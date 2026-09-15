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

  const apiUrl = process.env.API_URL || "http://127.0.0.1:4000";

  const fetchOptions: RequestInit = {
    ...options,
    headers: {
      ...options.headers,
      "Content-Type": "application/json",
      Cookie: allCookies, // Provedor de Sessão do Tenant Web
    },
  };

  const url = `${apiUrl}${path.startsWith("/") ? path : `/${path}`}`;
  return fetch(url, fetchOptions);
}
