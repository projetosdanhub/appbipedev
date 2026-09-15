import { describe, it, expect, vi, beforeEach } from "vitest";

const mocks = vi.hoisted(() => ({
  fetchApi: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/api-client", () => ({ fetchApi: mocks.fetchApi }));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));

import {
  createContactAction,
  updateContactAction,
  deleteContactAction,
  getContactsAction,
} from "@/features/crm/actions/contact.actions";

describe("CRM Contact Actions", () => {
  const tenantId = "tenant-1";
  
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("should create a contact and revalidate path", async () => {
    mocks.fetchApi.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: { id: "contact-1", name: "John Doe" } }),
    });

    const result = await createContactAction(tenantId, { name: "John Doe", email: "john@example.com", phone: null, customFields: null });
    
    expect(result.success).toBe(true);
    expect(result.data.id).toBe("contact-1");
    expect(mocks.fetchApi).toHaveBeenCalledWith(`/api/v1/tenants/${tenantId}/contacts`, expect.objectContaining({ method: "POST" }));
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/crm/contacts");
  });

  it("should handle create contact error gracefully", async () => {
    mocks.fetchApi.mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Validation failed" }),
    });

    const result = await createContactAction(tenantId, { name: "", email: null, phone: null, customFields: null });
    
    expect(result.success).toBe(false);
    expect(result.message).toBe("Validation failed");
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });

  it("should get contacts successfully", async () => {
    mocks.fetchApi.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: [{ id: "contact-1", name: "John Doe" }] }),
    });

    const result = await getContactsAction(tenantId);
    
    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(1);
    expect(mocks.fetchApi).toHaveBeenCalledWith(`/api/v1/tenants/${tenantId}/contacts`);
  });
});
