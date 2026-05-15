import { NextRequest, NextResponse } from "next/server";

// Dispara manualmente el GitHub Actions workflow via repository_dispatch
export async function POST(req: NextRequest) {
  const { mode = "all" } = await req.json().catch(() => ({}));

  const githubToken = process.env.GITHUB_ACTIONS_TOKEN;
  const repo = process.env.GITHUB_REPO; // formato: "owner/repo"

  if (!githubToken || !repo) {
    return NextResponse.json(
      { error: "GITHUB_ACTIONS_TOKEN o GITHUB_REPO no configurados" },
      { status: 503 }
    );
  }

  const res = await fetch(`https://api.github.com/repos/${repo}/dispatches`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${githubToken}`,
      "Content-Type": "application/json",
      Accept: "application/vnd.github+json",
    },
    body: JSON.stringify({
      event_type: "manual_collect",
      client_payload: { mode },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    return NextResponse.json({ error: text }, { status: res.status });
  }

  return NextResponse.json({ ok: true, message: `Colección '${mode}' disparada` });
}
