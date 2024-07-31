import mysql from "mysql2/promise";

export const GET = async ({ params, request }) => {
  const paperId = params.paperId;

  const con = await mysql.createConnection({
    host: import.meta.env.DB_HOST,
    user: import.meta.env.DB_USER,
    password: import.meta.env.DB_PASSWORD,
    database: import.meta.env.DB_DATABASE,
    port: import.meta.env.DB_PORT,
  });
  try {
    const [rows] = await con.execute(`
        SELECT u.username, c.commentId, c.commentContent, c.commentTimestamp
        FROM Comments c JOIN UserInfo u ON c.userId = u.userId
        WHERE c.paperId = ${paperId}
        ORDER BY c.commentTimestamp DESC;
    `);
    return new Response(JSON.stringify(rows), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    return new Response(JSON.stringify(error), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } finally {
    await con.end();
  }
};

export const POST = async ({ params, request, cookies }) => {
  const paperId = params.paperId;

  const body = await request.json();
  const commentContent = body.commentContent;

  const con = await mysql.createConnection({
    host: import.meta.env.DB_HOST,
    user: import.meta.env.DB_USER,
    password: import.meta.env.DB_PASSWORD,
    database: import.meta.env.DB_DATABASE,
    port: import.meta.env.DB_PORT,
  });

  const user_cookie = cookies.get("username");

  if (!user_cookie) {
    return new Response(
      JSON.stringify({
        response: "Not a user",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }

  const username = user_cookie.value;

  try {
    const [user_result] = await con.execute(
      "SELECT userId FROM UserInfo WHERE username = ?",
      [username]
    );
    const [result] = await con.execute(
      "INSERT INTO Comments (userId, paperId, commentContent) VALUES (?, ?, ?)",
      [user_result[0].userId, paperId, commentContent]
    );
    return new Response(JSON.stringify({ success: true }), {
      status: 201,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    return new Response(JSON.stringify(error), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } finally {
    await con.end();
  }
};
