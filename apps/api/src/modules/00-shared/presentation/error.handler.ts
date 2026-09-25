import { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import { AppError } from "../domain/errors.js";
import { ErrorEnvelope } from "@bipesend/contracts";

export function errorHandler(
  error: FastifyError,
  request: FastifyRequest,
  reply: FastifyReply
) {
  const reqId = request.id as string;

  // Log errors for internal tracking
  if (error instanceof AppError) {
    request.log.warn({ err: error, code: error.code }, error.message);
  } else if (error.statusCode && error.statusCode >= 400 && error.statusCode < 500) {
    request.log.warn({ err: error, code: error.code }, error.message);
  } else {
    request.log.error({ err: error }, "Unhandled error");
  }

  // Handle expected application errors
  if (error instanceof AppError) {
    const envelope: ErrorEnvelope = {
      error: {
        code: error.code,
        message: error.message,
        requestId: reqId,
      },
    };
    return reply.status(error.statusCode).send(envelope);
  }

  // Check if error is Fastify validation error (usually has validationContext)
  if (error.validation) {
    const envelope: ErrorEnvelope = {
      error: {
        code: "VALIDATION_FAILED",
        message: "Os dados fornecidos são inválidos. Verifique e tente novamente.",
        requestId: reqId,
      },
    };
    return reply.status(400).send(envelope);
  }

  // Handle standard Fastify 4xx client errors (e.g. empty body, invalid content type, not found)
  if (error.statusCode && error.statusCode >= 400 && error.statusCode < 500) {
    const envelope: ErrorEnvelope = {
      error: {
        code: (error.code as any) || "BAD_REQUEST",
        message: error.message || "Requisição inválida.",
        requestId: reqId,
      },
    };
    return reply.status(error.statusCode).send(envelope);
  }

  // Default fallback for unexpected errors (do not leak stack)
  const envelope: ErrorEnvelope = {
    error: {
      code: "INTERNAL_ERROR",
      message: "Ocorreu um erro interno. Tente novamente mais tarde.",
      requestId: reqId,
    },
  };
  return reply.status(500).send(envelope);
}
