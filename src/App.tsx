import { useMemo, useState } from "react";

/** Types */
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

/** Helpers */
const r = (min: number, max: number): Range => ({ min, max });
const currency = (n: number) =>
  n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const TIER_LABEL: Record<TierKey, string> = { good: "Good", better: "Better", best: "Best", custom: "Custom" };
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

/** CONFIG — replace these min/max with live site values */
const ROOMS: RoomDef[] = [
  {
    key: "living",
    label: "Living Room",
    items: [
      { key: "sofa", label: "Sofa", required: true, quantityDefault: 1, ranges: {
        jossMain: r(700, 2500), allModern: r(600, 3000), birchLane: r(1200, 4500) } },
      { key: "sectional", label: "Sectional (optional)", ranges: {
        jossMain: r(900, 3500), allModern: r(1000, 4500), birchLane: r(1800, 6500) } },
      { key: "accentChair", label: "Accent Chair", quantityDefault: 2, ranges: {
        jossMain: r(160, 800), allModern: r(150, 1200), birchLane: r(300, 1600) } },
      { key: "coffeeTable", label: "Coffee Table", required: true, ranges: {
        jossMain: r(120, 700), allModern: r(100, 900), birchLane: r(250, 1200) } },
      { key: "sideTable", label: "Side Table", quantityDefault: 2, ranges: {
        jossMain: r(80, 450), allModern: r(70, 500), birchLane: r(150, 700) } },
      { key: "mediaConsole", label: "Media Console", ranges: {
        jossMain: r(250, 1400), allModern: r(200, 1600), birchLane: r(500, 2200) } },
      { key: "rug", label: "Area Rug (8×10)", required: true, ranges: {
        jossMain: r(180, 900), allModern: r(160, 1100), birchLane: r(250, 1600) } },
      { key: "lighting", label: "Floor/Table Lamp", quantityDefault: 2, ranges: {
        jossMain: r(70, 350), allModern: r(60, 450), birchLane: r(120, 600) } },
      { key: "decor", label: "Pillows/Throws/Decor (bundle)", ranges: {
        jossMain: r(150, 600), allModern: r(150, 700), birchLane: r(250, 900) } },
    ],
  },
  {
    key: "bedroom",
    label: "Bedroom",
    items: [
      { key: "bed", label: "Bed Frame", required: true, ranges: {
        jossMain: r(300, 1500), allModern: r(280, 1700), birchLane: r(600, 2500) } },
      { key: "mattress", label: "Mattress (Queen)", required: true, ranges: {
        jossMain: r(350, 1400), allModern: r(350, 1600), birchLane: r(600, 2200) } },
      { key: "nightstand", label: "Nightstand", quantityDefault: 2, ranges: {
        jossMain: r(120, 600), allModern: r(110, 700), birchLane: r(220, 900) } },
      { key: "dresser", label: "Dresser", ranges: {
        jossMain: r(250, 1400), allModern: r(240, 1600), birchLane: r(500, 2300) } },
      { key: "bench", label: "Bed Bench", ranges: {
        jossMain: r(140, 700), allModern: r(120, 800), birchLane: r(250, 1100) } },
      { key: "rugBR", label: "Area Rug (8×10)", ranges: {
        jossMain: r(180, 900), allModern: r(160, 1100), birchLane: r(250, 1600) } },
      { key: "bedding", label: "Bedding Set (duvet/insert/sheets)", ranges: {
        jossMain: r(180, 550), allModern: r(170, 700), birchLane: r(250, 900) } },
      { key: "lightingBR", label: "Table Lamps (pair)", ranges: {
        jossMain: r(120, 500), allModern: r(120, 600), birchLane: r(220, 900) } },
    ],
  },
  {
    key: "dining",
    label: "Dining Room",
    items: [
      { key: "table", label: "Dining Table", required: true, ranges: {
        jossMain: r(300, 1900), allModern: r(280, 2300), birchLane: r(700, 3200) } },
      { key: "chairs", label: "Dining Chairs (per chair)", quantityDefault: 6, required: true, ranges: {
        jossMain: r(80, 350), allModern: r(75, 450), birchLane: r(150, 600) } },
      { key: "sideboard", label: "Sideboard/Buffet", ranges: {
        jossMain: r(300, 1600), allModern: r(280, 1800), birchLane: r(600, 2600) } },
      { key: "rugDR", label: "Area Rug (8×10)", ranges: {
        jossMain: r(180, 900), allModern: r(160, 1100), birchLane: r(250, 1600) } },
      { key: "lightingDR", label: "Chandelier/Pendant", ranges: {
        jossMain: r(150, 700), allModern: r(140, 900), birchLane: r(250, 1300) } },
    ],
  },
  {
    key: "office",
    label: "Home Office",
    items: [
      { key: "desk", label: "Desk", required: true, ranges: {
        jossMain: r(150, 900), allModern: r(140, 1100), birchLane: r(300, 1600) } },
      { key: "officeChair", label: "Office Chair", required: true, ranges: {
        jossMain: r(120, 600), allModern: r(110, 800), birchLane: r(220, 1100) } },
      { key: "storage", label: "Bookcase/Storage", ranges: {
        jossMain: r(120, 700), allModern: r(110, 900), birchLane: r(220, 1300) } },
      { key: "rugOF", label: "Area Rug (5×8)", ranges: {
        jossMain: r(120, 600), allModern: r(110, 700), birchLane: r(200, 900) } },
      { key: "lampOF", label: "Task/Desk Lamp", ranges: {
        jossMain: r(60, 250), allModern: r(55, 300), birchLane: r(100, 450) } },
    ],
  },
];

