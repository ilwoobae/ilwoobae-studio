// functions/api.js
async function checkAuth(request) {
  const cookie = request.headers.get("Cookie") || "";
  return cookie.includes("auth=logged_in");
}

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const action = url.searchParams.get("action");

  // --- [A. 로그인 처리] ---
  if (request.method === "POST" && url.pathname.endsWith("/login")) {
    const { password } = await request.json();
    
    // 1. 직접 입력하는 비밀번호 (테스트용)
    const MY_REAL_PW = "66503"; // 여기에 진짜 쓰실 비번을 '따옴표' 안에 넣으세요!
    
    // 2. 입력값과 대조 (로그 출력 포함)
    console.log("Input:", password); 

    if (String(password).trim() === MY_REAL_PW || (env.ADMIN_PASSWORD && String(password).trim() === env.ADMIN_PASSWORD.trim())) {
      return new Response(JSON.stringify({ success: true }), {
        headers: {
          "Set-Cookie": "auth=logged_in; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400; Secure",
          "Content-Type": "application/json"
        },
      });
    }
    // 실패 시 응답에 메시지를 명확히 담음
    return new Response(JSON.stringify({ success: false, error: "wrong_password" }), { status: 401 });
  }
  // --- [B. 로그아웃 처리] ---
  if (url.pathname.endsWith("/logout")) {
    // ✅ 로그아웃도 여기서 바로 끝내야 합니다.
    return new Response(JSON.stringify({ success: true }), {
      headers: {
        "Set-Cookie": "auth=; Path=/; Max-Age=0",
        "Content-Type": "application/json"
      },
    });
  }

  // --- [C. 권한 체크] ---
  // 위에서 로그인/로그아웃 처리가 끝난 요청들은 이 아래로 내려오지 않습니다.
  const isLoggedIn = await checkAuth(request);
  if (!isLoggedIn) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { 
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }

  // =========================================================
  // 여기부터 관리자 전용 로직 (GET, POST, PUT, DELETE)
  // =========================================================

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
      await env.DB.prepare("INSERT INTO posts (category_id, title, file_url, description, info1, info2, info3) VALUES (?, ?, ?, ?, ?, ?, ?)")
        .bind(formData.get("category_id"), formData.get("title"), fileUrl, formData.get("description"), formData.get("info1"), formData.get("info2"), formData.get("info3")).run();
    }
    return Response.json({ success: true });
  }

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
      await env.DB.prepare("UPDATE posts SET title = ?, description = ?, category_id = ?, info1 = ?, info2 = ?, info3 = ? WHERE id = ?")
        .bind(formData.get("title"), formData.get("description"), formData.get("category_id"), formData.get("info1"), formData.get("info2"), formData.get("info3"), id).run();
    }
    return Response.json({ success: true });
  }

  if (request.method === "DELETE") {
    const id = url.searchParams.get("id");
    const target = url.searchParams.get("target");
    await env.DB.prepare(`DELETE FROM ${target} WHERE id = ?`).bind(id).run();
    return Response.json({ success: true });
  }

  return new Response("Not Found", { status: 404 });
}