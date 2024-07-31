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

      const [rows] = await con.execute(
        `
        SELECT 
            ax.paperId, 
            ax.arxivId, 
            ax.title, 
            ax.comments, 
            ax.authors, 
            ax.categories AS tags, 
            ax.abstract, 
            ax.update_date, 
            ax.views,
            ac.savedAt
        FROM 
            Arxiv ax
            INNER JOIN Actions ac ON ax.paperId = ac.paperId
        WHERE
            ac.actionType = 'save'
            AND ac.userId = ?
        ORDER BY ac.savedAt DESC;
      `,
        [userId]
      );

      return new Response(JSON.stringify(rows), {
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
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }
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
