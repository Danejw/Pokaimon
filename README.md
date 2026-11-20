# Pokaimon

**Master your models. Battle real-world problems.** A responsive, original pixel-art inspired AI literacy game. Initial battles are deterministic simulations; no paid model APIs are called.

## Development
Requires Node 22+.

```bash
npm install
npm run dev
npm run lint
npm run typecheck
npm run test
npm run build
npx playwright install chromium
npm run test:e2e
```

The Vite app is served from `/Pokaimon/` to support GitHub Pages deployment. Visit `http://localhost:4173/Pokaimon/` during development.

## Roadmap
- [Game design](docs/GAME_DESIGN.md)
- [Phased plan](docs/IMPLEMENTATION_PLAN.md)
- [Skills and agent guide](AGENTS.md)

## Release
The Pages workflow builds on each push to main. The repo owner may need to enable **Settings → Pages → Build and deployment → GitHub Actions** once before deployment works. Runtime dependencies and testing are separate from the vendored coding-agent skills.

Status: Phase 0 app shell, navigation, settings, responsive Phaser stage, and CI. No battles yet.
