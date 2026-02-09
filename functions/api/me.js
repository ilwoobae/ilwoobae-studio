import { isAuthed } from "../_utils/auth";

export async function onRequestGet({ request, env }) {
  const ok = await isAuthed(request, env);
  return new Response(JSON.stringify({ ok }), {
    status: ok ? 200 : 401,
    headers: { "Content-Type": "application/json" },
  });
}
