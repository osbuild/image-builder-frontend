import { execFile } from 'child_process';

import {
  DescribeInstancesCommand,
  EC2Client,
  RunInstancesCommand,
  TerminateInstancesCommand,
} from '@aws-sdk/client-ec2';
import { test } from '@playwright/test';

export class AwsWrapper {
  private static readonly SLEEP_TIME = 15000; // 15 seconds
  private static readonly RETRY_LAUNCH_INSTANCE = 20; // 20 * 15 seconds = 5 minutes to launch the instance
  private static readonly RETRY_CHECK_CONNECTION = 20; // 20 * 15 seconds = 5 minutes to wait for SSH
  private privateIpAddress!: string;
  private instanceId?: string;
  private amiId: string;
  private instanceName: string;
  private keyName: string =
    process.env.AWS_SSH_KEY_NAME ?? 'image-builder-frontend-ci';
  private securityGroupId: string = process.env.AWS_SECURITY_GROUP_ID!;
  private subnetId: string = process.env.AWS_SUBNET_ID!;
  private canConnect: boolean;

  public constructor(amiId: string, instanceName: string) {
    this.amiId = amiId;
    this.instanceName = instanceName;
    this.canConnect = false;
  }

  // The EC2 client inherits IAM credentials from the CodeBuild service role
  private static ec2Client = new EC2Client({
    region: process.env.AWS_DEFAULT_REGION ?? 'us-east-1',
  });

  private static async execCommand(
    executable: string,
    args: string[],
  ): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      execFile(executable, args, (error, stdout) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(stdout);
      });
    });
  }

  public async launchInstance(): Promise<void> {
    try {
      console.log(
        `Launching instance ${this.instanceName} from AMI ${this.amiId}`,
      );

      const runCommand = new RunInstancesCommand({
        ImageId: this.amiId,
        InstanceType: 't3.micro',
        KeyName: this.keyName,
        SecurityGroupIds: [this.securityGroupId],
        SubnetId: this.subnetId,
        MinCount: 1,
        MaxCount: 1,
      });

      const response = await AwsWrapper.ec2Client.send(runCommand);
      this.instanceId = response.Instances?.[0]?.InstanceId;

      if (!this.instanceId) {
        throw new AwsError('Failed to launch instance: no InstanceId returned');
      }
      // Wait until the instance is running and has a private IP.
      // The first DescribeInstances call can fail with InvalidInstanceID.NotFound
      // due to AWS eventual consistency, so we treat it as retryable.
      for (let i = 0; i < AwsWrapper.RETRY_LAUNCH_INSTANCE; i++) {
        await new Promise((resolve) =>
          setTimeout(resolve, AwsWrapper.SLEEP_TIME),
        );

        try {
          const describeResponse = await AwsWrapper.ec2Client.send(
            new DescribeInstancesCommand({
              InstanceIds: [this.instanceId],
            }),
          );
          const instance = describeResponse.Reservations?.[0]?.Instances?.[0];

          if (instance && instance.State?.Name === 'running') {
            this.privateIpAddress = instance.PrivateIpAddress!;
            console.log(`Instance ${this.instanceName} launched successfully`);
            return;
          }
        } catch (describeError) {
          // AWS eventual consistency: instance may not be visible yet
          const errorName =
            describeError instanceof Error ? describeError.name : '';
          if (errorName !== 'InvalidInstanceID.NotFound') {
            throw describeError;
          }
        }
      }

      throw new AwsError(
        `Instance ${this.instanceName} didn't launch after 5 minutes.`,
      );
    } catch (error) {
      console.error(`Error launching instance: ${error}`);
      throw error;
    }
  }

  private async checkConnection(): Promise<void> {
    if (!this.canConnect) {
      const sshUser = process.env.AWS_SSH_USER ?? 'ec2-user';
      for (let i = 0; i < AwsWrapper.RETRY_CHECK_CONNECTION; i++) {
        try {
          // StrictHostKeyChecking=no and UserKnownHostsFile=/dev/null prevent
          // host key conflicts when IPs are reused across test runs in the /23 subnet
          const output = await AwsWrapper.execCommand('ssh', [
            '-o', 'StrictHostKeyChecking=no',
            '-o', 'UserKnownHostsFile=/dev/null',
            `${sshUser}@${this.privateIpAddress}`,
            "echo 'Hello'",
          ]);
          if (output.includes('Hello')) {
            this.canConnect = true;
            break;
          }
        } catch (error) {
          if (i < AwsWrapper.RETRY_CHECK_CONNECTION - 1) {
            await new Promise((resolve) =>
              setTimeout(resolve, AwsWrapper.SLEEP_TIME),
            );
          } else {
            throw new AwsError(
              `Failed to connect to instance ${this.instanceName} after ${i + 1} attempts. Reason: ${error}`,
            );
          }
        }
      }
      console.log(`Instance ${this.instanceName} is ready to connect`);
    }
  }

  public async exec(command: string, user?: string): Promise<[number, string]> {
    await this.checkConnection();

    const sshArgs = [
      '-o', 'StrictHostKeyChecking=no',
      '-o', 'UserKnownHostsFile=/dev/null',
      `${user ?? process.env.AWS_SSH_USER ?? 'ec2-user'}@${this.privateIpAddress}`,
      command,
    ];

    try {
      const output = await AwsWrapper.execCommand('ssh', sshArgs);
      return [0, output];
    } catch (error) {
      //@ts-ignore TODO revisit this
      return [error.code, error.message];
    }
  }

  public static async terminateInstance(instanceId: string): Promise<void> {
    await test.step(
      'Terminate the EC2 instance with ID: ' + instanceId,
      async () => {
        try {
          await AwsWrapper.ec2Client.send(
            new TerminateInstancesCommand({
              InstanceIds: [instanceId],
            }),
          );
          console.log(`Instance ${instanceId} terminated`);
        } catch (error) {
          if (
            error instanceof Error &&
            !error.message.includes('does not exist')
          ) {
            throw new AwsError(
              `Instance was found, but failed to terminate. Reason: ${error.message}`,
            );
          }
          // Fail gracefully, no instance to terminate
        }
      },
    );
  }

  public getInstanceId(): string | undefined {
    return this.instanceId;
  }
}

class AwsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AwsError';
  }
}
