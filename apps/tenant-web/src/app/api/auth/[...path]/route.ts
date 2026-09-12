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
    
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
