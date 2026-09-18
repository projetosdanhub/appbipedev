-- AlterTable
ALTER TABLE "contacts" ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "departments" ADD COLUMN     "archived_at" TIMESTAMP(3),
ADD COLUMN     "created_by_membership_id" UUID,
ADD COLUMN     "lead_membership_id" UUID,
ADD COLUMN     "name_normalized" TEXT,
ADD COLUMN     "sort_order" INTEGER,
ADD COLUMN     "status" VARCHAR(50) NOT NULL DEFAULT 'active';

-- AlterTable
ALTER TABLE "invitations" ADD COLUMN     "accepted_at" TIMESTAMP(3),
ADD COLUMN     "accepted_by_user_id" UUID,
ADD COLUMN     "access_snapshot_version" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "challenge_id" VARCHAR(255),
ADD COLUMN     "created_by_membership_id" UUID,
ADD COLUMN     "delivery_status" VARCHAR(50) NOT NULL DEFAULT 'queued',
ADD COLUMN     "email_normalized" VARCHAR(255),
ADD COLUMN     "last_sent_at" TIMESTAMP(3),
ADD COLUMN     "name" VARCHAR(120),
ADD COLUMN     "relationship_type" VARCHAR(50) NOT NULL DEFAULT 'team_partner',
ADD COLUMN     "revoked_at" TIMESTAMP(3),
ADD COLUMN     "send_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "status" VARCHAR(50) NOT NULL DEFAULT 'pending',
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "memberships" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "alias" VARCHAR(100),
ADD COLUMN     "authorization_version" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "display_name" VARCHAR(120),
ADD COLUMN     "invited_by_membership_id" UUID,
ADD COLUMN     "job_title" VARCHAR(100),
ADD COLUMN     "joined_at" TIMESTAMP(3),
ADD COLUMN     "relationship_type" VARCHAR(50) NOT NULL DEFAULT 'team_partner',
ADD COLUMN     "removed_at" TIMESTAMP(3),
ADD COLUMN     "status" VARCHAR(50) NOT NULL DEFAULT 'active',
ADD COLUMN     "status_reason" TEXT,
ADD COLUMN     "suspended_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "role_permissions" ADD COLUMN     "scope_type" VARCHAR(50) NOT NULL DEFAULT 'TENANT',
ADD COLUMN     "tenant_id" UUID;

-- AlterTable
ALTER TABLE "roles" ADD COLUMN     "archived_at" TIMESTAMP(3),
ADD COLUMN     "created_by_membership_id" UUID,
ADD COLUMN     "description" VARCHAR(500),
ADD COLUMN     "is_base_role" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "key" VARCHAR(100),
ADD COLUMN     "name_normalized" TEXT,
ADD COLUMN     "policy_version" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "scope_kind" VARCHAR(50) NOT NULL DEFAULT 'TENANT',
ADD COLUMN     "status" VARCHAR(50) NOT NULL DEFAULT 'active',
ADD COLUMN     "updated_by_membership_id" UUID;

-- AlterTable
ALTER TABLE "sessions" ADD COLUMN     "impersonated_by" UUID;

-- AlterTable
ALTER TABLE "tenants" ADD COLUMN     "authorization_version" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "owner_membership_id" UUID,
ADD COLUMN     "slug" VARCHAR(100) NOT NULL DEFAULT gen_random_uuid(),
ADD COLUMN     "status" VARCHAR(50) NOT NULL DEFAULT 'active';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "auth_version" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "email_normalized" TEXT,
ADD COLUMN     "is_managed_account" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "must_change_password" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "password_changed_at" TIMESTAMP(3),
ADD COLUMN     "signup_origin" VARCHAR(50),
ADD COLUMN     "status" VARCHAR(50) NOT NULL DEFAULT 'active';

-- CreateTable
CREATE TABLE "disconnection_requests" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "membership_id" UUID NOT NULL,
    "tenant_id" UUID NOT NULL,
    "requested_by" UUID NOT NULL,
    "approved_by" UUID,
    "reason" TEXT NOT NULL,
    "status" VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "disconnection_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "permission_dependencies" (
    "permission_id" VARCHAR(100) NOT NULL,
    "required_permission_id" VARCHAR(100) NOT NULL,

    CONSTRAINT "permission_dependencies_pkey" PRIMARY KEY ("permission_id","required_permission_id")
);

