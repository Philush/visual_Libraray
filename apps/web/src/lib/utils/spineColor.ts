/**
 * Детерминированная генерация цвета корешка книги.
 *
 * Если пользователь не указал цвет вручную — генерируем его из названия и автора.
 * Детерминированность важна: один и тот же ввод всегда даёт один и тот же цвет,
 * что исключает "мерцание" при ре-рендерах.
 *
 * Алгоритм: djb2 hash → HSL с фиксированной насыщенностью и светлотой
 * (чтобы цвета выглядели как реальные корешки книг — не слишком яркие).
 */

/**
 * Простой djb2 хэш строки → число.
 */
function hashString(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 33) ^ str.charCodeAt(i);
  }
  // Приводим к положительному числу
  return hash >>> 0;
}

/**
 * Генерирует HEX-цвет корешка из названия и автора книги.
 *
 * @param title - название книги
 * @param author - автор книги
 * @returns HEX строка вида '#RRGGBB'
 */
export function generateSpineColor(title: string, author: string): string {
  const seed = `${title}::${author}`;
  const hash = hashString(seed);

  // Используем hue (0-360) из хэша
  const hue = hash % 360;

  // Фиксированные saturation и lightness — тона "книжных" корешков
  const saturation = 35 + (hash % 30); // 35–65%
  const lightness = 35 + (hash % 25); // 35–60%

  return hslToHex(hue, saturation, lightness);
}

/**
 * Конвертирует HSL в HEX.
 */
function hslToHex(h: number, s: number, l: number): string {
  const sNorm = s / 100;
  const lNorm = l / 100;

  const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = lNorm - c / 2;

  let r = 0,
    g = 0,
    b = 0;

  if (h < 60) {
    [r, g, b] = [c, x, 0];
  } else if (h < 120) {
    [r, g, b] = [x, c, 0];
  } else if (h < 180) {
    [r, g, b] = [0, c, x];
  } else if (h < 240) {
    [r, g, b] = [0, x, c];
  } else if (h < 300) {
    [r, g, b] = [x, 0, c];
  } else {
    [r, g, b] = [c, 0, x];
  }

  const toHex = (n: number) =>
    Math.round((n + m) * 255)
      .toString(16)
      .padStart(2, '0');

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
