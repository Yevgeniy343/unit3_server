// captureStore.js

const USE_CAPTURE_MOCK = true;

let lastFrame = null;
let source = "none";

function createMockFrame() {
  const frame = new Array(16384);

  const mockCh1 = 150;
  const mockCh2 = 130;

  // Формат кадра:
  // CH1, CH2, CH1, CH2...
  for (let i = 0; i < frame.length; i += 2) {
    frame[i] = mockCh1;
    frame[i + 1] = mockCh2;
  }

  return frame;
}

if (USE_CAPTURE_MOCK) {
  lastFrame = createMockFrame();
  source = "mock";
}

/**
 * Сохраняет последний кадр осциллографа.
 *
 * Ожидаемый формат:
 * [CH1, CH2, CH1, CH2, ...]
 */
export function setCaptureFrame(frame) {
  if (!Array.isArray(frame)) {
    throw new Error("Кадр осциллографа должен быть массивом");
  }

  if (frame.length < 2) {
    throw new Error("Кадр осциллографа пуст");
  }

  lastFrame = frame;
  source = "capture";
}

/**
 * Возвращает простые значения последнего кадра.
 *
 * Пока без графика и без передачи всего массива во Flutter.
 */
export function getCaptureValues() {
  if (!lastFrame || lastFrame.length < 2) {
    return {
      available: false,
      source,
      ch1: null,
      ch2: null,
      sampleCount: 0,
    };
  }

  // Берём последнюю полную пару CH1/CH2.
  const lastPairIndex =
    lastFrame.length % 2 === 0 ? lastFrame.length - 2 : lastFrame.length - 3;

  return {
    available: true,
    source,
    ch1: lastFrame[lastPairIndex],
    ch2: lastFrame[lastPairIndex + 1],

    // Одна выборка состоит из CH1 и CH2.
    sampleCount: Math.floor(lastFrame.length / 2),
  };
}
