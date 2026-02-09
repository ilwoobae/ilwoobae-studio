import { isAuthed } from "../_utils/auth";

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function onRequestGet({ request, env }) {
  if (!(await isAuthed(request, env))) {
    return json({ ok: false, error: "Unauthorized" }, 401);
  }

  if (!env.DB) {
    return json({ ok: false, error: "Missing DB binding" }, 500);
  }

  const { results } = await env.DB.prepare(
    "SELECT id, title, created_at FROM groups ORDER BY created_at DESC"
  ).all();

  return json({ ok: true, data: results || [] });
}

export async function onRequestPost({ request, env }) {
  if (!(await isAuthed(request, env))) {
    return json({ ok: false, error: "Unauthorized" }, 401);
  }

  if (!env.DB) {
    return json({ ok: false, error: "Missing DB binding" }, 500);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: "Invalid payload" }, 400);
  }

  const title = String(body?.title || "").trim();
  if (!title) {
    return json({ ok: false, error: "Title required" }, 400);
  }

  const id = crypto.randomUUID();
  await env.DB.prepare(
    "INSERT INTO groups (id, title) VALUES (?, ?)"
  )
    .bind(id, title)
    .run();

  return json({ ok: true, data: { id, title } }, 201);
}
