import { useMemo, useState } from "react";

/** ───────────────── Types & Helpers ───────────────── */
type BrandKey = "jossMain" | "allModern" | "birchLane";
type Range = { min: number; max: number };
type ItemDef = {
  key: string;
  label: string;
  quantityDefault?: number;
  required?: boolean;
  ranges: Record<BrandKey, Range>;
};
type RoomDef = { key: string; label: string; items: ItemDef[] };
type TierKey = "good" | "better" | "best" | "custom";
type ScopeKey = "singleRoom" | "wholeHome";

const r = (min: number, max: number): Range => ({ min, max });
const currency = (n: number) =>
  n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });

const TIER_LABEL: Record<TierKey, string> = {
  good: "Good",
  better: "Better",
  best: "Best",
  custom: "Custom",
};
const BRANDS: Record<BrandKey, { label: string }> = {
  jossMain: { label: "Joss & Main" },
  allModern: { label: "AllModern" },
  birchLane: { label: "Birch Lane" },
};

function unitForTier(range: Range, tier: TierKey) {
  const { min, max } = range;
  if (tier === "good") return min;
  if (tier === "best") return max;
  if (tier === "better") return Math.round(min + (max - min) * 0.55);
  return Math.round((min + max) / 2);
}

/** ───────────────── Accessory Helper ───────────────── */
function accessories({
  rugLabel,
  lampQty,
  panelsQty,
  addMirror = false,
  rugRangeKey = "rugStd",
}: {
  rugLabel: string;
  lampQty: number;
  panelsQty: number;
  addMirror?: boolean;
  rugRangeKey?: "rugStd" | "rugLarge" | "rugSmall" | "rugOutdoor";
}): ItemDef[] {
  const rugRanges: Record<string, Record<BrandKey, Range>> = {
    rugStd: { jossMain: r(180, 900), allModern: r(160, 1100), birchLane: r(250, 1600) },
    rugLarge: { jossMain: r(350, 1500), allModern: r(320, 1700), birchLane: r(500, 2200) },
    rugSmall: { jossMain: r(120, 600), allModern: r(120, 700), birchLane: r(200, 900) },
    rugOutdoor: { jossMain: r(120, 600), allModern: r(120, 700), birchLane: r(200, 900) },
  };

  const items: ItemDef[] = [
    { key: `rug_${rugLabel}`, label: rugLabel, ranges: rugRanges[rugRangeKey] },
    { key: "lamp", label: "Table / Floor Lamp", quantityDefault: lampQty, ranges: {
      jossMain: r(70, 350), allModern: r(60, 450), birchLane: r(120, 600) } },
    { key: "windowPanel", label: "Window Panel", quantityDefault: panelsQty, ranges: {
      jossMain: r(40, 160), allModern: r(40, 175), birchLane: r(60, 225) } },
    { key: "decor", label: "Decor Bundle", quantityDefault: 1, ranges: {
      jossMain: r(150, 600), allModern: r(150, 700), birchLane: r(250, 900) } },
    { key: "wallArt", label: "Wall Art", quantityDefault: 1, ranges: {
      jossMain: r(120, 500), allModern: r(120, 600), birchLane: r(220, 900) } },
  ];
  if (addMirror) {
    items.push({
      key: "mirror",
      label: "Wall / Floor Mirror",
      ranges: {
        jossMain: r(120, 600),
        allModern: r(120, 700),
        birchLane: r(220, 1000),
      },
    });
  }
  return items;
}

/** ───────────────── Room Catalogs (placeholders—replace with live site values) ───────────────── */

