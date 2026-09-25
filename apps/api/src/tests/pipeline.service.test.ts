import { describe, it, before, after } from "node:test";
import assert from "node:assert";
import { PipelineService } from "../modules/05-crm/application/pipeline.service.js";
import { PipelineRepository } from "../modules/05-crm/infrastructure/pipeline.repository.js";
import { Database } from "../modules/00-shared/infrastructure/database.js";
import { TenantRepository } from "../modules/02-tenancy/infrastructure/tenant.repository.js";
// removed TenantContext import
import { randomUUID } from "node:crypto";

describe("PipelineService", () => {
  let db: Database;
  let tenantRepo: TenantRepository;

  const validContext = (tenantId: string, membershipId: string, userId: string) => ({
    tenantId,
    membershipId,
    userId,
    requestId: randomUUID(),
    role: "tenant_admin",
    globalPermissions: ["crm.pipelines.manage", "crm.deals.read"],
    departmentGrants: {},
  });

  before(async () => {
    const databaseUrl =
      process.env["DATABASE_URL"] ||
      "postgresql://api_user:api_pass@localhost:5432/bipesend";
    db = new Database(databaseUrl);
    tenantRepo = new TenantRepository(db);
  });

  after(async () => {
    await db.close();
  });

  it("should create a pipeline successfully", async () => {
    const tenant = await tenantRepo.create("Pipeline Test Tenant 1");
    const userId = randomUUID();
    
    await db.withTransaction(async (txDb) => {
      await txDb.query(`INSERT INTO users (id, email, name, updated_at) VALUES ($1, $2, $3, NOW())`, [userId, `pipe-${tenant.id}@test.com`, 'Test']);
      const membership = await txDb.query(`INSERT INTO memberships (tenant_id, user_id, role) VALUES ($1, $2, $3) RETURNING id`, [tenant.id, userId, 'tenant_admin']);
      
      const service = new PipelineService(txDb, new PipelineRepository(txDb));
      const ctx = validContext(tenant.id, membership[0].id, userId);

      const pipeline = await service.createPipeline(ctx as any, { 
        name: "Sales",
        description: "",
        defaultCurrency: "BRL"
      }) as any;
      assert.strictEqual(pipeline.name, "Sales");
      assert.strictEqual(pipeline.tenantId, tenant.id);

      const stages = await service.createStage(ctx as any, pipeline.id, {
        name: "New",
        position: 0,
        category: "open",
        colorToken: "blue-500",
        requiredFieldRules: { version: 1, rules: [] }
      } as any) as any;
      
      assert.strictEqual(stages.pipelineId, pipeline.id);
      assert.strictEqual(stages.name, "New");
    }, tenant.id);
  });

  it("should fail to create pipeline if permission is missing", async () => {
    const tenant = await tenantRepo.create("Pipeline Test Tenant 2");
    const userId = randomUUID();
    
    await db.withTransaction(async (txDb) => {
      await txDb.query(`INSERT INTO users (id, email, name, updated_at) VALUES ($1, $2, $3, NOW())`, [userId, `pipe2-${tenant.id}@test.com`, 'Test']);
      const membership = await txDb.query(`INSERT INTO memberships (tenant_id, user_id, role) VALUES ($1, $2, $3) RETURNING id`, [tenant.id, userId, 'tenant_admin']);
      
      const service = new PipelineService(txDb, new PipelineRepository(txDb));
      const ctx = { ...validContext(tenant.id, membership[0].id, userId), globalPermissions: [] };

      await assert.rejects(
        async () => service.createPipeline(ctx as any, { 
          name: "Fail",
          description: "",
          defaultCurrency: "BRL"
        }),
        { message: "PERMISSION_DENIED" }
      );
    }, tenant.id);
  });

  it("should block deletion of stage if deals exist", async () => {
    const tenant = await tenantRepo.create("Pipeline Test Tenant 3");
    const userId = randomUUID();
    
    await db.withTransaction(async (txDb) => {
      await txDb.query(`INSERT INTO users (id, email, name, updated_at) VALUES ($1, $2, $3, NOW())`, [userId, `pipe3-${tenant.id}@test.com`, 'Test']);
      const membership = await txDb.query(`INSERT INTO memberships (tenant_id, user_id, role) VALUES ($1, $2, $3) RETURNING id`, [tenant.id, userId, 'tenant_admin']);
      
      const service = new PipelineService(txDb, new PipelineRepository(txDb));
      const ctx = validContext(tenant.id, membership[0].id, userId);

      const pipeline = await service.createPipeline(ctx as any, { 
        name: "With Deals",
        description: "",
        defaultCurrency: "BRL" 
      }) as any;
      const stage = await service.createStage(ctx as any, pipeline.id, {
        name: "Stage 1",
        position: 0,
        category: "open",
        colorToken: "blue-500",
        requiredFieldRules: { version: 1, rules: [] }
      } as any) as any;

      const contact = await txDb.query(`INSERT INTO contacts (tenant_id, name) VALUES ($1, $2) RETURNING id`, [tenant.id, 'Contact']);
      
      // Create deal
      await txDb.query(
        `INSERT INTO deals (tenant_id, pipeline_id, stage_id, contact_id, title, amount, created_by_membership_id, updated_by_membership_id) 
         VALUES ($1, $2, $3, $4, $5, 100, $6, $6)`,
         [tenant.id, pipeline.id, stage.id, contact[0].id, 'Test Deal', membership[0].id]
      );

      await assert.rejects(
        async () => service.deleteStage(ctx as any, stage.id),
        { message: "CANNOT_DELETE_STAGE_WITH_DEALS" }
      );
    }, tenant.id);
  });

  it("should list stages in correct order and allow deleting stage and pipeline", async () => {
    const tenant = await tenantRepo.create("Pipeline Test Tenant 4");
    const userId = randomUUID();
    
    await db.withTransaction(async (txDb) => {
      await txDb.query(`INSERT INTO users (id, email, name, updated_at) VALUES ($1, $2, $3, NOW())`, [userId, `pipe4-${tenant.id}@test.com`, 'Test']);
      const membership = await txDb.query(`INSERT INTO memberships (tenant_id, user_id, role) VALUES ($1, $2, $3) RETURNING id`, [tenant.id, userId, 'tenant_admin']);
      
      const service = new PipelineService(txDb, new PipelineRepository(txDb));
      const ctx = validContext(tenant.id, membership[0].id, userId);

      const pipeline = await service.createPipeline(ctx as any, { 
        name: "Order Test",
        description: "",
        defaultCurrency: "BRL" 
      }) as any;

      await service.createStage(ctx as any, pipeline.id, {
        name: "Stage 2",
        position: 1,
        category: "won",
        colorToken: "green-500",
        requiredFieldRules: { version: 1, rules: [] }
      } as any);

      await service.createStage(ctx as any, pipeline.id, {
        name: "Stage 1",
        position: 0,
        category: "open",
        colorToken: "blue-500",
        requiredFieldRules: { version: 1, rules: [] }
      } as any);

      const stages = (await service.listStages(ctx as any, pipeline.id)) as any[];
      assert.strictEqual(stages.length, 2);
      assert.strictEqual(stages[0].name, "Stage 1");
      assert.strictEqual(stages[1].name, "Stage 2");

      await service.deleteStage(ctx as any, stages[0].id);
      const remainingStages = (await service.listStages(ctx as any, pipeline.id)) as any[];
      assert.strictEqual(remainingStages.length, 1);
      assert.strictEqual(remainingStages[0].name, "Stage 2");

      await service.deleteStage(ctx as any, stages[1].id);
      await service.deletePipeline(ctx as any, pipeline.id);

      const pipelines = (await service.listPipelines(ctx as any)) as any[];
      assert.strictEqual(pipelines.find(p => p.id === pipeline.id), undefined);
    }, tenant.id);
  });

  it("should protect default pipeline against deletion and correctly count only custom pipelines", async () => {
    const tenant = await tenantRepo.create("Pipeline Default Quota Tenant");
    const userId = randomUUID();

    await db.withTransaction(async (txDb) => {
      await txDb.query(`INSERT INTO users (id, email, name, updated_at) VALUES ($1, $2, $3, NOW())`, [userId, `pipe-default-${tenant.id}@test.com`, 'Test Default']);
      const membership = await txDb.query(`INSERT INTO memberships (tenant_id, user_id, role) VALUES ($1, $2, $3) RETURNING id`, [tenant.id, userId, 'tenant_admin']);

      const repo = new PipelineRepository(txDb);
      const service = new PipelineService(txDb, repo);
      const ctx = validContext(tenant.id, membership[0].id, userId);

      // 1. Funil Principal Gratuito do Sistema (isDefault = true)
      const defaultPipeline = await service.createPipeline(ctx as any, {
        name: "Atendimento Omnichannel",
        description: "Funil principal gratuito do sistema",
        defaultCurrency: "BRL",
        isDefault: true,
      }) as any;

      assert.strictEqual(defaultPipeline.isDefault, true);

      // 2. Funil Comercial Adicional (isDefault = false)
      const customPipeline = await service.createPipeline(ctx as any, {
        name: "Expansão B2B",
        description: "Funil adicional contratado",
        defaultCurrency: "BRL",
        isDefault: false,
      }) as any;

      assert.strictEqual(customPipeline.isDefault, false);

      // 3. Contagem de funis customizados (deve ser 1, ignorando o principal gratuito)
      const customCount = await repo.countCustomPipelines(tenant.id);
      assert.strictEqual(customCount, 1, "Apenas funis adicionais não-default devem consumir cota do plano");

      // 4. Tentativa de deletar o funil principal gratuito deve ser bloqueada
      await assert.rejects(
        async () => service.deletePipeline(ctx as any, defaultPipeline.id),
        { message: "CANNOT_DELETE_DEFAULT_PIPELINE" },
        "Funil principal do sistema não pode ser deletado sob nenhuma hipótese"
      );

      // 5. Deletar o funil customizado adicional deve ser permitido
      await service.deletePipeline(ctx as any, customPipeline.id);
      const updatedCustomCount = await repo.countCustomPipelines(tenant.id);
      assert.strictEqual(updatedCustomCount, 0);
    }, tenant.id);
  });
});
