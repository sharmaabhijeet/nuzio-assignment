export async function api(path, options = {}) {
  const response = await fetch(`/api${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
    credentials: 'same-origin',
  });
  const body = await response
    .json()
    .catch(() => ({ error: 'The server is unavailable. Please try again.' }));
  if (!response.ok)
    throw Object.assign(new Error(body.error || 'Request failed.'), { status: response.status });
  return body;
}
