/**
 * Вычисляет цвет текста (белый или тёмный) для читаемости на фоне заданного цвета.
 *
 * Используется для текста на корешке книги — чтобы название было читаемым
 * на любом цвете корешка.
 *
 * Алгоритм: стандартная формула относительной яркости (luminance) по W3C.
 *
 * @param hexColor - цвет фона в формате '#RRGGBB'
 * @returns '#ffffff' (белый) или '#1a1a1a' (почти чёрный)
 */
export function getContrastColor(hexColor: string): string {
  // Безопасно парсим hex — возвращаем белый если формат невалидный
  if (!/^#[0-9A-Fa-f]{6}$/.test(hexColor)) return '#ffffff';

  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);

  // Формула относительной яркости (W3C WCAG 2.0)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Порог 0.5 — светлые фоны получают тёмный текст, тёмные — белый
  return luminance > 0.5 ? '#1a1a1a' : '#ffffff';
}

/**
 * Возвращает цвет для hover-состояния корешка (слегка светлее/ярче).
 * Используется для визуальной обратной связи при наведении.
 *
 * @param hexColor - исходный цвет корешка
 * @returns hex цвет светлее на ~15%
 */
export function getLighterColor(hexColor: string): string {
  if (!/^#[0-9A-Fa-f]{6}$/.test(hexColor)) return hexColor;

  const clamp = (n: number) => Math.min(255, Math.round(n));
  const factor = 1.15;

  const r = clamp(parseInt(hexColor.slice(1, 3), 16) * factor);
  const g = clamp(parseInt(hexColor.slice(3, 5), 16) * factor);
  const b = clamp(parseInt(hexColor.slice(5, 7), 16) * factor);

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}
