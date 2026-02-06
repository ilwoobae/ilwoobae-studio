// functions/api.js 최상단에 추가
async function checkAuth(request, env) {
  const cookie = request.headers.get("Cookie") || "";
  // 쿠키에 auth=logged_in 이라는 값이 있는지 확인
  return cookie.includes("auth=logged_in");
}

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  // --- [로그인 처리] ---
  if (request.method === "POST" && url.pathname.endsWith("/login")) {
    const { password } = await request.json();
    if (password === env.ADMIN_PASSWORD) {
      return new Response(JSON.stringify({ success: true }), {
        headers: {
          "Set-Cookie": "auth=logged_in; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400",
          "Content-Type": "application/json"
        },
      });
    }
    return new Response(JSON.stringify({ success: false }), { status: 401 });
  }

  // --- [로그아웃 처리] ---
  if (url.pathname.endsWith("/logout")) {
    return new Response(JSON.stringify({ success: true }), {
      headers: {
        "Set-Cookie": "auth=; Path=/; Max-Age=0",
        "Content-Type": "application/json"
      },
    });
  }

  // --- [권한 체크] ---
  // 로그인(/login) 요청이 아닌 모든 API 요청은 로그인이 되어있어야 함
  const isLoggedIn = await checkAuth(request, env);
  if (!isLoggedIn) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }
}

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