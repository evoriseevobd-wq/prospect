const express = require("express");
const cors = require("cors");
const fetch = require("cross-fetch");

const app = express();
app.use(cors({ origin: "*" }));
app.use(express.json());

app.get("/health", (req, res) => res.json({ ok: true }));

const GOOGLE_KEY = process.env.GOOGLE_KEY;
const GEMINI_KEY = process.env.GEMINI_KEY;

app.post("/api/places/search", async (req, res) => {
  try {
    const response = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": GOOGLE_KEY,
        "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.rating,places.userRatingCount,places.regularOpeningHours,places.currentOpeningHours,places.photos,nextPageToken"
      },
      body: JSON.stringify(req.body)
    });
    const data = await response.json();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/places/photo", async (req, res) => {
  try {
    const { name } = req.query;
    const url = `https://places.googleapis.com/v1/${name}/media?maxWidthPx=800&key=${GOOGLE_KEY}&skipHttpRedirect=true`;
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/gemini/score", async (req, res) => {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req.body)
      }
    );
    const data = await response.json();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, "0.0.0.0", () => console.log(`Servidor rodando na porta ${PORT}`));

process.on("SIGTERM", () => {
  server.close(() => process.exit(0));
});
