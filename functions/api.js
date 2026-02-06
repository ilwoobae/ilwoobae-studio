export async function onRequest(context) {
    // 2단계에서 설정한 변수명 'DB'를 사용합니다.
    const { env } = context;
    const { results } = await env.DB.prepare("SELECT * FROM projects").all();
  
    return new Response(JSON.stringify(results), {
      headers: { "Content-Type": "application/json" }
    });
  }