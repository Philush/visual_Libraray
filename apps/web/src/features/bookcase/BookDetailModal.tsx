'use client';

/**
 * Модалка деталей книги, открываемая кликом по корешку на полке.
 *
 * Шапка (обложка/цвет, название, автор) отображается сразу из placement.book.
 * Детали (isbn, notes, рейтинг и т.д.) подгружаются через useBook(id).
 *
 * Действия:
 * - "Редактировать" → открывает EditBookModal
 * - "Убрать с полки" → вызывает useDeletePlacement и закрывает модалку
 *
 * Связанные фичи: F-02, F-04
 */

import { useState } from 'react';
import { Pencil, BookOpen, Hash, Calendar, Tag, FileText, BookmarkX } from 'lucide-react';
import { Modal, Button, Spinner, StarRating } from '@/components/ui';
import { EditBookModal } from '@/features/books/EditBookModal';
import { useBook } from '@/hooks/useBooks';
import { useDeletePlacement } from '@/hooks/usePlacements';
import { generateSpineColor } from '@/lib/utils/spineColor';
import type { BookPlacementWithBook } from '@visual-library/types';

interface BookDetailModalProps {
  placement: BookPlacementWithBook;
  bookcaseId: string;
  shelfPosition: number;
  shelfLabel: string | null;
  onClose: () => void;
}

export function BookDetailModal({
  placement,
  bookcaseId,
  shelfPosition,
  shelfLabel,
  onClose,
}: BookDetailModalProps) {
  const [editOpen, setEditOpen] = useState(false);

  const { data: book, isLoading } = useBook(placement.book.id);
  const { mutate: removePlacement, isPending: isRemoving } = useDeletePlacement(bookcaseId);

  const spineColor = placement.book.spineColor ?? generateSpineColor(placement.book.title, placement.book.author);
  const shelfName = shelfLabel ?? `Полка ${shelfPosition}`;

  const handleRemove = () => {
    removePlacement(placement.id, { onSuccess: onClose });
  };

  return (
    <>
      <Modal
        isOpen={true}
        onClose={onClose}
        title=""
        className="sm:max-w-md"
      >
        <div className="flex flex-col gap-5">
          {/* Шапка: обложка (или цвет корешка) + название + автор.
              Отображается сразу — данные есть в placement.book */}
          <div className="flex items-start gap-4">
            {placement.book.coverUrl ? (
              <img
                src={placement.book.coverUrl}
                alt={placement.book.title}
                className="shrink-0 w-14 h-20 object-cover rounded-sm shadow-md"
              />
            ) : (
              <div
                className="shrink-0 rounded-sm shadow-md"
                style={{ width: '14px', height: '72px', backgroundColor: spineColor }}
              />
            )}
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-gray-900 leading-snug">
                {placement.book.title}
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">{placement.book.author}</p>
              <p className="text-xs text-amber-600 mt-1.5 flex items-center gap-1">
                <BookOpen className="w-3 h-3" />
                {shelfName}
              </p>
              {/* Рейтинг из полного объекта книги (после загрузки) */}
              {(book?.rating ?? 0) > 0 && (
                <div className="mt-2">
                  <StarRating value={book!.rating} readOnly size="sm" />
                </div>
              )}
            </div>
          </div>

          {/* Метаданные — ждём useBook */}
          {isLoading ? (
            <div className="flex justify-center py-4">
              <Spinner size="sm" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm border-t border-gray-100 pt-4">
                {book?.pageCount && (
                  <MetaRow icon={<BookOpen className="w-3.5 h-3.5" />} label="Страниц" value={String(book.pageCount)} />
                )}
                {book?.publishYear && (
                  <MetaRow icon={<Calendar className="w-3.5 h-3.5" />} label="Год" value={String(book.publishYear)} />
                )}
                {book?.genre && (
                  <MetaRow icon={<Tag className="w-3.5 h-3.5" />} label="Жанр" value={book.genre} />
                )}
                {book?.isbn && (
                  <MetaRow icon={<Hash className="w-3.5 h-3.5" />} label="ISBN" value={book.isbn} />
                )}
              </div>

              {book?.notes && (
                <div className="border-t border-gray-100 pt-3">
                  <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    Заметки
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                    {book.notes}
                  </p>
                </div>
              )}
            </>
          )}

          {/* Кнопки действий */}
          <div className="flex items-center justify-between pt-1 border-t border-gray-100">
            <button
              onClick={handleRemove}
              disabled={isRemoving}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
            >
              <BookmarkX className="w-3.5 h-3.5" />
              {isRemoving ? 'Убираем…' : 'Убрать с полки'}
            </button>

            <div className="flex gap-2">
              <Button variant="ghost" onClick={onClose}>
                Закрыть
              </Button>
              <Button
                onClick={() => setEditOpen(true)}
                className="flex items-center gap-1.5"
              >
                <Pencil className="w-3.5 h-3.5" />
                Редактировать
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      {/* EditBookModal открывается поверх — закрываем оба при успехе */}
      {book && (
        <EditBookModal
          book={editOpen ? book : null}
          onClose={() => {
            setEditOpen(false);
            onClose();
          }}
        />
      )}
    </>
  );
}

function MetaRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="flex items-center gap-1 text-[11px] text-gray-400 uppercase tracking-wide">
        {icon}
        {label}
      </span>
      <span className="text-sm text-gray-700">{value}</span>
    </div>
  );
}
