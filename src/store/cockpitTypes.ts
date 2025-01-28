// TODO: maybe move to cockpit directory?
export type Params = Record<string, unknown>;
export type Method = 'GET' | 'DELETE' | 'POST' | 'PUT' | 'PATCH'; // We can add more if we need
export type Headers = { [name: string]: string };
