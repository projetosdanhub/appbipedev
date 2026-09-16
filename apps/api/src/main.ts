/**
 * BipeSend API — Bootstrap mínimo.
 *
 * Responsabilidades nesta fase:
 * - Carregar e validar configuração (INF-002)
 * - Registrar GET /health e GET /ready (INF-003)
 * - Servir na porta configurada, com bind local em 127.0.0.1 por padrão
 */

import crypto from "node:crypto";
import Fastify from "fastify";
import { loadEnv } from "./config/env.js";
import { logger } from "./modules/00-shared/infrastructure/logger.js";
import { registerHealthController } from "./modules/00-shared/presentation/health.controller.js";

async function bootstrap(): Promise<void> {
  const env = loadEnv();

  const app = Fastify({
    logger: false,
    trustProxy: ['127.0.0.1', '10.0.0.0/8', '172.16.0.0/12', '192.168.0.0/16', '::1'],
    genReqId: (req) => {
      const id = req.headers["x-request-id"];
      return typeof id === "string" ? id : crypto.randomUUID();
    }
  });

  const { errorHandler } = await import("./modules/00-shared/presentation/error.handler.js");
  app.setErrorHandler(errorHandler);

  app.addHook("onRequest", async (request, reply) => {
    // Garantir que a request ID está sanitizada e segura
    const reqId = request.id;
    reply.header("x-request-id", reqId);
    request.log = logger.withContext({ requestId: reqId }) as any;
  });

  await registerHealthController(app);

  // Setup plugins
  app.register(import("@fastify/cookie"));

  // Setup DB
  const { Database } = await import(
    "./modules/00-shared/infrastructure/database.js"
  );
  const db = new Database(env.DATABASE_URL);

  // Clean up DB on exit
  app.addHook("onClose", async () => {
    await db.close();
  });

  // Identity Module
  const { UserRepository } = await import(
    "./modules/01-identity/infrastructure/user.repository.js"
  );
  const { SessionRepository } = await import(
    "./modules/01-identity/infrastructure/session.repository.js"
  );
  const { MailService } = await import(
    "./modules/00-shared/infrastructure/mail.service.js"
  );
  const { authRoutes } = await import(
    "./modules/01-identity/presentation/auth.controller.js"
  );
  const { createAuthMiddleware } = await import(
    "./modules/00-shared/presentation/auth.middleware.js"
  );

  const userRepository = new UserRepository(db);
  const sessionRepository = new SessionRepository(db);
  const mailService = new MailService();

  const authMiddleware = createAuthMiddleware(
    sessionRepository,
    userRepository,
  );

  // Tenancy Module
  const { TenantRepository } = await import(
    "./modules/02-tenancy/infrastructure/tenant.repository.js"
  );
  const { MembershipRepository } = await import(
    "./modules/02-tenancy/infrastructure/membership.repository.js"
  );
  const { InvitationRepository } = await import(
    "./modules/02-tenancy/infrastructure/invitation.repository.js"
  );
  const { OnboardingService } = await import(
    "./modules/02-tenancy/application/onboarding.service.js"
  );
  const { InvitationService } = await import(
    "./modules/02-tenancy/application/invitation.service.js"
  );
  const { tenantRoutes } = await import(
    "./modules/02-tenancy/presentation/tenant.controller.js"
  );

  const tenantRepository = new TenantRepository(db);
  const membershipRepository = new MembershipRepository(db);
  const invitationRepository = new InvitationRepository(db);
  const onboardingService = new OnboardingService(
    db,
    tenantRepository,
    membershipRepository,
  );
  const invitationService = new InvitationService(
    db,
    invitationRepository,
    membershipRepository,
    mailService,
  );

  // Team Module
  const { TeamRepository } = await import(
    "./modules/04-team/infrastructure/team.repository.js"
  );
  const { TeamService } = await import(
    "./modules/04-team/application/team.service.js"
  );
  const { teamRoutes } = await import(
    "./modules/04-team/presentation/team.controller.js"
  );
  const { AuditRepository } = await import(
    "./modules/04-team/infrastructure/audit.repository.js"
  );
  const { AuditService } = await import(
    "./modules/04-team/application/audit.service.js"
  );
  const { auditRoutes } = await import(
    "./modules/04-team/presentation/audit.controller.js"
  );
  const { ErrorReportRepository } = await import(
    "./modules/04-team/infrastructure/error-report.repository.js"
  );
  const { supportRoutes } = await import(
    "./modules/04-team/presentation/support.controller.js"
  );

  const teamRepository = new TeamRepository(db);
  const teamService = new TeamService(db, teamRepository);

  // CRM Module
  const { ContactRepository } = await import(
    "./modules/05-crm/infrastructure/contact.repository.js"
  );
  const { TagRepository } = await import(
    "./modules/05-crm/infrastructure/tag.repository.js"
  );
  const { SegmentRepository } = await import(
    "./modules/05-crm/infrastructure/segment.repository.js"
  );
  const { ContactService } = await import(
    "./modules/05-crm/application/contact.service.js"
  );
  const { TagService } = await import(
    "./modules/05-crm/application/tag.service.js"
  );
  const { SegmentService } = await import(
    "./modules/05-crm/application/segment.service.js"
  );
  const { contactRoutes } = await import(
    "./modules/05-crm/presentation/contact.controller.js"
  );
  const { tagRoutes } = await import(
    "./modules/05-crm/presentation/tag.controller.js"
  );
  const { segmentRoutes } = await import(
    "./modules/05-crm/presentation/segment.controller.js"
  );
  const { CustomFieldRepository } = await import(
    "./modules/05-crm/infrastructure/custom-field.repository.js"
  );
  const { ContactImportRepository } = await import(
    "./modules/05-crm/infrastructure/contact-import.repository.js"
  );
  const { CustomFieldService } = await import(
    "./modules/05-crm/application/custom-field.service.js"
  );
  const { ContactImportService } = await import(
    "./modules/05-crm/application/contact-import.service.js"
  );
  const { customFieldRoutes } = await import(
    "./modules/05-crm/presentation/custom-field.controller.js"
  );
  const { importRoutes } = await import(
    "./modules/05-crm/presentation/import.controller.js"
  );
  const { PipelineRepository } = await import(
    "./modules/05-crm/infrastructure/pipeline.repository.js"
  );
  const { DealRepository } = await import(
    "./modules/05-crm/infrastructure/deal.repository.js"
  );
  const { PipelineService } = await import(
    "./modules/05-crm/application/pipeline.service.js"
  );
  const { DealService } = await import(
    "./modules/05-crm/application/deal.service.js"
  );
  const { pipelineRoutes } = await import(
    "./modules/05-crm/presentation/pipeline.controller.js"
  );
  const { dealRoutes } = await import(
    "./modules/05-crm/presentation/deal.controller.js"
  );
  
  // Inbox Module
  const { InboxService } = await import(
    "./modules/06-inbox/application/inbox.service.js"
  );
  const { inboxRoutes } = await import(
    "./modules/06-inbox/presentation/inbox.controller.js"
  );

  const contactRepository = new ContactRepository(db);
  const tagRepository = new TagRepository(db);
  const segmentRepository = new SegmentRepository(db);
  const customFieldRepository = new CustomFieldRepository(db);
  const contactImportRepository = new ContactImportRepository(db);
  const pipelineRepository = new PipelineRepository(db);
  const dealRepository = new DealRepository(db);

  const contactService = new ContactService(db, contactRepository);
  const tagService = new TagService(tagRepository, db);
  const segmentService = new SegmentService(segmentRepository, db);
  const customFieldService = new CustomFieldService(customFieldRepository);
  const contactImportService = new ContactImportService(contactImportRepository);
  const pipelineService = new PipelineService(db, pipelineRepository);
  const dealService = new DealService(db, dealRepository, pipelineRepository, contactRepository);
  const inboxService = new InboxService(db);

  // Register auth routes (no auth required for most, auth plugin handles middleware where needed)
  app.register(async (instance) => {
    const auditRepository = new AuditRepository(db);
    const auditService = new AuditService(db, auditRepository);
    const errorReportRepository = new ErrorReportRepository(db);

    // Add auth middleware hook to all tenant routes
    instance.addHook("onRequest", authMiddleware);
    tenantRoutes(instance, db, onboardingService, invitationService);
    teamRoutes(instance, db, teamService);
    auditRoutes(instance, db, auditService);
    supportRoutes(instance, db, errorReportRepository);
    contactRoutes(instance, db, contactService);
    tagRoutes(instance, db, tagService);
    segmentRoutes(instance, db, segmentService);
    customFieldRoutes(instance, db, customFieldService);
    importRoutes(instance, db, contactImportService);
    pipelineRoutes(instance, db, pipelineService);
    dealRoutes(instance, db, dealService);
    inboxRoutes(instance, db, inboxService);
  });

  // Reject the obsolete browser identity paths; Auth.js is the canonical web surface.
  app.register(async (instance) => {
    authRoutes(instance);
  });

  try {
    await app.listen({ port: env.API_PORT, host: env.API_HOST });
    logger.info(
      `${env.APP_NAME} API upstream is ready; public access must use the HTTPS proxy`,
      { host: env.API_HOST, port: env.API_PORT }
    );
  } catch (err) {
    logger.error("Failed to start server", err);
    process.exit(1);
  }
}

bootstrap();
