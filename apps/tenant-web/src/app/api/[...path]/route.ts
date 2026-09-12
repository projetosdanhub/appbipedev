import { NextRequest } from "next/server";

export async function handler(req: NextRequest) {
  // Strip "/api/" from the pathname
  const path = req.nextUrl.pathname.replace(/^\/api\//, "");
  const url = `http://127.0.0.1:4000/${path}${req.nextUrl.search}`;
  
  const headers = new Headers(req.headers);
  headers.delete("host"); 
  headers.delete("connection");

  try {
    const body = req.method !== "GET" && req.method !== "HEAD" ? await req.arrayBuffer() : undefined;
    
    const response = await fetch(url, {
      method: req.method,
      headers,
      body,
      redirect: "manual",
    });

    const responseHeaders = new Headers(response.headers);
    responseHeaders.delete("content-encoding");

    return new Response(response.body, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("Proxy error:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const DELETE = handler;
export const PATCH = handler;
