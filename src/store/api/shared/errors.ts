export class OnPremApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OnPremApiError';
  }
}
