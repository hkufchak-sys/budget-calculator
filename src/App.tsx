import { useMemo, useState } from "react";

type Brand = "Joss & Main" | "AllModern" | "Birch Lane";
type Range = { min: number; max: number };
type Item = { key: string; label: string; qty?: number; required?: boolean; ranges: Record<Brand, Range> };
type Room = { key: string; label: string; items: Item[] };
type Tier = "Good" | "Better" | "Best" | "Custom";

const currency = (n: number) =>
  n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });

// ====== EDIT THESE TO YOUR REAL NUMBERS WHEN READY ======
const RANGES: Room[] = [
  {
    key: "living",
    label: "Living Room",
    items: [
      { key: "sofa", label: "Sofa", required: true, ranges: {
        "Joss & Main": { min: 800, max: 2800 },
        "AllModern":   { min: 700, max: 3000 },
        "Birch Lane":  { min: 1300, max: 4500 },
      }},
      { key: "sectional", label: "Sectional (optional)", ranges: {
        "Joss & Main": { min: 1000, max: 3800 },
        "AllModern":   { min: 1100, max: 4800 },
        "Birch Lane":  { min: 1900, max: 6500 },
      }},
      { key: "accentChair", label: "Accent Chair", qty: 2, ranges: {
        "Joss & Main": { min: 180, max: 900 },
        "AllModern":   { min: 170, max: 1200 },
        "Birch Lane":  { min: 320, max: 1600 },
      }},
      { key: "coffeeTable", label: "Coffee Table", required: true, ranges: {
        "Joss & Main": { min: 140, max: 800 },
        "AllModern":   { min: 120, max: 900 },
        "Birch Lane":  { min: 280, max: 1200 },
      }},
      { key: "sideTable", label: "Side Table", qty: 2, ranges: {
        "Joss & Main": { min: 90, max: 480 },
        "AllModern":   { min: 80, max: 520 },
        "Birch Lane":  { min: 160, max: 720 },
      }},
      { key: "mediaConsole", label: "Media Console", ranges: {
        "Joss & Main": { min: 280, max: 1400 },
        "AllModern":   { min: 240, max: 1600 },
        "Birch Lane":  { min: 520, max: 2200 },
      }},
      { key: "rug", label: "Area Rug (8×10)", required: true, ranges: {
        "Joss & Main": { min: 200, max: 900 },
        "AllModern":   { min: 180, max: 1100 },
        "Birch Lane":  { min: 260, max: 1600 },
      }},
      { key: "lamps", label: "Floor/Table Lamp", qty: 2, ranges: {
        "Joss & Main": { min: 80, max: 360 },
        "AllModern":   { min: 70, max: 460 },
        "Birch Lane":  { min: 130, max: 620 },
      }},
      { key: "decor", label: "Pillows/Throws/Decor (bundle)", ranges: {
        "Joss & Main": { min: 160, max: 620 },
        "AllModern":   { min: 150, max: 720 },
        "Birch Lane":  { min: 260, max: 900 },
      }},
    ],
  },
  {
    key: "bedroom",
    label: "Bedroom",
    items: [
      { key: "bed", label: "Bed Frame", required: true, ranges: {
        "Joss & Main": { min: 350, max: 1500 },
        "AllModern":   { min: 320, max: 1700 },
        "Birch Lane":  { min: 650, max: 2600 },
      }},
      { key: "mattress", label: "Mattress (Queen)", required: true, ranges: {
        "Joss & Main": { min: 400, max: 1500 },
        "AllModern":   { min: 400, max: 1700 },
        "Birch Lane":  { min: 650, max: 2300 },
      }},
      { key: "nightstand", label: "Nightstand", qty: 2, ranges: {
        "Joss & Main": { min: 140, max: 620 },
        "AllModern":   { min: 120, max: 720 },
        "Birch Lane":  { min: 240, max: 920 },
      }},
      { key: "dresser", label: "Dresser", ranges: {
        "Joss & Main": { min: 280, max: 1400 },
        "AllModern":   { min: 260, max: 1600 },
        "Birch Lane":  { min: 520, max: 2300 },
      }},
      { key: "bench", label: "Bed Bench", ranges: {
        "Joss & Main": { min: 160, max: 720 },
        "AllModern":   { min: 140, max: 820 },
        "Birch Lane":  { min: 260, max: 1100 },
      }},
      { key: "rugBR", label: "Area Rug (8×10)", ranges: {
        "Joss & Main": { min: 200, max: 900 },
        "AllModern":   { min: 180, max: 1100 },
        "Birch Lane":  { min: 260, max: 1600 },
      }},
      { key: "bedding", label: "Bedding Set (duvet/insert/sheets)", ranges: {
        "Joss & Main": { min: 200, max: 560 },
        "AllModern":   { min: 190, max: 700 },
        "Birch Lane":  { min: 260, max: 900 },
      }},
      { key: "lampsBR", label: "Table Lamps (pair)", ranges: {
        "Joss & Main": { min: 140, max: 520 },
        "AllModern":   { min: 130, max: 620 },
        "Birch Lane":  { min: 230, max: 920 },
      }},
    ],
  },
  {
    key: "dining",
    label: "Dining Room",
    items: [
      { key: "table", label: "Dining Table", required: true, ranges: {
        "Joss & Main": { min: 340, max: 1900 },
        "AllModern":   { min: 320, max: 2300 },
        "Birch Lane":  { min: 720, max: 3200 },
      }},
      { key: "chairs", label: "Dining Chairs (per chair)", qty: 6, required: true, ranges: {
        "Joss & Main": { min: 90, max: 360 },
        "AllModern":   { min: 80, max: 460 },
        "Birch Lane":  { min: 160, max: 620 },
      }},
      { key: "sideboard", label: "Sideboard/Buffet", ranges: {
        "Joss & Main": { min: 320, max: 1600 },
        "AllModern":   { min: 300, max: 1800 },
        "Birch Lane":  { min: 620, max: 2600 },
      }},
      { key: "rugDR", label: "Area Rug (8×10)", ranges: {
        "Joss & Main": { min: 200, max: 900 },
        "AllModern":   { min: 180, max: 1100 },
        "Birch Lane":  { min: 260, max: 1600 },
      }},
      { key: "lightingDR", label: "Chandelier/Pendant", ranges: {
        "Joss & Main": { min: 160, max: 720 },
        "AllModern":   { min: 150, max: 900 },
        "Birch Lane":  { min: 260, max: 1300 },
      }},
    ],
  },
  {
    key: "office",
    label: "Home Office",
    items: [
      { key: "desk", label: "Desk", required: true, ranges: {
        "Joss & Main": { min: 170, max: 900 },
        "AllModern":   { min: 160, max: 1100 },
        "Birch Lane":  { min: 320, max: 1600 },
      }},
      { key: "officeChair", label: "Office Chair", required: true, ranges: {
        "Joss & Main": { min: 140, max: 620 },
        "AllModern":   { min: 130, max: 820 },
        "Birch Lane":  { min: 230, max: 1100 },
      }},
      { key: "storage", label: "Bookcase/Storage", ranges: {
        "Joss & Main": { min: 140, max: 700 },
        "AllModern":   { min: 120, max: 900 },
        "Birch Lane":  { min: 230, max: 1300 },
      }},
      { key: "rugOF", label: "Area Rug (5×8)", ranges: {
        "Joss & Main": { min: 140, max: 600 },
        "AllModern":   { min: 120, max: 700 },
        "Birch Lane":  { min: 210, max: 900 },
      }},
      { key: "lampOF", label: "Task/Desk Lamp", ranges: {
        "Joss & Main": { min: 70, max: 260 },
        "AllModern":   { min: 60, max: 320 },
        "Birch Lane":  { min: 110, max: 450 },
      }},
    ],
  },
];
// =======================================================

