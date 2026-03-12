declare module 'cockpit' {
  type UserInfo = {
    home: string;
    name: string;
    groups: string[];
  };

  type Transport = {
    host: string;
  };

  type FileHandle = {
    read(): Promise<string>;
    close(): void;
    replace(contents: string): Promise<void>;
    modify(callback: (contents: string) => string): Promise<string>;
  };

  type FileOptions = {
    superuser?: 'try' | 'require' | 'required';
  };

  type SpawnOptions = {
    superuser?: 'try' | 'require';
    err?: 'message' | 'out' | 'ignore';
  };

  type HttpOptions = {
    superuser?: 'try' | 'require';
  };

  type HttpRequestOptions = {
    path: string;
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | undefined;
    body?: unknown;
    headers?: Record<string, string> | undefined;
    params?: Record<string, unknown> | undefined;
  };

  type HttpClient = {
    request(options: HttpRequestOptions): Promise<string>;
  };

  type PermissionOptions = {
    admin?: boolean;
  };

  type PermissionObject = {
    allowed: boolean;
    addEventListener(eventType: string, callback: () => void): void;
    removeEventListener(eventType: string, callback: () => void): void;
  };

  type Cockpit = {
    transport: Transport;
    jump(url: string, host: string): void;
    user(): Promise<UserInfo>;
    file(path: string, options?: FileOptions): FileHandle;
    spawn(args: string[], options?: SpawnOptions): Promise<string | Uint8Array>;
    script(script: string): Promise<string | Uint8Array>;
    http(address: string, options?: HttpOptions): HttpClient;
    permission(options: PermissionOptions): PermissionObject;
  };

  const cockpit: Cockpit;
  export default cockpit;
}

declare module 'cockpit/fsinfo' {
  type FileInfo = {
    entries?: Record<string, FileInfo>;
    mtime: number;
  };

  type FileInfoAttribute = 'entries' | 'mtime';

  type FSInfoOptions = {
    superuser?: 'try' | 'require';
  };

  export function fsinfo(
    filepath: string,
    attributes: FileInfoAttribute[],
    options?: FSInfoOptions,
  ): Promise<FileInfo>;
}

declare module 'os-release' {
  type OsRelease = {
    ID: string;
    VERSION_ID: string;
  };

  export function read_os_release(): Promise<OsRelease>;
}
