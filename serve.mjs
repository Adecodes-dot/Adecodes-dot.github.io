// Local preview of dist/. Usage: node serve.mjs [port]
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, extname, normalize, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = join(dirname(fileURLToPath(import.meta.url)), 'dist');
const port = Number(process.argv[2] ?? 4321);
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.pdf': 'application/pdf', '.ico': 'image/x-icon' };

createServer(async (req, res) => {
  let path = normalize(join(dist, decodeURIComponent(new URL(req.url, 'http://x').pathname)));
  if (!path.startsWith(dist)) { res.writeHead(403).end(); return; }
  try {
    if ((await stat(path)).isDirectory()) path = join(path, 'index.html');
    res.writeHead(200, { 'content-type': types[extname(path)] ?? 'application/octet-stream' }).end(await readFile(path));
  } catch {
    res.writeHead(404, { 'content-type': 'text/plain' }).end('Not found');
  }
}).listen(port, () => console.log(`http://localhost:${port}`));
