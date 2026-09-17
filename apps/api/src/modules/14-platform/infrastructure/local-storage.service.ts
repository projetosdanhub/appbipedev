import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import crypto from "node:crypto";

import { loadEnv } from "../../../config/env.js";

export class LocalStorageService {
  private uploadDir: string;
  private baseUrl: string;

  constructor() {
    this.uploadDir = path.join(process.cwd(), "uploads");
    const env = loadEnv();
    // Default to the API URL or something local
    const protocol = env.API_PORT === 443 ? "https" : "http";
    const apiUrl = `${protocol}://${env.API_HOST}${env.API_PORT !== 80 && env.API_PORT !== 443 ? `:${env.API_PORT}` : ""}`;
    this.baseUrl = env.API_PUBLIC_URL || apiUrl;
    this.init();
  }

  private async init() {
    try {
      await fs.mkdir(this.uploadDir, { recursive: true });
    } catch (e) {
      console.error("Failed to create uploads directory", e);
    }
  }

  async uploadFile(buffer: Buffer, filename: string, _mimetype: string): Promise<string> {
    const ext = path.extname(filename);
    const hash = crypto.randomBytes(16).toString("hex");
    const safeFilename = `${hash}${ext}`;
    const filePath = path.join(this.uploadDir, safeFilename);
    
    await fs.writeFile(filePath, buffer);
    
    // Return the absolute public URL directly so clients (ngrok, frontend) can access it
    return `${this.baseUrl}/uploads/${safeFilename}`;
  }
}
