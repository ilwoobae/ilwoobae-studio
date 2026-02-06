export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const type = url.searchParams.get("type"); 

  // --- 1. GET: 목록 불러오기 ---
  if (request.method === "GET") {
    if (type === "groups") {
      const { results } = await env.DB.prepare("SELECT * FROM groups").all();
      return Response.json(results);
    }
    if (type === "categories") {
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

    if (action === "add_group") {
      await env.DB.prepare("INSERT INTO groups (name) VALUES (?)").bind(formData.get("name")).run();
    } 
    else if (action === "add_category") {
      await env.DB.prepare("INSERT INTO categories (group_id, name, description) VALUES (?, ?, ?)")
        .bind(formData.get("group_id"), formData.get("name"), formData.get("description")).run();
    }
    else if (action === "add_post") {
      const file = formData.get("file");
      let fileUrl = "";
      if (file && file.size > 0) {
        const fileName = `${Date.now()}-${file.name}`;
        await env.BUCKET.put(fileName, file.stream(), { httpMetadata: { contentType: file.type } });
        fileUrl = `https://pub-7bb9e707134648fd9c236f08b217d0df.r2.dev/${fileName}`;
      }
      // 여기서 info1, 2, 3를 FormData에서 잘 받아오는지 확인
      await env.DB.prepare("INSERT INTO posts (category_id, title, file_url, description, info1, info2, info3) VALUES (?, ?, ?, ?, ?, ?, ?)")
        .bind(formData.get("category_id"), formData.get("title"), fileUrl, formData.get("description"), formData.get("info1"), formData.get("info2"), formData.get("info3")).run();
    }
    return Response.json({ success: true });
  }

  // --- 3. PUT: 데이터 수정 ---
  if (request.method === "PUT") {
    const formData = await request.formData();
    const action = formData.get("action");
    const id = formData.get("id");

    if (action === "edit_group") {
      await env.DB.prepare("UPDATE groups SET name = ? WHERE id = ?").bind(formData.get("name"), id).run();
    } 
    else if (action === "edit_category") {
      await env.DB.prepare("UPDATE categories SET name = ?, description = ?, group_id = ? WHERE id = ?")
        .bind(formData.get("name"), formData.get("description"), formData.get("group_id"), id).run();
    }
    else if (action === "edit_post") {
      // 수정 시에도 info1, 2, 3를 업데이트
      await env.DB.prepare("UPDATE posts SET title = ?, description = ?, category_id = ?, info1 = ?, info2 = ?, info3 = ? WHERE id = ?")
        .bind(formData.get("title"), formData.get("description"), formData.get("category_id"), formData.get("info1"), formData.get("info2"), formData.get("info3"), id).run();
    }
    return Response.json({ success: true });
  }

  // --- 4. DELETE: 데이터 삭제 ---
  if (request.method === "DELETE") {
    const id = url.searchParams.get("id");
    const target = url.searchParams.get("target");
    await env.DB.prepare(`DELETE FROM ${target} WHERE id = ?`).bind(id).run();
    return Response.json({ success: true });
  }

  return new Response("Not Found", { status: 404 });
}