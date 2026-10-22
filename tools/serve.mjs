// Development-only static server. No build step or dependency installation required.
import http from 'node:http';
import { readFile, realpath, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, sep, extname } from 'node:path';
const root = await realpath(fileURLToPath(new URL('../', import.meta.url)));
const port = Number(process.env.PORT || 4173);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT must be an integer between 1 and 65535.');
const types = { '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.json':'application/json', '.svg':'image/svg+xml', '.png':'image/png', '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.webp':'image/webp', '.avif':'image/avif', '.woff2':'font/woff2', '.mp4':'video/mp4', '.pdf':'application/pdf' };
const server = http.createServer(async (req, res) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Cache-Control', 'no-store');
  if (!['GET','HEAD'].includes(req.method)) { res.writeHead(405, { Allow: 'GET, HEAD' }); res.end(); return; }
  try {
    const path = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const candidate = resolve(root, `.${path}`, path.endsWith('/') ? 'index.html' : '');
    const file = await realpath(candidate);
    if (!file.startsWith(root + sep) || !(await stat(file)).isFile()) { res.writeHead(404); res.end('Not found'); return; }
    const data = await readFile(file);
    res.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream', 'Content-Length': data.length });
    res.end(req.method === 'HEAD' ? undefined : data);
  } catch (error) {
    res.writeHead(error instanceof URIError ? 400 : 404); res.end('Not found');
  }
});
server.on('error', error => { console.error(error.message); process.exitCode = 1; });
server.listen(port, '127.0.0.1', () => console.log(`Local: http://127.0.0.1:${port}/`));
