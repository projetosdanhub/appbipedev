import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ArchivePipelineModal } from "../../features/crm/components/archive-pipeline-modal";
import * as pipelineActions from "../../features/crm/actions/pipeline.actions";
import { CrmPipeline } from "@bipesend/contracts";

vi.mock("../../features/crm/actions/pipeline.actions", () => ({
  updatePipelineAction: vi.fn(),
}));

describe("ArchivePipelineModal", () => {
  const pipeline1: CrmPipeline = {
    id: "pipe-1",
    tenantId: "tenant-123",
    name: "Funil Geral",
    nameNormalized: "funil geral",
    description: "Funil principal",
    status: "active",
    defaultCurrency: "BRL",
    version: 1,
    isDefault: false,
    createdAt: "2026-09-18T12:00:00.000Z",
    updatedAt: "2026-09-18T12:00:00.000Z",
  };

  const pipeline2: CrmPipeline = {
    id: "pipe-2",
    tenantId: "tenant-123",
    name: "Outbound B2B",
    nameNormalized: "outbound b2b",
    description: "Prospecção ativa",
    status: "active",
    defaultCurrency: "BRL",
    version: 1,
    isDefault: false,
    createdAt: "2026-09-18T12:00:00.000Z",
    updatedAt: "2026-09-18T12:00:00.000Z",
  };

  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    tenantId: "tenant-123",
    pipeline: pipeline2,
    activePipelines: [pipeline1, pipeline2],
    defaultPipelineId: "pipe-1",
    dealsCount: 3,
    stagesMap: { "pipe-1": [], "pipe-2": [] },
    onPipelineArchived: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("blocks archiving when pipeline is marked as default", () => {
    render(
      <ArchivePipelineModal
        {...defaultProps}
        pipeline={pipeline1}
        defaultPipelineId="pipe-1"
      />
    );

    expect(screen.getByText(/este é o funil padrão do crm/i)).toBeInTheDocument();
    expect(screen.getByText(/selecione outro funil como padrão/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /arquivar funil/i })).not.toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /fechar/i }).length).toBeGreaterThanOrEqual(1);
  });

  it("blocks archiving when it is the last active pipeline", () => {
    render(
      <ArchivePipelineModal
        {...defaultProps}
        pipeline={pipeline2}
        activePipelines={[pipeline2]}
        defaultPipelineId="other-pipe"
      />
    );

    expect(screen.getByText(/não é possível arquivar o único funil ativo da conta/i)).toBeInTheDocument();
    expect(screen.getByText(/sua empresa precisa ter ao menos um funil ativo/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /arquivar funil/i })).not.toBeInTheDocument();
  });

  it("archives successfully and calls onPipelineArchived and onClose when valid", async () => {
    const user = userEvent.setup();
    vi.mocked(pipelineActions.updatePipelineAction).mockResolvedValueOnce({
      success: true,
      message: "Pipeline atualizado com sucesso!",
      data: { ...pipeline2, status: "archived" },
    });

    render(<ArchivePipelineModal {...defaultProps} />);

    expect(screen.getByRole("heading", { name: /arquivar funil comercial/i })).toBeInTheDocument();
    expect(screen.getByText("Outbound B2B")).toBeInTheDocument();
    expect(screen.getByText(/3 cards/i)).toBeInTheDocument();

    const archiveBtn = screen.getByRole("button", { name: /arquivar funil/i });
    await user.click(archiveBtn);

    await waitFor(() => {
      expect(pipelineActions.updatePipelineAction).toHaveBeenCalledWith(
        "tenant-123",
        "pipe-2",
        { status: "archived" }
      );
      expect(defaultProps.onPipelineArchived).toHaveBeenCalledWith("pipe-2");
      expect(defaultProps.onClose).toHaveBeenCalled();
    });
  });
});
