import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { env } from 'node:process';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

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
    this.baseUrl = env.NEXT_PUBLIC_API_URL 
      ? `${env.NEXT_PUBLIC_API_URL}/uploads` 
      : env.API_PUBLIC_URL 
      ? `${env.API_PUBLIC_URL}/uploads`
      : `http://localhost:${env.API_PORT || 4000}/uploads`;
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

export interface S3Config {
  bucket?: string;
  endpoint?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  publicUrl?: string;
}

class S3StorageProvider implements StorageProvider {
  private s3: S3Client;
  private bucket: string;
  private publicUrl: string;

  constructor(config?: S3Config) {
    this.bucket = config?.bucket || env.STORAGE_BUCKET || env.S3_BUCKET || 'bipesend-media';
    const region = env.STORAGE_REGION || env.S3_REGION || 'auto';
    const endpoint = config?.endpoint || env.STORAGE_ENDPOINT || env.S3_ENDPOINT; // Cloudflare R2 ou MinIO
    const accessKeyId = config?.accessKeyId || env.STORAGE_ACCESS_KEY || env.STORAGE_ACCESS_KEY_ID || env.S3_ACCESS_KEY_ID || '';
    const secretAccessKey = config?.secretAccessKey || env.STORAGE_SECRET_KEY || env.STORAGE_SECRET_ACCESS_KEY || env.S3_SECRET_ACCESS_KEY || '';

    this.s3 = new S3Client({
      region,
      endpoint: endpoint || undefined,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      forcePathStyle: !!endpoint && (endpoint.includes('localhost') || endpoint.includes('127.0.0.1')),
    });

    // Public URL para entrega direta via CDN / Cloudflare R2 custom domain ou S3
    this.publicUrl = config?.publicUrl || env.STORAGE_PUBLIC_URL || env.S3_PUBLIC_URL || (endpoint ? `${endpoint}/${this.bucket}` : `https://${this.bucket}.s3.${region}.amazonaws.com`);
  }

  async upload(file: Buffer, filename: string, mimetype: string): Promise<{ url: string; key: string }> {
    const ext = path.extname(filename);
    const key = `media/${Date.now()}_${randomUUID()}${ext}`;

    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file,
        ContentType: mimetype,
      })
    );

    return {
      url: this.getUrl(key),
      key,
    };
  }

  async delete(key: string): Promise<void> {
    await this.s3.send(
      new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      })
    );
  }

  getUrl(key: string): string {
    return `${this.publicUrl.replace(/\/+$/, '')}/${key}`;
  }
}

export class StorageService {
  private localProvider: StorageProvider;
  private r2Provider: StorageProvider | null = null;
  private credentialsService?: any;
  private lastChecked = 0;

  constructor() {
    this.localProvider = new LocalStorageProvider();
    const storageType = (env.STORAGE_PROVIDER || 'local').toLowerCase();
    
    if (storageType === 's3' || storageType === 'r2') {
      try {
        this.r2Provider = new S3StorageProvider();
      } catch (err) {
        console.warn('[StorageService] Falha ao inicializar S3StorageProvider fallback:', err);
      }
    }
  }

  setCredentialsService(service: any) {
    this.credentialsService = service;
  }

  private async getActiveProvider(): Promise<StorageProvider> {
    const now = Date.now();
    // Verifica status da credencial no banco (cache de 15s)
    if (this.credentialsService && now - this.lastChecked > 15000) {
      this.lastChecked = now;
      try {
        const status = await this.credentialsService.repo.getStatus("cloudflare_r2");
        if (status?.status === "active") {
          const creds = await this.credentialsService.getCloudflareR2Credentials();
          if (creds) {
            this.r2Provider = new S3StorageProvider(creds);
            return this.r2Provider;
          }
        } else {
          // Se não estiver "active", fica no Localhost Storage
          return this.localProvider;
        }
      } catch {
        // Fallback seguro
      }
    }

    if (this.r2Provider && (env.STORAGE_PROVIDER === 'r2' || env.STORAGE_PROVIDER === 's3')) {
      return this.r2Provider;
    }

    return this.localProvider;
  }

  async upload(file: Buffer, filename: string, mimetype: string) {
    const provider = await this.getActiveProvider();
    return provider.upload(file, filename, mimetype);
  }

  async uploadFile(file: Buffer, filename: string, mimetype: string): Promise<string> {
    const res = await this.upload(file, filename, mimetype);
    return res.url;
  }

  async delete(key: string) {
    const provider = await this.getActiveProvider();
    return provider.delete(key);
  }

  async getUrl(key: string) {
    const provider = await this.getActiveProvider();
    return provider.getUrl(key);
  }
}

// Export a singleton instance
export const storageService = new StorageService();
