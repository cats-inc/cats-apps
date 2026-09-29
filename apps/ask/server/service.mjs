import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { z } from 'zod';
import { createStore, AskError, answerSchema, attemptSchema, LIMITS } from './store.mjs';

const json = (response, status, value) => {
  response.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
  response.end(JSON.stringify(value));
};
async function body(request) {
  const chunks = []; let size = 0;
  for await (const chunk of request) { size += chunk.length; if (size > LIMITS.bodyBytes) throw new AskError('request_too_large', 413); chunks.push(Buffer.from(chunk)); }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); }
  catch { throw new AskError('invalid_json'); }
}
const result = (value, isError = false) => ({ content: [{ type: 'text', text: JSON.stringify(value) }], structuredContent: value, isError });

export async function start({ dataDir }) {
  const store = await createStore(dataDir);
  const sessions = new Set();
  let inFlight = 0;
  let calls = 0; let windowStart = Date.now();
  const mcp = async (request, response) => {
    const bearer = /^Bearer ([a-f0-9]{64})$/.exec(request.headers.authorization ?? '')?.[1];
    if (!store.authenticate(bearer)) { json(response, 401, { error: 'connection_auth_required' }); return; }
    if (request.method !== 'POST') { response.writeHead(405, { Allow: 'POST' }).end(); return; }
    if (Date.now() - windowStart > 60_000) { calls = 0; windowStart = Date.now(); }
    if (++calls > 120 || inFlight >= 8) throw new AskError('connection_rate_limited', 429);
    inFlight++;
    response.once('close', () => { inFlight--; });
    const payload = await body(request);
    const server = new McpServer({ name: 'cats.ask', version: '0.1.0' });
    const guarded = operation => async input => {
      // Rotation can happen after transport authentication but before the actual tool call.
      if (!store.authenticate(bearer)) return result({ error: 'connection_revoked' }, true);
      try { return result(await operation(input)); }
      catch (error) { return result({ error: error instanceof AskError ? error.message : 'invalid_or_unsaved_answer' }, true); }
    };
    server.registerTool('cats_get_question', {
      description: 'Read one question explicitly shared by its owner in Cats Ask. No listing or account discovery.',
      inputSchema: attemptSchema.shape,
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    }, guarded(input => store.fetchAttempt(input)));
    server.registerTool('cats_submit_answer', {
      description: 'Save the answer for the original Cats Ask attempt. Identical retries return the original receipt; conflicting answers are rejected.',
      inputSchema: { ...attemptSchema.shape, response: answerSchema },
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: false },
    }, guarded(({ response: answer, ...attempt }) => store.submit(attempt, answer)));
    const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true });
    const session = { server, transport }; sessions.add(session);
    response.once('close', () => { sessions.delete(session); void transport.close(); void server.close(); });
    await server.connect(transport);
    await transport.handleRequest(request, response, payload);
  };
  return {
    async handle(request, response) {
      try {
        const url = new URL(request.url, 'http://app.invalid');
        if (url.pathname === '/mcp') { await mcp(request, response); return; }
        if (url.pathname === '/api/connection' && request.method === 'GET') { json(response, 200, store.connection()); return; }
        if (url.pathname === '/api/connection/rotate' && request.method === 'POST') { json(response, 200, await store.rotate()); return; }
        if (url.pathname === '/api/questions') {
          if (request.method === 'GET') { json(response, 200, { questions: store.list() }); return; }
          if (request.method === 'POST') { json(response, 201, await store.create(await body(request))); return; }
        }
        const match = /^\/api\/questions\/([a-f0-9-]{36})(\/prepare)?$/.exec(url.pathname);
        if (match) {
          if (!match[2] && request.method === 'GET') { json(response, 200, store.get(match[1])); return; }
          if (match[2] && request.method === 'POST') { json(response, 200, await store.prepare(match[1])); return; }
        }
        json(response, 404, { error: 'route_not_found' });
      } catch (error) {
        if (response.headersSent) { response.destroy(); return; }
        json(response, error instanceof AskError ? error.status : error instanceof z.ZodError ? 400 : 503,
          { error: error instanceof AskError ? error.message : error instanceof z.ZodError ? 'invalid_input' : 'ask_storage_unavailable' });
      }
    },
    async close() { for (const { server, transport } of sessions) { await transport.close(); await server.close(); } await store.close(); },
  };
}
