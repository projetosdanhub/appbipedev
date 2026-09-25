import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { CreatePipelineInline } from "../../features/crm/components/create-pipeline-inline";
import * as pipelineActions from "../../features/crm/actions/pipeline.actions";
import * as stageActions from "../../features/crm/actions/stage.actions";
import { CrmPipeline, CrmPipelineStage } from "@bipesend/contracts";

vi.mock("../../features/crm/actions/pipeline.actions", () => ({
  createPipelineAction: vi.fn(),
}));

vi.mock("../../features/crm/actions/stage.actions", () => ({
  createPipelineStageAction: vi.fn(),
}));

describe("CreatePipelineInline", () => {
  const existingPipelines: CrmPipeline[] = [
    {
      id: "pipe-1",
      tenantId: "tenant-123",
      name: "Funil Comercial",
      nameNormalized: "funil comercial",
      description: "Funil principal",
      status: "active",
      defaultCurrency: "BRL",
      version: 1,
      isDefault: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "pipe-2",
      tenantId: "tenant-123",
      name: "Pós-Venda",
      nameNormalized: "pos-venda",
      description: "Acompanhamento",
      status: "active",
      defaultCurrency: "BRL",
      version: 1,
      isDefault: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const defaultProps = {
    tenantId: "tenant-123",
    existingPipelines,
    defaultPipelineId: "pipe-1",
    onClose: vi.fn(),
    onPipelineCreated: vi.fn(),
    onSetDefaultPipeline: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders all form elements with header drawer and strategic flows preview", () => {
    render(<CreatePipelineInline {...defaultProps} />);

    // Aba expandida do cabeçalho
    expect(screen.getByTestId("crm-create-pipeline-inline")).toBeInTheDocument();
    expect(screen.getByText("Criar Novo Funil")).toBeInTheDocument();
    expect(screen.getByText("Aba Rápida")).toBeInTheDocument();

    // Campos principais
    expect(screen.getByLabelText(/^nome/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/descrição/i)).toBeInTheDocument();

    // Chave de fluxos estratégicos de mercado
    expect(screen.getByText(/fluxo estratégico de mercado/i)).toBeInTheDocument();
    expect(screen.getByText(/Alta Conversão • Resgate • Pós-Venda/i)).toBeInTheDocument();
    expect(screen.getByText("Entrada de Leads")).toBeInTheDocument();
    expect(screen.getByText("Resgate de Oportunidades")).toBeInTheDocument();
    expect(screen.getByText("Pós-Venda & Fidelização")).toBeInTheDocument();

    // Checkbox de funil padrão
    expect(screen.getByLabelText(/definir como funil padrão/i)).toBeInTheDocument();

    // Botões de ação
    expect(screen.getByRole("button", { name: /^cancelar$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /criar funil$/i })).toBeInTheDocument();
  });

  it("validates unique pipeline name in real time and blocks duplicate names", async () => {
    const user = userEvent.setup();
    render(<CreatePipelineInline {...defaultProps} />);

    const nameInput = screen.getByLabelText(/^nome/i);
    const submitBtn = screen.getByRole("button", { name: /criar funil$/i });

    // Digita um nome idêntico (case-insensitive) ao existente "Funil Comercial"
    await user.type(nameInput, "funil comercial");

    // Alerta em tempo real de duplicidade
    expect(
      screen.getByText(/já existe um funil com o nome/i)
    ).toBeInTheDocument();

    // Botão de submissão deve estar desabilitado
    expect(submitBtn).toBeDisabled();

    // Altera para um nome exclusivo
    await user.clear(nameInput);
    await user.type(nameInput, "Vendas WhatsApp Outbound");

    // Alerta de duplicidade deve sumir e botão habilitar
    expect(screen.queryByText(/já existe um funil com o nome/i)).not.toBeInTheDocument();
    expect(submitBtn).not.toBeDisabled();
  });

  it("warns the user dynamically when setting as default if another default funnel exists", async () => {
    const user = userEvent.setup();
    render(<CreatePipelineInline {...defaultProps} />);

    const defaultCheckbox = screen.getByLabelText(/definir como funil padrão/i);

    // Inicialmente não está marcado se já existirem funis
    expect(defaultCheckbox).not.toBeChecked();
    expect(screen.queryByText(/substituirá/i)).not.toBeInTheDocument();

    // Clica para definir como padrão
    await user.click(defaultCheckbox);
    expect(defaultCheckbox).toBeChecked();

    // Deve exibir aviso inteligente informando que substituirá o funil "Funil Comercial"
    expect(screen.getByText(/substituirá "Funil Comercial"/i)).toBeInTheDocument();
  });

  it("closes when pressing the Escape key or clicking close button", async () => {
    const user = userEvent.setup();
    render(<CreatePipelineInline {...defaultProps} />);

    // Pressiona Escape
    fireEvent.keyDown(document, { key: "Escape" });
    expect(defaultProps.onClose).toHaveBeenCalled();

    // Clica no botão de fechar (X)
    const closeBtn = screen.getByLabelText("Fechar aba de criação de funil");
    await user.click(closeBtn);
    expect(defaultProps.onClose).toHaveBeenCalledTimes(2);
  });

  it("submits and creates pipeline with strategic market stages successfully", async () => {
    const user = userEvent.setup();
    const createdPipelineMock: CrmPipeline = {
      id: "pipe-new",
      tenantId: "tenant-123",
      name: "Expansão Enterprise",
      nameNormalized: "expansao enterprise",
      description: "Novos contratos corporativos",
      status: "active",
      defaultCurrency: "BRL",
      version: 1,
      isDefault: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const createdStageMock: CrmPipelineStage = {
      id: "stage-1",
      tenantId: "tenant-123",
      pipelineId: "pipe-new",
      name: "Entrada de Leads",
      position: 0,
      category: "open",
      colorToken: "#007BFF",
      requiredFieldRules: { version: 1, rules: [] },
      version: 1,
      archivedAt: null,
    };

    vi.mocked(pipelineActions.createPipelineAction).mockResolvedValueOnce({
      success: true,
      message: "Funil criado com sucesso",
      data: createdPipelineMock,
    });

    vi.mocked(stageActions.createPipelineStageAction).mockResolvedValue({
      success: true,
      message: "Etapa criada com sucesso",
      data: createdStageMock,
    });

    render(<CreatePipelineInline {...defaultProps} />);

    await user.type(screen.getByLabelText(/^nome/i), "Expansão Enterprise");
    await user.type(screen.getByLabelText(/descrição/i), "Novos contratos corporativos");

    // Marca como padrão
    await user.click(screen.getByLabelText(/definir como funil padrão/i));

    const submitBtn = screen.getByRole("button", { name: /criar funil$/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(pipelineActions.createPipelineAction).toHaveBeenCalledWith("tenant-123", {
        name: "Expansão Enterprise",
        description: "Novos contratos corporativos",
        defaultCurrency: "BRL",
      });
    }, { timeout: 4000 });

    // Deve ter chamado a criação das 8 etapas estratégicas
    expect(stageActions.createPipelineStageAction).toHaveBeenCalledTimes(8);

    await waitFor(() => {
      expect(defaultProps.onSetDefaultPipeline).toHaveBeenCalledWith("pipe-new");
      expect(defaultProps.onPipelineCreated).toHaveBeenCalledWith(
        createdPipelineMock,
        expect.arrayContaining([createdStageMock])
      );
      expect(defaultProps.onClose).toHaveBeenCalled();
    }, { timeout: 4000 });
  }, 15000);
});
