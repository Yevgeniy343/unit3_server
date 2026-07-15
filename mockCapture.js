const POINTS_PER_CHANNEL = 8192;
const FRAME_SIZE = POINTS_PER_CHANNEL * 2;

const clampByte = (value) => {
  return Math.max(0, Math.min(255, Math.round(value)));
};

/**
 * Создаёт кадр в формате реального C++:
 *
 * CH1, CH2, CH1, CH2...
 *
 * CH1 имитирует один крупный прямоугольный импульс
 * на протяжении всего кадра.
 *
 * CH2 почти ровный, с небольшим шумом.
 */
export const createMockFrame = (frameNumber = 0) => {
  const frame = Buffer.allocUnsafe(FRAME_SIZE);

  // Небольшое движение импульса между кадрами.
  const shift = Math.round(Math.sin(frameNumber * 0.04) * 120);

  const riseStart = 900 + shift;
  const highEnd = 4900 + shift;

  for (let point = 0; point < POINTS_PER_CHANNEL; point++) {
    let ch1Base;

    // Основная форма CH1:
    // низкий уровень -> высокий уровень -> низкий уровень.
    if (point < riseStart) {
      ch1Base = 135;
    } else if (point < highEnd) {
      ch1Base = 187;
    } else {
      ch1Base = 135;
    }

    // Небольшой шум реального АЦП.
    const ch1Noise = (Math.random() - 0.5) * 2;

    const ch2Noise = (Math.random() - 0.5) * 3;

    const ch1 = clampByte(ch1Base + ch1Noise);

    // Второй канал у нас был примерно в районе 130–131.
    const ch2 = clampByte(131 + ch2Noise);

    const byteIndex = point * 2;

    frame[byteIndex] = ch1;
    frame[byteIndex + 1] = ch2;
  }

  // Добавляем несколько переходных значений,
  // похожих на реальные первые точки Hantek.
  const transient = [187, 187, 187, 175, 191, 127, 141, 134];

  for (let point = 0; point < transient.length; point++) {
    frame[point * 2] = transient[point];
  }

  return frame;
};
