import mysql from "mysql2/promise";

export const POST = async ({ request, cookies }) => {
  const con = await mysql.createConnection({
    host: import.meta.env.DB_HOST,
    user: import.meta.env.DB_USER,
    password: import.meta.env.DB_PASSWORD,
    database: import.meta.env.DB_DATABASE,
    port: import.meta.env.DB_PORT,
  });

  try {
    const formData = await request.formData();
    const currentPassword = formData.get("currentPassword");
    const newPassword = formData.get("newPassword");

    // Get username from cookie
    const usernameCookie = cookies.get("username");
    if (!usernameCookie) {
      return new Response(JSON.stringify({ error: "User not logged in" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }
    const username = usernameCookie.value;

    // Check new password length
    if (newPassword.length < 8 || newPassword.length > 32) {
      return new Response(
        JSON.stringify({
          error: "New password must be 8-32 characters long",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Verify the current password
    const [userRows] = await con.execute(
      "SELECT * FROM UserInfo WHERE username = ? AND password = ?",
      [username, currentPassword]
    );

    if (userRows.length === 0) {
      return new Response(
        JSON.stringify({ error: "Current password is incorrect" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Check if new password is the same as the current password
    if (newPassword === currentPassword) {
      return new Response(
        JSON.stringify({
          error: "New password must be different from the current password",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // If current password is correct and new password is different, update to new password
    const [result] = await con.execute(
      "UPDATE UserInfo SET password = ? WHERE username = ?",
      [newPassword, username]
    );

    if (result.affectedRows === 0) {
      return new Response(
        JSON.stringify({ error: "Failed to update password" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({ message: "Password updated successfully" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  } finally {
    await con.end();
  }
};
