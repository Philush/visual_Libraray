'use client';

/**
 * Модал редактирования книги.
 * Открывается кликом по строке книги в BooksPage.
 * Позволяет изменить все поля, а также удалить книгу.
 *
 * Связанные фичи: F-02
 */

import { useState, useEffect, useRef } from 'react';
import { Trash2, ImagePlus, X } from 'lucide-react';
import { Modal, Button, Input, Textarea, StarRating, AutocompleteInput } from '@/components/ui';
import { useUpdateBook, useDeleteBook, useBookAuthors, useBookGenres } from '@/hooks/useBooks';
import { generateSpineColor } from '@/lib/utils/spineColor';
import { uploadBookCover } from '@/lib/api/books';
import { toast } from 'sonner';
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
  const [rating, setRating] = useState(0);
  const [coverUrl, setCoverUrl] = useState('');
  const [coverPreview, setCoverPreview] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmDelete, setConfirmDelete] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const { mutate: updateBook, isPending: isUpdating } = useUpdateBook(book?.id ?? '');
  const { mutate: deleteBook, isPending: isDeleting } = useDeleteBook();
  const { data: authors = [] } = useBookAuthors();
  const { data: genres = [] } = useBookGenres();

  useEffect(() => {
    if (book) {
      setTitle(book.title);
      setAuthor(book.author);
      setIsbn(book.isbn ?? '');
      setPageCount(book.pageCount ? String(book.pageCount) : '');
      setGenre(book.genre ?? '');
      setPublishYear(book.publishYear ? String(book.publishYear) : '');
      setNotes(book.notes ?? '');
      setRating(book.rating ?? 0);
      setCoverUrl(book.coverUrl ?? '');
      setCoverPreview(book.coverUrl ?? '');
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

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCoverPreview(URL.createObjectURL(file));
    setIsUploading(true);
    try {
      const result = await uploadBookCover(file);
      setCoverUrl(result.coverUrl);
    } catch {
      toast.error('Не удалось загрузить обложку');
      setCoverPreview(book?.coverUrl ?? '');
    } finally {
      setIsUploading(false);
    }
  };

  const removeCover = () => {
    setCoverUrl('');
    setCoverPreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
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
        rating,
        coverUrl: coverUrl || undefined,
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
            <AutocompleteInput
              label="Автор"
              value={author}
              onChange={(v) => { setAuthor(v); setErrors(prev => ({ ...prev, author: '' })); }}
              suggestions={authors}
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

          <AutocompleteInput
            label="Жанр"
            value={genre}
            onChange={setGenre}
            suggestions={genres}
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

        {/* Рейтинг */}
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-gray-700">Рейтинг</span>
          <StarRating value={rating} onChange={setRating} />
        </div>

        {/* Обложка */}
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-gray-700">Обложка</span>
          {coverPreview ? (
            <div className="relative w-20 h-28">
              <img src={coverPreview} alt="Обложка" className="w-full h-full object-cover rounded-md shadow-sm" />
              <button
                type="button"
                onClick={removeCover}
                className="absolute -top-1.5 -right-1.5 bg-white border border-gray-200 rounded-full p-0.5 shadow hover:bg-gray-50"
              >
                <X className="w-3 h-3 text-gray-600" />
              </button>
              {isUploading && (
                <div className="absolute inset-0 bg-white/70 rounded-md flex items-center justify-center">
                  <span className="text-xs text-gray-500">Загрузка…</span>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex items-center gap-2 w-fit text-sm text-gray-500 hover:text-gray-700 border border-dashed border-gray-300 hover:border-gray-400 rounded-md px-3 py-2 transition-colors disabled:opacity-50"
            >
              <ImagePlus className="w-4 h-4" />
              Загрузить обложку
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleCoverChange}
          />
        </div>

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
            <Button type="button" variant="ghost" onClick={onClose} disabled={isUpdating || isUploading}>
              Отмена
            </Button>
            <Button type="submit" isLoading={isUpdating} disabled={isUploading}>
              Сохранить
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
