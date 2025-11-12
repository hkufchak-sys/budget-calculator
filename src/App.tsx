import { useMemo, useState } from "react";

type Brand = "Joss & Main" | "AllModern" | "Birch Lane";
type Range = { min: number; max: number };
type Item = { key: string; label: string; qty: number; ranges: Record<Brand, Range> };
type Room = { key: string; label: string; items: Item[] };

const currency = (n: number) =>
  n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });

/**
 * RANGES — update these with the exact min/max you verify on brand category pages.
 * Tip: use 8x10 for main rugs, per-chair pricing for dining chairs.
 * Quantities are fixed for projection (clients can't change them).
 */
const RANGES: Room[] = [
  {
    key: "living",
    label: "Living Room",
    items: [
      { key: "sofa",         label: "Sofa",                 qty: 1, ranges: {
        "Joss & Main": { min: 800,  max: 2800 },
        "AllModern":   { min: 700,  max: 3000 },
        "Birch Lane":  { min: 1300, max: 4500 },
      }},
      { key: "accent",       label: "Accent Chair",         qty: 2, ranges: {
        "Joss & Main": { min: 180,  max: 900  },
        "AllModern":   { min: 170,  max: 1200 },
        "Birch Lane":  { min: 320,  max: 1600 },
      }},
      { key: "coffee",       label: "Coffee Table",         qty: 1, ranges: {
        "Joss & Main": { min: 140,  max: 800  },
        "AllModern":   { min: 120,  max: 900  },
        "Birch Lane":  { min: 280,  max: 1200 },
      }},
      { key: "side",         label: "Side Table",           qty: 2, ranges: {
        "Joss & Main": { min: 90,   max: 480  },
        "AllModern":   { min: 80,   max: 520  },
        "Birch Lane":  { min: 160,  max: 720  },
      }},
      { key: "media",        label: "Media Console",        qty: 1, ranges: {
        "Joss & Main": { min: 280,  max: 1400 },
        "AllModern":   { min: 240,  max: 1600 },
        "Birch Lane":  { min: 520,  max: 2200 },
      }},
      { key: "rug",          label: "Area Rug (8×10)",      qty: 1, ranges: {
        "Joss & Main": { min: 200,  max: 900  },
        "AllModern":   { min: 180,  max: 1100 },
        "Birch Lane":  { min: 260,  max: 1600 },
      }},
      { key: "lamps",        label: "Floor/Table Lamp",     qty: 2, ranges: {
        "Joss & Main": { min: 80,   max: 360  },
        "AllModern":   { min: 70,   max: 460  },
        "Birch Lane":  { min: 130,  max: 620  },
      }},
      { key: "decor",        label: "Pillows/Throws/Decor", qty: 1, ranges: {
        "Joss & Main": { min: 160,  max: 620  },
        "AllModern":   { min: 150,  max: 720  },
        "Birch Lane":  { min: 260,  max: 900  },
      }},
    ],
  },
  {
    key: "bedroom",
    label: "Bedroom",
    items: [
      { key: "bed",       label: "Bed Frame",                qty: 1, ranges: {
        "Joss & Main": { min: 350,  max: 1500 },
        "AllModern":   { min: 320,  max: 1700 },
        "Birch Lane":  { min: 650,  max: 2600 },
      }},
      { key: "mattress",  label: "Mattress (Queen)",         qty: 1, ranges: {
        "Joss & Main": { min: 400,  max: 1500 },
        "AllModern":   { min: 400,  max: 1700 },
        "Birch Lane":  { min: 650,  max: 2300 },
      }},
      { key: "nights",    label: "Nightstand",               qty: 2, ranges: {
        "Joss & Main": { min: 140,  max: 620  },
        "AllModern":   { min: 120,  max: 720  },
        "Birch Lane":  { min: 240,  max: 920  },
      }},
      { key: "dresser",   label: "Dresser",                  qty: 1, ranges: {
        "Joss & Main": { min: 280,  max: 1400 },
        "AllModern":   { min: 260,  max: 1600 },
        "Birch Lane":  { min: 520,  max: 2300 },
      }},
      { key: "bench",     label: "Bed Bench",                qty: 1, ranges: {
        "Joss & Main": { min: 160,  max: 720  },
        "AllModern":   { min: 140,  max: 820  },
        "Birch Lane":  { min: 260,  max: 1100 },
      }},
      { key: "rugBR",     label: "Area Rug (8×10)",          qty: 1, ranges: {
        "Joss & Main": { min: 200,  max: 900  },
        "AllModern":   { min: 180,  max: 1100 },
        "Birch Lane":  { min: 260,  max: 1600 },
      }},
      { key: "bedding",   label: "Bedding Set (duvet/sheets)", qty: 1, ranges: {
        "Joss & Main": { min: 200,  max: 560  },
        "AllModern":   { min: 190,  max: 700  },
        "Birch Lane":  { min: 260,  max: 900  },
      }},
      { key: "lampsBR",   label: "Table Lamps (pair)",       qty: 1, ranges: {
        "Joss & Main": { min: 140,  max: 520  },
        "AllModern":   { min: 130,  max: 620  },
        "Birch Lane":  { min: 230,  max: 920  },
      }},
    ],
  },
  {
    key: "dining",
    label: "Dining Room",
    items: [
      { key: "table",     label: "Dining Table",             qty: 1, ranges: {
        "Joss & Main": { min: 340,  max: 1900 },
        "AllModern":   { min: 320,  max: 2300 },
        "Birch Lane":  { min: 720,  max: 3200 },
      }},
      { key: "chairs",    label: "Dining Chairs (per chair)", qty: 6, ranges: {
        "Joss & Main": { min: 90,   max: 360  },
        "AllModern":   { min: 80,   max: 460  },
        "Birch Lane":  { min: 160,  max: 620  },
      }},
      { key: "sideboard", label: "Sideboard/Buffet",         qty: 1, ranges: {
        "Joss & Main": { min: 320,  max: 1600 },
        "AllModern":   { min: 300,  max: 1800 },
        "Birch Lane":  { min: 620,  max: 2600 },
      }},
      { key: "rugDR",     label: "Area Rug (8×10)",          qty: 1, ranges: {
        "Joss & Main": { min: 200,  max: 900  },
        "AllModern":   { min: 180,  max: 1100 },
        "Birch Lane":  { min: 260,  max: 1600 },
      }},
      { key: "lightDR",   label: "Chandelier/Pendant",       qty: 1, ranges: {
        "Joss & Main": { min: 160,  max: 720  },
        "AllModern":   { min: 150,  max: 900  },
        "Birch Lane":  { min: 260,  max: 1300 },
      }},
    ],
  },
  {
    key: "office",
    label: "Home Office",
    items: [
      { key: "desk",      label: "Desk",                     qty: 1, ranges: {
        "Joss & Main": { min: 170,  max: 900  },
        "AllModern":   { min: 160,  max: 1100 },
        "Birch Lane":  { min: 320,  max: 1600 },
      }},
      { key: "chair",     label: "Office Chair",             qty: 1, ranges: {
        "Joss & Main": { min: 140,  max: 620  },
        "AllModern":   { min: 130,  max: 820  },
        "Birch Lane":  { min: 230,  max: 1100 },
      }},
      { key: "storage",   label: "Bookcase/Storage",         qty: 1, ranges: {
        "Joss & Main": { min: 140,  max: 700  },
        "AllModern":   { min: 120,  max: 900  },
        "Birch Lane":  { min: 230,  max: 1300 },
      }},
      { key: "rugOF",     label: "Area Rug (5×8)",           qty: 1, ranges: {
        "Joss & Main": { min: 140,  max: 600  },
        "AllModern":   { min: 120,  max: 700  },
        "Birch Lane":  { min: 210,  max: 900  },
      }},
      { key: "lampOF",    label: "Task/Desk Lamp",           qty: 1, ranges: {
        "Joss & Main": { min: 70,   max: 260  },
        "AllModern":   { min: 60,   max: 320  },
        "Birch Lane":  { min: 110,  max: 450  },
      }},
    ],
  },
];

