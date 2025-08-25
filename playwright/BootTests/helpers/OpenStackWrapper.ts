import { execFile } from 'child_process';

import { test } from '@playwright/test';

export class OpenStackWrapper {
  private static readonly SLEEP_TIME = 15000; // 15 seconds
  private static readonly RETRY_CREATE_IMAGE = 40; // 40 * 15 seconds = 4 minutes for image to be in 'active' state
  private static readonly RETRY_LAUNCH_INSTANCE = 20; // 20 * 30 seconds = 10 minutes to launch the instance
  private static readonly RETRY_CHECK_CONNECTION = 4; // 4 * 15 seconds = 1 minute to wait if we can connect to the instance
  private ipAddress: string;
  private imageName: string;
  private instanceName: string;
  private diskFormat: string;
  private imageFilePath: string;
  // Add an option to use environment variable for local debugging
  private keyName: string =
    process.env.OS_SSH_KEY_NAME ?? 'image-builder-frontend-ci';
  private canConnect: boolean;

  /**
   * This class serves as a wrapper around the OpenStack CLI.
   * It provides methods to create an image, launch an instance, and execute commands on the instance.
   * @param imageName - The name of the image to create.
   * @param diskFormat - The disk format of the image.
   * @param imageFilePath - The path to the image file.
   * @param instanceName - The name of the instance to launch. If not provided, the image name is used.
   */
  public constructor(
    imageName: string,
    diskFormat: string,
    imageFilePath: string,
    instanceName?: string,
  ) {
    this.imageName = imageName;
    this.instanceName = instanceName ?? imageName;
    this.diskFormat = diskFormat;
    this.imageFilePath = imageFilePath;
    this.canConnect = false;
  }

  /**
   * Wrapper around exec so it can be simply called as await execCommand(...).
   * Executes a command and returns the output.
   * @param executable - The executable to execute.
   * @param args - The arguments to pass to the executable.
   * @throws Error if command fails
   * @returns stdout
   */
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

  /**
   * Upload an image to Openstack.
   */
  public async createImage(): Promise<void> {
    try {
      console.log(`Uploading image ${this.imageName} to Openstack`);
      await OpenStackWrapper.execCommand('openstack', [
        'image',
        'create',
        '-f',
        'json',
        `--disk-format=${this.diskFormat}`,
        `--file=${this.imageFilePath}`,
        this.imageName,
      ]);
      // Wait until the image is in 'active' state
      for (let i = 0; i < OpenStackWrapper.RETRY_CREATE_IMAGE; i++) {
        const output = await OpenStackWrapper.execCommand('openstack', [
          'image',
          'show',
          '-f',
          'json',
          this.imageName,
        ]);
        const image = JSON.parse(output);
        if (image.status === 'active') {
          console.log(
            `Image ${this.imageName} successfully uploaded to Openstack`,
          );
          return;
        }
        // Wait before checking again
        await new Promise((resolve) =>
          setTimeout(resolve, OpenStackWrapper.SLEEP_TIME),
        );
      }
      // If the image is not ready after the retries, throw an error
      throw new OpenStackError(
        `Image ${this.imageName} didn't become active after 4 minutes.`,
      );
    } catch (error) {
      console.error(`Error creating image: ${error}`);
      throw error;
    }
  }

  /**
   * Launch an instance from the created image.
   */
  public async launchInstance(): Promise<void> {
    try {
      console.log(
        `Launching instance ${this.instanceName} from image ${this.imageName}`,
      );
      const output = await OpenStackWrapper.execCommand('openstack', [
        'server',
        'create',
        '-f',
        'json',
        `--image=${this.imageName}`,
        '--flavor=g.standard.small',
        '--network=shared_net_1',
        '--security-group=default',
        `--key-name=${this.keyName}`,
        this.instanceName,
      ]);
      const instance = JSON.parse(output);
      // Expect the instance started building
      if (instance.status !== 'BUILD') {
        throw new OpenStackError(
          `Instance ${this.instanceName} does not have expected status 'BUILD', but '${instance.status}'`,
        );
      }
      // Wait until the instance is running (in active state)
      for (let i = 0; i < OpenStackWrapper.RETRY_LAUNCH_INSTANCE; i++) {
        const output = await OpenStackWrapper.execCommand('openstack', [
          'server',
          'show',
          '-f',
          'json',
          this.instanceName,
        ]);
        const instance = JSON.parse(output);
        if (instance.status === 'ACTIVE') {
          // Instance is running
          this.ipAddress = instance.addresses.shared_net_1[0];
          console.log(`Instance ${this.instanceName} launched successfully`);
          return;
        }
        // Wait before checking again
        await new Promise((resolve) =>
          setTimeout(resolve, OpenStackWrapper.SLEEP_TIME),
        );
      }
      // If the instance is not running after the retries, throw an error
      throw new OpenStackError(
        `Instance ${this.instanceName} didn't launch after 10 minutes.`,
      );
    } catch (error) {
      console.error(`Error launching instance: ${error}`);
      throw error;
    }
  }

