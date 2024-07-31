import mysql from "mysql2/promise";

export const GET = async ({ params, request, cookies }) => {
  const con = await mysql.createConnection({
    host: import.meta.env.DB_HOST,
    user: import.meta.env.DB_USER,
    password: import.meta.env.DB_PASSWORD,
    database: import.meta.env.DB_DATABASE,
    port: import.meta.env.DB_PORT,
  });

  try {
    const user_cookie = cookies.get("username");
    if (user_cookie) {
      const username = user_cookie.value;
      const [user_result] = await con.execute(
        "SELECT userId FROM UserInfo WHERE username = ?",
        [username]
      );
      const userId = user_result[0].userId;

      const url = new URL(request.url);
      const paperId = url.searchParams.get("paperId");

      console.log(`Fetching note for paperId: ${paperId}, userId: ${userId}`);

      const [rows] = await con.execute(
        `SELECT noteContent FROM Notes WHERE userId = ? AND paperId = ?`,
        [userId, paperId]
      );

      return new Response(JSON.stringify(rows[0] || { noteContent: "" }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      });
    } else {
      return new Response(
        JSON.stringify({
          response: "Not a user",
        }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }
  } catch (error) {
    console.error("Error in GET /api/notes:", error);
    return new Response(JSON.stringify({ error: error.message }), {
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
  const con = await mysql.createConnection({
    host: import.meta.env.DB_HOST,
    user: import.meta.env.DB_USER,
    password: import.meta.env.DB_PASSWORD,
    database: import.meta.env.DB_DATABASE,
    port: import.meta.env.DB_PORT,
  });

  try {
    const user_cookie = cookies.get("username");
    if (user_cookie) {
      const username = user_cookie.value;
      const [user_result] = await con.execute(
        "SELECT userId FROM UserInfo WHERE username = ?",
        [username]
      );
      const userId = user_result[0].userId;

      const { paperId, noteContent } = await request.json();

      console.log(`Saving note for paperId: ${paperId}, userId: ${userId}`);

      // Check if a note already exists
      const [existingNote] = await con.execute(
        "SELECT noteId FROM Notes WHERE paperId = ? AND userId = ?",
        [paperId, userId]
      );

      if (existingNote.length > 0) {
        // Update existing note
        await con.execute(
          "UPDATE Notes SET noteContent = ? WHERE paperId = ? AND userId = ?",
          [noteContent, paperId, userId]
        );
        console.log(`Updated note for paperId: ${paperId}, userId: ${userId}`);
      } else {
        // Insert new note
        await con.execute(
          "INSERT INTO Notes (paperId, userId, noteContent) VALUES (?, ?, ?)",
          [paperId, userId, noteContent]
        );
        console.log(
          `Inserted new note for paperId: ${paperId}, userId: ${userId}`
        );
      }

      return new Response(JSON.stringify({ success: true, noteContent }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      });
    } else {
      return new Response(
        JSON.stringify({
          response: "Not a user",
        }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }
  } catch (error) {
    console.error("Error in POST /api/notes:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } finally {
    await con.end();
  }
};

export const DELETE = async ({ params, request, cookies }) => {
  const con = await mysql.createConnection({
    host: import.meta.env.DB_HOST,
    user: import.meta.env.DB_USER,
    password: import.meta.env.DB_PASSWORD,
    database: import.meta.env.DB_DATABASE,
    port: import.meta.env.DB_PORT,
  });

  try {
    const user_cookie = cookies.get("username");
    if (user_cookie) {
      const username = user_cookie.value;
      const [user_result] = await con.execute(
        "SELECT userId FROM UserInfo WHERE username = ?",
        [username]
      );
      const userId = user_result[0].userId;

      const { paperId } = await request.json();

      console.log(`Deleting note for paperId: ${paperId}, userId: ${userId}`);

      const [result] = await con.execute(
        "DELETE FROM Notes WHERE paperId = ? AND userId = ?",
        [paperId, userId]
      );

      if (result.affectedRows > 0) {
        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        });
      } else {
        return new Response(
          JSON.stringify({ success: false, message: "Note not found" }),
          {
            status: 404,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      }
    } else {
      return new Response(
        JSON.stringify({
          response: "Not a user",
        }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }
  } catch (error) {
    console.error("Error in DELETE /api/notes:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } finally {
    await con.end();
  }
};
