/**
 * 0711-I OAuth2 PKCE Auth Service for BIG-C Admin UI
 */

const AUTH_BASE = '/auth';
const CLIENT_ID = 'bigc';
const REDIRECT_URI = `${window.location.origin}/admin/oauth/callback`;
const SCOPES = 'openid profile email';
const STORAGE_KEY = 'o711_bigc_auth';

export interface AuthUser {
  sub: string;
  email: string;
  name?: string;
  org_id?: string;
}

interface StoredAuth {
  access_token: string;
  refresh_token?: string;
  expires_at: number;
  user: AuthUser;
}

// --- PKCE Helpers ---

function randomString(len: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  const arr = new Uint8Array(len);
  crypto.getRandomValues(arr);
  return Array.from(arr, v => chars[v % chars.length]).join('');
}

async function codeChallenge(verifier: string): Promise<string> {
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
  return btoa(String.fromCharCode(...new Uint8Array(hash)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

class AuthService {
  getStoredAuth(): StoredAuth | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw) as StoredAuth;
      if (data.expires_at < Date.now()) {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }
      return data;
    } catch {
      return null;
    }
  }

  isAuthenticated(): boolean {
    return this.getStoredAuth() !== null;
  }

  getUser(): AuthUser | null {
    return this.getStoredAuth()?.user || null;
  }

  getToken(): string | null {
    return this.getStoredAuth()?.access_token || null;
  }

  async login(): Promise<void> {
    const verifier = randomString(64);
    const state = randomString(32);
    const challenge = await codeChallenge(verifier);

    sessionStorage.setItem('o711_pkce_verifier', verifier);
    sessionStorage.setItem('o711_pkce_state', state);

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      scope: SCOPES,
      state,
      code_challenge: challenge,
      code_challenge_method: 'S256',
    });

    window.location.href = `${AUTH_BASE}/oauth/authorize?${params}`;
  }

  async handleCallback(): Promise<AuthUser | null> {
    const url = new URL(window.location.href);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');

    if (!code || !state) return null;

    const savedState = sessionStorage.getItem('o711_pkce_state');
    const verifier = sessionStorage.getItem('o711_pkce_verifier');

    if (state !== savedState || !verifier) {
      console.error('OAuth state mismatch');
      return null;
    }

    try {
      const res = await fetch(`${AUTH_BASE}/oauth/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: CLIENT_ID,
          code,
          redirect_uri: REDIRECT_URI,
          code_verifier: verifier,
        }),
      });

      if (!res.ok) throw new Error('Token exchange failed');

      const tokens = await res.json();
      const payload = JSON.parse(atob(tokens.access_token.split('.')[1]));
      const user: AuthUser = {
        sub: payload.sub,
        email: payload.email || '',
        name: payload.name,
        org_id: payload.org_id,
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_at: Date.now() + tokens.expires_in * 1000,
        user,
      }));

      sessionStorage.removeItem('o711_pkce_verifier');
      sessionStorage.removeItem('o711_pkce_state');

      // Clean URL
      window.history.replaceState({}, '', '/admin/overview');

      return user;
    } catch (err) {
      console.error('OAuth callback error:', err);
      return null;
    }
  }

  logout(): void {
    localStorage.removeItem(STORAGE_KEY);
    window.location.href = '/admin/login';
  }
}

export const authService = new AuthService();
