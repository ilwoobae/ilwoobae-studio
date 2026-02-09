import { isAuthed } from "../../_utils/auth";

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
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

  const title = String(body?.title || "").trim();
  if (!title) {
    return json({ ok: false, error: "Title required" }, 400);
  }

  await env.DB.prepare("UPDATE groups SET title = ? WHERE id = ?")
    .bind(title, id)
    .run();

  return json({ ok: true, data: { id, title } });
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

  await env.DB.prepare("DELETE FROM groups WHERE id = ?").bind(id).run();
  return json({ ok: true });
}
