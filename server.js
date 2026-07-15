import express from "express";

import captureRoutes from "./routes/capture.js";
import modbusRoutes from "./routes/modbus.js";

import { startWSServer } from "./wsServer.js";

const app = express();

app.use(express.json());

app.use(captureRoutes);
app.use(modbusRoutes);

startWSServer();

app.listen(3000, () => {
  console.log("HTTP API: http://localhost:3000");
});