/* Living / Family */
const LIVING: ItemDef[] = [
  { key: "sofa",       label: "Sofa", required: true, quantityDefault: 1, ranges: {
    jossMain: r(700, 2500), allModern: r(600, 3000), birchLane: r(1200, 4500) } },
  { key: "sectional",  label: "Sectional", ranges: {
    jossMain: r(900, 3500), allModern: r(1000, 4500), birchLane: r(1800, 6500) } },
  { key: "accent",     label: "Accent Chair", quantityDefault: 2, ranges: {
    jossMain: r(160, 800), allModern: r(150, 1200), birchLane: r(300, 1600) } },
  { key: "coffee",     label: "Coffee Table", required: true, ranges: {
    jossMain: r(120, 700), allModern: r(100, 900), birchLane: r(250, 1200) } },
  { key: "side",       label: "Side Table", quantityDefault: 2, ranges: {
    jossMain: r(80, 450), allModern: r(70, 500), birchLane: r(150, 700) } },
  { key: "media",      label: "Media Console", ranges: {
    jossMain: r(250, 1400), allModern: r(200, 1600), birchLane: r(500, 2200) } },
  { key: "bookcase",   label: "Bookcase / Shelving", ranges: {
    jossMain: r(180, 900), allModern: r(180, 1100), birchLane: r(300, 1600) } },
  { key: "ottoman",    label: "Ottoman / Pouf", ranges: {
    jossMain: r(120, 600), allModern: r(110, 700), birchLane: r(200, 900) } },
  { key: "console",    label: "Console Table", ranges: {
    jossMain: r(180, 900), allModern: r(160, 1100), birchLane: r(300, 1500) } },
  ...accessories({ rugLabel: "Area Rug (8×10)", lampQty: 2, panelsQty: 4, addMirror: true, rugRangeKey: "rugStd" }),
];

/* Primary Bedroom */
const PRIMARY_BEDROOM: ItemDef[] = [
  { key: "bed",        label: "Bed Frame", required: true, ranges: {
    jossMain: r(500, 2000), allModern: r(480, 2200), birchLane: r(900, 3000) } },
  { key: "mattress",   label: "Mattress (King)", required: true, ranges: {
    jossMain: r(600, 2000), allModern: r(650, 2300), birchLane: r(900, 2800) } },
  { key: "nightstand", label: "Nightstand", quantityDefault: 2, ranges: {
    jossMain: r(140, 700), allModern: r(130, 820), birchLane: r(240, 1000) } },
  { key: "dresser",    label: "Dresser", ranges: {
    jossMain: r(300, 1600), allModern: r(280, 1800), birchLane: r(600, 2500) } },
  { key: "chest",      label: "Chest / Tallboy", ranges: {
    jossMain: r(260, 1300), allModern: r(240, 1500), birchLane: r(520, 2200) } },
  { key: "bench",      label: "Bed Bench", ranges: {
    jossMain: r(180, 800), allModern: r(160, 900), birchLane: r(280, 1200) } },
  ...accessories({ rugLabel: "Area Rug (9×12)", lampQty: 2, panelsQty: 4, addMirror: true, rugRangeKey: "rugLarge" }),
  { key: "bedding",    label: "Bedding Set (duvet/sheets)", ranges: {
    jossMain: r(200, 600), allModern: r(200, 750), birchLane: r(280, 950) } },
];

/* Secondary Bedroom */
const SECONDARY_BEDROOM: ItemDef[] = [
  { key: "bed",        label: "Bed Frame", required: true, ranges: {
    jossMain: r(300, 1500), allModern: r(280, 1700), birchLane: r(600, 2500) } },
  { key: "mattress",   label: "Mattress (Queen)", required: true, ranges: {
    jossMain: r(350, 1400), allModern: r(350, 1600), birchLane: r(600, 2200) } },
  { key: "nightstand", label: "Nightstand", quantityDefault: 2, ranges: {
    jossMain: r(120, 600), allModern: r(110, 700), birchLane: r(220, 900) } },
  { key: "dresser",    label: "Dresser", ranges: {
    jossMain: r(250, 1400), allModern: r(240, 1600), birchLane: r(500, 2300) } },
  ...accessories({ rugLabel: "Area Rug (8×10)", lampQty: 2, panelsQty: 4, addMirror: false, rugRangeKey: "rugStd" }),
  { key: "bedding",    label: "Bedding Set (duvet/sheets)", ranges: {
    jossMain: r(180, 550), allModern: r(170, 700), birchLane: r(250, 900) } },
];

