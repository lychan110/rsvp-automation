const BASE = 'https://sheets.googleapis.com/v4/spreadsheets';

export function extractSheetId(url: string): string {
  const m = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (!m) throw new Error('Cannot parse spreadsheet ID from URL: ' + url);
  return m[1];
}

export async function sheetsGet(token: string, spreadsheetId: string, range: string): Promise<string[][]> {
  const url = `${BASE}/${spreadsheetId}/values/${encodeURIComponent(range)}`;
  const res = await fetch(url, { headers: { Authorization: 'Bearer ' + token } });
  if (!res.ok) throw new Error(`Sheets GET error ${res.status}: ${await res.text()}`);
  const data = await res.json() as { values?: string[][] };
  return data.values ?? [];
}

export async function sheetsUpdate(token: string, spreadsheetId: string, range: string, values: string[][]): Promise<void> {
  const url = `${BASE}/${spreadsheetId}/values/${encodeURIComponent(range)}?valueInputOption=USER_ENTERED`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
    body: JSON.stringify({ range, majorDimension: 'ROWS', values }),
  });
  if (!res.ok) throw new Error(`Sheets PUT error ${res.status}: ${await res.text()}`);
}

export async function sheetsClear(token: string, spreadsheetId: string, range: string): Promise<void> {
  const url = `${BASE}/${spreadsheetId}/values/${encodeURIComponent(range)}:clear`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + token },
  });
  if (!res.ok) throw new Error(`Sheets CLEAR error ${res.status}: ${await res.text()}`);
}
