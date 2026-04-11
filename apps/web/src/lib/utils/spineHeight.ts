/**
 * Вычисление визуальной высоты корешка книги.
 *
 * Реальные книжные полки выглядят живее когда книги немного различаются
 * по высоте. Небольшая детерминированная вариация (±12%) создаёт этот эффект
 * без потери предсказуемости — один и тот же title всегда даёт одну и ту же высоту.
 */

/** Базовая высота корешка книги в пикселях */
export const SPINE_HEIGHT_BASE = 110;

/** Диапазон вариации высоты (±px от базовой) */
const VARIATION = 13;

/**
 * Возвращает высоту корешка книги в пикселях.
 * Небольшая вариация делает полку визуально живой.
 *
 * @param title - название книги (используется как seed для детерминизма)
 * @returns высота в пикселях
 */
export function getSpineHeight(title: string): number {
  // Простой хэш из первых символов названия
  let hash = 0;
  for (let i = 0; i < Math.min(title.length, 8); i++) {
    hash = (hash * 31 + title.charCodeAt(i)) >>> 0;
  }

  // Вариация от -VARIATION до +VARIATION
  const variation = ((hash % (VARIATION * 2 + 1)) - VARIATION);
  return SPINE_HEIGHT_BASE + variation;
}
