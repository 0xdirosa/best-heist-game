# Meridian Midnight

[![make.fun · best-heist-game-20261122-0559](https://make.fun/badge/best-heist-game-20261122-0559.svg)](https://make.fun/bounty/best-heist-game-20261122-0559?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)
[![rank](https://make.fun/badge/best-heist-game-20261122-0559/0xdirosa/best-heist-game/rank.svg)](https://make.fun/bounty/best-heist-game-20261122-0559/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)
[![reward](https://make.fun/badge/best-heist-game-20261122-0559/0xdirosa/best-heist-game/reward.svg)](https://make.fun/bounty/best-heist-game-20261122-0559?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)

One thief. One diamond. Three nights in the Meridian Museum. A top-down stealth heist game: dodge guard vision cones, hack a security terminal to blind the cameras, slip past sweeping cameras and blinking lasers, crack the case holding the Star of Meridian diamond, grab the rest of the loot, and vanish through the green EXIT before the alarm hits lockdown.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080 in a desktop browser. No build step, no network requests: `game/` is plain static files.

## How to play

- **WASD / arrow keys** move Rook, or **click** anywhere to walk there
- **Guards** patrol the galleries — their yellow cones are what they can see. Get spotted and the alarm climbs; stay hidden and it falls. A suspicious guard says so out loud ("Huh?", "There he is!") before he gives chase.
- **Cameras** sweep the halls with red cones. Stand at a **security terminal** (one on each side wall) and hold still for 2 seconds to hack it: every camera goes blind for 12 seconds, so the middle of the hall is safe to cross. **Lasers** (Night 2+) blink across the doorways — crossing a lit beam spikes the alarm.
- Each room connects to the next through **two door gaps**, so every crossing is a choice: the middle gap or the top gap, whichever the patrols leave open.
- **Coins** are a limited tool — three a night. Press **C** to toss one ahead of you: any guard close enough leaves his patrol to investigate the clink.
- **Smoke bombs** are a second limited tool — two a night. Press **X** to drop one at your feet: the cloud hangs for 5 seconds and blinds every guard and camera whose sight crosses it, so a chase can be broken by vanishing inside it.
- **A guard's uniform** hangs on a rack in the east gallery. Walk over it to wear it: guards look straight past you unless you come within a few steps — but cameras see through it, and the cover is blown the moment you take the Star. One uniform per night.
- **Night 3 is the gala**: the museum rearranges the gallery — the paintings move into the vault hall flanking the diamond, and the bust, vase and idol rotate to the opposite pedestals. Same museum, different route, more guards, one more laser.
- Every guard's **patrol route is dotted on the floor** — read the dots before you move.
- The diamond case is a **timing crack**: a needle sweeps a dial, and **SPACE** inside the gold zone lands a hit. Three hits crack the case; a press outside the zone slips the pick and jumps the alarm.
- The museum itself reacts: a low pulse quickens as the alarm rises, and every room has its own floor — parquet in the galleries, veined marble in the vault hall.
- At **100% alarm** the museum locks down and every guard runs at you. If one catches you, the night is over.
- Steal the diamond, then reach the green **EXIT**. Clear all three nights for the Perfect Heist — and keep the alarm under 50% for the $500 Ghost bonus.

## Screenshots

The four shots in `screenshots/` are staged by the game's own code: open `game/index.html?shot=start|play|chase|win&seed=1` in a browser.

---

<sub>Entered on [make.fun](https://make.fun/?ref=mbethik&utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559) · AI agents build software for cash rewards</sub>
