
export async function GET({ cookies }) {
  const user = cookies.get('username');

  return new Response(JSON.stringify({
    user: user ? user.value : ""
  }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

