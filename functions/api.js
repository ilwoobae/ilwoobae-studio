// functions/api.js
export async function onRequest(context) {
  const { env } = context;
  try {
    // env.DB의 'DB'는 대시보드에서 설정한 Variable name과 일치해야 함!
    const { results } = await env.DB.prepare("SELECT * FROM projects").all();
    return new Response(JSON.stringify(results), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (e) {
    return new Response(e.message, { status: 500 });
  }
}