/* Guest Bedroom */
const GUEST_BEDROOM: ItemDef[] = [
  { key: "bed",        label: "Bed Frame", required: true, ranges: {
    jossMain: r(300, 1300), allModern: r(280, 1500), birchLane: r(550, 2200) } },
  { key: "mattress",   label: "Mattress (Queen)", required: true, ranges: {
    jossMain: r(350, 1300), allModern: r(350, 1500), birchLane: r(580, 2100) } },
  { key: "nightstand", label: "Nightstand", quantityDefault: 2, ranges: {
    jossMain: r(110, 520), allModern: r(110, 620), birchLane: r(200, 820) } },
  { key: "dresser",    label: "Dresser", ranges: {
    jossMain: r(240, 1200), allModern: r(220, 1400), birchLane: r(460, 2000) } },
  ...accessories({ rugLabel: "Area Rug (8×10)", lampQty: 2, panelsQty: 4, addMirror: false, rugRangeKey: "rugStd" }),
  { key: "bedding",    label: "Bedding Set (duvet/sheets)", ranges: {
    jossMain: r(170, 520), allModern: r(170, 650), birchLane: r(240, 850) } },
];

/* Nursery */
const NURSERY: ItemDef[] = [
  { key: "crib",       label: "Crib", required: true, ranges: {
    jossMain: r(180, 900), allModern: r(200, 1000), birchLane: r(350, 1400) } },
  { key: "mattressCrib",   label: "Crib Mattress", required: true, ranges: {
    jossMain: r(70, 280), allModern: r(70, 320), birchLane: r(90, 380) } },
  { key: "dresser",    label: "Dresser / Changing Table", ranges: {
    jossMain: r(220, 1100), allModern: r(240, 1300), birchLane: r(420, 1900) } },
  { key: "glider",     label: "Glider / Rocker", ranges: {
    jossMain: r(220, 900), allModern: r(240, 1100), birchLane: r(380, 1400) } },
  ...accessories({ rugLabel: "Area Rug (5×8)", lampQty: 1, panelsQty: 2, addMirror: false, rugRangeKey: "rugSmall" }),
  { key: "storageToy", label: "Toy / Book Storage", ranges: {
    jossMain: r(80, 350), allModern: r(90, 420), birchLane: r(140, 650) } },
];

/* Playroom */
const PLAYROOM: ItemDef[] = [
  { key: "sofa",       label: "Sofa / Sleeper", ranges: {
    jossMain: r(600, 2200), allModern: r(600, 2600), birchLane: r(1000, 3800) } },
  { key: "activityTable",      label: "Activity / Craft Table", ranges: {
    jossMain: r(120, 600), allModern: r(120, 700), birchLane: r(220, 900) } },
  { key: "kidSeat",      label: "Kid Chair / Pouf", quantityDefault: 2, ranges: {
    jossMain: r(60, 280), allModern: r(60, 320), birchLane: r(100, 450) } },
  { key: "storage",    label: "Toy / Cubby Storage", ranges: {
    jossMain: r(120, 600), allModern: r(120, 700), birchLane: r(200, 900) } },
  ...accessories({ rugLabel: "Area Rug (8×10)", lampQty: 1, panelsQty: 2, addMirror: false, rugRangeKey: "rugStd" }),
  { key: "bookcase",   label: "Bookcase", ranges: {
    jossMain: r(140, 700), allModern: r(130, 900), birchLane: r(220, 1300) } },
];

/* Dining */
const DINING: ItemDef[] = [
  { key: "table",     label: "Dining Table", required: true, ranges: {
    jossMain: r(300, 1900), allModern: r(280, 2300), birchLane: r(700, 3200) } },
  { key: "chair",     label: "Dining Chair", quantityDefault: 6, required: true, ranges: {
    jossMain: r(80, 350), allModern: r(75, 450), birchLane: r(150, 600) } },
  { key: "sideboard", label: "Sideboard / Buffet", ranges: {
    jossMain: r(300, 1600), allModern: r(280, 1800), birchLane: r(600, 2600) } },
  { key: "bar",       label: "Bar / Storage Cabinet", ranges: {
    jossMain: r(220, 1100), allModern: r(220, 1300), birchLane: r(450, 1900) } },
  ...accessories({ rugLabel: "Area Rug (8×10)", lampQty: 0, panelsQty: 2, addMirror: false, rugRangeKey: "rugStd" }),
  { key: "lightingDR",   label: "Chandelier / Pendant", ranges: {
    jossMain: r(150, 700), allModern: r(140, 900), birchLane: r(250, 1300) } },
];

