// Meridian Midnight v6: the museum's sprite set, drawn as code with pxl.
// Top-down, 16px base, Meridian palette (navy guards, gold trim, dark
// wood, jade, ice-blue diamond). Build with:
//   node ~/workspace/custom-skills/pxl/bin/pxl.js build game/pxl/museum.px.js --out /tmp/pxl-v6
// then copy out/museum.png + out/museum.json to game/assets/.
// Characters face down (toward the viewer); the vision cones and the
// crack dial, not the sprite, show which way anyone looks.

pal({ k: "#14101e", n: "#2c4a7c", N: "#1e3255", b: "#4a6fa5", s: "#e8b98a", g: "#c9a227", G: "#c9962e", w: "#f2ead8", d: "#8a6a3f", D: "#6b4e2e", l: "#b08d57", h: "#241a30", H: "#3a2c4a", r: "#a83240", R: "#7a1f2b", m: "#8a93a6", M: "#6b7280", e: "#7fd0a8", E: "#2f7d5a", c: "#9be8ff", C: "#e8fbff", y: "#58c98a", o: "#e5534b", t: "#3f5a3a", T: "#2c4028", p: "#7a4a21" })
ramps("kNnb", "kDdl", "kMm", "kEe", "kRr")

// Museum parquet tile: four horizontal plank bands, each a different wood
// tone, with vertical seams offset per band and a dark seam between bands.
sprite("parquet_tile", { w: 16, h: 16 }, `
lllllDllllllllll
lllllDllllllllll
lllllDllllllllll
DDDDDDDDDDDDDDDD
dddddddddddDdddd
dddddddddddDdddd
dddddddddddDdddd
DDDDDDDDDDDDDDDD
llDlllllllllllll
llDlllllllllllll
llDlllllllllllll
DDDDDDDDDDDDDDDD
ddddddddDddddddd
ddddddddDddddddd
ddddddddDddddddd
ddddddddDddddddd`)

// Vault-hall marble: pale grey-blue with a few darker veins.
sprite("marble_tile", { w: 16, h: 16 }, `
mmmmmmmmmmmmmmmm
mmmmmmmmmmmmmmmm
mmMmmmmmmmmMmmmm
mmmmmmmmmmmmmmmm
mmmmMmmmmmmmmmmm
mmmmmmmmmmmmMmmm
mmmmmmmmmmmmmmmm
mMmmmmmmmmmmmmmm
mmmmmmmmmmmmmmmm
mmmmmmmmMmmmmmmm
mmmmmmmmmmmmmmmm
mmmmMmmmmmmmmMmm
mmmmmmmmmmmmmmmm
mmmmmmmmmmMmmmmm
mmmmmmmmmmmmmmmm
mmmmmmmmmmmmmmmm`)

// Red carpet tile: dark red border, gold edge, one gold diamond motif.
sprite("carpet_tile", { w: 16, h: 16 }, `
RRRRRRRRRRRRRRRR
RggggggggggggggR
RgrrrrrrrrrrrrgR
RgrrrrrrrrrrrrgR
RgrrrrggggrrrrgR
RgrrrggggggrrrgR
RgrrrrggggrrrrgR
RgrrrrrrrrrrrrgR
RgrrrrrrrrrrrrgR
RgrrrrrrrrrrrrgR
RgrrrrggggrrrrgR
RgrrrggggggrrrgR
RgrrrrggggrrrrgR
RgrrrrrrrrrrrrgR
RggggggggggggggR
RRRRRRRRRRRRRRRR`)

// Guard seen from above, facing down: navy cap with a gold band, face,
// navy shoulders with gold trim on the epaulettes.
sprite("guard_topdown", { w: 16, h: 16, outline: "k", pivot: "bottom" }, `
.....nnnnnn.....
....nnnnnnnn....
...nnnnnnnnnn...
...nggggggggn...
....ssssssss....
...ssssssssss...
...ssssssssss...
...nnnnnnnnnn...
..nnnnnnnnnnnn..
..nnnnnnnnnnnn..
..nngnnnnnnngn..
..nnnnnnnnnnnn..
...nnnnnnnnnn...
....nnnnnnnn....
.....nnnnnn.....
................`)

