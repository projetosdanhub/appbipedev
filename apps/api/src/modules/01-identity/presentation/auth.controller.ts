import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { AuthService } from "../application/auth.service.js";

import { OnboardingService } from "../../02-tenancy/application/onboarding.service.js";

export function authRoutes(
  fastify: FastifyInstance,
  authService: AuthService,
  onboardingService: OnboardingService
) {
  fastify.post("/auth/register", async (request: FastifyRequest, reply: FastifyReply) => {
    const { email, password, name, companyName } = request.body as any;
    
    if (!email || !password || !name) {
      return reply.status(400).send({ error: "Missing required fields" });
    }

    try {
      const user = await authService.register(email, password, name);
      
      // Create Tenant for user if companyName is provided
      if (companyName) {
        await onboardingService.createTenantForUser(user.id, companyName);
      } else {
        // Default to a generic workspace name if none provided to prevent blank spaces
        await onboardingService.createTenantForUser(user.id, "Meu Espaço");
      }

      return reply.status(201).send({ id: user.id, email: user.email, name: user.name });
    } catch (err: any) {
      return reply.status(400).send({ error: err.message });
    }
  });

  fastify.post("/auth/login", async (request: FastifyRequest, reply: FastifyReply) => {
    const { email, password } = request.body as any;

    if (!email || !password) {
      return reply.status(400).send({ error: "Missing required fields" });
    }

    try {
      const { sessionToken, user } = await authService.login(email, password);
      
      // Setting HTTP-only secure cookie
      reply.setCookie("session_token", sessionToken, {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60, // 7 days
      });

      return reply.status(200).send({ id: user.id, email: user.email, name: user.name });
    } catch (err: any) {
      return reply.status(401).send({ error: err.message });
    }
  });

  fastify.post("/auth/logout", async (request: FastifyRequest, reply: FastifyReply) => {
    const sessionToken = request.cookies.session_token;
    if (sessionToken) {
      await authService.logout(sessionToken);
      reply.clearCookie("session_token", { path: "/" });
    }
    return reply.status(200).send({ ok: true });
  });

  fastify.post("/auth/verify-email", async (request: FastifyRequest, reply: FastifyReply) => {
    const { token } = request.body as any;
    if (!token) return reply.status(400).send({ error: "Missing token" });

    try {
      await authService.verifyEmail(token);
      return reply.status(200).send({ ok: true });
    } catch (err: any) {
      return reply.status(400).send({ error: err.message });
    }
  });

  fastify.post("/auth/request-password-reset", async (request: FastifyRequest, reply: FastifyReply) => {
    const { email } = request.body as any;
    if (!email) return reply.status(400).send({ error: "Missing email" });

    await authService.requestPasswordReset(email);
    // Always return 200 to prevent user enumeration
    return reply.status(200).send({ ok: true });
  });

  fastify.post("/auth/reset-password", async (request: FastifyRequest, reply: FastifyReply) => {
    const { token, newPassword } = request.body as any;
    if (!token || !newPassword) return reply.status(400).send({ error: "Missing fields" });

    try {
      await authService.resetPassword(token, newPassword);
      return reply.status(200).send({ ok: true });
    } catch (err: any) {
      return reply.status(400).send({ error: err.message });
    }
  });
}
