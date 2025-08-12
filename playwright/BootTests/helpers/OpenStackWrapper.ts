import { exec } from 'child_process';

import { test } from '@playwright/test';

export class OpenStackWrapper {
    /**
     * This class serves as a wrapper around the OpenStack CLI.
     * It provides methods to create an image, launch an instance, and execute commands on the instance.
     * @param imageName - The name of the image to create. The same name is used for the instance name.
     * @param diskFormat - The disk format of the image.
     * @param imageFilePath - The path to the image file.
     */
    private ipAddress: string;
    private imageName: string;
    private diskFormat: string;
    private imageFilePath: string;
    // Add an option to use environment variable for local debugging
    private keyName: string = process.env.OS_SSH_KEY_NAME ?? 'image-builder-frontend-ci';
    private canConnect: boolean;

    public constructor(imageName: string, diskFormat: string, imageFilePath: string) {
        this.imageName = imageName;
        this.diskFormat = diskFormat;
        this.imageFilePath = imageFilePath;
        this.canConnect = false;
    }

    private static async execCommand(command: string): Promise<string> {
        /**
         * Wrapper around exec so it can be simply called as await execCommand(...).
         * Executes a command and returns the output.
         * @param command - The command to execute.
         * @throws Error if command fails
         * @returns stdout
         */
        return new Promise<string>((resolve, reject) => {
            exec(command, (error, stdout,) => {
                if (error) {
                    // Reject the promise with an error that includes stderr
                    reject(new Error(`Command failed: ${error.message}`));
                    return;
                }
                resolve(stdout);
            });
        });
    }


    public async createImage(): Promise<void> {
        /**
         * Upload an image to Openstack.
         */
        const sleepTime = 10000; // 10 seconds
        const retries = 40; // 40 * 10 seconds = 4 minutes for image to be in 'active' state
        try {
            console.log(`Uploading image ${this.imageName} to Openstack`);
            await OpenStackWrapper.execCommand(`openstack image create -f json --disk-format="${this.diskFormat}"  --file=${this.imageFilePath} ${this.imageName}`);
            // Wait until the image is in 'active' state
            for (let i = 0; i < retries; i++) {
                const output = await OpenStackWrapper.execCommand(`openstack image show -f json ${this.imageName}`);
                const image = JSON.parse(output);
                if (image.status === 'active') {
                    console.log(`Image ${this.imageName} successfully uploaded to Openstack`);
                    return;
                }
                // Wait before checking again
                await new Promise(resolve => setTimeout(resolve, sleepTime));
            }
            // If the image is not ready after the retries, throw an error
            throw new OpenStackError(`Instance ${this.imageName} didn't launch after 10 minutes.`);
        } catch (error) {
            console.error(`Error creating image: ${error}`);
            throw error;
        }
    }

    public async launchInstance(): Promise<void>  {
        /**
         * Launch an instance from the created image.
         */
        const sleepTime = 30000; // 30 seconds
        const retries = 20; // 20 * 30 seconds = 10 minutes to launch the instance
        try {
            console.log(`Launching instance ${this.imageName} from image ${this.imageName}`);
            const output = await OpenStackWrapper.execCommand(`openstack server create -f json --image="${this.imageName}" --flavor="g.standard.small" --network="shared_net_1" --security-group="default" --key-name="${this.keyName}" ${this.imageName}`);
            const instance = JSON.parse(output);
            // Expect the instance started building
            if (instance.status !== 'BUILD') {
                throw new OpenStackError(`Instance ${this.imageName} does not have expected status 'BUILD', but '${instance.status}'`);
            }
            // Wait until the instance is running (in active state)
            for (let i = 0; i < retries; i++) {
                const output = await OpenStackWrapper.execCommand(`openstack server show -f json ${this.imageName}`);
                const instance = JSON.parse(output);
                if (instance.status === 'ACTIVE') {
                    // Instance is running
                    this.ipAddress = instance.addresses.shared_net_1[0];
                    console.log(`Instance ${this.imageName} launched successfully`);
                    return;
                }
                // Wait before checking again
                await new Promise(resolve => setTimeout(resolve, sleepTime));
            }
            // If the instance is not running after the retries, throw an error
            throw new OpenStackError(`Instance ${this.imageName} didn't launch after 10 minutes.`);
        } catch (error) {
            console.error(`Error launching instance: ${error}`);
            throw error;
        }
    }

    private async checkConnection(): Promise<void> {
        /**
         * Check if we can connect to the instance.
         */
        if (!this.canConnect) {
            const sleepTime = 15000; // 15 seconds
            const retries = 4; // 4 * 15 seconds = 1 minute to wait if we can connect to the instance
            for (let i = 0; i < retries; i++) {
                try {
                    const output = await OpenStackWrapper.execCommand(`ssh -o StrictHostKeyChecking=accept-new cloud-user@${this.ipAddress} "echo 'Hello'"`);
                    if (output.includes('Hello')) {
                        this.canConnect = true;
                        break;
                    }
                } catch (error) {
                    if (i < retries - 1) {
                        await new Promise(resolve => setTimeout(resolve, sleepTime));
                    } else {
                        throw new OpenStackError(`Failed to connect to instance ${this.imageName} after ${retries} attempts. Reason: ${error}`);
                    }
                }
            }
            console.log(`Instance ${this.imageName} is ready to connect`);
        }
    }

    public async exec(command: string, user?: string): Promise<[number, string]> {
        /**
         * Executes a command via SSH on the running instance and returns the exit code and output.
         * @param command - The command to execute.
         * @param user - The user to execute the command as. If not provided, defaults to 'cloud-user'.
         * @returns [exitCode, stdout]
         */
        await this.checkConnection();

        // Execute the SSH command using the private wrapper
        try {
            const output = await OpenStackWrapper.execCommand(`ssh -o StrictHostKeyChecking=accept-new ${user ?? 'cloud-user'}@${this.ipAddress} ${command}`);
            return [0, output];
        } catch (error) {
            return [error.code, error.message];
        }
    }

    public static async deleteImage(imageName: string): Promise<void> {
        /**
         * Delete an image from Openstack.
         * @param imageName - The name of the image to delete.
         */
        await test.step(
        'Delete the image on Openstack with name: ' + imageName,
        async () => {
            try {
                await this.execCommand(`openstack image delete ${imageName}`);
                console.log(`Image ${imageName} deleted`);
            } catch (error) {
                if (!error.message.includes('Multi Backend support not enabled.')) {
                    throw new OpenStackError(`Image was found, but failed to delete. Reason: ${error.message}`);
                }
                // Fail gracefully, no image to delete
            }
        });
    }

    public static async deleteInstance(instanceName: string): Promise<void> {
        /**
         * Delete an instance from Openstack.
         * @param instanceName - The name of the instance to delete.
         */
        await test.step(
        'Delete the instance on Openstack with name: ' + instanceName,
        async () => {
            try {
                await this.execCommand(`openstack server delete ${instanceName}`);
                console.log(`Instance ${instanceName} deleted`);
            } catch (error) {
                if (!error.message.includes('No Server found')) {
                    throw new OpenStackError(`Instance was found, but failed to delete. Reason: ${error.message}`);
                }
                // Fail gracefully, no instance to delete
            }
        });
    }
}


class OpenStackError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'OpenStackError';
    }
}
