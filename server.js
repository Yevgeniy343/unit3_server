// server.js
import express from "express";

const app = express();
app.use(express.json());

app.listen(3000, () => {
  console.log("HTTP API: http://localhost:3000");
});
