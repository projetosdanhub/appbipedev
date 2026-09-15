-- Enable RLS
ALTER TABLE "pipelines" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "pipeline_stages" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "deals" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "deal_stage_history" ENABLE ROW LEVEL SECURITY;

-- Create Policies
CREATE POLICY "isolate_tenant_pipelines" ON "pipelines"
  AS PERMISSIVE FOR ALL
  TO public
  USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid)
  WITH CHECK (tenant_id = current_setting('app.current_tenant_id', true)::uuid);

CREATE POLICY "isolate_tenant_pipeline_stages" ON "pipeline_stages"
  AS PERMISSIVE FOR ALL
  TO public
  USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid)
  WITH CHECK (tenant_id = current_setting('app.current_tenant_id', true)::uuid);

CREATE POLICY "isolate_tenant_deals" ON "deals"
  AS PERMISSIVE FOR ALL
  TO public
  USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid)
  WITH CHECK (tenant_id = current_setting('app.current_tenant_id', true)::uuid);

CREATE POLICY "isolate_tenant_deal_stage_history" ON "deal_stage_history"
  AS PERMISSIVE FOR ALL
  TO public
  USING (tenant_id = current_setting('app.current_tenant_id', true)::uuid)
  WITH CHECK (tenant_id = current_setting('app.current_tenant_id', true)::uuid);
