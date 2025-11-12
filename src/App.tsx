import { useMemo, useState } from "react";

/** ─────────────────────────  Types & Helpers  ───────────────────────── **/
type BrandKey = "jossMain" | "allModern" | "birchLane";
type Range = { min: number; max: number };
type ItemDef = {
  key: string;
  label: string;
  quantityDefault?: number; // per room instance
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

function bandForTier(range: Range, tier: TierKey) {
  const { min, max } = range;
  if (tier === "good") return min;
  if (tier === "best") return max;
  if (tier === "better") return Math.round(min + (max - min) * 0.55);
  return Math.round((min + max) / 2);
}

/** ─────────────────────────  Catalog (expandable)  ─────────────────────────
 * NOTE: Ranges are placeholders. Replace with live site values.
 * I expanded each room with common add-ons so you can scope “full options”.
 */
const LIVING: ItemDef[] = [
  { key: "sofa",        label: "Sofa",                  required: true, quantityDefault: 1, ranges: {
    jossMain: r(700, 2500), allModern: r(600, 3000), birchLane: r(1200, 4500) } },
  { key: "sectional",   label: "Sectional (optional)",  ranges: {
    jossMain: r(900, 3500), allModern: r(1000, 4500), birchLane: r(1800, 6500) } },
  { key: "accentPair",  label: "Accent Chairs (pair)",  quantityDefault: 1, ranges: {
    jossMain: r(160, 800), allModern: r(150, 1200), birchLane: r(300, 1600) } },
  { key: "coffee",      label: "Coffee Table",          required: true, ranges: {
    jossMain: r(120, 700), allModern: r(100, 900), birchLane: r(250, 1200) } },
  { key: "sidePair",    label: "Side Tables (pair)",    quantityDefault: 1, ranges: {
    jossMain: r(80, 450), allModern: r(70, 500), birchLane: r(150, 700) } },
  { key: "media",       label: "Media Console",         ranges: {
    jossMain: r(250, 1400), allModern: r(200, 1600), birchLane: r(500, 2200) } },
  { key: "bookcase",    label: "Bookcase / Shelving",   ranges: {
    jossMain: r(180, 900), allModern: r(180, 1100), birchLane: r(300, 1600) } },
  { key: "ottoman",     label: "Ottoman / Pouf",        ranges: {
    jossMain: r(120, 600), allModern: r(110, 700), birchLane: r(200, 900) } },
  { key: "console",     label: "Console Table",         ranges: {
    jossMain: r(180, 900), allModern: r(160, 1100), birchLane: r(300, 1500) } },
  { key: "rug",         label: "Area Rug (8×10)",       required: true, ranges: {
    jossMain: r(180, 900), allModern: r(160, 1100), birchLane: r(250, 1600) } },
  { key: "curtains",    label: "Window Panels (pair)",  ranges: {
    jossMain: r(80, 300), allModern: r(80, 350), birchLane: r(120, 450) } },
  { key: "lampsPair",   label: "Table/Floor Lamps (pair)", quantityDefault: 1, ranges: {
    jossMain: r(70, 350), allModern: r(60, 450), birchLane: r(120, 600) } },
  { key: "decor",       label: "Pillows/Throws/Decor (bundle)", ranges: {
    jossMain: r(150, 600), allModern: r(150, 700), birchLane: r(250, 900) } },
];

const BEDROOM: ItemDef[] = [
  { key: "bed",       label: "Bed Frame",                 required: true, ranges: {
    jossMain: r(300, 1500), allModern: r(280, 1700), birchLane: r(600, 2500) } },
  { key: "mattress",  label: "Mattress (Queen)",          required: true, ranges: {
    jossMain: r(350, 1400), allModern: r(350, 1600), birchLane: r(600, 2200) } },
  { key: "nightsPair",label: "Nightstands (pair)",        quantityDefault: 1, ranges: {
    jossMain: r(120, 600), allModern: r(110, 700), birchLane: r(220, 900) } },
  { key: "dresser",   label: "Dresser",                   ranges: {
    jossMain: r(250, 1400), allModern: r(240, 1600), birchLane: r(500, 2300) } },
  { key: "bench",     label: "Bed Bench",                 ranges: {
    jossMain: r(140, 700), allModern: r(120, 800), birchLane: r(250, 1100) } },
  { key: "mirror",    label: "Wall / Floor Mirror",       ranges: {
    jossMain: r(120, 500), allModern: r(120, 600), birchLane: r(220, 900) } },
  { key: "rugBR",     label: "Area Rug (8×10)",           ranges: {
    jossMain: r(180, 900), allModern: r(160, 1100), birchLane: r(250, 1600) } },
  { key: "bedding",   label: "Bedding Set (duvet/sheets)", ranges: {
    jossMain: r(180, 550), allModern: r(170, 700), birchLane: r(250, 900) } },
  { key: "lampPair",  label: "Bedside Lamps (pair)",      quantityDefault: 1, ranges: {
    jossMain: r(120, 500), allModern: r(120, 600), birchLane: r(220, 900) } },
];

const DINING: ItemDef[] = [
  { key: "table",     label: "Dining Table",              required: true, ranges: {
    jossMain: r(300, 1900), allModern: r(280, 2300), birchLane: r(700, 3200) } },
  { key: "chairs6",   label: "Dining Chairs (per chair)", quantityDefault: 6, required: true, ranges: {
    jossMain: r(80, 350), allModern: r(75, 450), birchLane: r(150, 600) } },
  { key: "sideboard", label: "Sideboard/Buffet",          ranges: {
    jossMain: r(300, 1600), allModern: r(280, 1800), birchLane: r(600, 2600) } },
  { key: "bar",       label: "Bar / Storage Cabinet",     ranges: {
    jossMain: r(220, 1100), allModern: r(220, 1300), birchLane: r(450, 1900) } },
  { key: "rugDR",     label: "Area Rug (8×10)",           ranges: {
    jossMain: r(180, 900), allModern: r(160, 1100), birchLane: r(250, 1600) } },
  { key: "lightDR",   label: "Chandelier/Pendant",        ranges: {
    jossMain: r(150, 700), allModern: r(140, 900), birchLane: r(250, 1300) } },
];

const OFFICE: ItemDef[] = [
  { key: "desk",      label: "Desk",                      required: true, ranges: {
    jossMain: r(150, 900), allModern: r(140, 1100), birchLane: r(300, 1600) } },
  { key: "taskChair", label: "Office Chair",              required: true, ranges: {
    jossMain: r(120, 600), allModern: r(110, 800), birchLane: r(220, 1100) } },
  { key: "storage",   label: "Bookcase / Storage",        ranges: {
    jossMain: r(120, 700), allModern: r(110, 900), birchLane: r(220, 1300) } },
  { key: "rugOF",     label: "Area Rug (5×8)",            ranges: {
    jossMain: r(120, 600), allModern: r(110, 700), birchLane: r(200, 900) } },
  { key: "lampOF",    label: "Task/Desk Lamp",            ranges: {
    jossMain: r(60, 250), allModern: r(55, 300), birchLane: r(100, 450) } },
];

const ENTRYWAY: ItemDef[] = [
  { key: "entryConsole", label: "Entry Console Table", ranges: {
    jossMain: r(150, 900), allModern: r(140, 1100), birchLane: r(300, 1500) } },
  { key: "entryMirror",  label: "Mirror",              ranges: {
    jossMain: r(100, 450), allModern: r(100, 500), birchLane: r(180, 800) } },
  { key: "entryBench",   label: "Bench",              ranges: {
    jossMain: r(120, 600), allModern: r(120, 700), birchLane: r(220, 900) } },
  { key: "entryRug",     label: "Runner (2.5×8)",     ranges: {
    jossMain: r(80, 300), allModern: r(80, 350), birchLane: r(120, 500) } },
  { key: "entryLamp",    label: "Table Lamp",         ranges: {
    jossMain: r(70, 250), allModern: r(70, 300), birchLane: r(110, 450) } },
];

const ROOMS: RoomDef[] = [
  { key: "living",   label: "Living Room", items: LIVING },
  { key: "bedroom",  label: "Bedroom",     items: BEDROOM },
  { key: "dining",   label: "Dining Room", items: DINING },
  { key: "office",   label: "Home Office", items: OFFICE },
  { key: "entry",    label: "Entryway",    items: ENTRYWAY },
];

/** ─────────────────────────  Component  ───────────────────────── **/
export default function App() {
  const [scope, setScope] = useState<ScopeKey>("singleRoom");
  const [brand, setBrand] = useState<BrandKey>("jossMain");
  const [roomKey, setRoomKey] = useState<string>(ROOMS[0].key);
  const [tier, setTier] = useState<TierKey>("better");

  // Single-room state
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [enabledItems, setEnabledItems] = useState<Record<string, boolean>>({});
  const [customPrices, setCustomPrices] = useState<Record<string, number>>({});

  // Whole home counts
  const [homeCounts, setHomeCounts] = useState({
    living: 1,
    bedrooms: 3,
    dining: 1,
    office: 1,
    entry: 1,
  });

  const room = useMemo(() => ROOMS.find(r => r.key === roomKey)!, [roomKey]);

  /** initialize defaults when room/brand changes (single-room mode) */
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

  /** compute a room’s merchandise subtotal for a given brand+tier, using defaults */
  function computeRoomMerch(roomDef: RoomDef, brandKey: BrandKey, tierKey: TierKey) {
    return roomDef.items.reduce((sum, it) => {
      const qty = it.quantityDefault ?? (it.required ? 1 : 0);
      if (!qty) return sum;
      const range = it.ranges[brandKey];
      const unit =
        tierKey === "custom" && customPrices[it.key]
          ? customPrices[it.key]
          : bandForTier(range, tierKey);
      return sum + unit * qty;
    }, 0);
  }

  /** ───── Single-room calculations ───── */
  const lines = useMemo(() => {
    if (scope !== "singleRoom") return [];
    return room.items
      .filter(it => enabledItems[it.key])
      .map(it => {
        const q = quantities[it.key] ?? 1;
        const range = it.ranges[brand];
        const unit = tier === "custom" && customPrices[it.key] ? customPrices[it.key] : bandForTier(range, tier);
        return { ...it, quantity: q, unit, subtotal: unit * q, range };
      });
  }, [scope, room, brand, quantities, enabledItems, tier, customPrices]);

  const merchandise = useMemo(
    () => (scope === "singleRoom" ? lines.reduce((s, l) => s + l.subtotal, 0) : 0),
    [scope, lines]
  );

  /** ───── Whole-home calculations ───── */
  const wholeHome = useMemo(() => {
    if (scope !== "wholeHome") return null;
    // Per-room totals (use standard/default quantities per room)
    const livingDef  = ROOMS.find(r => r.key === "living")!;
    const bedDef     = ROOMS.find(r => r.key === "bedroom")!;
    const diningDef  = ROOMS.find(r => r.key === "dining")!;
    const officeDef  = ROOMS.find(r => r.key === "office")!;
    const entryDef   = ROOMS.find(r => r.key === "entry")!;

    const tiers: TierKey[] = ["good", "better", "best"];
    const perRoom = (rd: RoomDef, count: number) => {
      const t: Record<TierKey, number> = { good: 0, better: 0, best: 0, custom: 0 };
      tiers.forEach(tierKey => {
        t[tierKey] = computeRoomMerch(rd, brand, tierKey) * count;
      });
      return t;
    };

    const livingTotals  = perRoom(livingDef,  homeCounts.living);
    const bedroomTotals = perRoom(bedDef,     homeCounts.bedrooms);
    const diningTotals  = perRoom(diningDef,  homeCounts.dining);
    const officeTotals  = perRoom(officeDef,  homeCounts.office);
    const entryTotals   = perRoom(entryDef,   homeCounts.entry);

    const sumTiers = (...objs: Record<TierKey, number>[]) => {
      const out: Record<TierKey, number> = { good: 0, better: 0, best: 0, custom: 0 };
      objs.forEach(o => {
        out.good   += o.good;
        out.better += o.better;
        out.best   += o.best;
      });
      return out;
    };

    const grand = sumTiers(livingTotals, bedroomTotals, diningTotals, officeTotals, entryTotals);

    return {
      livingTotals, bedroomTotals, diningTotals, officeTotals, entryTotals,
      grand,
    };
  }, [scope, brand, homeCounts]);

  /** ───── UI Helpers ───── */
  const wrap: React.CSSProperties = { maxWidth: 1200, margin: "0 auto", padding: 24, fontFamily: "system-ui, sans-serif" };
  const card: React.CSSProperties = { border: "1px solid #e5e5e5", borderRadius: 12, background: "#fff", padding: 16 };
  const input: React.CSSProperties = { padding: 10, borderRadius: 8, border: "1px solid #d9d9d9", width: "100%" };
  const btn: React.CSSProperties = { padding: "6px 10px", border: "1px solid #d9d9d9", borderRadius: 8, background: "#fafafa", cursor: "pointer" };
  const small: React.CSSProperties = { color: "#777", fontSize: 12 };

  return (
    <div style={{ background: "#f7f7f9", minHeight: "100vh" }}>
      <div style={wrap}>
        <h1 style={{ fontSize: 22, marginBottom: 8 }}>Client Budget Calculator — Wayfair Specialty Brands</h1>
        <p style={{ color: "#666", marginBottom: 16 }}>
          Select brand & scope. Use Good / Better / Best tiers. Totals show <b>merchandise only</b>.
        </p>

        <div style={{ display: "grid", gap: 16, gridTemplateColumns: "1fr 2fr" }}>
          {/* Left controls */}
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
                      // quantities/toggles reset when room/brand changes
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
                  {[
                    { key: "living", label: "Living Areas" },
                    { key: "bedrooms", label: "Bedrooms" },
                    { key: "dining", label: "Dining Areas" },
                    { key: "office", label: "Home Offices" },
                    { key: "entry", label: "Entryways" },
                  ].map(({ key, label }) => (
                    <div key={key}>
                      <div style={{ fontSize: 12, color: "#666", marginBottom: 6 }}>{label}</div>
                      <input
                        type="number"
                        min={0}
                        value={(homeCounts as any)[key]}
                        onChange={(e) => setHomeCounts(s => ({ ...s, [key]: Math.max(0, Number(e.target.value || 0)) }))}
                        style={input}
                      />
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 8, ...small }}>
                  Uses each room’s default set of items & quantities (editable in the config).
                </div>
              </>
            )}
          </div>

          {/* Right side */}
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
                                style={{ padding: "6px 10px", border: "1px solid #d9d9d9", borderRadius: 8, background: "#fafafa", cursor: "pointer" }}
                                onClick={() => setQuantities(s => ({ ...s, [l.key]: Math.max(0, (s[l.key] ?? 0) - 1) }))}
                              >-</button>
                              <input
                                type="number"
                                value={quantities[l.key] ?? 0}
                                onChange={(e) => setQuantities(s => ({ ...s, [l.key]: Math.max(0, Number(e.target.value || 0)) }))}
                                style={{ padding: 10, borderRadius: 8, border: "1px solid #d9d9d9", width: 70, textAlign: "center" }}
                              />
                              <button
                                style={{ padding: "6px 10px", border: "1px solid #d9d9d9", borderRadius: 8, background: "#fafafa", cursor: "pointer" }}
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
                        {[
                          { key: "living",  label: "Living Area(s)",   count: homeCounts.living,  totals: wholeHome.livingTotals },
                          { key: "bedroom", label: "Bedroom(s)",       count: homeCounts.bedrooms, totals: wholeHome.bedroomTotals },
                          { key: "dining",  label: "Dining Area(s)",   count: homeCounts.dining,  totals: wholeHome.diningTotals },
                          { key: "office",  label: "Home Office(s)",   count: homeCounts.office,  totals: wholeHome.officeTotals },
                          { key: "entry",   label: "Entryway(s)",      count: homeCounts.entry,   totals: wholeHome.entryTotals },
                        ].map(row => (
                          <tr key={row.key} style={{ borderTop: "1px solid #f0f0f0" }}>
                            <td style={{ padding: 12 }}>{row.label}</td>
                            <td style={{ padding: 12, textAlign: "right" }}>{row.count}</td>
                            <td style={{ padding: 12, textAlign: "right" }}>{currency(row.totals.good)}</td>
                            <td style={{ padding: 12, textAlign: "right", fontWeight: 600 }}>{currency(row.totals.better)}</td>
                            <td style={{ padding: 12, textAlign: "right" }}>{currency(row.totals.best)}</td>
                          </tr>
                        ))}
                        <tr>
                          <td colSpan={5} style={{ borderTop: "1px solid #eee" }} />
                        </tr>
                        <tr>
                          <td style={{ padding: 12, fontWeight: 700 }}>Whole-Home Total</td>
                          <td />
                          <td style={{ padding: 12, textAlign: "right", fontWeight: 700 }}>{currency(wholeHome.grand.good)}</td>
                          <td style={{ padding: 12, textAlign: "right", fontWeight: 800 }}>{currency(wholeHome.grand.better)}</td>
                          <td style={{ padding: 12, textAlign: "right", fontWeight: 700 }}>{currency(wholeHome.grand.best)}</td>
                        </tr>
                      </>
                    )}
                  </tbody>
                </table>
                <p style={{ ...small, marginTop: 12 }}>
                  Uses each room’s default package. Tweak defaults in the catalog (top of file) for different home profiles (e.g., kids’ rooms vs guest rooms).
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
