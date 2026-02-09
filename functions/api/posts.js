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
    "SELECT id, category_id, title, description, attachment_type, attachment_url, info1, info2, info3, created_at FROM posts ORDER BY created_at DESC"
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

  const categoryId = String(body?.category_id || "").trim();
  const title = String(body?.title || "").trim();
  const description = body?.description ?? null;
  const attachmentType = body?.attachment_type ?? null;
  const attachmentUrl = body?.attachment_url ?? null;
  const info1 = body?.info1 ?? null;
  const info2 = body?.info2 ?? null;
  const info3 = body?.info3 ?? null;

  if (!categoryId || !title) {
    return json({ ok: false, error: "category_id and title required" }, 400);
  }

  const id = crypto.randomUUID();
  await env.DB.prepare(
    "INSERT INTO posts (id, category_id, title, description, attachment_type, attachment_url, info1, info2, info3) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
  )
    .bind(
      id,
      categoryId,
      title,
      description,
      attachmentType,
      attachmentUrl,
      info1,
      info2,
      info3
    )
    .run();

  return json(
    {
      ok: true,
      data: {
        id,
        category_id: categoryId,
        title,
        description,
        attachment_type: attachmentType,
        attachment_url: attachmentUrl,
        info1,
        info2,
        info3,
      },
    },
    201
  );
}
