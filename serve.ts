import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';

const root = resolve(import.meta.dirname, 'game');
const types: Record<string, string> = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8', '.json':'application/json; charset=utf-8' };
createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url || '/', 'http://localhost').pathname);
    const candidate = resolve(root, `.${pathname === '/' ? '/index.html' : pathname}`);
    if (candidate !== root && !candidate.startsWith(root + sep)) throw new Error('forbidden');
    if (!(await stat(candidate)).isFile()) throw new Error('not found');
    res.writeHead(200, { 'content-type': types[extname(candidate)] || 'application/octet-stream', 'cache-control':'no-store' });
    res.end(await readFile(candidate));
  } catch { res.writeHead(404, { 'content-type':'text/plain; charset=utf-8' }); res.end('Not found'); }
}).listen(8080, '0.0.0.0', () => console.log('VOID HARVEST at http://localhost:8080'));
