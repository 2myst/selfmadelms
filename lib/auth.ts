// Работает и в middleware (edge), и на сервере: только Web Crypto, без node-модулей.
export const COOKIE = 'lms_admin';

export async function tokenFor(password: string) {
  const data = new TextEncoder().encode(`design-basics-lms:${password}`);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function isAdminToken(value: string | undefined) {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw || !value) return false;
  return value === (await tokenFor(pw));
}
