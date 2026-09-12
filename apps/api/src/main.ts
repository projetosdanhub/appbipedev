/**
 * BipeSend API — Bootstrap mínimo.
 *
 * Responsabilidades nesta fase:
 * - Carregar e validar configuração (INF-002)
 * - Registrar GET /health e GET /ready (INF-003)
 * - Servir na porta configurada, com bind local em 127.0.0.1 por padrão
 */

import Fastify from "fastify";
import { loadEnv } from "./config/env.js";
import { registerHealthController } from "./modules/00-shared/presentation/health.controller.js";

async function bootstrap(): Promise<void> {
  const env = loadEnv();

  const app = Fastify({
    logger: {
      level: env.NODE_ENV === "production" ? "info" : "debug",
      transport:
        env.NODE_ENV !== "production"
          ? { target: "pino-pretty", options: { colorize: true } }
          : undefined,
    },
  });

  await registerHealthController(app);

  // Setup plugins
  app.register(import("@fastify/cookie"));

  // Setup DB
  const { Database } = await import("./modules/00-shared/infrastructure/database.js");
  const db = new Database(env.DATABASE_URL);
  
  // Clean up DB on exit
  app.addHook('onClose', async () => {
    await db.close();
  });

  // Identity Module
  const { UserRepository } = await import("./modules/01-identity/infrastructure/user.repository.js");
  const { SessionRepository } = await import("./modules/01-identity/infrastructure/session.repository.js");
  const { VerificationRepository, PasswordResetRepository } = await import("./modules/01-identity/infrastructure/verification.repository.js");
  const { MailService } = await import("./modules/00-shared/infrastructure/mail.service.js");
  const { AuthService } = await import("./modules/01-identity/application/auth.service.js");
  const { authRoutes } = await import("./modules/01-identity/presentation/auth.controller.js");
  const { createAuthMiddleware } = await import("./modules/00-shared/presentation/auth.middleware.js");

  const userRepository = new UserRepository(db);
  const sessionRepository = new SessionRepository(db);
  const verificationRepository = new VerificationRepository(db);
  const passwordResetRepository = new PasswordResetRepository(db);
  const mailService = new MailService();
  const authService = new AuthService(
    userRepository,
    sessionRepository,
    verificationRepository,
    passwordResetRepository,
    mailService
  );

  const authMiddleware = createAuthMiddleware(sessionRepository, userRepository);
  
  // Tenancy Module
  const { TenantRepository } = await import("./modules/02-tenancy/infrastructure/tenant.repository.js");
  const { MembershipRepository } = await import("./modules/02-tenancy/infrastructure/membership.repository.js");
  const { InvitationRepository } = await import("./modules/02-tenancy/infrastructure/invitation.repository.js");
  const { OnboardingService } = await import("./modules/02-tenancy/application/onboarding.service.js");
  const { InvitationService } = await import("./modules/02-tenancy/application/invitation.service.js");
  const { tenantRoutes } = await import("./modules/02-tenancy/presentation/tenant.controller.js");

  const tenantRepository = new TenantRepository(db);
  const membershipRepository = new MembershipRepository(db);
  const invitationRepository = new InvitationRepository(db);
  const onboardingService = new OnboardingService(db, tenantRepository, membershipRepository);
  const invitationService = new InvitationService(invitationRepository, membershipRepository, mailService);

  // Register auth routes (no auth required for most, auth plugin handles middleware where needed)
  app.register(async (instance) => {
    // Add auth middleware hook to all tenant routes
    instance.addHook('onRequest', authMiddleware);
    tenantRoutes(instance, db, onboardingService, invitationService);
  });

  // Auth routes are mostly public
  app.register(async (instance) => {
    // authMiddleware should only protect logout, but for now we put it inside the controller if needed or register without hook
    authRoutes(instance, authService, onboardingService);
  });

  try {
    await app.listen({ port: env.API_PORT, host: env.API_HOST });
    app.log.info(
      {
        host: env.API_HOST,
        port: env.API_PORT,
      },
      `${env.APP_NAME} API upstream is ready; public access must use the HTTPS proxy`
    );
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

bootstrap();
