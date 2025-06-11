// pkceUtils.js
import sha256 from 'js-sha256';

function base64URLEncode(str) {
  return btoa(String.fromCharCode.apply(null, str))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function generateCodeVerifier() {
  const array = new Uint32Array(56);
  window.crypto.getRandomValues(array);
  return Array.from(array, dec => ('0' + dec.toString(16)).substr(-2)).join('');
}

function generateCodeChallenge(codeVerifier) {
  const hashed = sha256.arrayBuffer(codeVerifier);
  return base64URLEncode(new Uint8Array(hashed));
}

export { generateCodeVerifier, generateCodeChallenge };
