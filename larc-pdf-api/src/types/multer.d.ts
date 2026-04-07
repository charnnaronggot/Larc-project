declare namespace Express {
  namespace Multer {
    interface File {
      fieldname: string;
      originalname: string;
      encoding: string;
      mimetype: string;
      size: number;
      destination?: string;
      filename?: string;
      path?: string;
      buffer: Buffer;
    }
  }
  interface Request {
    file?: Express.Multer.File;
    files?: { [fieldname: string]: Express.Multer.File[] } | Express.Multer.File[];
  }
}

declare module 'multer' {
  type ExpressRequest = import('express').Request;
  type RequestHandler = import('express').RequestHandler;

  type FileFilterCallback = (error: Error | null, acceptFile?: boolean) => void;

  interface StorageEngine {
    _handleFile(
      req: ExpressRequest,
      file: Express.Multer.File,
      callback: (error?: Error | null, info?: Partial<Express.Multer.File>) => void
    ): void;
    _removeFile(
      req: ExpressRequest,
      file: Express.Multer.File,
      callback: (error: Error | null) => void
    ): void;
  }

  interface DiskStorageOptions {
    destination?:
      | string
      | ((
          req: ExpressRequest,
          file: Express.Multer.File,
          callback: (error: Error | null, destination: string) => void
        ) => void);
    filename?: (
      req: ExpressRequest,
      file: Express.Multer.File,
      callback: (error: Error | null, filename: string) => void
    ) => void;
  }

  interface Field {
    name: string;
    maxCount?: number;
  }

  interface Limits {
    fieldNameSize?: number;
    fieldSize?: number;
    fields?: number;
    fileSize?: number;
    files?: number;
    parts?: number;
    headerPairs?: number;
  }

  interface Options {
    dest?: string;
    storage?: StorageEngine;
    limits?: Limits;
    preservePath?: boolean;
    fileFilter?: (
      req: ExpressRequest,
      file: Express.Multer.File,
      callback: FileFilterCallback
    ) => void;
  }

  interface Instance {
    single(fieldname: string): RequestHandler;
    array(fieldname: string, maxCount?: number): RequestHandler;
    fields(fields: Field[]): RequestHandler;
    any(): RequestHandler;
    none(): RequestHandler;
  }

  class MulterError extends Error {
    code: string;
    field?: string;
    constructor(code: string, field?: string);
  }

  interface Multer {
    (options?: Options): Instance;
    diskStorage(options: DiskStorageOptions): StorageEngine;
    memoryStorage(): StorageEngine;
    MulterError: typeof MulterError;
  }

  const multer: Multer;
  export = multer;
  export { FileFilterCallback, MulterError };
}
