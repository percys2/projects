export async function parseBody(req) {
  try {
    return await req.json();
  } catch (e) {
    return null;
  }
}
