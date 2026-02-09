import { isAuthed } from "../../_utils/auth";

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function onRequestGet({ request, env, params }) {
  if (!(await isAuthed(request, env))) {
    return json({ ok: false, error: "Unauthorized" }, 401);
  }

  if (!env.DB) {
    return json({ ok: false, error: "Missing DB binding" }, 500);
  }

  const id = params?.id;
  if (!id) return json({ ok: false, error: "Missing id" }, 400);

  const result = await env.DB.prepare(
    "SELECT id, group_id, title, description, created_at FROM categories WHERE id = ?"
  )
    .bind(id)
    .first();

  if (!result) {
    return json({ ok: false, error: "Not found" }, 404);
  }

  return json({ ok: true, data: result });
}

export async function onRequestPut({ request, env, params }) {
  if (!(await isAuthed(request, env))) {
    return json({ ok: false, error: "Unauthorized" }, 401);
  }

  if (!env.DB) {
    return json({ ok: false, error: "Missing DB binding" }, 500);
  }

  const id = params?.id;
  if (!id) return json({ ok: false, error: "Missing id" }, 400);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: "Invalid payload" }, 400);
  }

  const groupId = String(body?.group_id || "").trim();
  const title = String(body?.title || "").trim();
  const description = body?.description ?? null;

  if (!groupId || !title) {
    return json({ ok: false, error: "group_id and title required" }, 400);
  }

  await env.DB.prepare(
    "UPDATE categories SET group_id = ?, title = ?, description = ? WHERE id = ?"
  )
    .bind(groupId, title, description, id)
    .run();

  return json({ ok: true, data: { id, group_id: groupId, title, description } });
}

export async function onRequestDelete({ request, env, params }) {
  if (!(await isAuthed(request, env))) {
    return json({ ok: false, error: "Unauthorized" }, 401);
  }

  if (!env.DB) {
    return json({ ok: false, error: "Missing DB binding" }, 500);
  }

  const id = params?.id;
  if (!id) return json({ ok: false, error: "Missing id" }, 400);

  await env.DB.prepare("DELETE FROM categories WHERE id = ?").bind(id).run();
  return json({ ok: true });
}
