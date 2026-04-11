/**
 * Вычисление визуальной ширины корешка книги.
 *
 * Ширина пропорциональна количеству страниц: толстая книга = широкий корешок.
 * Если pageCount не известен — используем среднюю ширину.
 *
 * Диапазоны заданы эмпирически для приятного визуального баланса на полке.
 */

/** Минимальная и максимальная ширина корешка в пикселях */
const SPINE_WIDTH_MIN = 20;
const SPINE_WIDTH_MAX = 56;

/** Пороговые значения количества страниц */
const PAGE_THIN = 100; // до 100 стр — тонкая
const PAGE_MEDIUM = 300; // 100–300 стр — средняя
// свыше 300 стр — толстая

/** Ширина корешка по умолчанию (если pageCount неизвестен) */
export const SPINE_WIDTH_DEFAULT = 32;

/**
 * Возвращает ширину корешка книги в пикселях.
 *
 * @param pageCount - количество страниц (null если неизвестно)
 * @returns ширина в пикселях
 */
export function getSpineWidth(pageCount: number | null | undefined): number {
  if (!pageCount || pageCount <= 0) {
    return SPINE_WIDTH_DEFAULT;
  }

  if (pageCount < PAGE_THIN) {
    // Тонкая: 20–28px
    return Math.round(SPINE_WIDTH_MIN + (pageCount / PAGE_THIN) * 8);
  }

  if (pageCount < PAGE_MEDIUM) {
    // Средняя: 28–40px
    const ratio = (pageCount - PAGE_THIN) / (PAGE_MEDIUM - PAGE_THIN);
    return Math.round(28 + ratio * 12);
  }

  // Толстая: 40–56px, но не больше максимума
  const ratio = Math.min((pageCount - PAGE_MEDIUM) / 400, 1); // насыщается на ~700 стр
  return Math.round(40 + ratio * (SPINE_WIDTH_MAX - 40));
}
