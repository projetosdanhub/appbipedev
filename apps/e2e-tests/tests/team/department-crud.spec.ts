import { test, expect } from "@playwright/test";

test.describe.serial("CRUD de Setores (TEAM-001)", () => {
  test.use({ baseURL: "http://127.0.0.1:3001" });

  const testEmail = `admin_${Date.now()}@bipesend.com.br`;
  const testPassword = "Password123!";
  const deptName = `Setor ${Date.now()}`;
  const editedDeptName = `${deptName} Editado`;

  test("Deve criar usuário e configurar workspace", async ({ page }) => {
    // 1. Registro
    await page.goto("/register");
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: "Cadastrar com E-mail" }).click();
    await page.fill('input[name="name"]', "Admin Setores");
    await page.fill('input[name="companyName"]', "Empresa Setores");
    await page.fill('input[name="email"]', testEmail);
    await page.fill('input[name="password"]', testPassword);
    await page.click('button[type="submit"]');

    // 2. Aguarda redirecionar (para onboarding ou app)
    await expect(page).toHaveURL(/.*\/onboarding/, { timeout: 15000 });

    // 3. Completar o onboarding
    await page.fill('input[name="companyName"]', "Meu Workspace de Setores");
    await page.fill('input[name="slug"]', `workspace-setores-${Date.now()}`);
    await page.getByRole("button", { name: "Concluir" }).click();

    await expect(page).toHaveURL(/.*\/$/, { timeout: 15000 });
  });

  test("Deve acessar configurações de equipe e criar um setor", async ({ page }) => {
    // Log in just in case the session is not preserved in a new test (though Playwright might drop context if not using storage state, so we login again)
    await page.goto("/login");
    await page.waitForLoadState("networkidle");
    if (await page.getByRole("heading", { name: "Entre na sua conta" }).isVisible()) {
      await page.getByRole("button", { name: "Logar com E-mail e Senha" }).click();
      await page.fill('input[name="email"]', testEmail);
      await page.fill('input[name="password"]', testPassword);
      await page.click('button[type="submit"]');
      await expect(page).toHaveURL(/.*\/$/, { timeout: 15000 });
    }

    // Navegar para configurações de equipe na aba Setores
    await page.goto("/settings/team?tab=departments");
    await page.waitForLoadState("networkidle");
    
    // Clicar em "Novo Setor"
    await page.getByRole("button", { name: "Novo Setor" }).click();

    // Preencher o formulário
    await page.fill('input[placeholder="Ex: Comercial"]', deptName);
    await page.fill('input[placeholder="Descrição das atividades do setor"]', "Descrição de teste");
    
    // Submeter
    await page.getByRole("button", { name: "Criar Setor" }).click();

    // Aguardar o setor aparecer na lista
    await expect(page.getByText(deptName)).toBeVisible({ timeout: 15000 });
  });

  test("Deve editar um setor existente", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("networkidle");
    if (await page.getByRole("heading", { name: "Entre na sua conta" }).isVisible()) {
      await page.getByRole("button", { name: "Logar com E-mail e Senha" }).click();
      await page.fill('input[name="email"]', testEmail);
      await page.fill('input[name="password"]', testPassword);
      await page.click('button[type="submit"]');
      await expect(page).toHaveURL(/.*\/$/, { timeout: 15000 });
    }

    await page.goto("/settings/team?tab=departments");
    await page.waitForLoadState("networkidle");

    // Encontrar o setor e clicar no botão de edição (lápis)
    const deptRow = page.locator("div.flex.items-center.justify-between", { hasText: deptName }).first();
    await deptRow.locator("button").first().click();

    // Preencher o novo nome
    await page.fill('input[placeholder="Ex: Comercial"]', editedDeptName);
    
    // Submeter
    await page.getByRole("button", { name: "Salvar Alterações" }).click();

    // Aguardar o setor aparecer na lista com o novo nome
    await expect(page.getByText(editedDeptName)).toBeVisible({ timeout: 15000 });
  });

  test("Deve excluir um setor existente", async ({ page }) => {
    await page.goto("/login");
    await page.waitForLoadState("networkidle");
    if (await page.getByRole("heading", { name: "Entre na sua conta" }).isVisible()) {
      await page.getByRole("button", { name: "Logar com E-mail e Senha" }).click();
      await page.fill('input[name="email"]', testEmail);
      await page.fill('input[name="password"]', testPassword);
      await page.click('button[type="submit"]');
      await expect(page).toHaveURL(/.*\/$/, { timeout: 15000 });
    }

    await page.goto("/settings/team?tab=departments");
    await page.waitForLoadState("networkidle");

    // Aceitar dialogos automaticamente
    page.on('dialog', dialog => dialog.accept());

    // Encontrar o setor e clicar no botão de excluir (lixeira)
    const deptRow = page.locator("div.flex.items-center.justify-between", { hasText: editedDeptName }).first();
    await deptRow.locator("button").nth(1).click();

    // Aguardar o setor desaparecer da lista
    await expect(page.getByText(editedDeptName)).toBeHidden({ timeout: 15000 });
  });
});