  /**
   * Check if we can connect to the instance. Raises an error if we can't.
   * @throws OpenStackError if we can't connect to the instance even after the retries.
   */
  private async checkConnection(): Promise<void> {
    if (!this.canConnect) {
      for (let i = 0; i < OpenStackWrapper.RETRY_CHECK_CONNECTION; i++) {
        try {
          const output = await OpenStackWrapper.execCommand('ssh', [
            '-o',
            'StrictHostKeyChecking=accept-new',
            `cloud-user@${this.ipAddress}`,
            "echo 'Hello'",
          ]);
          if (output.includes('Hello')) {
            this.canConnect = true;
            break;
          }
        } catch (error) {
          if (i < OpenStackWrapper.RETRY_CHECK_CONNECTION - 1) {
            await new Promise((resolve) =>
              setTimeout(resolve, OpenStackWrapper.SLEEP_TIME),
            );
          } else {
            throw new OpenStackError(
              `Failed to connect to instance ${this.instanceName} after ${i + 1} attempts. Reason: ${error}`,
            );
          }
        }
      }
      console.log(`Instance ${this.instanceName} is ready to connect`);
    }
  }

  /**
   * Executes a command via SSH on the running instance and returns the exit code and output.
   * @param command - The command to execute.
   * @param user - The user to execute the command as. If not provided, defaults to 'cloud-user'.
   * @returns [exitCode, stdout]
   */
  public async exec(command: string, user?: string): Promise<[number, string]> {
    await this.checkConnection();

    const sshArgs = [
      '-o',
      'StrictHostKeyChecking=accept-new',
      `${user ?? 'cloud-user'}@${this.ipAddress}`,
      command,
    ];

    try {
      const output = await OpenStackWrapper.execCommand('ssh', sshArgs);
      return [0, output];
    } catch (error) {
      return [error.code, error.message];
    }
  }

  /**
   * Delete an image from Openstack.
   * @param imageName - The name of the image to delete.
   * @throws OpenStackError if the image is found but failed to delete.
   */
  public static async deleteImage(imageName: string): Promise<void> {
    await test.step(
      'Delete the image on Openstack with name: ' + imageName,
      async () => {
        try {
          await OpenStackWrapper.execCommand('openstack', [
            'image',
            'delete',
            imageName,
          ]);
          console.log(`Image ${imageName} deleted`);
        } catch (error) {
          if (!error.message.includes('Multi Backend support not enabled.')) {
            throw new OpenStackError(
              `Image was found, but failed to delete. Reason: ${error.message}`,
            );
          }
          // Fail gracefully, no image to delete
        }
      },
    );
  }

  /**
   * Delete an instance from Openstack.
   * @param instanceName - The name of the instance to delete.
   * @throws OpenStackError if the instance is found but failed to delete.
   */
  public static async deleteInstance(instanceName: string): Promise<void> {
    await test.step(
      'Delete the instance on Openstack with name: ' + instanceName,
      async () => {
        try {
          await OpenStackWrapper.execCommand('openstack', [
            'server',
            'delete',
            instanceName,
          ]);
          console.log(`Instance ${instanceName} deleted`);
        } catch (error) {
          if (!error.message.includes('No Server found')) {
            throw new OpenStackError(
              `Instance was found, but failed to delete. Reason: ${error.message}`,
            );
          }
          // Fail gracefully, no instance to delete
        }
      },
    );
  }
}

/**
 * Custom error class for OpenStack errors.
 */
class OpenStackError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OpenStackError';
  }
}
