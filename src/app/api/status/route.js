export async function GET(req) {
  if (req.nextUrl.pathname === '/api/status') {
    return new Response(
      JSON.stringify({ status: 'API is up and running!' }),
      { status: 200 }
    );
  }
}