/* Office */
const OFFICE: ItemDef[] = [
  { key: "desk",      label: "Desk", required: true, ranges: {
    jossMain: r(150, 900), allModern: r(140, 1100), birchLane: r(300, 1600) } },
  { key: "chairOffice",     label: "Office Chair", required: true, ranges: {
    jossMain: r(120, 600), allModern: r(110, 800), birchLane: r(220, 1100) } },
  { key: "storage",   label: "Bookcase / Storage", ranges: {
    jossMain: r(120, 700), allModern: r(110, 900), birchLane: r(220, 1300) } },
  { key: "file",      label: "Filing Cabinet", ranges: {
    jossMain: r(100, 450), allModern: r(110, 520), birchLane: r(180, 800) } },
  { key: "taskLight", label: "Task Lamp", ranges: {
    jossMain: r(60, 250), allModern: r(55, 300), birchLane: r(100, 450) } },
  ...accessories({ rugLabel: "Area Rug (5×8)", lampQty: 1, panelsQty: 2, addMirror: true, rugRangeKey: "rugSmall" }),
];

/* Entryway (full) */
const ENTRY: ItemDef[] = [
  { key: "entryConsole", label: "Console Table", required: true, quantityDefault: 1, ranges: {
    jossMain: r(150, 900), allModern: r(140, 1100), birchLane: r(300, 1500) } },
  { key: "entryBench", label: "Bench", quantityDefault: 1, ranges: {
    jossMain: r(120, 600), allModern: r(120, 700), birchLane: r(220, 900) } },
  { key: "entryMirror", label: "Mirror", quantityDefault: 1, ranges: {
    jossMain: r(100, 450), allModern: r(100, 500), birchLane: r(180, 800) } },
  { key: "entryLamp", label: "Table Lamp", quantityDefault: 1, ranges: {
    jossMain: r(70, 250), allModern: r(70, 300), birchLane: r(110, 450) } },
  { key: "entryRug", label: "Runner (2.5×8)", quantityDefault: 1, ranges: {
    jossMain: r(80, 300), allModern: r(80, 350), birchLane: r(120, 500) } },
  { key: "entryHooks", label: "Wall Hooks / Rack", quantityDefault: 1, ranges: {
    jossMain: r(30, 140), allModern: r(35, 160), birchLane: r(60, 220) } },
  { key: "entryBasket", label: "Storage Basket", quantityDefault: 2, ranges: {
    jossMain: r(25, 120), allModern: r(25, 140), birchLane: r(40, 180) } },
  { key: "entryTray", label: "Catchall / Tray", quantityDefault: 1, ranges: {
    jossMain: r(20, 90), allModern: r(20, 110), birchLane: r(35, 150) } },
  { key: "entryArt", label: "Wall Art", quantityDefault: 1, ranges: {
    jossMain: r(120, 500), allModern: r(120, 600), birchLane: r(220, 900) } },
];

/* Outdoor Living */
const OUTDOOR_LIVING: ItemDef[] = [
  { key: "sofa",       label: "Outdoor Sofa", ranges: {
    jossMain: r(500, 2400), allModern: r(550, 2800), birchLane: r(900, 3500) } },
  { key: "lounge",     label: "Lounge Chair", quantityDefault: 2, ranges: {
    jossMain: r(180, 800), allModern: r(200, 950), birchLane: r(300, 1200) } },
  { key: "coffee",     label: "Coffee Table", ranges: {
    jossMain: r(140, 700), allModern: r(140, 800), birchLane: r(220, 1000) } },
  { key: "side",       label: "Side Table", quantityDefault: 2, ranges: {
    jossMain: r(80, 300), allModern: r(80, 360), birchLane: r(120, 500) } },
  { key: "umbrella",   label: "Umbrella", ranges: {
    jossMain: r(120, 600), allModern: r(130, 700), birchLane: r(200, 900) } },
  { key: "fire",       label: "Fire Pit / Table", ranges: {
    jossMain: r(220, 1200), allModern: r(240, 1400), birchLane: r(400, 1800) } },
  ...accessories({ rugLabel: "Outdoor Rug (8×10)", lampQty: 0, panelsQty: 0, addMirror: false, rugRangeKey: "rugOutdoor" }),
];

