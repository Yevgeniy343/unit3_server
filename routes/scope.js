import express from "express";

const router = express.Router();

router.post("/capture", (req, res) => {
  console.log("Получены данные");

  console.log(req.body.length);

  console.log(req.body.slice(0, 20));

  res.sendStatus(200);
});

export default router;
