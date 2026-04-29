const BASE = 'https://www.googleapis.com/';

export async function listAppDataFiles(token: string): Promise<Array<{ id: string; name: string }>> {
  const url = `${BASE}drive/v3/files?spaces=appDataFolder&fields=files(id,name)`;
  const res = await fetch(url, { headers: { Authorization: 'Bearer ' + token } });
  if (!res.ok) throw new Error(`Drive list error ${res.status}: ${await res.text()}`);
  const data = await res.json() as { files: Array<{ id: string; name: string }> };
  return data.files;
}

export async function getAppDataFile(token: string, fileId: string): Promise<unknown> {
  const url = `${BASE}drive/v3/files/${fileId}?alt=media`;
  const res = await fetch(url, { headers: { Authorization: 'Bearer ' + token } });
  if (!res.ok) throw new Error(`Drive get error ${res.status}: ${await res.text()}`);
  return res.json();
}

export async function createAppDataFile(token: string, name: string, content: unknown): Promise<string> {
  const metadata = { name, parents: ['appDataFolder'] };
  const body = JSON.stringify(content);
  const boundary = 'xyz_boundary_xyz';
  const multipart = [
    `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}`,
    `\r\n--${boundary}\r\nContent-Type: application/json\r\n\r\n${body}`,
    `\r\n--${boundary}--`,
  ].join('');
  const url = `${BASE}upload/drive/v3/files?uploadType=multipart&fields=id`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + token,
      'Content-Type': `multipart/related; boundary="${boundary}"`,
    },
    body: multipart,
  });
  if (!res.ok) throw new Error(`Drive create error ${res.status}: ${await res.text()}`);
  const data = await res.json() as { id: string };
  return data.id;
}

export async function updateAppDataFile(token: string, fileId: string, content: unknown): Promise<void> {
  const url = `${BASE}upload/drive/v3/files/${fileId}?uploadType=media`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
    body: JSON.stringify(content),
  });
  if (!res.ok) throw new Error(`Drive update error ${res.status}: ${await res.text()}`);
}

export async function deleteAppDataFile(token: string, fileId: string): Promise<void> {
  const url = `${BASE}drive/v3/files/${fileId}`;
  const res = await fetch(url, { method: 'DELETE', headers: { Authorization: 'Bearer ' + token } });
  if (!res.ok && res.status !== 404) throw new Error(`Drive delete error ${res.status}: ${await res.text()}`);
}
