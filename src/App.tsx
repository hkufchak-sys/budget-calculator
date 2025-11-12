import React, { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Info, Plus, Minus, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

/**
 * Wayfair Specialty Brands Budget Calculator
 * - Supports Joss & Main, AllModern, Birch Lane
 * - Room presets with editable line items and price ranges
 * - Good/Better/Best tiering mapped to range bands
 * - Add-ons: delivery/white glove, assembly, protection plan
 * - Tax, promo, and contingency controls
 * - Designed so ranges are easy to update from a single config object
 *
 * NOTE: All price ranges are placeholders; replace with current live ranges.
 */

// ---------------------- CONFIG ---------------------- //

// Helper to build a range more readably
const r = (min: number, max: number) => ({ min, max });

type Range = { min: number; max: number };

type ItemDef = {
  key: string; // stable id
  label: string;
  quantityDefault?: number;
  required?: boolean;
  ranges: {
    [brand in BrandKey]: Range;
  };
};

type RoomDef = {
  key: string;
  label: string;
  items: ItemDef[];
};

type BrandKey = "jossMain" | "allModern" | "birchLane";

const BRANDS: Record<BrandKey, { label: string; note?: string }> = {
  jossMain: { label: "Joss & Main" },
  allModern: { label: "AllModern" },
  birchLane: { label: "Birch Lane" },
};

// Placeholder ranges – update with live data when ready
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

// ---------------------- UTILITIES ---------------------- //

type TierKey = "good" | "better" | "best" | "custom";

const TIER_LABEL: Record<TierKey, string> = {
  good: "Good",
  better: "Better",
  best: "Best",
  custom: "Custom",
};

function bandForTier(range: Range, tier: TierKey): number {
  const { min, max } = range;
  if (tier === "good") return min;
  if (tier === "best") return max;
  if (tier === "better") return Math.round(min + (max - min) * 0.55);
  // custom handled elsewhere
  return Math.round((min + max) / 2);
}

const currency = (n: number) => n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });

// ---------------------- COMPONENT ---------------------- //

