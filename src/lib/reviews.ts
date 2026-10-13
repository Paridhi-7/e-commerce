import type { Review } from "./types";

const r = (
  productSlug: string,
  author: string,
  rating: number,
  date: string,
  title: string,
  body: string,
  helpful: number,
  avatarSeed: string,
  verified = true
): Review => ({
  id: `${productSlug}-${author.replace(/\s+/g, "-").toLowerCase()}`,
  productSlug,
  author,
  avatarSeed,
  rating,
  date,
  title,
  body,
  helpful,
  verified,
});

export const REVIEWS: Review[] = [
  r(
    "nord-city-tote",
    "Amelia Chen",
    5,
    "Sep 2, 2026",
    "Holds everything, hides nothing",
    "I've gone through four totes in three years and this is the first one that never slouches. The laptop sleeve is exactly the right tightness and the key leash has ended the 10-minute morning hunt.",
    41,
    "AC"
  ),
  r(
    "nord-city-tote",
    "Priya Natarajan",
    4,
    "Aug 18, 2026",
    "Excellent, wish the strap were longer",
    "Quality is outstanding — the canvas feels technical, not crafty. I'm 5'10\" and would love 3 more cm on the strap for shoulder carry. Still my daily bag.",
    18,
    "PN"
  ),
  r(
    "nord-city-tote",
    "Marco Ruiz",
    5,
    "Aug 9, 2026",
    "Survived a year of commuting",
    "Bikes, trains, one spilled coffee (bead right off). Zero fraying, the magnetic closure still snaps like day one.",
    12,
    "MR"
  ),
  r(
    "nord-field-pack",
    "Daniel Osei",
    5,
    "Sep 12, 2026",
    "The stand-up trick is real",
    "It genuinely stands upright on a desk which sounds trivial until you're digging for a passport with both hands. Zips feel like they'll outlive me.",
    27,
    "DO"
  ),
  r(
    "nord-field-pack",
    "Hannah Lee",
    4,
    "Aug 30, 2026",
    "Great pack, runs small",
    "22L is optimistic with a sweater inside. For travel weeks I pair it with the Weekender. Build quality is faultless.",
    9,
    "HL"
  ),
  r(
    "nord-weekender",
    "Tom Becker",
    5,
    "Jul 22, 2026",
    "Two nights, no checked bag",
    "Fits exactly a weekend: three shirts, jeans, dopp kit, shoes in the vented pocket. The trolley pass-through is the detail I didn't know I needed.",
    22,
    "TB"
  ),
  r(
    "nord-camera-sling",
    "Sofia Marino",
    4,
    "Aug 25, 2026",
    "Quick-draw done right",
    "Swings to front smoothly even loaded. Wish the strap pad were wider for all-day wear, but for a 6L it's the best I've used.",
    8,
    "SM"
  ),
  r(
    "nord-horizon-watch",
    "James Whitfield",
    5,
    "Sep 1, 2026",
    "Quietly perfect",
    "The dial has real depth in sunlight. Went in sceptical about quartz at this price; six weeks in, I haven't thought about it once — which is the point.",
    35,
    "JW"
  ),
  r(
    "nord-horizon-watch",
    "Nadia Osman",
    5,
    "Aug 14, 2026",
    "Dressier than expected",
    "On the grey strap it passes as dress watch. Lume is faint but who's reading it in the dark anyway.",
    11,
    "NO"
  ),
  r(
    "nord-passport-holder",
    "Elena Petrova",
    4,
    "Jul 30, 2026",
    "Slim, smells incredible",
    "Fits two passports and both boarding passes without bulging. Leather smelled like a library of good books for the first week.",
    6,
    "EP"
  ),
  r(
    "nord-glaze-mug",
    "Karin Møller",
    5,
    "Sep 14, 2026",
    "The mug I reach for",
    "Third one I've bought (two as gifts). The oat glaze feels like river stone and coffee stays hot noticeably longer than my old mugs.",
    29,
    "KM"
  ),
  r(
    "nord-glaze-mug",
    "Josh Kimani",
    5,
    "Aug 28, 2026",
    "Handmade in the best way",
    "Mine has a slight thumb dip in the handle that I now can't live without. If you want machine uniformity this isn't it — that's the whole appeal.",
    15,
    "JK"
  ),
  r(
    "nord-glaze-mug",
    "Rachel Adams",
    4,
    "Aug 3, 2026",
    "Beautiful but delicate",
    "Chipped mine on a ceramic sink within a month (my fault). Gorgeous object, treat it accordingly.",
    7,
    "RA"
  ),
  r(
    "nord-dinner-plates",
    "Claire Dubois",
    5,
    "Sep 8, 2026",
    "Dinner parties upgraded",
    "Guests always comment. The rim shape makes even takeaway look composed. Four sets deep now.",
    19,
    "CD"
  ),
  r(
    "nord-dinner-plates",
    "Omar Haddad",
    5,
    "Aug 20, 2026",
    "Survives daily family use",
    "Eight months, two kids, zero chips. The glaze pool inside is deeper than photos suggest — in a good way.",
    14,
    "OH"
  ),
  r(
    "nord-stone-vase",
    "Ingrid Foss",
    5,
    "Aug 11, 2026",
    "Sculpture that holds flowers",
    "Bought for dried pampas, stays out even empty. The unglazed texture is the entire point — photos undersell it.",
    9,
    "IF"
  ),
  r(
    "nord-serve-bowl",
    "Lucas Ferreira",
    5,
    "Sep 3, 2026",
    "Pasta night official bowl",
    "Feeds six generously. The charcoal glaze looks dramatic with bright food. Wide foot genuinely never wobbles.",
    12,
    "LF"
  ),
  r(
    "nord-espresso-pair",
    "Mia Tanaka",
    5,
    "Sep 10, 2026",
    "Ritual upgraded",
    "The thumb groove is genius — no handle needed. Tiny thermal mass means a hot cup, quickly.",
    10,
    "MT"
  ),
  r(
    "nord-planter-set",
    "Grace Njeri",
    4,
    "Aug 6, 2026",
    "Herbs are thriving",
    "Drainage and saucers included means no swampy basils. Raw clay darkens beautifully with watering.",
    5,
    "GN"
  ),
  r(
    "lumen-studio-one",
    "Alex Rivera",
    5,
    "Sep 15, 2026",
    "Sold my Sony XM5s",
    "The tuning is neutral with actual sub-bass, not the bloated blob everyone else ships. ANC a touch behind Bose but sound quality wins, comfortably.",
    52,
    "AR"
  ),
  r(
    "lumen-studio-one",
    "Sarah Lindqvist",
    5,
    "Aug 29, 2026",
    "42 hours is accurate",
    "Charged twice in a month of desk work. Memory foam survived a full 9-hour flight with zero hot spots.",
    24,
    "SL"
  ),
  r(
    "lumen-studio-one",
    "David Park",
    4,
    "Aug 12, 2026",
    "Superb sound, clamp is firm",
    "First hour feels tight, then the pads relax. LDAC over Android is flawless. Case is oddly gorgeous.",
    17,
    "DP"
  ),
  r(
    "lumen-air-buds",
    "Emma Santos",
    5,
    "Sep 6, 2026",
    "For people who dislike earbuds",
    "Shallow insertion, still seals. Call quality finally got compliments. Case is pebble-small.",
    31,
    "ES"
  ),
  r(
    "lumen-air-buds",
    "Chris Baumann",
    4,
    "Aug 22, 2026",
    "Great, not perfect",
    "ANC is good-not-great versus the class leaders, but the tuning is so much more honest that I keep choosing these.",
    13,
    "CB"
  ),
  r(
    "lumen-monitor-speakers",
    "Yuki Tanabe",
    5,
    "Aug 18, 2026",
    "Desk changed character",
    "Voiced flat means mixes translate to the car. Walnut finish earns desk-supreme status. USB-C input is clutch.",
    20,
    "YT"
  ),
  r(
    "lumen-field-recorder",
    "Nora Lindgren",
    5,
    "Jul 28, 2026",
    "Interviews, rain or shine",
    "32-bit float means you can never clip an interview again. Dials feel like a good camera.",
    8,
    "NL"
  ),
  r(
    "lumen-desk-mic",
    "Ben Carter",
    4,
    "Aug 26, 2026",
    "Meetings upgraded",
    "Voice sounds warm, not processed. Mute ring is visible from across the room. Pop filter not included, buy one.",
    9,
    "BC"
  ),
  r(
    "terra-dot-notebook",
    "Oliver Grant",
    5,
    "Sep 9, 2026",
    "Fountain pen heaven",
    "Zero bleed with a wet M nib, and ghosting so faint I stop noticing. Lay-flat binding actually lies flat. I've bought nine.",
    47,
    "OG"
  ),
  r(
    "terra-dot-notebook",
    "Amara Diallo",
    5,
    "Aug 31, 2026",
    "The last notebook search ends",
    "Back pocket takes receipts and a boarding pass. Cover survived eight months of tote bottom.",
    22,
    "AD"
  ),
  r(
    "terra-dot-notebook",
    "Felix Braun",
    4,
    "Aug 7, 2026",
    "Nearly perfect",
    "Wish for a page-marker ribbon. Otherwise the best paper at this price by a distance.",
    10,
    "FB"
  ),
  r(
    "terra-weekly-planner",
    "Sofia Almeida",
    5,
    "Sep 11, 2026",
    "Habit columns finally stuck",
    "Six weeks and the habit rows are still going — record. Ribbon markers in sage/rust are a lovely touch.",
    18,
    "SA"
  ),
  r(
    "terra-weekly-planner",
    "Liam O'Connor",
    4,
    "Aug 24, 2026",
    "Solid, wish for vertical hours",
    "It's week-per-spread not daily, which the listing is honest about. Paper is the same gorgeous stock as the notebook.",
    7,
    "LO"
  ),
  r(
    "terra-fountain-pen",
    "Victoria Marsh",
    5,
    "Sep 4, 2026",
    "Brass patina diary",
    "Month three: the brass has gone honey-gold where my fingers sit. Writes like a much more expensive pen.",
    26,
    "VM"
  ),
  r(
    "terra-fountain-pen",
    "Kenji Watanabe",
    5,
    "Aug 16, 2026",
    "Weighted perfectly",
    "Uncapped, it writes with zero pressure. Posting the cap makes it front-heavy — don't post it.",
    14,
    "KW"
  ),
  r(
    "terra-desk-set",
    "Isabelle Laurent",
    5,
    "Aug 2, 2026",
    "Sending real mail again",
    "The wax seal makes everyone reply. Cotton paper takes fountain pen too. Gave three as gifts.",
    16,
    "IL"
  ),
  r(
    "terra-index-cards",
    "Peter Novak",
    4,
    "Jul 19, 2026",
    "Pocket brain",
    "Slipcase survives denim pockets. Cards take fountain pen — rare at this size.",
    6,
    "PN"
  ),
  r(
    "terra-pencil-set",
    "Lucy Zhang",
    5,
    "Aug 21, 2026",
    "Drawing grade graphite",
    "4B and 6B are buttery without being crumbly. Cedar sharpens to a long needle point.",
    11,
    "LZ"
  ),
  r(
    "haus-arc-lamp",
    "Robert Ellis",
    5,
    "Sep 7, 2026",
    "Reading chair solved",
    "Reaches right over the arm of the chair. Dimmed low at night it's basically a sunset.",
    23,
    "RE"
  ),
  r(
    "haus-arc-lamp",
    "Anna Kowalski",
    4,
    "Aug 15, 2026",
    "Beautiful, mind the base",
    "Base is heavy (good) but big — measure before ordering. Shade glass is genuinely glare-free.",
    9,
    "AK"
  ),
  r(
    "haus-stoneware-mugs",
    "Julia Moreau",
    5,
    "Aug 27, 2026",
    "Coffee stays hot",
    "The drip glaze on mine is cream-to-clay like the photos. These are chunky in the hand — I mean that as praise.",
    17,
    "JM"
  ),
  r(
    "haus-linen-throw",
    "Mette Sørensen",
    5,
    "Sep 13, 2026",
    "Softer every wash",
    "Fifth wash and it's cloud-like. Breathable enough for August naps, layered with wool in winter. Colour: quiet oat.",
    28,
    "MS"
  ),
  r(
    "haus-linen-throw",
    "Gabriel Torres",
    4,
    "Aug 9, 2026",
    "Great linen, arrives creased",
    "The stonewash creases read as texture after one wash. Fringe is tight and hasn't unravelled.",
    8,
    "GT"
  ),
  r(
    "haus-glass-carafe",
    "Hana Suzuki",
    5,
    "Aug 23, 2026",
    "Bedside routine",
    "Mouth-blown with tiny bubbles that prove it. Cups stack perfectly on the base.",
    10,
    "HS"
  ),
  r(
    "haus-candle-noir",
    "Freya Olsen",
    5,
    "Sep 2, 2026",
    "Fig without the candle-shop sweetness",
    "Smells like a fig tree in August, not synthetic jam. Sixty hours was accurate. Amber jar now holds brushes.",
    21,
    "FO"
  ),
  r(
    "haus-candle-noir",
    "Andrés Vega",
    4,
    "Aug 19, 2026",
    "Lovely, burns slightly fast",
    "First burn tunneled a little until I fixed the wick. Scent throw fills a large room.",
    7,
    "AV"
  ),
  r(
    "haus-wall-mirror",
    "Camille Fontaine",
    4,
    "Aug 8, 2026",
    "The shadow gap is the detail",
    "Hovers off the wall like a gallery piece. Heavy — anchor it properly.",
    6,
    "CF"
  ),
  r(
    "velvet-bifold-wallet",
    "Marcus Bell",
    5,
    "Sep 16, 2026",
    "Three years and counting",
    "On my second — the first went cognac-black and I gave it to my brother when I reordered. Six cards, no bulk.",
    44,
    "MB"
  ),
  r(
    "velvet-bifold-wallet",
    "Rajesh Iyer",
    5,
    "Aug 25, 2026",
    "Saddle stitch, no shortcuts",
    "Edges are burnished by hand, you can feel it. The leather creases where it should and nowhere else.",
    19,
    "RI"
  ),
  r(
    "velvet-belt",
    "Tomasz Kowalczyk",
    5,
    "Sep 5, 2026",
    "Buckle is jewellery",
    "Solid brass has that quiet weight. Punch included meant a perfect fit in five minutes.",
    15,
    "TK"
  ),
  r(
    "velvet-messenger",
    "Nathan Cole",
    5,
    "Aug 30, 2026",
    "The 'one bag for a decade'",
    "Flap actually covers in rain. Wool shoulder pad is the hidden luxury. Brass has gone honey where hands touch.",
    25,
    "NC"
  ),
  r(
    "velvet-messenger",
    "Aditi Sharma",
    4,
    "Aug 13, 2026",
    "Beautiful, a bit stiff at first",
    "Two weeks of breaking in and it moulds to you. Canvas is properly waxed — water beads off.",
    10,
    "AS"
  ),
  r(
    "velvet-keyring",
    "Zoe Fitzgerald",
    5,
    "Aug 4, 2026",
    "Bought four",
    "One for every family member's keys. $32 of visible handwork.",
    12,
    "ZF"
  ),
  r(
    "velvet-cardholder",
    "Ethan Walsh",
    5,
    "Sep 8, 2026",
    "Front pocket convert",
    "Slots loosen to perfect after a week. Half the thickness of my old bifold — jeans owe it an apology.",
    18,
    "EW"
  ),
  r(
    "mono-desk-organiser",
    "Anders Vik",
    5,
    "Sep 10, 2026",
    "Desk finally looks decided",
    "Modules rearrange weekly based on the project. The cork tray quiets everything and the felt lining is a luxuriously quiet detail.",
    26,
    "AV"
  ),
  r(
    "mono-desk-organiser",
    "Dana White",
    4,
    "Aug 21, 2026",
    "Premium feel, premium price",
    "Wish a pen well this size cost less, but you can feel the anodising quality. Riser swallows an entire stationery drawer.",
    11,
    "DW"
  ),
  r(
    "mono-task-light",
    "Samuel Osei",
    5,
    "Sep 12, 2026",
    "CRI 96 is not marketing",
    "Colour work at the desk finally reads true. The arm stays where you set it, forever. Touch memory is the small delight.",
    20,
    "SO"
  ),
  r(
    "mono-task-light",
    "Ines Rodrigues",
    5,
    "Aug 28, 2026",
    "Clamp is the way",
    "Zero footprint, full reach. 2700K at night, 5000K for detail work — two lights in one.",
    9,
    "IR"
  ),
  r(
    "mono-mouse-pad",
    "Viktor Hansen",
    5,
    "Aug 17, 2026",
    "Desk upgrade multiplier",
    "Felt dampens key clatter and the leather stitch edges never fray. Whole desk looks intentional now.",
    14,
    "VH"
  ),
  r(
    "mono-cable-tray",
    "Paulo Mendes",
    5,
    "Aug 25, 2026",
    "Cable spaghetti cured",
    "Clamp mount on the desk in five minutes, every brick hidden. Should have bought two.",
    8,
    "PM"
  ),
  r(
    "mono-note-cubes",
    "Alice Johnson",
    4,
    "Aug 2, 2026",
    "Small object, big presence",
    "Weighted enough to tear one-handed. Refills are standard so I'm never locked in.",
    5,
    "AJ"
  ),
  r(
    "wild-serum",
    "Charlotte Reed",
    5,
    "Sep 14, 2026",
    "Skin changed in three weeks",
    "The sea buckthorn gives a natural tint that reads as 'well slept'. Sinks in fully before moisturiser.",
    33,
    "CR"
  ),
  r(
    "wild-serum",
    "Maya Krishnan",
    5,
    "Aug 26, 2026",
    "Sensitive skin approved",
    "Zero sting, zero fragrance. The pressed-on batch date makes me trust it more than any marketing claim.",
    17,
    "MK"
  ),
  r(
    "wild-serum",
    "Jonas Weber",
    4,
    "Aug 8, 2026",
    "Great, dropper is fiddly",
    "Oil is superb — redness visibly calmer. Dropper could use a wider collar. Will repurchase.",
    8,
    "JW"
  ),
  r(
    "wild-cleansing-balm",
    "Tara Singh",
    5,
    "Sep 9, 2026",
    "Melts SPF like nothing",
    "Two-minute massage and everything dissolves, no tightness after. Aluminium jar takes refills.",
    21,
    "TS"
  ),
  r(
    "wild-cleansing-balm",
    "Lena Fischer",
    5,
    "Aug 20, 2026",
    "Sensitive skin's friend",
    "No fragrance means no headaches. Rinses to milk exactly as described.",
    12,
    "LF"
  ),
  r(
    "wild-lip-butter",
    "Odile Mercier",
    5,
    "Aug 29, 2026",
    "Winter pocket staple",
    "Waxy in the best way — survives a commute on a motorbike. Rose is a whisper, not a perfume counter.",
    13,
    "OM"
  ),
  r(
    "wild-body-oil",
    "Sara Lindberg",
    5,
    "Sep 1, 2026",
    "Smells like a forest walk",
    "Dresses three minutes later, non-negotiable for me. The fir note is real plants, not 'woodsy fragrance #7'.",
    15,
    "SL"
  ),
  r(
    "wild-clay-mask",
    "Nina Berg",
    4,
    "Aug 22, 2026",
    "Powder = genius",
    "Mixing fresh each time means it never spoils. Ten minutes, rinse, calm skin. A little messy — worth it.",
    9,
    "NB"
  ),
];

export const reviewsFor = (slug: string) =>
  REVIEWS.filter((r) => r.productSlug === slug);
