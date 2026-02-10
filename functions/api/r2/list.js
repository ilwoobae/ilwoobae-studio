import { isAuthed } from "../../_utils/auth";

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

  if (!env.R2_BUCKET) {
    return json({ ok: false, error: "Missing R2_BUCKET binding" }, 500);
  }

  const url = new URL(request.url);
  const prefix = url.searchParams.get("prefix") || "";
  const cursor = url.searchParams.get("cursor") || undefined;

  const listing = await env.R2_BUCKET.list({ prefix, cursor, limit: 100 });
  const base = env.R2_PUBLIC_BASE || "";
  const normalizeBase = base ? base.replace(/\/$/, "") : "";

  const items = (listing.objects || []).map((obj) => ({
    key: obj.key,
    size: obj.size,
    uploaded: obj.uploaded,
    url: normalizeBase ? `${normalizeBase}/${obj.key}` : null,
  }));

  return json({ ok: true, data: { items, cursor: listing.truncated ? listing.cursor : null } });
}
