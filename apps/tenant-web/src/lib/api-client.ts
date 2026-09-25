import { cookies } from "next/headers";

/**
 * Creates an authenticated fetch client for Server Actions or React Server Components
 * to communicate directly with the backend API.
 */
export async function fetchApi(path: string, options: RequestInit = {}) {
  const cookieStore = await cookies();
  const allCookies = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  let apiUrl = process.env.API_URL || "http://127.0.0.1:4000";
  if (apiUrl.includes("api.localhost")) {
    apiUrl = "http://127.0.0.1:4000"; // Resolve ENOTFOUND on Windows Node.js
  }

  const isFormData = options.body instanceof FormData;
  const activeTenantId = cookieStore.get("bipesend.tenant.active")?.value;
  const defaultHeaders: Record<string, string> = {
    Cookie: allCookies, // Provedor de Sessão do Tenant Web
  };
  
  if (activeTenantId) {
    defaultHeaders["x-tenant-id"] = activeTenantId;
  }
  
  if (!isFormData && options.body !== undefined && options.body !== null) {
    defaultHeaders["Content-Type"] = "application/json";
  }

  const fetchOptions: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  const url = `${apiUrl}${path.startsWith("/") ? path : `/${path}`}`;
  return fetch(url, fetchOptions);
}
