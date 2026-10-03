const express = require("express");
const cors = require("cors");
const fetch = require("cross-fetch");

const app = express();
app.use(cors({
  origin: "*"
}));
app.use(express.json());

app.get("/health", (req, res) => res.json({ ok: true }));
app.get("/debug", (req, res) => res.json({ 
  google_key: process.env.GOOGLE_KEY ? process.env.GOOGLE_KEY.slice(0,10)+"..." : "NAO DEFINIDA"
}));

const GOOGLE_KEY = process.env.GOOGLE_KEY;
const GEMINI_KEY = process.env.GEMINI_KEY;

// Busca de lugares
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

// Proxy de fotos
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

// Score Gemini
app.post("/api/gemini/score", async (req, res) => {
  try
