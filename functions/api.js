export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  // 1. 데이터 불러오기 (GET)
  if (request.method === "GET") {
    const { results } = await env.DB.prepare("SELECT * FROM projects ORDER BY id DESC").all();
    return Response.json(results);
  }

  // 2. 데이터 업로드 (POST)
  if (request.method === "POST") {
    try {
      const formData = await request.formData();
      const title = formData.get('title');
      const description = formData.get('description');
      const file = formData.get('file');

      if (!file) return new Response("파일이 없습니다.", { status: 400 });

      // R2에 파일 저장 (파일명은 중복 방지를 위해 앞에 시간을 붙임)
      const fileName = `${Date.now()}-${file.name}`;
      await env.BUCKET.put(fileName, file.stream(), {
        httpMetadata: { contentType: file.type },
      });

      // R2 공개 주소 생성 (아까 만든 주소 사용)
      const imageUrl = `https://pub-7bb9e707134648fd9c236f08b217d0df.r2.dev/${fileName}`;

      // D1 DB에 저장
      await env.DB.prepare(
        "INSERT INTO projects (title, description, image_url) VALUES (?, ?, ?)"
      ).bind(title, description, imageUrl).run();

      return Response.json({ success: true });
    } catch (err) {
      return new Response(err.message, { status: 500 });
    }
  }
}