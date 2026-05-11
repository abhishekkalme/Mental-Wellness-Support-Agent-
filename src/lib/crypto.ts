/**
 * Synchronous encryption/decryption using a session-scoped XOR cipher.
 * Key is generated via crypto.getRandomValues and stored in sessionStorage
 * so it persists across SPA navigations but is cleared when the tab closes.
 *
 * This protects sensitive wellness data from casual localStorage inspection
 * while remaining compatible with zustand persist's synchronous API.
 */

let _key: Uint8Array | null = null;

function getKey(): Uint8Array {
  if (_key) return _key;

  try {
    const stored = typeof window !== 'undefined' && sessionStorage.getItem('__mc_enc_key');
    if (stored) {
      _key = Uint8Array.from(atob(stored), (c) => c.charCodeAt(0));
      return _key;
    }
  } catch {}

  _key = crypto.getRandomValues(new Uint8Array(32));

  try {
    sessionStorage.setItem('__mc_enc_key', btoa(String.fromCharCode(..._key)));
  } catch {}

  return _key;
}

export function encrypt(plaintext: string): string {
  const key = getKey();
  const data = new TextEncoder().encode(plaintext);
  const result = new Uint8Array(data.length);
  for (let i = 0; i < data.length; i++) {
    result[i] = data[i] ^ key[i % key.length];
  }
  return btoa(String.fromCharCode(...new Uint8Array(result)));
}

export function decrypt(ciphertext: string): string {
  const key = getKey();
  let data: Uint8Array;
  try {
    data = Uint8Array.from(atob(ciphertext), (c) => c.charCodeAt(0));
  } catch {
    throw new Error('Invalid ciphertext');
  }
  const result = new Uint8Array(data.length);
  for (let i = 0; i < data.length; i++) {
    result[i] = data[i] ^ key[i % key.length];
  }
  return new TextDecoder().decode(result);
}
