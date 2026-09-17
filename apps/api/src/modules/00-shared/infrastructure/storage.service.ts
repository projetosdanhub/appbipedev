import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { env } from 'node:process';

export interface StorageProvider {
  upload(file: Buffer, filename: string, mimetype: string): Promise<{ url: string; key: string }>;
  delete(key: string): Promise<void>;
  getUrl(key: string): string;
}

class LocalStorageProvider implements StorageProvider {
  private baseDir: string;
  private baseUrl: string;

  constructor() {
    this.baseDir = path.join(process.cwd(), 'uploads');
    this.baseUrl = env.NEXT_PUBLIC_API_URL ? `${env.NEXT_PUBLIC_API_URL}/uploads` : 'http://localhost:3333/uploads';
    this.init();
  }

  private async init() {
    try {
      await fs.access(this.baseDir);
    } catch {
      await fs.mkdir(this.baseDir, { recursive: true });
    }
  }

  async upload(file: Buffer, filename: string, _mimetype: string): Promise<{ url: string; key: string }> {
    const ext = path.extname(filename);
    const key = `${randomUUID()}${ext}`;
    const filePath = path.join(this.baseDir, key);
    
    await fs.writeFile(filePath, file);
    
    return {
      url: this.getUrl(key),
      key,
    };
  }

  async delete(key: string): Promise<void> {
    const filePath = path.join(this.baseDir, key);
    try {
      await fs.unlink(filePath);
    } catch (error: unknown) {
      if ((error as any).code !== 'ENOENT') {
        throw error;
      }
    }
  }

  getUrl(key: string): string {
    return `${this.baseUrl}/${key}`;
  }
}

class S3StorageProvider implements StorageProvider {
  // To be implemented when credentials are provided
  constructor() {}

  async upload(_file: Buffer, _filename: string, _mimetype: string): Promise<{ url: string; key: string }> {
    throw new Error('S3 Storage not implemented yet');
  }

  async delete(_key: string): Promise<void> {
    throw new Error('S3 Storage not implemented yet');
  }

  getUrl(_key: string): string {
    throw new Error('S3 Storage not implemented yet');
  }
}

export class StorageService {
  private provider: StorageProvider;

  constructor() {
    const storageType = env.STORAGE_PROVIDER || 'local';
    
    if (storageType === 's3' || storageType === 'r2') {
      this.provider = new S3StorageProvider();
    } else {
      this.provider = new LocalStorageProvider();
    }
  }

  async upload(file: Buffer, filename: string, mimetype: string) {
    return this.provider.upload(file, filename, mimetype);
  }

  async delete(key: string) {
    return this.provider.delete(key);
  }

  getUrl(key: string) {
    return this.provider.getUrl(key);
  }
}

// Export a singleton instance
export const storageService = new StorageService();
