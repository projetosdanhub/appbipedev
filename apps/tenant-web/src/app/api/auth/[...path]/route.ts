import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const path = req.nextUrl.pathname.replace('/api/', '/');
  const url = `http://127.0.0.1:4000${path}`;
  console.log("PROXY API HIT:", req.method, url);
  
  try {
    const bodyText = await req.text();
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": req.headers.get("Content-Type") || "application/json",
      },
      body: bodyText,
    });
    
    let data;
    const resText = await res.text();
    try {
      data = JSON.parse(resText);
    } catch {
      data = resText;
    }
    
    const nextRes = NextResponse.json(data, { status: res.status });
    
    // Repassa os cookies do Fastify (importante para o login funcionar)
    const setCookieHeader = res.headers.get("Set-Cookie");
    if (setCookieHeader) {
      nextRes.headers.set("Set-Cookie", setCookieHeader);
    }
    
    return nextRes;
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