function unitForTier(range: Range, tier: Tier) {
  const { min, max } = range;
  if (tier === "Good") return min;
  if (tier === "Best") return max;
  if (tier === "Better") return Math.round(min + (max - min) * 0.55);
  return Math.round((min + max) / 2);
}

export default function App() {
  const [brand, setBrand] = useState<Brand>("Joss & Main");
  const [roomKey, setRoomKey] = useState<string>(RANGES[0].key);
  const [tier, setTier] = useState<Tier>("Better");
  const [enabled, setEnabled] = useState<Record<string, boolean>>({});
  const [qty, setQty] = useState<Record<string, number>>({});
  const [custom, setCustom] = useState<Record<string, number>>({});
  const [deliveryPct, setDeliveryPct] = useState(3);
  const [taxPct, setTaxPct] = useState(6.25);
  const [contingencyPct, setContingencyPct] = useState(10);
  const [promo, setPromo] = useState(0);

  const room = useMemo(() => RANGES.find(r => r.key === roomKey)!, [roomKey]);

  // initialize when room changes
  useMemo(() => {
    const e: Record<string, boolean> = {};
    const q: Record<string, number> = {};
    room.items.forEach(i => {
      e[i.key] = !!(i.required || i.qty);
      q[i.key] = i.qty ?? (i.required ? 1 : 0);
    });
    setEnabled(e);
    setQty(q);
    setCustom({});
  }, [roomKey]);

  const lines = room.items
    .filter(i => enabled[i.key])
    .map(i => {
      const range = i.ranges[brand];
      const unit = tier === "Custom" && custom[i.key] ? custom[i.key] : unitForTier(range, tier);
      const quantity = qty[i.key] ?? 1;
      return { ...i, range, unit, quantity, subtotal: unit * quantity };
    });

  const merchandise = lines.reduce((s, l) => s + l.subtotal, 0);
  const delivery = Math.round(merchandise * (deliveryPct / 100));
  const subBeforeTax = Math.max(0, merchandise + delivery - promo);
  const tax = Math.round(subBeforeTax * (taxPct / 100));
  const contingency = Math.round(subBeforeTax * (contingencyPct / 100));
  const total = subBeforeTax + tax + contingency;

  const label = (s: string) => <div style={{ fontSize: 12, color: "#666", marginBottom: 4 }}>{s}</div>;
  const box: React.CSSProperties = { padding: 16, border: "1px solid #e5e5e5", borderRadius: 12, background: "#fff" };
  const row: React.CSSProperties = { display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr", gap: 8, padding: "8px 0", borderTop: "1px solid #f0f0f0", alignItems: "center" };

  return (
    <div style={{ fontFamily: "Inter, system-ui, sans-serif", margin: "0 auto", maxWidth: 1100, padding: 24, background: "#f7f7f9", minHeight: "100vh" }}>
      <h1 style={{ fontSize: 24, marginBottom: 8 }}>Client Budget Calculator — Wayfair Specialty Brands</h1>
      <p style={{ color: "#666", marginBottom: 16 }}>Choose brand, room, and tier. Toggle items, set quantities, and adjust delivery/tax/promo/contingency.</p>

      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 16 }}>
        {/* Left controls */}
        <div style={box}>
          {label("Brand")}
          <select value={brand} onChange={(e) => setBrand(e.target.value as Brand)} style={{ width: "100%", padding: 10, borderRadius: 8 }}>
            <option>Joss & Main</option>
            <option>AllModern</option>
            <option>Birch Lane</option>
          </select>

          {label("Room")}
          <select value={roomKey} onChange={(e) => setRoomKey(e.target.value)} style={{ width: "100%", padding: 10, borderRadius: 8 }}>
            {RANGES.map(r => <option key={r.key} value={r.key}>{r.label}</option>)}
          </select>

          {label("Tier")}
          <select value={tier} onChange={(e) => setTier(e.target.value as Tier)} style={{ width: "100%", padding: 10, borderRadius: 8 }}>
            <option>Good</option>
            <option>Better</option>
            <option>Best</option>
            <option>Custom</option>
          </select>

          <div style={{ height: 16 }} />

          {label("Delivery (%)")}
          <input type="number" value={deliveryPct} onChange={(e) => setDeliveryPct(Number(e.target.value || 0))} style={{ width: "100%", padding: 10, borderRadius: 8 }} />
          {label("Tax (%)")}
          <input type="number" value={taxPct} onChange={(e) => setTaxPct(Number(e.target.value || 0))} style={{ width: "100%", padding: 10, borderRadius: 8 }} />
          {label("Contingency (%)")}
          <input type="number" value={contingencyPct} onChange={(e) => setContingencyPct(Number(e.target.value || 0))} style={{ width: "100%", padding: 10, borderRadius: 8 }} />
          {label("Promo ($ off)")}
          <input type="number" value={promo} onChange={(e) => setPromo(Number(e.target.value || 0))} style={{ width: "100%", padding: 10, borderRadius: 8 }} />
        </div>

        {/* Right table */}
        <div style={box}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr 1fr", gap: 8, fontSize: 12, fontWeight: 600, color: "#555", paddingBottom: 8, borderBottom: "1px solid #eaeaea" }}>
            <div>Include</div>
            <div>Item</div>
            <div>Range</div>
            <div>Unit ({tier})</div>
            <div style={{ textAlign: "right" }}>Qty × Subtotal</div>
          </div>

          {lines.map(l => (
            <div key={l.key} style={row}>
              <div>
                <input
                  type="checkbox"
                  checked={!!enabled[l.key]}
                  onChange={(e) => setEnabled(s => ({ ...s, [l.key]: e.target.checked }))}
                />
              </div>
              <div>{l.label}</div>
              <div>{currency(l.range.min)} – {currency(l.range.max)}</div>
              <div>
                {tier === "Custom" ? (
                  <input
                    type="number"
                    value={custom[l.key] ?? ""}
                    placeholder={String(l.unit)}
                    onChange={(e) => setCustom(s => ({ ...s, [l.key]: Number(e.target.value || 0) }))}
                    style={{ width: "100%", padding: 6, borderRadius: 6 }}
                  />
                ) : (
                  currency(l.unit)
                )}
              </div>
              <div style={{ textAlign: "right" }}>
                <input
                  type="number"
                  value={l.quantity}
                  onChange={(e) => setQty(s => ({ ...s, [l.key]: Math.max(0, Number(e.target.value || 0)) }))}
                  style={{ width: 60, padding: 6, borderRadius: 6, marginRight: 8 }}
                />
                <strong>{currency(l.subtotal)}</strong>
              </div>
            </div>
          ))}

          <div style={{ borderTop: "1px solid #eaeaea", marginTop: 12, paddingTop: 12 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto", rowGap: 6 }}>
              <div>Merchandise</div><div>{currency(merchandise)}</div>
              <div>Delivery</div><div>{currency(delivery)}</div>
              <div>Promo</div><div>-{currency(promo)}</div>
              <div>Tax</div><div>{currency(tax)}</div>
              <div>Contingency</div><div>{currency(contingency)}</div>
              <div style={{ borderTop: "1px solid #eaeaea", marginTop: 6 }}></div><div style={{ borderTop: "1px solid #eaeaea", marginTop: 6 }}></div>
              <div style={{ fontWeight: 700 }}>Client Budget Target</div><div style={{ fontWeight: 700 }}>{currency(total)}</div>
            </div>
          </div>
        </div>
      </div>

      <p style={{ color: "#777", fontSize: 12, marginTop: 12 }}>
        Tip: Update live ranges in the <code>RANGES</code> object at the top. Switch Tier to “Custom” to enter exact unit prices from product pages.
      </p>
    </div>
  );
}