export default function BudgetCalculator() {
  const [brand, setBrand] = useState<BrandKey>("jossMain");
  const [roomKey, setRoomKey] = useState<string>(ROOMS[0].key);
  const [tier, setTier] = useState<TierKey>("better");
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [enabledItems, setEnabledItems] = useState<Record<string, boolean>>({});
  const [customPrices, setCustomPrices] = useState<Record<string, number>>({});

  // Add-ons & global controls
  const [taxRate, setTaxRate] = useState<number>(6.25);
  const [promo, setPromo] = useState<number>(0); // flat $ discount
  const [contingencyPct, setContingencyPct] = useState<number>(10);
  const [deliveryPct, setDeliveryPct] = useState<number>(3); // % of merchandise
  const [whiteGlove, setWhiteGlove] = useState<boolean>(false);
  const [assemblyPct, setAssemblyPct] = useState<number>(0); // % of merchandise
  const [protectionPct, setProtectionPct] = useState<number>(0); // % of merchandise

  const room = useMemo(() => ROOMS.find(r => r.key === roomKey)!, [roomKey]);

  // Initialize defaults on room or brand change
  React.useEffect(() => {
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

  const addOns = useMemo(() => {
    const delivery = Math.round(merchandise * (whiteGlove ? Math.max(0.06, deliveryPct / 100) : deliveryPct / 100));
    const assembly = Math.round(merchandise * (assemblyPct / 100));
    const protection = Math.round(merchandise * (protectionPct / 100));
    const sub = merchandise + delivery + assembly + protection - promo;
    const tax = Math.round(sub * (taxRate / 100));
    const contingency = Math.round(sub * (contingencyPct / 100));
    const total = sub + tax + contingency;
    return { delivery, assembly, protection, tax, contingency, sub, total };
  }, [merchandise, deliveryPct, whiteGlove, assemblyPct, protectionPct, promo, taxRate, contingencyPct]);

  const reset = () => {
    setTier("better");
    setPromo(0);
    setTaxRate(6.25);
    setContingencyPct(10);
    setDeliveryPct(3);
    setWhiteGlove(false);
    setAssemblyPct(0);
    setProtectionPct(0);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <motion.h1 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-semibold mb-2">
        Client Budget Calculator — Wayfair Specialty Brands
      </motion.h1>
      <p className="text-sm text-muted-foreground mb-6">Select a brand, room, and tier. Adjust quantities, toggle line items, or switch to Custom to input exact unit prices. All ranges are editable in the config.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="col-span-1">
          <CardContent className="p-4 space-y-4">
            <div>
              <Label className="mb-1 block">Brand</Label>
              <Select value={brand} onValueChange={(v: BrandKey) => setBrand(v)}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Select brand" /></SelectTrigger>
                <SelectContent>
                  {Object.entries(BRANDS).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1 block">Room</Label>
              <Select value={roomKey} onValueChange={setRoomKey}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Select room" /></SelectTrigger>
                <SelectContent>
                  {ROOMS.map(r => (
                    <SelectItem key={r.key} value={r.key}>{r.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-2 block">Tier</Label>
              <Tabs value={tier} onValueChange={(v) => setTier(v as TierKey)}>
                <TabsList className="grid grid-cols-4">
                  {Object.entries(TIER_LABEL).map(([k, label]) => (
                    <TabsTrigger key={k} value={k}>{label}</TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
              {tier === "custom" && (
                <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1"><Info className="w-3 h-3"/> Enter per-line exact unit prices in the table.</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 md:col-span-2">
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-medium">Line Items</h2>
              <Button variant="ghost" size="sm" onClick={reset} className="gap-2"><RefreshCw className="w-4 h-4"/> Reset</Button>
            </div>

            <div className="overflow-auto rounded-2xl border">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="bg-muted/40 text-left">
                    <th className="p-3">Include</th>
                    <th className="p-3">Item</th>
                    <th className="p-3">Range ({BRANDS[brand].label})</th>
                    <th className="p-3">Unit ({tier === "custom" ? "Custom" : TIER_LABEL[tier]})</th>
                    <th className="p-3">Qty</th>
                    <th className="p-3 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {lines.map((l) => (
                    <tr key={l.key} className="border-t">
                      <td className="p-3 align-middle">
                        <Checkbox
                          checked={!!enabledItems[l.key]}
                          onCheckedChange={(v) => setEnabledItems(s => ({ ...s, [l.key]: !!v }))}
                        />
                      </td>
                      <td className="p-3 align-middle">{l.label}</td>
                      <td className="p-3 align-middle">{currency(l.range.min)} – {currency(l.range.max)}</td>
                      <td className="p-3 align-middle">
                        {tier === "custom" ? (
                          <Input
                            inputMode="numeric"
                            value={customPrices[l.key] ?? ("" as any)}
                            placeholder={String(l.unit)}
                            onChange={(e) => setCustomPrices(s => ({ ...s, [l.key]: Number(e.target.value || 0) }))}
                            className="w-28"
                          />
                        ) : (
                          <div className="w-28">{currency(l.unit)}</div>
                        )}
                      </td>
                      <td className="p-3 align-middle">
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="icon" onClick={() => setQuantities(s => ({ ...s, [l.key]: Math.max(0, (s[l.key] ?? 0) - 1) }))}><Minus className="w-4 h-4"/></Button>
                          <Input
                            inputMode="numeric"
                            value={quantities[l.key] ?? 0}
                            onChange={(e) => setQuantities(s => ({ ...s, [l.key]: Math.max(0, Number(e.target.value || 0)) }))}
                            className="w-16 text-center"
                          />
                          <Button variant="outline" size="icon" onClick={() => setQuantities(s => ({ ...s, [l.key]: (s[l.key] ?? 0) + 1 }))}><Plus className="w-4 h-4"/></Button>
                        </div>
                      </td>
                      <td className="p-3 align-middle text-right">{currency(l.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 space-y-4">
            <h3 className="font-medium">Add‑Ons</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Delivery %</Label>
                <div className="flex items-center gap-2">
                  <Slider value={[deliveryPct]} onValueChange={(v) => setDeliveryPct(v[0])} max={10} step={0.5}/>
                  <div className="w-12 text-right text-sm">{deliveryPct}%</div>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <Checkbox checked={whiteGlove} onCheckedChange={v => setWhiteGlove(!!v)} />
                  <span className="text-xs text-muted-foreground">White glove (min 6%)</span>
                </div>
              </div>
              <div>
                <Label>Assembly %</Label>
                <div className="flex items-center gap-2">
                  <Slider value={[assemblyPct]} onValueChange={(v) => setAssemblyPct(v[0])} max={20} step={1}/>
                  <div className="w-12 text-right text-sm">{assemblyPct}%</div>
                </div>
              </div>
              <div>
                <Label>Protection Plan %</Label>
                <div className="flex items-center gap-2">
                  <Slider value={[protectionPct]} onValueChange={(v) => setProtectionPct(v[0])} max={15} step={0.5}/>
                  <div className="w-12 text-right text-sm">{protectionPct}%</div>
                </div>
              </div>
              <div>
                <Label>Promo ($)</Label>
                <Input inputMode="numeric" value={promo} onChange={(e) => setPromo(Number(e.target.value || 0))} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-4">
            <h3 className="font-medium">Taxes & Contingency</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Tax Rate</Label>
                <div className="flex items-center gap-2">
                  <Slider value={[taxRate]} onValueChange={(v) => setTaxRate(v[0])} max={12} step={0.25}/>
                  <div className="w-16 text-right text-sm">{taxRate}%</div>
                </div>
              </div>
              <div>
                <Label>Contingency</Label>
                <div className="flex items-center gap-2">
                  <Slider value={[contingencyPct]} onValueChange={(v) => setContingencyPct(v[0])} max={25} step={1}/>
                  <div className="w-16 text-right text-sm">{contingencyPct}%</div>
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Use contingency to cover freight variability, backorder swaps, last‑mile fees, or styling add‑ons.</p>
          </CardContent>
        </Card>

        <TotalsCard merchandise={merchandise} addOns={addOns} />
      </div>
    </div>
  );
}

function TotalsCard({ merchandise, addOns }: { merchandise: number; addOns: { delivery: number; assembly: number; protection: number; tax: number; contingency: number; sub: number; total: number; } }) {
  return (
    <Card className="bg-gradient-to-b from-background to-muted/30">
      <CardContent className="p-4 space-y-3">
        <h3 className="font-medium">Totals</h3>
        <div className="grid grid-cols-2 text-sm gap-y-1">
          <div>Merchandise</div><div className="text-right font-medium">{currency(merchandise)}</div>
          <div>Delivery</div><div className="text-right">{currency(addOns.delivery)}</div>
          <div>Assembly</div><div className="text-right">{currency(addOns.assembly)}</div>
          <div>Protection Plan</div><div className="text-right">{currency(addOns.protection)}</div>
          <div>Promo</div><div className="text-right">-{currency(Math.max(0, addOns.sub - merchandise - addOns.delivery - addOns.assembly - addOns.protection))}</div>
          <div>Tax</div><div className="text-right">{currency(addOns.tax)}</div>
          <div>Contingency</div><div className="text-right">{currency(addOns.contingency)}</div>
          <div className="col-span-2 border-t my-1" />
          <div className="text-base">Client Budget Target</div><div className="text-right text-base font-semibold">{currency(addOns.total)}</div>
        </div>
        <p className="text-xs text-muted-foreground">Adjust line items, tiers, and controls to meet your client’s target budget. Share a screenshot or export values to a deck.</p>
      </CardContent>
    </Card>
  );
}
