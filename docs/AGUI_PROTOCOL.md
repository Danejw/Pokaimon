# AG-UI integration: MVP contract

**Status:** Standalone simulation transport, 2026-11-19.

Pokaimon uses the official [AG-UI protocol 1.0](https://docs.ag-ui.com/spec/1.0) as its *future agent-to-frontend* interface. AG-UI is not a replacement for model-specific provider adapters. All actual battle actions in MVP are handled by the deterministic local reducer.

## Current implementation

- \`server/agui.ts\`: Node HTTP endpoint \`POST /api/agui\`. Validates an AG-UI \`RunAgentInput\`, streams events using \`@ag-ui/encoder\`, and advertises \`mode=simulation\`.
- \`src/integrations/agui/client.ts\`: real \`HttpAgent\` handshake and lifecycle client.
- \`server/provider-contract.ts\`: future provider adapter interface; zero live adapters exist.
- \`GET /api/health\`: mode and adapter count. No model/API keys are used.
- \`tests/agui.test.ts\`: official client conformance, validation, streaming success, error, health and adapter absence.

The endpoint's allowed events are \`RUN_STARTED\` with protocol version, \`STATE_SNAPSHOT\`, \`TEXT_MESSAGE_START\`, \`TEXT_MESSAGE_CONTENT\`, \`TEXT_MESSAGE_END\`, \`RUN_FINISHED\`, and \`RUN_ERROR\`. An explicit simulated failure emits RUN_ERROR without RUN_FINISHED.

No AG-UI stream drives game victories in the MVP. Current game progress is the result of deterministic gameplay only.

## Local development

Install dependencies with \`npm install\`, then start the API and frontend in separate terminals:

\`\`\`bash
npm run dev:agent
npm run dev
\`\`\`

Open http://localhost:4173/Pokaimon/ . Vite proxies \`/api\` to the AG-UI simulation server at 127.0.0.1:8787. The Settings page includes a local-only handshake test.

Run \`npm run test:agui\` to exercise the official client/server protocol. Network/runtime credentials are not required.

## GitHub Pages limitation

GitHub Pages is static hosting. The game itself works without any server. The AG-UI demonstration endpoint is **not deployed** on Pages. A later paid/live mode requires a separately hosted backend with permissions, budgets, security gates, and external evidence verification. Do not claim GitHub Pages provides dynamic AG-UI execution.

## Security and provider neutrality

- Request bodies have a 64KiB cap, strict JSON/schema validation, and a 20-message limit.
- Simulated results advertise zero provider calls and no verification.
- The example server binds only to localhost by default and uses no CORS header.
- Provider adapters implement a single narrow interface (model ID, tool grants, cancellation, result evidence and usage). No API secrets are in frontend assets.
- Before exposing this endpoint publicly: threat model identity, request authentication, budgets, rate limits, tool execution permissions, retention and cost reporting.
- If an external result cannot be verified, it cannot count as a real TASK victory.

Sources: https://docs.ag-ui.com/spec/1.0 and https://github.com/ag-ui-protocol/ag-ui .
