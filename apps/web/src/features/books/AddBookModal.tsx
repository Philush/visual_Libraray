'use client';

/**
 * Модал добавления новой книги.
 *
 * Форма содержит обязательные и опциональные поля.
 * Если spineColor не задан — генерируется автоматически на основе
 * title + author (детерминированно, через generateSpineColor).
 *
 * Связанные фичи: F-02
 */

import { useState, useRef } from 'react';
import { ImagePlus, X } from 'lucide-react';
import { Modal, Button, Input, Textarea, StarRating, AutocompleteInput } from '@/components/ui';
import { useCreateBook, useBookAuthors, useBookGenres } from '@/hooks/useBooks';
import { generateSpineColor } from '@/lib/utils/spineColor';
import { uploadBookCover } from '@/lib/api/books';
import { toast } from 'sonner';

interface AddBookModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddBookModal({ isOpen, onClose }: AddBookModalProps) {
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

  const fileInputRef = useRef<HTMLInputElement>(null);

  const { mutate: createBook, isPending } = useCreateBook();
  const { data: authors = [] } = useBookAuthors();
  const { data: genres = [] } = useBookGenres();

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

    // Локальный превью сразу
    setCoverPreview(URL.createObjectURL(file));

    setIsUploading(true);
    try {
      const result = await uploadBookCover(file);
      setCoverUrl(result.coverUrl);
    } catch {
      toast.error('Не удалось загрузить обложку');
      setCoverPreview('');
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

    const spineColor = generateSpineColor(title.trim(), author.trim());

    createBook(
      {
        title: title.trim(),
        author: author.trim(),
        isbn: isbn.trim() || undefined,
        pageCount: pageCount ? Number(pageCount) : undefined,
        genre: genre.trim() || undefined,
        publishYear: publishYear ? Number(publishYear) : undefined,
        notes: notes.trim() || undefined,
        spineColor,
        rating: rating || undefined,
        coverUrl: coverUrl || undefined,
      },
      { onSuccess: handleClose },
    );
  };

  const handleClose = () => {
    setTitle('');
    setAuthor('');
    setIsbn('');
    setPageCount('');
    setGenre('');
    setPublishYear('');
    setNotes('');
    setRating(0);
    setCoverUrl('');
    setCoverPreview('');
    setErrors({});
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Добавить книгу" className="sm:max-w-lg">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Input
              label="Название"
              placeholder="Мастер и Маргарита"
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
              placeholder="Михаил Булгаков"
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
            placeholder="978-5-17-090297-5"
            value={isbn}
            onChange={(e) => setIsbn(e.target.value)}
            maxLength={20}
          />

          <Input
            label="Страниц"
            type="number"
            placeholder="480"
            value={pageCount}
            onChange={(e) => { setPageCount(e.target.value); setErrors(prev => ({ ...prev, pageCount: '' })); }}
            error={errors.pageCount}
            min={1}
          />

          <AutocompleteInput
            label="Жанр"
            placeholder="Классика"
            value={genre}
            onChange={setGenre}
            suggestions={genres}
            maxLength={100}
          />

          <Input
            label="Год издания"
            type="number"
            placeholder="1967"
            value={publishYear}
            onChange={(e) => { setPublishYear(e.target.value); setErrors(prev => ({ ...prev, publishYear: '' })); }}
            error={errors.publishYear}
            min={1000}
            max={new Date().getFullYear()}
          />
        </div>

        <Textarea
          label="Заметки"
          placeholder="Личные заметки о книге…"
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
            <span>Цвет корешка будет сгенерирован автоматически</span>
          </div>
        )}

        <div className="flex gap-2 justify-end pt-1">
          <Button type="button" variant="ghost" onClick={handleClose} disabled={isPending || isUploading}>
            Отмена
          </Button>
          <Button type="submit" isLoading={isPending} disabled={isUploading}>
            Добавить книгу
          </Button>
        </div>
      </form>
    </Modal>
  );
}
