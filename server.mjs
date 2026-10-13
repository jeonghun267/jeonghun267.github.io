/** Dependency-free development server; no build or npm install is needed.
 *  Not intended as an internet-facing production application server. */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.dirname(fileURLToPath(import.meta.url));
const arg = (name, fallback) => {
  const i = process.argv.indexOf(name);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
};
const port = Number(arg('--port', process.env.PORT || '4173'));
const host = arg('--host', '127.0.0.1');
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Invalid port');
const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.json':'application/json; charset=utf-8','.ico':'image/x-icon','.md':'text/plain; charset=utf-8','.mp4':'video/mp4'};
const server = http.createServer((req, res) => {
  try {
    if (!['GET','HEAD'].includes(req.method)) { res.writeHead(405, {'Allow':'GET, HEAD'}); res.end(); return; }
    const pathname = decodeURIComponent(new URL(req.url || '/', 'http://localhost').pathname);
    const file = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
    if (!file.startsWith(root + path.sep)) { res.writeHead(403); res.end('Forbidden'); return; }
    fs.stat(file, (error, stat) => {
      if (error || !stat.isFile()) { res.writeHead(404); res.end('Not found'); return; }
      res.writeHead(200, {'Content-Type':types[path.extname(file)] || 'application/octet-stream','X-Content-Type-Options':'nosniff','Cache-Control':'no-store','Referrer-Policy':'strict-origin-when-cross-origin'});
      if (req.method === 'HEAD') { res.end(); return; }
      const stream = fs.createReadStream(file);
      stream.on('error', err => { console.error('[server] Read failed', err.message); res.destroy(); });
      stream.pipe(res);
    });
  } catch (error) { console.error('[server] Request failed', error.message); res.writeHead(400); res.end('Bad request'); }
});
server.requestTimeout = 10000;
server.headersTimeout = 10000;
server.on('error', error => { console.error('[server]', error.message); process.exitCode = 1; });
server.listen(port, host, () => console.info(`[OJH] Development preview: http://${host}:${port}`));
for (const signal of ['SIGINT','SIGTERM']) process.on(signal, () => server.close(() => process.exit(0)));