// Rook, the thief: a dark hood, a shadowed face with one small skin hint,
// dark shoulders and a gold collar. Written as one half and mirrored.
sprite("rook_topdown", { mx: true, outline: "k", pivot: "bottom" }, `
....hhhh
...hhhhh
..hhhhhh
..hhHHhh
..hkkkkh
..hhkskh
..hhhhhh
.hhhhhhh
.hhhhhhh
.hhggggh
.hhhhhhh
.hhhhhhh
..hhhhhh
..hhhhhh
...hhhh.
........`)

// The disguise: the same hood in guard navy, gold collar kept.
sprite("rook_disguised", { base: "rook_topdown", swap: { h: "n", H: "b" } })

// Three framed paintings, 16x12, drawn at 4x in the game (64x48).
// A: sunset over dark hills. B: a gold figure on crimson. C: moon over sea.
sprite("painting_a", { w: 16, h: 12 }, `
gggggggggggggggg
gkkkkkkkkkkkkkkg
gknnnnnnnnnnnnkg
gknnnnnnggnnnnkg
gknnnnnnggnnnnkg
gknnnnnnnnnnnnkg
gknnnnnnnnnnnnkg
gkknnnnnnnnnnkkg
gkkknnnnkknnnkkg
gkkkknnnnnnkkkkg
gkkkkkkkkkkkkkkg
gggggggggggggggg`)

sprite("painting_b", { w: 16, h: 12 }, `
gggggggggggggggg
gkkkkkkkkkkkkkkg
gkRRRRRRRRRRRRkg
gkRRRRRggRRRRRkg
gkRRRRggggRRRRkg
gkRRRRggggRRRRkg
gkRRRRRggRRRRRkg
gkRRRRRRRRRRRRkg
gkRRRRRggRRRRRkg
gkRRRRggggRRRRkg
gkkkkkkkkkkkkkkg
gggggggggggggggg`)

sprite("painting_c", { w: 16, h: 12 }, `
gggggggggggggggg
gkkkkkkkkkkkkkkg
gkbbbbbbbbbbbbkg
gkbbbwwbbbbbbbkg
gkbbbwwbbbbbbbkg
gkbbbbbbbbbbbbkg
gkEEEEEEEEEEEEkg
gkEEeEEEEEeEEEkg
gkEEEEeEEEEEeEkg
gkEEEEEEEEEEEEkg
gkkkkkkkkkkkkkkg
gggggggggggggggg`)

// The golden bust, seen from above: a bright head, wide shoulders.
sprite("bust", { mx: true, outline: "k", pivot: "bottom" }, `
....gggg
...ggggg
..gggggC
..gggggg
..gggggg
..gggggg
.ggggggg
.ggggggg
.ggggggg
gggggggg
gggggggg
gggggggg
.ggggggg
..gggggg
...gggg.
........`)

// The green vase, seen from above: a dark rim ring, a pale body.
sprite("vase", { mx: true, outline: "k", pivot: "bottom" }, `
....eeee
...eeeee
..eEEEEe
..eEEEEe
..eeeeee
..eeeeee
.eeeeeee
.eeeeeee
.eeeeeee
eeeeeeee
eeeeeeee
.eeeeeee
..eeeeee
..eeeeee
...eeee.
........`)

// The Jade Jaguar Idol, seen from above: jade body, gold eyes, gold base.
sprite("idol", { mx: true, outline: "k", pivot: "bottom" }, `
....eeee
...eeeee
..eeeeee
..egeeee
..eeeeee
..eeeeee
.eeeeeee
.eeeeeee
.ggggggg
gggggggg
gggggggg
.ggggggg
..gggggg
...gggg.
........
........`)

