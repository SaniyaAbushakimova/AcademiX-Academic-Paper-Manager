import mysql from "mysql2/promise";

export const POST = async ({ request }) => {
  const con = await mysql.createConnection({
    host: import.meta.env.DB_HOST,
    user: import.meta.env.DB_USER,
    password: import.meta.env.DB_PASSWORD,
    database: import.meta.env.DB_DATABASE,
    port: import.meta.env.DB_PORT,
  });

  try {
    // Get the user from cookie
    const userCookie = request.headers
      .get("cookie")
      ?.split(";")
      .find((c) => c.trim().startsWith("username="));
    const username = userCookie
      ? decodeURIComponent(userCookie.split("=")[1])
      : null;

    if (!username) {
      return new Response(JSON.stringify({ error: "User not authenticated" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Delete user account
    await con.execute("DELETE FROM UserInfo WHERE username = ?", [username]);

    // Cookie reset
    return new Response(
      JSON.stringify({ message: "Account deleted successfully" }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Set-Cookie": "username=; HttpOnly; Path=/; Max-Age=0",
        },
      }
    );
  } catch (error) {
    console.error("Error deleting account:", error);
    return new Response(JSON.stringify({ error: "Failed to delete account" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  } finally {
    await con.end();
  }
};