/* Outdoor Dining */
const OUTDOOR_DINING: ItemDef[] = [
  { key: "table",      label: "Outdoor Dining Table", ranges: {
    jossMain: r(260, 1400), allModern: r(280, 1600), birchLane: r(450, 2200) } },
  { key: "chair",      label: "Outdoor Dining Chair", quantityDefault: 6, ranges: {
    jossMain: r(70, 300), allModern: r(75, 360), birchLane: r(120, 520) } },
  { key: "storage",    label: "Deck Box / Storage", ranges: {
    jossMain: r(120, 500), allModern: r(130, 600), birchLane: r(200, 800) } },
  { key: "shade",      label: "Pergola / Shade", ranges: {
    jossMain: r(350, 1800), allModern: r(400, 2200), birchLane: r(600, 3000) } },
  { key: "lighting",   label: "Outdoor Lighting", ranges: {
    jossMain: r(80, 350), allModern: r(90, 420), birchLane: r(140, 650) } },
];

/** Rooms registry */
const ROOMS: RoomDef[] = [
  { key: "living",          label: "Living / Family Room", items: LIVING },
  { key: "primaryBedroom",  label: "Primary Bedroom",      items: PRIMARY_BEDROOM },
  { key: "secondaryBedroom",label: "Secondary Bedroom",    items: SECONDARY_BEDROOM },
  { key: "guestBedroom",    label: "Guest Bedroom",        items: GUEST_BEDROOM },
  { key: "nursery",         label: "Nursery",              items: NURSERY },
  { key: "playroom",        label: "Playroom",             items: PLAYROOM },
  { key: "dining",          label: "Dining Room",          items: DINING },
  { key: "office",          label: "Home Office",          items: OFFICE },
  { key: "entry",           label: "Entryway",             items: ENTRY },
  { key: "outdoorLiving",   label: "Outdoor Living",       items: OUTDOOR_LIVING },
  { key: "outdoorDining",   label: "Outdoor Dining",       items: OUTDOOR_DINING },
];

