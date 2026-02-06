export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const path = url.searchParams.get("type"); // ?type=groups 등으로 구분

  // --- 1. GET: 목록 불러오기 ---
  if (request.method === "GET") {
    if (path === "groups") {
      const { results } = await env.DB.prepare("SELECT * FROM groups").all();
      return Response.json(results);
    }
    if (path === "categories") {
      const { results } = await env.DB.prepare("SELECT * FROM categories").all();
      return Response.json(results);
    }
    const { results } = await env.DB.prepare("SELECT * FROM posts ORDER BY id DESC").all();
    return Response.json(results);
  }

  // --- 2. POST: 데이터 등록 ---
  if (request.method === "POST") {
    const formData = await request.formData();
    const action = formData.get("action");

    // A. 그룹 등록
    if (action === "add_group") {
      const name = formData.get("name");
      await env.DB.prepare("INSERT INTO groups (name) VALUES (?)").bind(name).run();
      return Response.json({ success: true });
    }

    // B. 카테고리 등록
    if (action === "add_category") {
      const groupId = formData.get("group_id");
      const name = formData.get("name");
      const desc = formData.get("description");
      await env.DB.prepare("INSERT INTO categories (group_id, name, description) VALUES (?, ?, ?)")
        .bind(groupId, name, desc).run();
      return Response.json({ success: true });
    }

    // C. 포스트 등록 (파일 업로드 포함)
    if (action === "add_post") {
      const catId = formData.get("category_id");
      const title = formData.get("title");
      const desc = formData.get("description");
      const i1 = formData.get("info1");
      const i2 = formData.get("info2");
      const i3 = formData.get("info3");
      const file = formData.get("file");

      let fileUrl = "";
      if (file && file.size > 0) {
        const fileName = `${Date.now()}-${file.name}`;
        await env.BUCKET.put(fileName, file.stream(), { httpMetadata: { contentType: file.type } });
        fileUrl = `https://pub-7bb9e707134648fd9c236f08b217d0df.r2.dev/${fileName}`;
      }

      await env.DB.prepare(
        "INSERT INTO posts (category_id, title, file_url, description, info1, info2, info3) VALUES (?, ?, ?, ?, ?, ?, ?)"
      ).bind(catId, title, fileUrl, desc, i1, i2, i3).run();
      
      return Response.json({ success: true });
    }
  }

  // --- 3. DELETE: 데이터 삭제 ---
  if (request.method === "DELETE") {
    const id = url.searchParams.get("id");
    const target = url.searchParams.get("target"); // groups, categories, posts
    
    await env.DB.prepare(`DELETE FROM ${target} WHERE id = ?`).bind(id).run();
    return Response.json({ success: true });
  }

  return new Response("Not Found", { status: 404 });
}