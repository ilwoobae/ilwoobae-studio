function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function onRequestGet({ request, env }) {
  if (!env.DB) {
    return json({ ok: false, error: "Missing DB binding" }, 500);
  }

  const url = new URL(request.url);
  const categoryId = url.searchParams.get("category_id");

  let stmt;
  if (categoryId) {
    stmt = env.DB.prepare(
      "SELECT id, category_id, title, description, attachment_type, attachment_url, info1, info2, info3, created_at FROM posts WHERE category_id = ? ORDER BY created_at DESC"
    ).bind(categoryId);
  } else {
    stmt = env.DB.prepare(
      "SELECT id, category_id, title, description, attachment_type, attachment_url, info1, info2, info3, created_at FROM posts ORDER BY created_at DESC"
    );
  }

  const { results } = await stmt.all();
  return json({ ok: true, data: results || [] });
}
