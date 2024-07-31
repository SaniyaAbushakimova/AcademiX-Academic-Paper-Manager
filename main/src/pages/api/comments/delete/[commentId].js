import mysql from 'mysql2/promise'

export const DELETE = async ({ params, request, cookies }) => {
  const commentId = params.commentId

  const con = await mysql.createConnection({
    host: import.meta.env.DB_HOST,
    user: import.meta.env.DB_USER,
    password: import.meta.env.DB_PASSWORD,
    database: import.meta.env.DB_DATABASE,
    port: import.meta.env.DB_PORT,
  })

  const user_cookie = cookies.get("username")

  if (!user_cookie) {
    return new Response(JSON.stringify({
      response: "Not a user"
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json"
      }
    })
  }

  try {
    const [result] = await con.execute(
      "DELETE FROM Comments WHERE commentId = ?",
      [commentId]
    )
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        "Content-Type": "application/json"
      }
    })
  } catch (error) {
    return new Response(JSON.stringify(error), {
      status: 500,
      headers: {
        "Content-Type": "application/json"
      }
    })
  } finally {
    await con.end()
  }

};
