declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient(config: {
            client_id: string;
            scope: string;
            callback: (resp: { access_token?: string; error?: string }) => void;
          }): { requestAccessToken(): void };
        };
      };
    };
  }
}

const TOKEN_PREFIX = 'gsi_token_';
const SCOPE_MAP: Record<string, string> = {
  spreadsheets: 'https://www.googleapis.com/auth/spreadsheets',
  'gmail.send': 'https://www.googleapis.com/auth/gmail.send',
  'drive.appdata': 'https://www.googleapis.com/auth/drive.appdata',
};

export function getClientId(): string {
  return localStorage.getItem('gClientId') ?? '';
}

export function setClientId(id: string) {
  localStorage.setItem('gClientId', id);
}

export function getToken(scope: string): Promise<string> {
  const cached = sessionStorage.getItem(TOKEN_PREFIX + scope);
  if (cached) return Promise.resolve(cached);

  return new Promise((resolve, reject) => {
    const clientId = getClientId();
    if (!clientId) { reject(new Error('Google Client ID not set — go to Setup tab')); return; }
    if (!window.google) { reject(new Error('Google Identity Services not loaded')); return; }

    const fullScope = SCOPE_MAP[scope] ?? scope;
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: fullScope,
      callback(resp) {
        if (resp.error || !resp.access_token) {
          reject(new Error(resp.error ?? 'No access token'));
        } else {
          sessionStorage.setItem(TOKEN_PREFIX + scope, resp.access_token);
          resolve(resp.access_token);
        }
      },
    });
    client.requestAccessToken();
  });
}

export function clearToken(scope: string) {
  sessionStorage.removeItem(TOKEN_PREFIX + scope);
}
