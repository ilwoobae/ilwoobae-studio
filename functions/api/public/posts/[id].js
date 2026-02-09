function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function onRequestGet({ env, params }) {
  if (!env.DB) {
    return json({ ok: false, error: "Missing DB binding" }, 500);
  }

  const id = params?.id;
  if (!id) return json({ ok: false, error: "Missing id" }, 400);

  const result = await env.DB.prepare(
    "SELECT id, category_id, title, description, attachment_type, attachment_url, info1, info2, info3, created_at FROM posts WHERE id = ?"
  )
    .bind(id)
    .first();

  if (!result) return json({ ok: false, error: "Not found" }, 404);

  return json({ ok: true, data: result });
}
