function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function onRequestGet({ env }) {
  if (!env.DB) {
    return json({ ok: false, error: "Missing DB binding" }, 500);
  }

  const { results } = await env.DB.prepare(
    "SELECT c.id, c.group_id, c.title, c.description, c.created_at, g.title as group_title FROM categories c LEFT JOIN groups g ON g.id = c.group_id ORDER BY c.created_at DESC"
  ).all();

  return json({ ok: true, data: results || [] });
}