// A security terminal on the wall: dark body, gold trim, amber screen
// with one dark line of text and one small square, two buttons below.
sprite("terminal", { w: 16, h: 20 }, `
kkkkkkkkkkkkkkkk
kgggggggggggggggk
kgNNNNNNNNNNNNNNgk
kgNggggggggggggNgk
kgNggggggggggggNgk
kgNggkkkkkgggNgk
kgNgggggkggggNgk
kgNggggggggggggNgk
kgNggggggggggggNgk
kgNggggggggggggNgk
kgNNNNNNNNNNNNNNgk
kgNNNyyNNNNooNNgk
kgNNNNNNNNNNNNNNgk
kgNNNNNNNNNNNNNNgk
kgNNNNNNNNNNNNNNgk
kgNNNNNNNNNNNNNNgk
kgNNNNNNNNNNNNNNgk
kgNNNNNNNNNNNNNNgk
kgggggggggggggggk
kkkkkkkkkkkkkkkk`)

// The uniform rack: a gold hook, a dark pole, one navy uniform.
// Full grid (not mirrored): a mirror seam would split the pole and the
// uniform into two.
sprite("rack_uniform", { w: 16, h: 16, outline: "k", pivot: "bottom" }, `
.......gg.......
.......kk.......
.......kk.......
....nnnnnnnn....
...nnnnnnnnnn...
...nnnnnnnnnn...
...nnggnnggnn...
...nnnnnnnnnn...
...nnnnnnnnnn...
..nnnnnnnnnnnn..
..nnnnnnnnnnnn..
...nnnnnnnnnn...
....nnnnnnnn....
................
................
................`)

// A ceiling camera, seen from below: a dark dome with a red lens bar.
sprite("camera_dome", { w: 16, h: 16, outline: "k", pivot: "bottom" }, `
.....kkkkkk.....
....kkkkkkkk....
...kkkkkkkkkk...
...kkkkkkkkkk...
..kkkkkkkkkkkk..
..kkkkooookkkk..
..kkkkooookkkk..
..kkkkkkkkkkkk..
...kkkkkkkkkk...
...kkkkkkkkkk...
....kkkkkkkk....
.....kkkkkk.....
................
................
................
................`)

// A gold coin with a darker embossed square.
sprite("coin", { w: 12, h: 12 }, `
....gggg....
..gggggggg..
.gggggggggg.
.gggGGGGggg.
.gggGGGGggg.
.gggggggggg.
.gggGGGGggg.
.gggGGGGggg.
.gggggggggg.
..gggggggg..
....gggg....
............`)

// A potted palm, seen from above: green fronds, a brown pot below.
// Full grid (not mirrored): a mirror seam would split the pot in two.
sprite("plant", { w: 16, h: 16, outline: "k", pivot: "bottom" }, `
.....tttttt.....
...tttttttttt...
..ttTttttttTtt..
..tttttttttttt..
...tttttttttt...
....tttttttt....
.....pppppp.....
.....pppppp.....
......pppp......
................
................
................
................
................
................
................`)

// A wooden gallery bench: two planks on dark legs.
sprite("bench", { w: 24, h: 12 }, `
........................
.llllllllllllllllllllll.
.lDDDDDDDDDDDDDDDDDDDDl.
.llllllllllllllllllllll.
........................
.llllllllllllllllllllll.
.lDDDDDDDDDDDDDDDDDDDDl.
.llllllllllllllllllllll.
........................
..kk................kk..
..kk................kk..
........................`)

// A velvet-rope stanchion: a gold post on a dark base.
sprite("stanchion", { w: 8, h: 16 }, `
...gg...
...gg...
...gg...
...gg...
...gg...
...gg...
...gg...
...gg...
..gggg..
..gggg..
..gggg..
...kk...
...kk...
...kk...
..kkkk..
..kkkk..`)

sheet("museum", ["parquet_tile", "marble_tile", "carpet_tile", "guard_topdown", "rook_topdown", "rook_disguised", "painting_a", "painting_b", "painting_c", "bust", "vase", "idol", "terminal", "rack_uniform", "camera_dome", "coin", "plant", "bench", "stanchion"], { pad: 1 })
