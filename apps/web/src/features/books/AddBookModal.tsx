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

import { useState } from 'react';
import { Modal, Button, Input, Textarea } from '@/components/ui';
import { useCreateBook } from '@/hooks/useBooks';
import { generateSpineColor } from '@/lib/utils/spineColor';

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
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { mutate: createBook, isPending } = useCreateBook();

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

    // Генерируем цвет корешка если не задан
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
            <Input
              label="Автор"
              placeholder="Михаил Булгаков"
              value={author}
              onChange={(e) => { setAuthor(e.target.value); setErrors(prev => ({ ...prev, author: '' })); }}
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

          <Input
            label="Жанр"
            placeholder="Классика"
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
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
          <Button type="button" variant="ghost" onClick={handleClose} disabled={isPending}>
            Отмена
          </Button>
          <Button type="submit" isLoading={isPending}>
            Добавить книгу
          </Button>
        </div>
      </form>
    </Modal>
  );
}
