import mysql from "mysql2/promise";

export const GET = async ({ params, cookies }) => {
  return await handleBookmarkRequest(params, cookies, false);
};

export const POST = async ({ params, cookies }) => {
  return await handleBookmarkRequest(params, cookies, true);
};

async function handleBookmarkRequest(params, cookies, isToggle) {
  const paperId = params.paperId;
  const user_cookie = cookies.get("username");

  if (!user_cookie) {
    return new Response(
      JSON.stringify({ isBookmarked: false, error: "Not a user" }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const con = await mysql.createConnection({
    host: import.meta.env.DB_HOST,
    user: import.meta.env.DB_USER,
    password: import.meta.env.DB_PASSWORD,
    database: import.meta.env.DB_DATABASE,
    port: import.meta.env.DB_PORT,
  });

  try {
    await con.beginTransaction();

    const username = user_cookie.value;
    const [user_result] = await con.execute(
      "SELECT userId FROM UserInfo WHERE username = ?",
      [username]
    );
    const userId = user_result[0].userId;

    const [existing] = await con.execute(
      "SELECT * FROM Actions WHERE userId = ? AND paperId = ? AND actionType = 'save'",
      [userId, paperId]
    );

    let isBookmarked = existing.length > 0;

    if (isToggle) {
      if (isBookmarked) {
        // Delete the bookmark
        await con.execute(
          "DELETE FROM Actions WHERE userId = ? AND paperId = ? AND actionType = 'save'",
          [userId, paperId]
        );

        // Delete associated notes
        await con.execute(
          "DELETE FROM Notes WHERE userId = ? AND paperId = ?",
          [userId, paperId]
        );

        isBookmarked = false;
      } else {
        await con.execute(
          "INSERT INTO Actions (userId, paperId, actionType) VALUES (?, ?, 'save')",
          [userId, paperId]
        );
        isBookmarked = true;
      }
    }

    await con.commit();

    return new Response(JSON.stringify({ isBookmarked }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    await con.rollback();
    console.error("Error handling bookmark:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } finally {
    await con.end();
  }
}
