import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { Database } from "../../00-shared/infrastructure/database.js";
import { storageService } from "../../00-shared/infrastructure/storage.service.js";
import { MediaConversionService } from "../application/media-conversion.service.js";

export function storageRoutes(
  fastify: FastifyInstance,
  _db: Database,
) {
  const conversionService = new MediaConversionService();

  fastify.post(
    "/api/v1/upload",
    async (request: FastifyRequest, reply: FastifyReply) => {
      const data = await request.file();
      if (!data) {
        return reply.status(400).send({ error: "No file uploaded" });
      }

      try {
        let buffer = await data.toBuffer();
        let mimetype = data.mimetype;
        let filename = data.filename;

        // Converter WebM de áudio para OGG/OPUS para PTT
        if (mimetype.includes('audio/') || mimetype === 'video/webm' && filename.includes('audio')) {
          buffer = await conversionService.convertAudioToOggOpus(buffer);
          mimetype = 'audio/ogg; codecs=opus';
          filename = filename.replace(/\.(webm|mp3|wav|ogg)$/, '.ogg');
          if (!filename.endsWith('.ogg')) filename += '.ogg';
        } 
        // Converter vídeos para MP4
        else if (mimetype.includes('video/') && mimetype !== 'video/mp4') {
          buffer = await conversionService.convertVideoToMp4(buffer);
          mimetype = 'video/mp4';
          filename = filename.replace(/\.(webm|mov|avi)$/, '.mp4');
          if (!filename.endsWith('.mp4')) filename += '.mp4';
        }

        const url = await storageService.uploadFile(buffer, filename, mimetype);
        
        return reply.status(200).send({ data: { url, mimetype, filename } });
      } catch (error) {
        request.log.error(error);
        return reply.status(500).send({ error: "Upload or conversion failed" });
      }
    }
  );
}
