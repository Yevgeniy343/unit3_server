// modbusControls.js
import client from "../modbusClient.js";
import { modbusQ } from "../modbusQueue.js";
import { REG } from "../registerMap.js";

/* ================== INPUT ================== */
export async function getAin0() {
  const { data } = await modbusQ.run(
    () => client.readInputRegisters(REG.INPUT.AIN0, 1),
    { label: "getAin0" },
  );
  return data[0];
}

export async function getAin2() {
  const { data } = await modbusQ.run(
    () => client.readInputRegisters(REG.INPUT.AIN2, 1),
    { label: "getAin2" },
  );
  return data[0];
}

export async function getAin4() {
  const { data } = await modbusQ.run(
    () => client.readInputRegisters(REG.INPUT.AIN4, 1),
    { label: "getAin4" },
  );
  return data[0];
}
