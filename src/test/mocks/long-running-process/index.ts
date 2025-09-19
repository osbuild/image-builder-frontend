export const ProcessState = {
  INIT: 'init',
  STOPPED: 'stopped',
  RUNNING: 'running',
  FAILED: 'failed',
} as const;

export type ProcessStateType = (typeof ProcessState)[keyof typeof ProcessState];

export type callback = (proc: LongRunningProcess) => void;

export class LongRunningProcess {
  public serviceName: string;
  public updateCallback?: callback | undefined;
  public state: ProcessStateType;

  constructor(
    serviceName: string,
    updateCallback?: (proc: LongRunningProcess) => void,
  ) {
    this.serviceName = serviceName;
    this.updateCallback = updateCallback;
    this.state = ProcessState.INIT;
  }

  // eslint-disable-next-line
  async run(argv: string[], options?: Record<string, unknown>): Promise<void> {}

  async terminate(): Promise<void> {}

  reset(): void {}
}