-- CreateTable
CREATE TABLE "membership_roles" (
    "tenant_id" UUID NOT NULL,
    "membership_id" UUID NOT NULL,
    "role_id" UUID NOT NULL,
    "granted_by_membership_id" UUID,
    "granted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3),
    "revoked_at" TIMESTAMP(3),

    CONSTRAINT "membership_roles_pkey" PRIMARY KEY ("membership_id","role_id")
);

-- CreateTable
CREATE TABLE "department_memberships" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "department_id" UUID NOT NULL,
    "membership_id" UUID NOT NULL,
    "status" VARCHAR(50) NOT NULL DEFAULT 'active',
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "left_at" TIMESTAMP(3),
    "version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "department_memberships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "department_role_assignments" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "department_id" UUID NOT NULL,
    "department_membership_id" UUID NOT NULL,
    "role_id" UUID NOT NULL,
    "granted_by_membership_id" UUID,
    "granted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3),
    "revoked_at" TIMESTAMP(3),

    CONSTRAINT "department_role_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "membership_permission_grants" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "membership_id" UUID NOT NULL,
    "permission_id" VARCHAR(100) NOT NULL,
    "scope_type" VARCHAR(50) NOT NULL DEFAULT 'TENANT',
    "reason" TEXT,
    "granted_by_membership_id" UUID,
    "granted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3),
    "revoked_at" TIMESTAMP(3),

    CONSTRAINT "membership_permission_grants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_keys" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "key_hash" VARCHAR(255) NOT NULL,
    "prefix" VARCHAR(50) NOT NULL,
    "scopes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "expires_at" TIMESTAMP(3),
    "revoked_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "api_keys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "webhook_endpoints" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "url" VARCHAR(2048) NOT NULL,
    "secret" VARCHAR(255) NOT NULL,
    "events" TEXT[],
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "webhook_endpoints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "webhook_deliveries" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "endpoint_id" UUID NOT NULL,
    "event_id" VARCHAR(255) NOT NULL,
    "payload" JSONB NOT NULL,
    "status" VARCHAR(50) NOT NULL,
    "status_code" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "webhook_deliveries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "actor_id" UUID,
    "target_id" UUID,
    "tenant_id" UUID,
    "action" VARCHAR(100) NOT NULL,
    "details" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "error_reports" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID,
    "actor_id" UUID,
    "request_id" VARCHAR(100) NOT NULL,
    "error_code" VARCHAR(100) NOT NULL,
    "context" JSONB,
    "status" VARCHAR(50) NOT NULL DEFAULT 'open',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "error_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_import_batches" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "created_by_membership_id" UUID NOT NULL,
    "status" VARCHAR(50) NOT NULL,
    "request_key" VARCHAR(255) NOT NULL,
    "payload_hash" VARCHAR(255) NOT NULL,
    "mapping" JSONB,
    "parse_options" JSONB,
    "definition_snapshot" JSONB,
    "staged_rows" JSONB,
    "row_issues" JSONB,
    "selection_hash" VARCHAR(255),
    "confirmation_key" VARCHAR(255),
    "total_rows" INTEGER NOT NULL DEFAULT 0,
    "selected_rows" INTEGER NOT NULL DEFAULT 0,
    "created_count" INTEGER NOT NULL DEFAULT 0,
    "skipped_count" INTEGER NOT NULL DEFAULT 0,
    "result_references" JSONB,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "committed_at" TIMESTAMP(3),

    CONSTRAINT "contact_import_batches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pipelines" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "name_normalized" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "status" VARCHAR(50) NOT NULL DEFAULT 'active',
    "default_currency" VARCHAR(3) NOT NULL DEFAULT 'BRL',
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pipelines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pipeline_stages" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "pipeline_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "color_token" VARCHAR(50),
    "category" VARCHAR(50) NOT NULL DEFAULT 'open',
    "required_field_rules" JSONB NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "archived_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pipeline_stages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deals" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "contact_id" UUID NOT NULL,
    "pipeline_id" UUID NOT NULL,
    "stage_id" UUID NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'BRL',
    "expected_close_date" TIMESTAMP(3),
    "closed_at" TIMESTAMP(3),
    "lost_reason" VARCHAR(1000),
    "department_id" UUID,
    "routing_role_id" UUID,
    "assigned_membership_id" UUID,
    "created_by_membership_id" UUID NOT NULL,
    "updated_by_membership_id" UUID NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "archived_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "deals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deal_stage_history" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "deal_id" UUID NOT NULL,
    "from_stage_id" UUID,
    "to_stage_id" UUID NOT NULL,
    "actor_membership_id" UUID,
    "reason" VARCHAR(1000),
    "occurred_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "version" INTEGER NOT NULL,

    CONSTRAINT "deal_stage_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "contact_id" UUID NOT NULL,
    "subject" VARCHAR(255),
    "source" VARCHAR(50) NOT NULL DEFAULT 'internal_crm',
    "channel_reference" VARCHAR(255),
    "status" VARCHAR(50) NOT NULL DEFAULT 'open',
    "department_id" UUID,
    "routing_role_id" UUID,
    "assigned_membership_id" UUID,
    "created_by_membership_id" UUID NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "last_activity_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "conversation_id" UUID NOT NULL,
    "sequence" VARCHAR(50) NOT NULL,
    "kind" VARCHAR(50) NOT NULL DEFAULT 'internal_note',
    "direction" VARCHAR(50) NOT NULL DEFAULT 'internal',
    "author_membership_id" UUID,
    "external_sender_reference" VARCHAR(255),
    "text" TEXT NOT NULL,
    "has_media" BOOLEAN NOT NULL DEFAULT false,
    "media_url" TEXT,
    "media_type" VARCHAR(100),
    "media_name" VARCHAR(255),
    "media_size" INTEGER,
    "state" VARCHAR(50) NOT NULL DEFAULT 'saved',
    "client_message_id" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversation_read_states" (
    "tenant_id" UUID NOT NULL,
    "conversation_id" UUID NOT NULL,
    "membership_id" UUID NOT NULL,
    "last_read_sequence" VARCHAR(50) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conversation_read_states_pkey" PRIMARY KEY ("tenant_id","conversation_id","membership_id")
);

