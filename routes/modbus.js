import express from "express";
import { getAin0 } from "../controllers/modbusControls.js";

const router = express.Router();

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
