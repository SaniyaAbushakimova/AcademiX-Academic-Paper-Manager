import mysql from "mysql2/promise";

export const GET = async ({ params, request }) => {
  const con = await mysql.createConnection({
    host: import.meta.env.DB_HOST,
    user: import.meta.env.DB_USER,
    password: import.meta.env.DB_PASSWORD,
    database: import.meta.env.DB_DATABASE,
    port: import.meta.env.DB_PORT,
  });

  try {
    const [rows] = await con.execute(`
      SELECT username, password
      FROM UserInfo
      ORDER BY userId DESC
      LIMIT 10;
    `);

    return new Response(JSON.stringify(rows), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
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

export const POST = async ({ request, cookies }) => {
  const formData = await request.formData();
  const action = formData.get("action");
  const username = formData.get("username");
  const password = formData.get("password");

  const con = await mysql.createConnection({
    host: import.meta.env.DB_HOST,
    user: import.meta.env.DB_USER,
    password: import.meta.env.DB_PASSWORD,
    database: import.meta.env.DB_DATABASE,
    port: import.meta.env.DB_PORT,
  });

  try {
    if (action === "signup") {
      if (
        username.length < 4 ||
        username.length > 32 ||
        password.length < 8 ||
        password.length > 32
      ) {
        return new Response(
          JSON.stringify({
            error:
              "Username must be 4-32 characters and password must be 8-32 characters long",
          }),
          {
            status: 400,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      }

      try {
        const [result] = await con.execute(
          `
          INSERT INTO UserInfo (username, password)
          VALUES (?, ?);
        `,
          [username, password]
        );
        cookies.set("username", username, {
          path: '/',
          httpOnly: true,
          secure: true,
          maxAge: 60 * 60 // 1 hour
        })
        return new Response(
          JSON.stringify({ message: "User created successfully" }),
          {
            status: 201,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      } catch (error) {
        if (error.code === "ER_DUP_ENTRY") {
          return new Response(
            JSON.stringify({
              error:
                "This username is already taken. Please choose a different one.",
            }),
            {
              status: 409,
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
        }
        throw error;
      }
    } else if (action === "login") {
      const [rows] = await con.execute(
        `
        SELECT * FROM UserInfo
        WHERE username = ? AND password = ?
      `,
        [username, password]
      );
      if (rows.length > 0) {
        cookies.set("username", username, {
          path: '/',
          httpOnly: true,
          secure: true,
          maxAge: 60 * 60 // 1 hour
        })
        return new Response(JSON.stringify({ message: "Login successful" }), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        });
      } else {
        return new Response(
          JSON.stringify({ error: "Invalid username or password" }),
          {
            status: 401,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      }
    } else {
      return new Response(JSON.stringify({ error: "Invalid action" }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }
  } catch (error) {
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
