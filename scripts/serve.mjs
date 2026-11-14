import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { handler } from '../netlify/functions/waitlist.mjs';
const root = path.resolve('public');
const mime = { '.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.webp':'image/webp','.jpg':'image/jpeg','.png':'image/png','.svg':'image/svg+xml','.mp4':'video/mp4','.woff2':'font/woff2','.txt':'text/plain' };
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
  const headers={'Content-Type':mime[path.extname(file)]||'application/octet-stream','X-Content-Type-Options':'nosniff','Cache-Control':'no-store','Accept-Ranges':'bytes'};
  if(status===200 && req.headers.range){
   const range=/^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
   let start=0,end=body.length-1;
   if(range){
    if(range[1]){start=Number(range[1]);if(range[2])end=Math.min(Number(range[2]),end);}
    else if(range[2])start=Math.max(0,body.length-Number(range[2]));
   }
   if(!range||(!range[1]&&!range[2])||start>end||start>=body.length){res.writeHead(416,{...headers,'Content-Range':`bytes */${body.length}`});res.end();return;}
   headers['Content-Range']=`bytes ${start}-${end}/${body.length}`;
   body=body.subarray(start,end+1);status=206;
  }
  headers['Content-Length']=body.length;
  res.writeHead(status,headers);res.end(req.method==='HEAD'?undefined:body);
 } catch {res.writeHead(500);res.end('Server error');}
}).listen(Number(process.env.PORT||8080),'0.0.0.0',()=>console.log(`Development server on port ${process.env.PORT||8080}`));
