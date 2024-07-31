
import mysql from 'mysql2/promise'

export const GET = async ({ params, request, cookies }) => {

  const paperId = params.paperId

  const con = await mysql.createConnection({
    host: import.meta.env.DB_HOST,
    user: import.meta.env.DB_USER,
    password: import.meta.env.DB_PASSWORD,
    database: import.meta.env.DB_DATABASE,
    port: import.meta.env.DB_PORT,
  })

  try {
    const [rows] = await con.execute(`
        SELECT ax.paperId, ax.arxivId, ax.title, ax.comments, ax.authors, ax.categories as tags, ax.abstract, ax.update_date, ax.views
        FROM Arxiv ax
        WHERE ax.paperId = ${paperId}
    `)
    return new Response(JSON.stringify(rows[0]), {
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
}
