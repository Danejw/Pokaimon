# Pokaimon

**Master your models. Battle real-world problems.** A nostalgic pixel-art AI literacy battle game. Press PLAY to meet a random wild problem, choose an AI inside the arena, watch your trainer summon it, then use capability moves. Battle rules are deterministic simulations; no paid model APIs are called.

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
- [MVP status and manual playtest](docs/MVP_STATUS.md)
- [Battle Evolution: five detailed post-MVP phases](docs/battle-evolution/README.md)
- [Battle Evolution: serial execution tracker](docs/battle-evolution/TASKS.md)
- [Retro wild encounter and summon design](docs/RETRO_BATTLE_DIRECTION.md)
- [Security and rights review](docs/SECURITY_REVIEW.md)
- [Skills and agent guide](AGENTS.md)

## Release
**Play the browser MVP:** https://danejw.github.io/Pokaimon/ . GitHub Pages deployment completed successfully in [this run](https://github.com/Danejw/Pokaimon/actions/runs/44680949777). Runtime dependencies and testing are separate from the vendored coding-agent skills.

Status: The stable main branch has the original simulated battle game. On the separate Battle Evolution draft branch, four playable model characters (including sourced Claude Opus 5.5), five base encounters, three campaign chapters, challenges, local progression, and the AG-UI simulation transport are implemented. Follow the phase tracker for latest CI and release gates. The game runs without signing in, API keys or paid inference.

See [AG-UI protocol](docs/AGUI_PROTOCOL.md) for running the standalone simulation backend locally. GitHub Pages serves the static game only. GitHub Pages serves the static game; the local AG-UI Node server is not part of that deployment.
