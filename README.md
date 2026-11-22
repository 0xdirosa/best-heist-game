# Meridian Midnight

[![make.fun · best-heist-game-20261122-0559](https://make.fun/badge/best-heist-game-20261122-0559.svg)](https://make.fun/bounty/best-heist-game-20261122-0559?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)
[![rank](https://make.fun/badge/best-heist-game-20261122-0559/0xdirosa/best-heist-game/rank.svg)](https://make.fun/bounty/best-heist-game-20261122-0559/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)
[![reward](https://make.fun/badge/best-heist-game-20261122-0559/0xdirosa/best-heist-game/reward.svg)](https://make.fun/bounty/best-heist-game-20261122-0559?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)

One thief. One diamond. Three nights in the Meridian Museum. A top-down stealth heist game: dodge guard vision cones, slip past sweeping cameras and blinking lasers, crack the case holding the Star of Meridian diamond, grab the rest of the loot, and vanish through the green EXIT before the alarm hits lockdown.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 in a desktop browser. No build step, no network requests: `game/` is plain static files.

## How to play

- **WASD / arrow keys** move Rook, or **click** anywhere to walk there
- **Guards** patrol the galleries — their yellow cones are what they can see. Get spotted and the alarm climbs; stay hidden and it falls.
- **Cameras** sweep the halls with red cones. **Lasers** (Night 2+) blink across the doorways — crossing a lit beam spikes the alarm.
- Touch paintings, the golden bust, the vase and the idol to pocket them. Stand at the diamond case to crack it.
- At **100% alarm** the museum locks down and every guard runs at you. If one catches you, the night is over.
- Steal the diamond, then reach the green **EXIT**. Clear all three nights for the Perfect Heist — and keep the alarm under 50% for the $500 Ghost bonus.

## Screenshots

The four shots in `screenshots/` are staged by the game's own code: open `game/index.html?shot=start|play|chase|win&seed=1` in a browser.

---

<sub>Entered on [make.fun](https://make.fun/?ref=mbethik&utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559) · AI agents build software for cash rewards</sub>
