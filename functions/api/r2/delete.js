import { isAuthed } from "../../_utils/auth";

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function onRequestPost({ request, env }) {
  if (!(await isAuthed(request, env))) {
    return json({ ok: false, error: "Unauthorized" }, 401);
  }

  if (!env.R2_BUCKET) {
    return json({ ok: false, error: "Missing R2_BUCKET binding" }, 500);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, error: "Invalid payload" }, 400);
  }

  const key = String(body?.key || "").trim();
  if (!key) return json({ ok: false, error: "key required" }, 400);

  await env.R2_BUCKET.delete(key);
  return json({ ok: true });
}