/** ───────────────── Component ───────────────── */
export default function App() {
  const [scope, setScope] = useState<ScopeKey>("singleRoom");
  const [brand, setBrand] = useState<BrandKey>("jossMain");
  const [roomKey, setRoomKey] = useState<string>(ROOMS[0].key);
  const [tier, setTier] = useState<TierKey>("better");

  // Single-room state
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [enabledItems, setEnabledItems] = useState<Record<string, boolean>>({});
  const [customPrices, setCustomPrices] = useState<Record<string, number>>({});

  // Whole-home counts
  const [homeCounts, setHomeCounts] = useState({
    living: 1,
    primaryBedroom: 1,
    secondaryBedroom: 2,
    guestBedroom: 1,
    nursery: 0,
    playroom: 0,
    dining: 1,
    office: 1,
    entry: 1,
    outdoorLiving: 0,
    outdoorDining: 0,
  });

  const room = useMemo(() => ROOMS.find(r => r.key === roomKey)!, [roomKey]);

  // initialize defaults for single-room
  useMemo(() => {
    if (scope !== "singleRoom") return;
    const defaults: Record<string, number> = {};
    const enabled: Record<string, boolean> = {};
    room.items.forEach(it => {
      defaults[it.key] = it.quantityDefault ?? (it.required ? 1 : 0);
      enabled[it.key] = !!(it.required || (it.quantityDefault && it.quantityDefault > 0));
    });
    setQuantities(defaults);
    setEnabledItems(enabled);
    setCustomPrices({});
  }, [scope, roomKey, brand]);

  // compute one room’s merch (using its defaults); ignore custom in whole-home to avoid collisions
  function computeRoomMerch(roomDef: RoomDef, brandKey: BrandKey, tierKey: TierKey) {
    return roomDef.items.reduce((sum, it) => {
      const qty = it.quantityDefault ?? (it.required ? 1 : 0);
      if (!qty) return sum;
      const unit = unitForTier(it.ranges[brandKey], tierKey);
      return sum + unit * qty;
    }, 0);
  }

  // single-room computed lines
  const lines = useMemo(() => {
    if (scope !== "singleRoom") return [];
    return room.items
      .filter(it => enabledItems[it.key])
      .map(it => {
        const q = quantities[it.key] ?? 0;
        const range = it.ranges[brand];
        const unit = tier === "custom" && customPrices[it.key] ? customPrices[it.key] : unitForTier(range, tier);
        return { ...it, quantity: q, unit, subtotal: unit * q, range };
      });
  }, [scope, room, brand, quantities, enabledItems, tier, customPrices]);

  const merchandise = useMemo(
    () => (scope === "singleRoom" ? lines.reduce((s, l) => s + l.subtotal, 0) : 0),
    [scope, lines]
  );

  // whole-home totals
  const wholeHome = useMemo(() => {
    if (scope !== "wholeHome") return null;
    const keys = ROOMS.map(r => r.key) as Array<typeof ROOMS[number]["key"]>;

    const totals = { good: 0, better: 0, best: 0 };
    const perRoomRows: Array<{label:string; count:number; good:number; better:number; best:number}> = [];

    keys.forEach((k) => {
      const def = ROOMS.find(r => r.key === k)!;
      const count = (homeCounts as any)[k] ?? 0;
      const good   = computeRoomMerch(def, brand, "good") * count;
      const better = computeRoomMerch(def, brand, "better") * count;
      const best   = computeRoomMerch(def, brand, "best") * count;
      totals.good += good; totals.better += better; totals.best += best;
      perRoomRows.push({ label: def.label, count, good, better, best });
    });

    return { rows: perRoomRows, totals };
  }, [scope, brand, homeCounts]);

  /** ─────────────── UI (no external libs) ─────────────── */
  const wrap: React.CSSProperties = { maxWidth: 1200, margin: "0 auto", padding: 24, fontFamily: "system-ui, sans-serif" };
  const card: React.CSSProperties = { border: "1px solid #e5e5e5", borderRadius: 12, background: "#fff", padding: 16 };
  const input: React.CSSProperties = { padding: 10, borderRadius: 8, border: "1px solid #d9d9d9", width: "100%" };
  const btn: React.CSSProperties = { padding: "6px 10px", border: "1px solid #d9d9d9", borderRadius: 8, background: "#fafafa", cursor: "pointer" };
  const small: React.CSSProperties = { color: "#777", fontSize: 12 };

  return (
    <div style={{ background: "#f7f7f9", minHeight: "100vh" }}>
      <div style={wrap}>
        <h1 style={{ fontSize: 22, marginBottom: 8 }}>Client Budget Calculator — Wayfair Specialty Brands</h1>
        <p style={{ color: "#666", marginBottom: 16 }}>Good / Better / Best projections. Merchandise only. Update ranges with live site values.</p>

        <div style={{ display: "grid", gap: 16, gridTemplateColumns: "1fr 2fr" }}>
          {/* Controls */}
          <div style={card}>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, color: "#666", marginBottom: 6 }}>Scope</div>
              <select value={scope} onChange={(e) => setScope(e.target.value as ScopeKey)} style={input}>
                <option value="singleRoom">Single Room</option>
                <option value="wholeHome">Whole Home</option>
              </select>
            </div>

            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, color: "#666", marginBottom: 6 }}>Brand</div>
              <select value={brand} onChange={(e) => setBrand(e.target.value as BrandKey)} style={input}>
                {Object.entries(BRANDS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>

            {scope === "singleRoom" ? (
              <>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 12, color: "#666", marginBottom: 6 }}>Room</div>
                  <select value={roomKey} onChange={(e) => setRoomKey(e.target.value)} style={input}>
                    {ROOMS.map(r => <option key={r.key} value={r.key}>{r.label}</option>)}
                  </select>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 12, color: "#666", marginBottom: 6 }}>Tier</div>
                  <select value={tier} onChange={(e) => setTier(e.target.value as TierKey)} style={input}>
                    <option value="good">Good</option>
                    <option value="better">Better</option>
                    <option value="best">Best</option>
                    <option value="custom">Custom</option>
                  </select>
                  {tier === "custom" && <div style={small}>Enter per-line exact unit prices in the table.</div>}
                </div>
                <div>
                  <button
                    style={btn}
                    onClick={() => {
                      setTier("better");
                      const defaults: Record<string, number> = {};
                      const enabled: Record<string, boolean> = {};
                      room.items.forEach(it => {
                        defaults[it.key] = it.quantityDefault ?? (it.required ? 1 : 0);
                        enabled[it.key] = !!(it.required || (it.quantityDefault && it.quantityDefault > 0));
                      });
                      setQuantities(defaults);
                      setEnabledItems(enabled);
                      setCustomPrices({});
                    }}
                  >
                    ↺ Reset Room Defaults
                  </button>
                </div>
              </>
            ) : (
              <>
                <div style={{ marginBottom: 8, fontWeight: 600 }}>Whole-Home Counts</div>
                <div style={{ display: "grid", gap: 8, gridTemplateColumns: "1fr 1fr" }}>
                  {ROOMS.map(r => (
                    <div key={r.key}>
                      <div style={{ fontSize: 12, color: "#666", marginBottom: 6 }}>{r.label}</div>
                      <input
                        type="number"
                        min={0}
                        value={(homeCounts as any)[r.key] ?? 0}
                        onChange={(e) => setHomeCounts(s => ({ ...s, [r.key]: Math.max(0, Number(e.target.value || 0)) }))}
                        style={input}
                      />
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 8, ...small }}>Uses default item sets per room (editable in the catalogs above).</div>
              </>
            )}
          </div>

          {/* Right panel */}
          <div style={card}>
            {scope === "singleRoom" ? (
              <>
                <div style={{ overflowX: "auto", borderRadius: 12 }}>
                  <table style={{ width: "100%", fontSize: 14, borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "#fafafa", textAlign: "left" }}>
                        <th style={{ padding: 12, borderBottom: "1px solid #eee" }}>Include</th>
                        <th style={{ padding: 12, borderBottom: "1px solid #eee" }}>Item</th>
                        <th style={{ padding: 12, borderBottom: "1px solid #eee" }}>Range ({BRANDS[brand].label})</th>
                        <th style={{ padding: 12, borderBottom: "1px solid #eee" }}>Unit ({tier === "custom" ? "Custom" : TIER_LABEL[tier]})</th>
                        <th style={{ padding: 12, borderBottom: "1px solid #eee" }}>Qty</th>
                        <th style={{ padding: 12, borderBottom: "1px solid #eee", textAlign: "right" }}>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lines.map((l) => (
                        <tr key={l.key} style={{ borderTop: "1px solid #f0f0f0" }}>
                          <td style={{ padding: 12, verticalAlign: "middle" }}>
                            <input
                              type="checkbox"
                              checked={!!enabledItems[l.key]}
                              onChange={(e) => setEnabledItems(s => ({ ...s, [l.key]: e.target.checked }))}
                            />
                          </td>
                          <td style={{ padding: 12, verticalAlign: "middle" }}>{l.label}</td>
                          <td style={{ padding: 12, verticalAlign: "middle" }}>
                            {currency(l.range.min)} – {currency(l.range.max)}
                          </td>
                          <td style={{ padding: 12, verticalAlign: "middle" }}>
                            {tier === "custom" ? (
                              <input
                                type="number"
                                value={Number.isFinite(customPrices[l.key]) ? customPrices[l.key] : ("" as any)}
                                placeholder={String(l.unit)}
                                onChange={(e) => setCustomPrices(s => ({ ...s, [l.key]: Number(e.target.value || 0) }))}
                                style={{ padding: 10, borderRadius: 8, border: "1px solid #d9d9d9", width: 110 }}
                              />
                            ) : (
                              <div style={{ width: 110 }}>{currency(l.unit)}</div>
                            )}
                          </td>
                          <td style={{ padding: 12, verticalAlign: "middle" }}>
                            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                              <button
                                style={btn}
                                onClick={() => setQuantities(s => ({ ...s, [l.key]: Math.max(0, (s[l.key] ?? 0) - 1) }))}
                              >-</button>
                              <input
                                type="number"
                                value={quantities[l.key] ?? 0}
                                onChange={(e) => setQuantities(s => ({ ...s, [l.key]: Math.max(0, Number(e.target.value || 0)) }))}
                                style={{ padding: 10, borderRadius: 8, border: "1px solid #d9d9d9", width: 70, textAlign: "center" }}
                              />
                              <button
                                style={btn}
                                onClick={() => setQuantities(s => ({ ...s, [l.key]: (s[l.key] ?? 0) + 1 }))}
                              >+</button>
                            </div>
                          </td>
                          <td style={{ padding: 12, verticalAlign: "middle", textAlign: "right" }}>
                            {currency(l.subtotal)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Totals */}
                <div style={{ marginTop: 16 }}>
                  <h3 style={{ margin: 0, marginBottom: 8, fontSize: 16 }}>Room Merchandise Total</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8, fontSize: 14 }}>
                    <div>Merchandise</div>
                    <div style={{ textAlign: "right", fontWeight: 600 }}>{currency(merchandise)}</div>
                  </div>
                  <p style={small}>Projection excludes delivery, assembly, protection, taxes, contingency, and promos.</p>
                </div>
              </>
            ) : (
              <>
                <h2 style={{ marginTop: 0, marginBottom: 12, fontSize: 18 }}>Whole-Home Projection (Merchandise)</h2>
                <table style={{ width: "100%", fontSize: 14, borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#fafafa", textAlign: "left" }}>
                      <th style={{ padding: 12, borderBottom: "1px solid #eee" }}>Room Type</th>
                      <th style={{ padding: 12, borderBottom: "1px solid #eee", textAlign: "right" }}>Count</th>
                      <th style={{ padding: 12, borderBottom: "1px solid #eee", textAlign: "right" }}>Good</th>
                      <th style={{ padding: 12, borderBottom: "1px solid #eee", textAlign: "right" }}>Better</th>
                      <th style={{ padding: 12, borderBottom: "1px solid #eee", textAlign: "right" }}>Best</th>
                    </tr>
                  </thead>
                  <tbody>
                    {wholeHome && (
                      <>
                        {wholeHome.rows.map(row => (
                          <tr key={row.label} style={{ borderTop: "1px solid #f0f0f0" }}>
                            <td style={{ padding: 12 }}>{row.label}</td>
                            <td style={{ padding: 12, textAlign: "right" }}>{row.count}</td>
                            <td style={{ padding: 12, textAlign: "right" }}>{currency(row.good)}</td>
                            <td style={{ padding: 12, textAlign: "right", fontWeight: 600 }}>{currency(row.better)}</td>
                            <td style={{ padding: 12, textAlign: "right" }}>{currency(row.best)}</td>
                          </tr>
                        ))}
                        <tr>
                          <td colSpan={5} style={{ borderTop: "1px solid #eee" }} />
                        </tr>
                        <tr>
                          <td style={{ padding: 12, fontWeight: 700 }}>Whole-Home Total</td>
                          <td />
                          <td style={{ padding: 12, textAlign: "right", fontWeight: 700 }}>{currency(wholeHome.totals.good)}</td>
                          <td style={{ padding: 12, textAlign: "right", fontWeight: 800 }}>{currency(wholeHome.totals.better)}</td>
                          <td style={{ padding: 12, textAlign: "right", fontWeight: 700 }}>{currency(wholeHome.totals.best)}</td>
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
                <p style={{ ...small, marginTop: 12 }}>
                  Uses default item sets per room. Adjust defaults or ranges in the catalogs at the top.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
