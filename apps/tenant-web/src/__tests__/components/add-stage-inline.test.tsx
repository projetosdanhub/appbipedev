import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { AddStageInlineCard } from "../../features/crm/components/board/add-stage-inline";
import * as stageActions from "../../features/crm/actions/stage.actions";

vi.mock("../../features/crm/actions/stage.actions", () => ({
  createPipelineStageAction: vi.fn(),
}));

describe("AddStageInlineCard", () => {
  const defaultProps = {
    tenantId: "tenant-123",
    pipelineId: "pipe-456",
    existingCount: 3,
    onStageSaved: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("renders the initial 'Adicionar Fluxo' button", () => {
    render(<AddStageInlineCard {...defaultProps} />);
    expect(screen.getByRole("button", { name: /adicionar novo fluxo ao funil/i })).toBeInTheDocument();
  });

  it("switches to inline card on click without any modal/popup", async () => {
    const user = userEvent.setup();
    render(<AddStageInlineCard {...defaultProps} />);

    const openBtn = screen.getByRole("button", { name: /adicionar novo fluxo ao funil/i });
    await user.click(openBtn);

    // Deve exibir o cabeçalho 'Novo Fluxo' e o input de nome
    expect(screen.getByText("Novo Fluxo")).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/ex: proposta enviada\.\.\./i)).toBeInTheDocument();

    // NÃO deve haver campo de 'Tipo de Fluxo'
    expect(screen.queryByText(/tipo do fluxo/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/tipo de fluxo/i)).not.toBeInTheDocument();
  });

  it("displays up to 10 saved colors and allows selecting them", async () => {
    const user = userEvent.setup();
    render(<AddStageInlineCard {...defaultProps} />);

    await user.click(screen.getByRole("button", { name: /adicionar novo fluxo ao funil/i }));

    expect(screen.getByText(/cores salvas \(10\/10\)/i)).toBeInTheDocument();
    
    // Verifica que temos 10 botões de swatch de cor
    const swatches = screen.getAllByRole("button", { name: /selecionar cor/i });
    expect(swatches).toHaveLength(10);
  });

  it("allows typing custom hexadecimal and saving it to favorites", async () => {
    const user = userEvent.setup();
    render(<AddStageInlineCard {...defaultProps} />);

    await user.click(screen.getByRole("button", { name: /adicionar novo fluxo ao funil/i }));

    const hexInput = screen.getByPlaceholderText("#007BFF");
    await user.clear(hexInput);
    await user.type(hexInput, "#FF0088");

    const saveColorBtn = screen.getByRole("button", { name: /salvar cor/i });
    await user.click(saveColorBtn);

    // O localStorage deve ter sido atualizado com #FF0088
    const stored = JSON.parse(localStorage.getItem("bipesend_crm_saved_flow_colors") || "[]");
    expect(stored[0]).toBe("#FF0088");
    expect(stored.length).toBeLessThanOrEqual(10);
  });

  it("submits the new stage with open category and selected color", async () => {
    const user = userEvent.setup();
    const mockCreatedStage = {
      id: "stage-new-1",
      pipelineId: "pipe-456",
      name: "Negociação Avançada",
      colorToken: "#007BFF",
      category: "open",
      position: 3,
      requiredFieldRules: { version: 1, rules: [] },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    vi.mocked(stageActions.createPipelineStageAction).mockResolvedValueOnce({
      success: true,
      data: mockCreatedStage as any,
      message: "Success",
    });

    render(<AddStageInlineCard {...defaultProps} />);

    await user.click(screen.getByRole("button", { name: /adicionar novo fluxo ao funil/i }));

    const nameInput = screen.getByPlaceholderText(/ex: proposta enviada\.\.\./i);
    await user.type(nameInput, "Negociação Avançada");

    const submitBtn = screen.getByRole("button", { name: /^adicionar fluxo$/i });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(stageActions.createPipelineStageAction).toHaveBeenCalledWith(
        "tenant-123",
        "pipe-456",
        expect.objectContaining({
          name: "Negociação Avançada",
          category: "open",
          pipelineId: "pipe-456",
          position: 3,
        })
      );
      expect(defaultProps.onStageSaved).toHaveBeenCalledWith(mockCreatedStage, false);
    });
  });
});
