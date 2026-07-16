import express from "express";
import {
  getAin0,
  setHeatEnable,
  setHumEnable,
} from "../controllers/modbusControls.js";

const router = express.Router();

router.post("/heat", async (req, res) => {
  console.log("heat rout", req.body);
  try {
    const value = await setHeatEnable(Boolean(req.body.state));
    res.json({ ok: true, value });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

router.post("/hum", async (req, res) => {
  console.log("hum rout", req.body);
  try {
    const value = await setHumEnable(Boolean(req.body.state));
    res.json({ ok: true, value });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

router.get("/ain0", async (req, res) => {
  try {
    const value = await getAin0();

    res.json({
      ok: true,
      value,
    });
  } catch (err) {
    res.status(500).json({
      ok: false,
      error: err.message,
    });
  }
});

export default router;