/** Midpoint recommendation */
const recommend = (r: Range) => Math.round(r.min + 0.55 * (r.max - r.min));

export default function App() {
  const [brand, setBrand] = useState<Brand>("Joss & Main");
  const [roomKey, setRoomKey] = useState<string>(RANGES[0].key);

  const room = useMemo(() => RANGES.find(r => r.key === roomKey)!, [roomKey]);

  const lines = room.items.map(i => {
    const r = i.ranges[brand];
    const unitRec = recommend(r);
    const minSub = r.min * i.qty;
    const maxSub = r.max * i.qty;
    const recSub = unitRec * i.qty;
    return { ...i, range: r, unitRec, minSub, maxSub, recSub };
  });

  const totals = lines.reduce(
    (acc, l) => {
      acc.min += l.minSub;
      acc.max += l.maxSub;
      acc.rec += l.recSub;
      return acc;
    },
    { min: 0, max: 0, rec: 0 }
  );

  const box: React.CSSProperties = { padding: 16, border: "1px solid #e5e5e5", borderRadius: 12, background: "#fff" };

  return (
    <div style={{ fontFamily: "Inter, system-ui, sans-serif", margin: "0 auto", maxWidth: 1100, padding: 24, background: "#f7f7f9", minHeight: "100vh" }}>
      <h1 style={{ fontSize: 24, marginBottom: 4 }}>Client Budget Projection — Wayfair Specialty Brands</h1>
      <p style={{ color: "#666", marginBottom: 16 }}>Projection-only view based on current brand ranges. Quantities are fixed by room.</p>

      <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", gap: 16 }}>
        {/* Controls (locked to Brand + Room only) */}
        <div style={box}>
          <div style={{ fontSize: 12, color: "#666", marginBottom: 6 }}>Brand</div>
          <select value={brand} onChange={(e) => setBrand(e.target.value as Brand)} style={{ width: "100%", padding: 10, borderRadius: 8 }}>
            <option>Joss & Main</option>
            <option>AllModern</option>
            <option>Birch Lane</option>
          </select>

          <div style={{ height: 12 }} />

          <div style={{ fontSize: 12, color: "#666", marginBottom: 6 }}>Room</div>
          <select value={roomKey} onChange={(e) => setRoomKey(e.target.value)} style={{ width: "100%", padding: 10, borderRadius: 8 }}>
            {RANGES.map(r => <option key={r.key} value={r.key}>{r.label}</option>)}
          </select>

          <div style={{ marginTop: 14, fontSize: 12, color: "#777" }}>
            Tip: Update exact min/max per item in the <code>RANGES</code> config to reflect current site prices.
          </div>
        </div>

        {/* Table */}
        <div style={box}>
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.6fr 0.9fr 0.9fr 1fr", gap: 8, fontSize: 12, fontWeight: 600, color: "#555", paddingBottom: 8, borderBottom: "1px solid #eaeaea" }}>
            <div>Item</div>
            <div style={{ textAlign: "right" }}>Qty</div>
            <div style={{ textAlign: "right" }}>Min</div>
            <div style={{ textAlign: "right" }}>Max</div>
            <div style={{ textAlign: "right" }}>Recommended</div>
          </div>

          {lines.map(l => (
            <div key={l.key} style={{ display: "grid", gridTemplateColumns: "1.2fr 0.6fr 0.9fr 0.9fr 1fr", gap: 8, padding: "10px 0", borderTop: "1px solid #f0f0f0", alignItems: "center" }}>
              <div>{l.label}</div>
              <div style={{ textAlign: "right" }}>{l.qty}</div>
              <div style={{ textAlign: "right" }}>{currency(l.minSub)}</div>
              <div style={{ textAlign: "right" }}>{currency(l.maxSub)}</div>
              <div style={{ textAlign: "right", fontWeight: 600 }}>{currency(l.recSub)}</div>
            </div>
          ))}

          <div style={{ borderTop: "1px solid #eaeaea", marginTop: 12, paddingTop: 12 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.6fr 0.9fr 0.9fr 1fr", gap: 8 }}>
              <div style={{ fontWeight: 700 }}>Room Projection Total</div>
              <div />
              <div style={{ textAlign: "right", fontWeight: 700 }}>{currency(totals.min)}</div>
              <div style={{ textAlign: "right", fontWeight: 700 }}>{currency(totals.max)}</div>
              <div style={{ textAlign: "right", fontWeight: 800 }}>{currency(totals.rec)}</div>
            </div>
          </div>
        </div>
      </div>

      <p style={{ color: "#777", fontSize: 12, marginTop: 12 }}>
        Source: brand category pages (sofas, coffee tables, dining tables, rugs, etc.). Update values as needed.
      </p>
    </div>
  );
}
