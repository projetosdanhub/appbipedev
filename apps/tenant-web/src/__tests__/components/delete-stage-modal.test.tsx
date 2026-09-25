import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { DeleteStageModal } from "../../features/crm/components/delete-stage-modal";
import * as stageActions from "../../features/crm/actions/stage.actions";
import { CrmPipelineStage } from "@bipesend/contracts";

vi.mock("../../features/crm/actions/stage.actions", () => ({
  deletePipelineStageAction: vi.fn(),
}));

describe("DeleteStageModal", () => {
  const stageToDelete: CrmPipelineStage = {
    id: "stage-1",
    tenantId: "tenant-123",
    pipelineId: "pipe-1",
    name: "Em Negociação",
    colorToken: "#007BFF",
    category: "open",
    position: 0,
    requiredFieldRules: { version: 1, rules: [] },
    version: 1,
    archivedAt: null,
  };

  const stageTarget: CrmPipelineStage = {
    id: "stage-2",
    tenantId: "tenant-123",
    pipelineId: "pipe-1",
    name: "Proposta Enviada",
    colorToken: "#6366F1",
    category: "open",
    position: 1,
    requiredFieldRules: { version: 1, rules: [] },
    version: 1,
    archivedAt: null,
  };

  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    tenantId: "tenant-123",
    pipelineId: "pipe-1",
    stage: stageToDelete,
    allStages: [stageToDelete, stageTarget],
    dealsCount: 0,
    onStageDeleted: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders empty stage deletion scenario without requiring transfer", async () => {
    const user = userEvent.setup();
    vi.mocked(stageActions.deletePipelineStageAction).mockResolvedValueOnce({
      success: true,
      message: "Excluído",
    });

    render(<DeleteStageModal {...defaultProps} dealsCount={0} />);

    expect(screen.getByRole("heading", { name: "Excluir Fluxo" })).toBeInTheDocument();
    expect(screen.getByText(/este fluxo está vazio/i)).toBeInTheDocument();

    const deleteBtn = screen.getByRole("button", { name: /^excluir fluxo$/i });
    await user.click(deleteBtn);

    await waitFor(() => {
      expect(stageActions.deletePipelineStageAction).toHaveBeenCalledWith(
        "tenant-123",
        "pipe-1",
        "stage-1",
        undefined
      );
      expect(defaultProps.onStageDeleted).toHaveBeenCalledWith("stage-1", undefined);
      expect(defaultProps.onClose).toHaveBeenCalled();
    });
  });

  it("requires transfer when stage contains deals and other stages exist", async () => {
    const user = userEvent.setup();
    vi.mocked(stageActions.deletePipelineStageAction).mockResolvedValueOnce({
      success: true,
      message: "Excluído com sucesso",
    });

    render(<DeleteStageModal {...defaultProps} dealsCount={4} />);

    expect(screen.getByText(/este fluxo possui/i)).toBeInTheDocument();
    expect(screen.getByText(/4 cards ativo\(s\)/i)).toBeInTheDocument();
    expect(screen.getByText(/mover cards para o fluxo de destino/i)).toBeInTheDocument();
    expect(screen.getByText("Proposta Enviada")).toBeInTheDocument();

    const transferBtn = screen.getByRole("button", { name: /transferir cards e excluir/i });
    await user.click(transferBtn);

    await waitFor(() => {
      expect(stageActions.deletePipelineStageAction).toHaveBeenCalledWith(
        "tenant-123",
        "pipe-1",
        "stage-1",
        "stage-2"
      );
      expect(defaultProps.onStageDeleted).toHaveBeenCalledWith("stage-1", "stage-2");
    });
  });

  it("blocks deletion when it is the only remaining stage in the pipeline", () => {
    render(
      <DeleteStageModal
        {...defaultProps}
        allStages={[stageToDelete]}
        dealsCount={0}
      />
    );

    expect(screen.getByText(/não é possível excluir o único fluxo deste funil/i)).toBeInTheDocument();
    expect(screen.getByText(/um funil comercial ativo precisa ter no mínimo 1 fluxo/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /excluir fluxo/i })).not.toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /fechar/i }).length).toBeGreaterThanOrEqual(1);
  });
});
