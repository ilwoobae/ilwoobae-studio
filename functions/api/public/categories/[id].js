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
    "SELECT c.id, c.group_id, c.title, c.description, c.created_at, g.title as group_title FROM categories c LEFT JOIN groups g ON g.id = c.group_id WHERE c.id = ?"
  )
    .bind(id)
    .first();

  if (!result) return json({ ok: false, error: "Not found" }, 404);

  return json({ ok: true, data: result });
}
