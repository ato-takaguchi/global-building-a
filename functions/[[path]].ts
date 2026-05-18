export async function onRequest(context: {
  request: Request;
  next: () => Promise<Response>;
}) {
  const auth = context.request.headers.get("Authorization");

  const USER = "demo";
  const PASS = "demo123";

  const expected =
    "Basic " + btoa(`${USER}:${PASS}`);

  if (auth !== expected) {
    return new Response("Authentication required", {
      status: 401,
      headers: {
        "WWW-Authenticate":
          'Basic realm="Protected"',
      },
    });
  }

  return context.next();
}