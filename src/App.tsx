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