-- CreateTable
CREATE TABLE "conversation_status_history" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "conversation_id" UUID NOT NULL,
    "from_status" VARCHAR(50),
    "to_status" VARCHAR(50) NOT NULL,
    "actor_membership_id" UUID,
    "reason" VARCHAR(1000),
    "occurred_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "version" INTEGER NOT NULL,

    CONSTRAINT "conversation_status_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "connections" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "provider" VARCHAR(50) NOT NULL DEFAULT 'evolution_api',
    "instance_name" VARCHAR(255) NOT NULL,
    "instance_id" VARCHAR(255),
    "status" VARCHAR(50) NOT NULL DEFAULT 'disconnected',
    "phone" VARCHAR(50),
    "metadata" JSONB,
    "qrcode" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "connections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "outbox_events" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "status" VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "locked_until" TIMESTAMP(3),

    CONSTRAINT "outbox_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_dedupe" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "consumer" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "processed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_dedupe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assignment_histories" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "tenant_id" UUID NOT NULL,
    "entity_type" VARCHAR(50) NOT NULL,
    "entity_id" UUID NOT NULL,
    "from_department_id" UUID,
    "from_routing_role_id" UUID,
    "from_membership_id" UUID,
    "to_department_id" UUID,
    "to_routing_role_id" UUID,
    "to_membership_id" UUID,
    "actor_membership_id" UUID,
    "occurred_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "version" INTEGER NOT NULL,

    CONSTRAINT "assignment_histories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "department_memberships_department_id_membership_id_key" ON "department_memberships"("department_id", "membership_id");

-- CreateIndex
CREATE UNIQUE INDEX "department_role_assignments_department_membership_id_role_i_key" ON "department_role_assignments"("department_membership_id", "role_id");

