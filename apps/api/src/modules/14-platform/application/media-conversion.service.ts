import ffmpeg from 'fluent-ffmpeg';
import ffmpegInstaller from '@ffmpeg-installer/ffmpeg';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { randomUUID } from 'crypto';

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

export class MediaConversionService {
  /**
   * Converte arquivos de áudio (ex: .webm do navegador) para OGG/OPUS (.ogg) ou MP3 
   * ou converte para a formatação esperada pelo Evolution API para envio de PTT (Push-To-Talk).
   * Evolution API exige OGG codec libopus para mandar como PTT de forma nativa.
   */
  async convertAudioToOggOpus(buffer: Buffer): Promise<Buffer> {
    const tempInput = path.join(os.tmpdir(), `${randomUUID()}-input.webm`);
    const tempOutput = path.join(os.tmpdir(), `${randomUUID()}-output.ogg`);

    await fs.promises.writeFile(tempInput, buffer);

    return new Promise((resolve, reject) => {
      ffmpeg(tempInput)
        .toFormat('ogg')
        .audioCodec('libopus')
        .audioChannels(1) // WhatsApp PTT is typically mono
        .audioBitrate('128k') // High quality audio
        .on('end', async () => {
          try {
            const outBuffer = await fs.promises.readFile(tempOutput);
            await fs.promises.unlink(tempInput).catch(() => {});
            await fs.promises.unlink(tempOutput).catch(() => {});
            resolve(outBuffer);
          } catch (err) {
            reject(err);
          }
        })
        .on('error', (err) => {
          fs.promises.unlink(tempInput).catch(() => {});
          reject(err);
        })
        .save(tempOutput);
    });
  }

  /**
   * Converte vídeo genérico para MP4 H264 de alta qualidade compatível com WhatsApp
   */
  async convertVideoToMp4(buffer: Buffer): Promise<Buffer> {
    const tempInput = path.join(os.tmpdir(), `${randomUUID()}-input.mp4`);
    const tempOutput = path.join(os.tmpdir(), `${randomUUID()}-output.mp4`);

    await fs.promises.writeFile(tempInput, buffer);

    return new Promise((resolve, reject) => {
      ffmpeg(tempInput)
        .toFormat('mp4')
        .videoCodec('libx264')
        .audioCodec('aac')
        // Alta qualidade mantendo compressão decente
        .outputOptions([
          '-crf 23', 
          '-preset medium',
          '-profile:v baseline',
          '-level 3.0',
          '-pix_fmt yuv420p'
        ])
        .on('end', async () => {
          try {
            const outBuffer = await fs.promises.readFile(tempOutput);
            await fs.promises.unlink(tempInput).catch(() => {});
            await fs.promises.unlink(tempOutput).catch(() => {});
            resolve(outBuffer);
          } catch (err) {
            reject(err);
          }
        })
        .on('error', (err) => {
          fs.promises.unlink(tempInput).catch(() => {});
          reject(err);
        })
        .save(tempOutput);
    });
  }
}