/** Component */
export default function App() {
  const [brand, setBrand] = useState<BrandKey>("jossMain");
  const [roomKey, setRoomKey] = useState<string>(ROOMS[0].key);
  const [tier, setTier] = useState<TierKey>("better");
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [enabledItems, setEnabledItems] = useState<Record<string, boolean>>({});
  const [customPrices, setCustomPrices] = useState<Record<string, number>>({});

  const room = useMemo(() => ROOMS.find(r => r.key === roomKey)!, [roomKey]);

  // init defaults when room/brand changes
  useMemo(() => {
    const defaults: Record<string, number> = {};
    const enabled: Record<string, boolean> = {};
    room.items.forEach(it => {
      defaults[it.key] = it.quantityDefault ?? (it.required ? 1 : 0);
      enabled[it.key] = !!(it.required || (it.quantityDefault && it.quantityDefault > 0));
    });
    setQuantities(defaults);
    setEnabledItems(enabled);
    setCustomPrices({});
  }, [roomKey, brand]);

  const lines = useMemo(() => {
    return room.items
      .filter(it => enabledItems[it.key])
      .map(it => {
        const q = quantities[it.key] ?? 1;
        const range = it.ranges[brand];
        const unit = tier === "custom" && customPrices[it.key] ? customPrices[it.key] : bandForTier(range, tier);
        return { ...it, quantity: q, unit, subtotal: unit * q, range };
      });
  }, [room, brand, quantities, enabledItems, tier, customPrices]);

  const merchandise = useMemo(() => lines.reduce((sum, l) => sum + l.subtotal, 0), [lines]);

  /** Simple styles (no external libs) */
  const wrap: React.CSSProperties = { maxWidth: 1100, margin: "0 auto", padding: 24, fontFamily: "system-ui, sans-serif" };
  const card: React.CSSProperties = { border: "1px solid #e5e5e5", borderRadius: 12, background: "#fff", padding: 16 };
  const input: React.CSSProperties = { padding: 10, borderRadius: 8, border: "1px solid #d9d9d9", width: "100%" };
  const btn: React.CSSProperties = { padding: "6px 10px", border: "1px solid #d9d9d9", borderRadius: 8, background: "#fafafa", cursor: "pointer" };

  return (
    <div style={{ background: "#f7f7f9", minHeight: "100vh" }}>
      <div style={wrap}>
        <h1 style={{ fontSize: 22, marginBottom: 8 }}>Client Budget Calculator — Wayfair Specialty Brands (Projection)</h1>
        <p style={{ color: "#666", marginBottom: 16 }}>
          Select brand, room, and tier. Ranges live in the config at the top. Totals show merchandise only.
        </p>

        <div style={{ display: "grid", gap: 16, gridTemplateColumns: "1fr 2fr" }}>
          {/* Controls */}
          <div style={card}>
            <div style={{ fontSize: 12, color: "#666", marginBottom: 6 }}>Brand</div>
            <select value={brand} onChange={(e) => setBrand(e.target.value as BrandKey)} style={input}>
              {Object.entries(BRANDS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>

            <div style={{ height: 12 }} />

            <div style={{ fontSize: 12, color: "#666", marginBottom: 6 }}>Room</div>
            <select value={roomKey} onChange={(e) => setRoomKey(e.target.value)} style={input}>
              {ROOMS.map(r => <option key={r.key} value={r.key}>{r.label}</option>)}
            </select>

            <div style={{ height: 12 }} />

            <div style={{ fontSize: 12, color: "#666", marginBottom: 6 }}>Tier</div>
            <select value={tier} onChange={(e) => setTier(e.target.value as TierKey)} style={input}>
              <option value="good">Good</option>
              <option value="better">Better</option>
              <option value="best">Best</option>
              <option value="custom">Custom</option>
            </select>

            <div style={{ marginTop: 8 }}>
              {tier === "custom" && (
                <div style={{ fontSize: 12, color: "#777" }}>
                  Enter per-line exact unit prices in the table below.
                </div>
              )}
            </div>

            <div style={{ marginTop: 12 }}>
              <button
                style={btn}
                onClick={() => {
                  setTier("better");
                  // quantities/toggles reset when room/brand changes
                }}
              >
                ↺ Reset
              </button>
            </div>
          </div>

          {/* Line items table */}
          <div style={card}>
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
                      <td style={{ padding: 12, verticalAlign: "middle" }}>{currency(l.range.min)} – {currency(l.range.max)}</td>
                      <td style={{ padding: 12, verticalAlign: "middle" }}>
                        {tier === "custom" ? (
                          <input
                            type="number"
                            value={Number.isFinite(customPrices[l.key]) ? customPrices[l.key] : ("" as any)}
                            placeholder={String(l.unit)}
                            onChange={(e) => setCustomPrices(s => ({ ...s, [l.key]: Number(e.target.value || 0) }))}
                            style={{ ...input, width: 100 }}
                          />
                        ) : (
                          <div style={{ width: 100 }}>{currency(l.unit)}</div>
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
                            style={{ ...input, width: 70, textAlign: "center" }}
                          />
                          <button
                            style={btn}
                            onClick={() => setQuantities(s => ({ ...s, [l.key]: (s[l.key] ?? 0) + 1 }))}
                          >+</button>
                        </div>
                      </td>
                      <td style={{ padding: 12, verticalAlign: "middle", textAlign: "right" }}>{currency(l.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Totals */}
        <div style={{ marginTop: 16 }}>
          <div style={card}>
            <h3 style={{ margin: 0, marginBottom: 8, fontSize: 16 }}>Room Merchandise Total</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8, fontSize: 14 }}>
              <div>Merchandise</div>
              <div style={{ textAlign: "right", fontWeight: 600 }}>{currency(merchandise)}</div>
            </div>
            <p style={{ color: "#777", fontSize: 12, marginTop: 8 }}>
              Projection excludes delivery, assembly, protection, taxes, contingency, and promos.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
