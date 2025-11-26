import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { printThermal } from "./thermalDriver.js";

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: "2mb" }));

// Thermal print endpoint
app.post("/print-thermal", async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: "Missing content" });

    await printThermal(content);
    return res.json({ success: true });
  } catch (err) {
    console.error("PRINT ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
});

app.listen(8089, () => {
  console.log("🖨 Printer server running on http://localhost:8089");
});
