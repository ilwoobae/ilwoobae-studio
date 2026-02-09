import { isAuthed } from "../_utils/auth";

const sanitize = (value) => value.replace(/[^a-zA-Z0-9._-]/g, "_");

export async function onRequestPost({ request, env }) {
  if (!(await isAuthed(request, env))) {
    return new Response("Unauthorized", { status: 401 });
  }

  if (!env.R2_BUCKET) {
    return new Response("Missing R2_BUCKET binding", { status: 500 });
  }

  const contentType = request.headers.get("Content-Type") || "";
  if (!contentType.includes("multipart/form-data")) {
    return new Response("Expected multipart/form-data", { status: 400 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const folder = sanitize(String(formData.get("folder") || "uploads"));

  if (!file || typeof file === "string") {
    return new Response("File missing", { status: 400 });
  }

  const safeName = sanitize(file.name || "upload");
  const key = `${folder}/${Date.now()}-${safeName}`;

  await env.R2_BUCKET.put(key, file.stream(), {
    httpMetadata: { contentType: file.type || "application/octet-stream" },
  });

  const base = env.R2_PUBLIC_BASE || "";
  const url = base ? `${base.replace(/\/$/, "")}/${key}` : null;

  return new Response(JSON.stringify({ ok: true, key, url }), {
    headers: { "Content-Type": "application/json" },
  });
}
