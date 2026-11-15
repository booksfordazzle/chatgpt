import { execFileSync, spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
const name = `primal-waitlist-test-${process.pid}`;
const image = 'postgres:17-alpine@sha256:a77aa70e641402a21411b92b721c58d10f23b50ae5fdd2333efd22d166e1e5f7';
const docker = args => execFileSync('docker', args, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
const sql = input => execFileSync('docker', ['exec', '-i', name, 'psql', '-X', '-v', 'ON_ERROR_STOP=1', '-U', 'postgres', '-q'], { input, encoding: 'utf8' });
try {
  // Ephemeral isolated test DB: no host ports, no external network and no production data.
  docker(['run', '--rm', '-d', '--network', 'none', '--name', name, '-e', 'POSTGRES_HOST_AUTH_METHOD=trust', image]);
  let ready = false;
  for (let attempt = 0; attempt < 40; attempt++) {
    try { docker(['exec', name, 'pg_isready', '-U', 'postgres']); ready = true; break; } catch { await new Promise(resolve => setTimeout(resolve, 250)); }
  }
  if (!ready) throw Error('Test PostgreSQL did not become ready');
  sql('create role anon; create role authenticated; create role service_role bypassrls;');
  sql(readFileSync('supabase/migrations/202611150001_waitlist.sql', 'utf8'));
  sql(readFileSync('supabase/tests/waitlist.sql', 'utf8'));
  console.log('PASS: migration, durable writes, deduplication, consent receipt, withdrawal preservation, RLS/grants and rollback.');
  const concurrent = () => new Promise((resolve, reject) => {
    const child = spawn('docker', ['exec', '-i', name, 'psql', '-X', '-v', 'ON_ERROR_STOP=1', '-U', 'postgres', '-q']);
    let error = ''; child.stderr.on('data', data => { error += data; }); child.stdout.resume();
    child.on('error', reject); child.on('close', code => code === 0 ? resolve() : reject(Error(error)));
    child.stdin.end("set role service_role; select public.capture_waitlist('concurrent@example.com', true);");
  });
  await Promise.all(Array.from({ length: 8 }, concurrent));
  sql("do $$begin if (select count(*) from public.waitlist_signups) <> 1 or (select count(*) from public.waitlist_consent_events) <> 1 then raise exception 'Concurrent duplicate/receipt mismatch'; end if; end$$;");
  console.log('PASS: 8 concurrent duplicate requests create exactly 1 signup and 1 consent receipt.');
} finally {
  try { docker(['rm', '-f', name]); } catch {}
}
