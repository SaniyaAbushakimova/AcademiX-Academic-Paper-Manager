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
    console.log(user_cookie);
    if (user_cookie) {
      const username = user_cookie.value;
      const [user_result] = await con.execute(
        "SELECT userId FROM UserInfo WHERE username = ?",
        [username]
      );
      const userId = user_result[0].userId;
      const [papers_result] = await con.execute(
        `
        SELECT DISTINCT ax.paperId, ax.arxivId, ax.title, ax.comments, ax.authors, ax.categories as tags, ax.abstract, ax.update_date, ax.views, ac.maxTime
        FROM Arxiv ax JOIN (
          SELECT paperId, MAX(savedAt) as maxTime
          FROM Actions
          WHERE actionType = 'view' AND userId = ?
          GROUP BY paperId
        ) ac ON ax.paperId = ac.paperId
        ORDER BY ac.maxTime DESC
        LIMIT 15;
        `,
        [userId]
      );
      return new Response(JSON.stringify(papers_result), {
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
