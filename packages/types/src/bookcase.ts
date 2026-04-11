/**
 * Типы для книжных шкафов и полок.
 * Используются и на фронтенде, и на бэкенде.
 */

/** Полка внутри шкафа */
export interface Shelf {
  id: string;
  bookcaseId: string;
  position: number;
  label: string | null;
  createdAt: string;
}

/** Книжный шкаф */
export interface Bookcase {
  id: string;
  name: string;
  description: string | null;
  shelves?: Shelf[];
  createdAt: string;
  updatedAt: string;
}

/** Шкаф в списке (с агрегированными счётчиками) */
export interface BookcaseListItem {
  id: string;
  name: string;
  description: string | null;
  shelvesCount: number;
  booksCount: number;
  createdAt: string;
  updatedAt: string;
}

/** Шкаф с полками и книгами (для страницы визуализации) */
export interface BookcaseWithShelves extends Bookcase {
  shelves: ShelfWithBooks[];
}

/** Полка с книгами */
export interface ShelfWithBooks extends Shelf {
  books: BookPlacementWithBook[];
}

/** Размещение книги на полке (включает данные книги) */
export interface BookPlacementWithBook {
  id: string;
  bookId: string;
  shelfId: string;
  position: number;
  book: BookSpineData;
  createdAt: string;
  updatedAt: string;
}

/** Минимальные данные книги для рендера корешка */
export interface BookSpineData {
  id: string;
  title: string;
  author: string;
  pageCount: number | null;
  spineColor: string | null;
  coverUrl: string | null;
  genre: string | null;
}
