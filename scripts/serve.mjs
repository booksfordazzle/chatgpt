import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { handler } from '../netlify/functions/waitlist.mjs';
const root = path.resolve('public');
const mime = { '.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.webp':'image/webp','.jpg':'image/jpeg','.svg':'image/svg+xml','.mp4':'video/mp4','.woff2':'font/woff2','.txt':'text/plain' };
http.createServer(async(req,res)=>{
 try {
  const pathname = decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  if(pathname === '/api/waitlist') {
   let body=''; for await (const chunk of req) { body+=chunk; if(Buffer.byteLength(body)>4096){res.writeHead(413);res.end();return;} }
   const result=await handler({httpMethod:req.method,headers:req.headers,body}); res.writeHead(result.statusCode,result.headers);res.end(result.body);return;
  }
  let file=path.resolve(root,'.'+pathname);if(!file.startsWith(root+path.sep)&&file!==root){res.writeHead(403);res.end();return;}
  try { if((await stat(file)).isDirectory())file=path.join(file,'index.html'); } catch {}
  let status=200,body;try{body=await readFile(file)}catch{status=404;file=path.join(root,'404.html');body=await readFile(file)}
  res.writeHead(status,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','X-Content-Type-Options':'nosniff','Cache-Control':'no-store'});res.end(req.method==='HEAD'?undefined:body);
 } catch {res.writeHead(500);res.end('Server error');}
}).listen(Number(process.env.PORT||8080),'0.0.0.0',()=>console.log(`Development server on port ${process.env.PORT||8080}`));
