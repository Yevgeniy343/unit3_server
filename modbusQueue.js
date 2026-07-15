// modbusQueue.js
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

class ModbusQueue {
  _chain = Promise.resolve();

  /**
   * Сериализует вызовы к Modbus.
   * - retries: число повторов при ошибке/таймауте
   * - timeoutMs: таймаут на ОДНУ операцию (не меньше client.setTimeout)
   * - gapMs: пауза между кадрами (для RS-485 авто-DE и т.п.)
   */
  run(fn, { label = "op", retries = 2, timeoutMs = 1000, gapMs = 20 } = {}) {
    const exec = async () => {
      let lastErr;
      for (let i = 0; i <= retries; i++) {
        try {
          // таймаут на саму операцию
          const res = await Promise.race([
            fn(),
            new Promise((_, rej) =>
              setTimeout(
                () => rej(new Error(`${label} timeout after ${timeoutMs}ms`)),
                timeoutMs,
              ),
            ),
          ]);
          await sleep(gapMs);
          return res;
        } catch (e) {
          lastErr = e;
          if (i < retries) await sleep(200 * (i + 1)); // небольшой backoff
        }
      }
      throw lastErr;
    };

    // Встраиваем задачу в цепочку (и не рвём её ошибками)
    const job = this._chain.then(exec, exec);
    this._chain = job.catch(() => {});
    return job;
  }
}

export const modbusQ = new ModbusQueue();
