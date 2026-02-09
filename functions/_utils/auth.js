const textEncoder = new TextEncoder();

export function parseCookies(cookieHeader = "") {
  return cookieHeader.split(";").reduce((acc, part) => {
    const [key, ...rest] = part.trim().split("=");
    if (!key) return acc;
    acc[key] = decodeURIComponent(rest.join("="));
    return acc;
  }, {});
}

export async function sha256(input) {
  const data = textEncoder.encode(input);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(hash)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function getAuthToken(env) {
  return sha256(`${env.ADMIN_PASSWORD}:${env.ADMIN_SECRET}`);
}

export async function isAuthed(request, env) {
  const cookies = parseCookies(request.headers.get("Cookie") || "");
  const token = cookies.admin_token;
  if (!token || !env.ADMIN_PASSWORD || !env.ADMIN_SECRET) return false;
  const expected = await getAuthToken(env);
  return token === expected;
}
