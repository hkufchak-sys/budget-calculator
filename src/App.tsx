import { useState } from "react";

export default function App() {
  const [brand, setBrand] = useState("Joss & Main");
  const [room, setRoom] = useState("Living Room");
  const [tier, setTier] = useState("Better");
  const [budget, setBudget] = useState(0);

  return (
    <div
      style={{
        fontFamily: "sans-serif",
        maxWidth: 600,
        margin: "2rem auto",
        padding: "2rem",
        background: "white",
        borderRadius: "1rem",
        boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
      }}
    >
      <h1 style={{ textAlign: "center" }}>
        Wayfair Specialty Brands Budget Calculator
      </h1>

      <div style={{ marginTop: "2rem" }}>
        <label style={{ display: "block", marginBottom: "0.5rem" }}>
          Brand
        </label>
        <select
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          style={{ width: "100%", padding: "0.5rem" }}
        >
          <option>Joss & Main</option>
          <option>AllModern</option>
          <option>Birch Lane</option>
        </select>
      </div>

      <div style={{ marginTop: "1rem" }}>
        <label style={{ display: "block", marginBottom: "0.5rem" }}>
          Room
        </label>
        <select
          value={room}
          onChange={(e) => setRoom(e.target.value)}
          style={{ width: "100%", padding: "0.5rem" }}
        >
          <option>Living Room</option>
          <option>Bedroom</option>
          <option>Dining Room</option>
          <option>Home Office</option>
        </select>
      </div>

      <div style={{ marginTop: "1rem" }}>
        <label style={{ display: "block", marginBottom: "0.5rem" }}>
          Tier
        </label>
        <select
          value={tier}
          onChange={(e) => setTier(e.target.value)}
          style={{ width: "100%", padding: "0.5rem" }}
        >
          <option>Good</option>
          <option>Better</option>
          <option>Best</option>
        </select>
      </div>

      <div style={{ marginTop: "1rem" }}>
        <label style={{ display: "block", marginBottom: "0.5rem" }}>
          Estimated Budget ($)
        </label>
        <input
          type="number"
          value={budget}
          onChange={(e) => setBudget(Number(e.target.value))}
          style={{ width: "100%", padding: "0.5rem" }}
        />
      </div>

      <div
        style={{
          marginTop: "2rem",
          padding: "1rem",
          background: "#f6f6f6",
          borderRadius: "0.5rem",
        }}
      >
        <p>
          <strong>Brand:</strong> {brand}
          <br />
          <strong>Room:</strong> {room}
          <br />
          <strong>Tier:</strong> {tier}
          <br />
          <strong>Estimated Budget:</strong> $
          {budget.toLocaleString(undefined, {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
          })}
        </p>
      </div>

      <p style={{ marginTop: "2rem", color: "#666", fontSize: "0.9rem" }}>
        💡 Tip: Share this page with your clients or team to scope budgets by
        brand and room type. You can expand this later to include detailed
        product categories.
      </p>
    </div>
  );
}
