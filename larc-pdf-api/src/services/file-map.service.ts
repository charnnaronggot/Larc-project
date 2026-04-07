import type { FileEntry } from '../models/file-entry';

export class FileMapService {
  private readonly fileMap = new Map<string, string>();

  public set(entry: FileEntry): void {
    this.fileMap.set(entry.fileId, entry.filePath);
  }

  public get(fileId: string): string | undefined {
    return this.fileMap.get(fileId);
  }

  public delete(fileId: string): boolean {
    return this.fileMap.delete(fileId);
  }
}
