'use client';

/**
 * Модал редактирования книги.
 * Открывается кликом по строке книги в BooksPage.
 * Позволяет изменить все поля, а также удалить книгу.
 *
 * Связанные фичи: F-02
 */

import { useState, useEffect } from 'react';
import { Trash2 } from 'lucide-react';
import { Modal, Button, Input, Textarea } from '@/components/ui';
import { useUpdateBook, useDeleteBook } from '@/hooks/useBooks';
import { generateSpineColor } from '@/lib/utils/spineColor';
import type { BookWithPlacement } from '@visual-library/types';

interface EditBookModalProps {
  book: BookWithPlacement | null;
  onClose: () => void;
}

export function EditBookModal({ book, onClose }: EditBookModalProps) {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [isbn, setIsbn] = useState('');
  const [pageCount, setPageCount] = useState('');
  const [genre, setGenre] = useState('');
  const [publishYear, setPublishYear] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { mutate: updateBook, isPending: isUpdating } = useUpdateBook(book?.id ?? '');
  const { mutate: deleteBook, isPending: isDeleting } = useDeleteBook();

  // Заполняем форму данными книги при открытии
  useEffect(() => {
    if (book) {
      setTitle(book.title);
      setAuthor(book.author);
      setIsbn(book.isbn ?? '');
      setPageCount(book.pageCount ? String(book.pageCount) : '');
      setGenre(book.genre ?? '');
      setPublishYear(book.publishYear ? String(book.publishYear) : '');
      setNotes(book.notes ?? '');
      setErrors({});
      setConfirmDelete(false);
    }
  }, [book]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = 'Введите название';
    if (!author.trim()) newErrors.author = 'Введите автора';
    if (pageCount && (isNaN(Number(pageCount)) || Number(pageCount) < 1)) {
      newErrors.pageCount = 'Введите корректное число страниц';
    }
    if (publishYear && (isNaN(Number(publishYear)) || Number(publishYear) < 1000)) {
      newErrors.publishYear = 'Введите корректный год';
    }
    return newErrors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    updateBook(
      {
        title: title.trim(),
        author: author.trim(),
        isbn: isbn.trim() || undefined,
        pageCount: pageCount ? Number(pageCount) : undefined,
        genre: genre.trim() || undefined,
        publishYear: publishYear ? Number(publishYear) : undefined,
        notes: notes.trim() || undefined,
        spineColor: generateSpineColor(title.trim(), author.trim()),
      },
      { onSuccess: onClose },
    );
  };

  const handleDelete = () => {
    if (!book) return;
    deleteBook(book.id, { onSuccess: onClose });
  };

  return (
    <Modal isOpen={Boolean(book)} onClose={onClose} title="Редактировать книгу" className="sm:max-w-lg">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Input
              label="Название"
              value={title}
              onChange={(e) => { setTitle(e.target.value); setErrors(prev => ({ ...prev, title: '' })); }}
              error={errors.title}
              required
              autoFocus
              maxLength={500}
            />
          </div>

          <div className="sm:col-span-2">
            <Input
              label="Автор"
              value={author}
              onChange={(e) => { setAuthor(e.target.value); setErrors(prev => ({ ...prev, author: '' })); }}
              error={errors.author}
              required
              maxLength={500}
            />
          </div>

          <Input
            label="ISBN"
            value={isbn}
            onChange={(e) => setIsbn(e.target.value)}
            maxLength={20}
          />

          <Input
            label="Страниц"
            type="number"
            value={pageCount}
            onChange={(e) => { setPageCount(e.target.value); setErrors(prev => ({ ...prev, pageCount: '' })); }}
            error={errors.pageCount}
            min={1}
          />

          <Input
            label="Жанр"
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            maxLength={100}
          />

          <Input
            label="Год издания"
            type="number"
            value={publishYear}
            onChange={(e) => { setPublishYear(e.target.value); setErrors(prev => ({ ...prev, publishYear: '' })); }}
            error={errors.publishYear}
            min={1000}
            max={new Date().getFullYear()}
          />
        </div>

        <Textarea
          label="Заметки"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          maxLength={2000}
        />

        {/* Превью цвета корешка */}
        {(title || author) && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <div
              className="w-4 h-8 rounded-sm"
              style={{ backgroundColor: generateSpineColor(title, author) }}
            />
            <span>Цвет корешка пересчитается по названию и автору</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-1">
          {/* Удаление */}
          {!confirmDelete ? (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Удалить книгу
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs text-red-600">Удалить навсегда?</span>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="text-xs font-medium text-red-600 hover:text-red-800 transition-colors disabled:opacity-50"
              >
                {isDeleting ? 'Удаление…' : 'Да, удалить'}
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
              >
                Отмена
              </button>
            </div>
          )}

          <div className="flex gap-2">
            <Button type="button" variant="ghost" onClick={onClose} disabled={isUpdating}>
              Отмена
            </Button>
            <Button type="submit" isLoading={isUpdating}>
              Сохранить
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
