export function getSlug(req) {
  return req.headers.get("x-org-slug");
}
