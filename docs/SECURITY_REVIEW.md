# Pokaimon MVP security and rights review

Scope: Browser-based deterministic game plus optional localhost AG-UI simulation server. This is a focused development review, not an external penetration test or legal clearance.

## Existing safeguards

- Zero live provider adapters. No model API credentials or real tool execution are needed for the MVP.
- AG-UI requests are validated with the official schema, a 64 KiB body limit, a 20-message limit and strict JSON content type.
- The example server binds to 127.0.0.1 without public CORS access. The static hosted game does not expose the server.
- Error events cannot produce a successful run-finished event. Simulation metadata identifies zero provider calls.
- Browser stores only game preferences and completed encounter IDs locally.
- The game uses original drawn characters and synthesized sound rather than copied commercial-game assets.
- CI checks run lint, TypeScript, unit/integration, AG-UI and mobile/desktop E2E tests.

## Explicit release limitations

- Public AG-UI execution would require authentication, authorization, cost controls, rate limits, safe tool sandboxing, evidence verification and a more complete threat model.
- The Pokaimon title and vendor-name references require trademark/branding review before commercial promotion.
- External Google Fonts are loaded in the stylesheet. Self-host or replace them if stricter privacy requirements apply.
- A versioned dependency lockfile is recommended for repeatable builds.
- Real Android playback, audio-quality assessment and deeper accessibility review remain for the owner.
- No live AI-model benchmarking has been performed. Fictional balance values do not prove comparative provider performance.

See AGUI_PROTOCOL.md for protocol details and MVP_STATUS.md for implementation and deployment readiness.