-- CreateIndex
CREATE UNIQUE INDEX "api_keys_key_hash_key" ON "api_keys"("key_hash");

-- CreateIndex
CREATE INDEX "webhook_deliveries_endpoint_id_event_id_idx" ON "webhook_deliveries"("endpoint_id", "event_id");

-- CreateIndex
CREATE INDEX "audit_logs_actor_id_idx" ON "audit_logs"("actor_id");

-- CreateIndex
CREATE INDEX "audit_logs_target_id_idx" ON "audit_logs"("target_id");

-- CreateIndex
CREATE INDEX "audit_logs_tenant_id_idx" ON "audit_logs"("tenant_id");

-- CreateIndex
CREATE INDEX "error_reports_tenant_id_idx" ON "error_reports"("tenant_id");

-- CreateIndex
CREATE INDEX "error_reports_request_id_idx" ON "error_reports"("request_id");

-- CreateIndex
CREATE UNIQUE INDEX "contact_import_batches_tenant_id_created_by_membership_id_r_key" ON "contact_import_batches"("tenant_id", "created_by_membership_id", "request_key");

-- CreateIndex
CREATE UNIQUE INDEX "pipelines_tenant_id_name_key" ON "pipelines"("tenant_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "pipeline_stages_pipeline_id_name_key" ON "pipeline_stages"("pipeline_id", "name");

-- CreateIndex
CREATE INDEX "deals_tenant_id_pipeline_id_idx" ON "deals"("tenant_id", "pipeline_id");

-- CreateIndex
CREATE INDEX "deals_tenant_id_contact_id_idx" ON "deals"("tenant_id", "contact_id");

-- CreateIndex
CREATE INDEX "deal_stage_history_deal_id_idx" ON "deal_stage_history"("deal_id");

-- CreateIndex
CREATE INDEX "deal_stage_history_tenant_id_idx" ON "deal_stage_history"("tenant_id");

-- CreateIndex
CREATE INDEX "conversations_tenant_id_contact_id_idx" ON "conversations"("tenant_id", "contact_id");

-- CreateIndex
CREATE INDEX "messages_tenant_id_conversation_id_idx" ON "messages"("tenant_id", "conversation_id");

-- CreateIndex
CREATE UNIQUE INDEX "messages_tenant_id_conversation_id_author_membership_id_cli_key" ON "messages"("tenant_id", "conversation_id", "author_membership_id", "client_message_id");

-- CreateIndex
CREATE INDEX "conversation_status_history_tenant_id_conversation_id_idx" ON "conversation_status_history"("tenant_id", "conversation_id");

-- CreateIndex
CREATE UNIQUE INDEX "connections_instance_name_key" ON "connections"("instance_name");

-- CreateIndex
CREATE INDEX "connections_tenant_id_idx" ON "connections"("tenant_id");

-- CreateIndex
CREATE INDEX "outbox_events_tenant_id_idx" ON "outbox_events"("tenant_id");

-- CreateIndex
CREATE INDEX "outbox_events_status_locked_until_idx" ON "outbox_events"("status", "locked_until");

-- CreateIndex
CREATE INDEX "event_dedupe_tenant_id_idx" ON "event_dedupe"("tenant_id");

-- CreateIndex
CREATE INDEX "assignment_histories_tenant_id_entity_type_entity_id_idx" ON "assignment_histories"("tenant_id", "entity_type", "entity_id");

-- CreateIndex
CREATE UNIQUE INDEX "roles_key_key" ON "roles"("key");

-- CreateIndex
CREATE UNIQUE INDEX "tenants_slug_key" ON "tenants"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_normalized_key" ON "users"("email_normalized");

-- AddForeignKey
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "webhook_endpoints" ADD CONSTRAINT "webhook_endpoints_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "webhook_deliveries" ADD CONSTRAINT "webhook_deliveries_endpoint_id_fkey" FOREIGN KEY ("endpoint_id") REFERENCES "webhook_endpoints"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact_import_batches" ADD CONSTRAINT "contact_import_batches_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pipelines" ADD CONSTRAINT "pipelines_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pipeline_stages" ADD CONSTRAINT "pipeline_stages_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pipeline_stages" ADD CONSTRAINT "pipeline_stages_pipeline_id_fkey" FOREIGN KEY ("pipeline_id") REFERENCES "pipelines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deals" ADD CONSTRAINT "deals_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deals" ADD CONSTRAINT "deals_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deals" ADD CONSTRAINT "deals_pipeline_id_fkey" FOREIGN KEY ("pipeline_id") REFERENCES "pipelines"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deals" ADD CONSTRAINT "deals_stage_id_fkey" FOREIGN KEY ("stage_id") REFERENCES "pipeline_stages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deals" ADD CONSTRAINT "deals_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deals" ADD CONSTRAINT "deals_routing_role_id_fkey" FOREIGN KEY ("routing_role_id") REFERENCES "roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deals" ADD CONSTRAINT "deals_assigned_membership_id_fkey" FOREIGN KEY ("assigned_membership_id") REFERENCES "memberships"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deals" ADD CONSTRAINT "deals_created_by_membership_id_fkey" FOREIGN KEY ("created_by_membership_id") REFERENCES "memberships"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deals" ADD CONSTRAINT "deals_updated_by_membership_id_fkey" FOREIGN KEY ("updated_by_membership_id") REFERENCES "memberships"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deal_stage_history" ADD CONSTRAINT "deal_stage_history_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deal_stage_history" ADD CONSTRAINT "deal_stage_history_deal_id_fkey" FOREIGN KEY ("deal_id") REFERENCES "deals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deal_stage_history" ADD CONSTRAINT "deal_stage_history_actor_membership_id_fkey" FOREIGN KEY ("actor_membership_id") REFERENCES "memberships"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_routing_role_id_fkey" FOREIGN KEY ("routing_role_id") REFERENCES "roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_assigned_membership_id_fkey" FOREIGN KEY ("assigned_membership_id") REFERENCES "memberships"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_created_by_membership_id_fkey" FOREIGN KEY ("created_by_membership_id") REFERENCES "memberships"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_author_membership_id_fkey" FOREIGN KEY ("author_membership_id") REFERENCES "memberships"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_read_states" ADD CONSTRAINT "conversation_read_states_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_read_states" ADD CONSTRAINT "conversation_read_states_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_read_states" ADD CONSTRAINT "conversation_read_states_membership_id_fkey" FOREIGN KEY ("membership_id") REFERENCES "memberships"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_status_history" ADD CONSTRAINT "conversation_status_history_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_status_history" ADD CONSTRAINT "conversation_status_history_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_status_history" ADD CONSTRAINT "conversation_status_history_actor_membership_id_fkey" FOREIGN KEY ("actor_membership_id") REFERENCES "memberships"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "connections" ADD CONSTRAINT "connections_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignment_histories" ADD CONSTRAINT "assignment_histories_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignment_histories" ADD CONSTRAINT "assignment_histories_actor_membership_id_fkey" FOREIGN KEY ("actor_membership_id") REFERENCES "memberships"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- RLS para CRM
ALTER TABLE "pipelines" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation_pipelines" ON "pipelines" FOR ALL USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid);

ALTER TABLE "pipeline_stages" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation_pipeline_stages" ON "pipeline_stages" FOR ALL USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid);

ALTER TABLE "deals" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation_deals" ON "deals" FOR ALL USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid);

ALTER TABLE "deal_stage_history" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation_deal_stage_history" ON "deal_stage_history" FOR ALL USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid);

ALTER TABLE "conversations" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation_conversations" ON "conversations" FOR ALL USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid);

ALTER TABLE "messages" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation_messages" ON "messages" FOR ALL USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid);

ALTER TABLE "conversation_read_states" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation_conversation_read_states" ON "conversation_read_states" FOR ALL USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid);

ALTER TABLE "conversation_status_history" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation_conversation_status_history" ON "conversation_status_history" FOR ALL USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid);

ALTER TABLE "connections" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation_connections" ON "connections" FOR ALL USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid);

ALTER TABLE "assignment_histories" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tenant_isolation_assignment_histories" ON "assignment_histories" FOR ALL USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid);
