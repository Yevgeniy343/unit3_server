// modbusControls.js
import client from "../modbusClient.js";
import { modbusQ } from "../modbusQueue.js";
import { REG } from "../registerMap.js";

function registersToFloatLH(lo, hi) {
  const buf = Buffer.allocUnsafe(4);
  buf.writeUInt16BE(hi, 0);
  buf.writeUInt16BE(lo, 2);
  return buf.readFloatBE(0);
}

function floatToRegistersLH(value) {
  const buf = Buffer.allocUnsafe(4);
  buf.writeFloatBE(value, 0);
  return [buf.readUInt16BE(2), buf.readUInt16BE(0)];
}

function registersToInt32LH(lo, hi) {
  const buf = Buffer.allocUnsafe(4);

  buf.writeUInt16BE(hi, 0);
  buf.writeUInt16BE(lo, 2);

  return buf.readInt32BE(0);
}

/* ================== INPUT ================== */
export async function getAin0() {
  const { data } = await modbusQ.run(
    () => client.readInputRegisters(REG.INPUT.AIN0, 2),
    { label: "getAin0" },
  );
  return registersToFloatLH(data[0], data[1]);
}

export async function getAin2() {
  const { data } = await modbusQ.run(
    () => client.readInputRegisters(REG.INPUT.AIN2, 2),
    { label: "getAin2" },
  );
  return registersToFloatLH(data[0], data[1]);
}

export async function getAin4() {
  const { data } = await modbusQ.run(
    () => client.readInputRegisters(REG.INPUT.AIN4, 2),
    { label: "getAin4" },
  );
  return registersToFloatLH(data[0], data[1]);
}

export async function getAin6() {
  const { data } = await modbusQ.run(
    () => client.registersToInt32LH(REG.INPUT.AIN6, 2),
    { label: "getAin6" },
  );
  return registersToFloatLH(data[0], data[1]);
}

export async function getAin8() {
  const { data } = await modbusQ.run(
    () => client.readInputRegisters(REG.INPUT.AIN8, 2),
    { label: "getAin8" },
  );
  return registersToFloatLH(data[0], data[1]);
}

/* ================== COIL ================== */
export async function setHeatEnable(state) {
  console.log("setHeatEnable", state);

  await modbusQ.run(() => client.writeCoil(REG.COIL.HEAT_ENABLE, state), {
    label: "setHeatEnable",
  });
  console.log(`setHeatEnable  ${state}`);
  return state;
}

export async function setGraterEnable(state) {
  console.log("setGraterEnable", state);

  await modbusQ.run(() => client.writeCoil(REG.COIL.GRATER_ENABLE, state), {
    label: "setGraterEnable",
  });
  console.log(`setGraterEnable  ${state}`);
  return state;
}

export async function setHumEnable(state) {
  console.log("setHumEnable", state);

  await modbusQ.run(() => client.writeCoil(REG.COIL.HUM_ENABLE, state), {
    label: "setHumEnable",
  });
  console.log(`setHumEnable  ${state}`);
  return state;
}

/* ================== HOLDING ================== */
export async function setStrokeLength(value) {
  console.log("setStrokeLength", value);

  const [lo, hi] = floatToRegistersLH(value);
  await modbusQ.run(
    () => client.writeRegisters(REG.HOLDING.STROKE_LENGTH, [lo, hi]),
    { label: "setStrokeLength" },
  );
  console.log(`setStrokeLength updated to ${value}`);
  return value;
}
