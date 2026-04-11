'use client';

/**
 * Модал создания книжного шкафа.
 *
 * Форма содержит:
 * - Название (обязательно, max 100 символов)
 * - Описание (опционально)
 * - Количество полок (1–20, по умолчанию 3)
 *
 * После успешного создания — закрывает модал и инвалидирует кэш шкафов.
 *
 * Связанные фичи: F-01
 */

import { useState } from 'react';
import { Modal, Button, Input, Textarea } from '@/components/ui';
import { useCreateBookcase } from '@/hooks/useBookcases';

interface CreateBookcaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/** Количество полок — варианты для быстрого выбора */
const SHELF_COUNT_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8];

export function CreateBookcaseModal({ isOpen, onClose }: CreateBookcaseModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [shelvesCount, setShelvesCount] = useState(3);
  const [nameError, setNameError] = useState('');

  const { mutate: createBookcase, isPending } = useCreateBookcase();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Клиентская валидация
    if (!name.trim()) {
      setNameError('Введите название шкафа');
      return;
    }
    if (name.length > 100) {
      setNameError('Название не может быть длиннее 100 символов');
      return;
    }

    createBookcase(
      { name: name.trim(), description: description.trim() || undefined, shelvesCount },
      {
        onSuccess: () => {
          handleClose();
        },
      },
    );
  };

  const handleClose = () => {
    // Сбрасываем форму при закрытии
    setName('');
    setDescription('');
    setShelvesCount(3);
    setNameError('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Новый шкаф">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Название"
          placeholder="Например: Шкаф в гостиной"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (nameError) setNameError('');
          }}
          error={nameError}
          required
          autoFocus
          maxLength={100}
        />

        <Textarea
          label="Описание"
          placeholder="Художественная литература, классика…"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
        />

        {/* Выбор количества полок */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">
            Количество полок <span className="text-red-500">*</span>
          </label>

          <div className="flex gap-1.5 flex-wrap">
            {SHELF_COUNT_OPTIONS.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setShelvesCount(n)}
                className={`w-9 h-9 rounded-md text-sm font-medium transition-colors border ${
                  shelvesCount === n
                    ? 'bg-amber-600 text-white border-amber-600'
                    : 'border-gray-200 text-gray-600 hover:border-amber-400 hover:text-amber-600'
                }`}
              >
                {n}
              </button>
            ))}
          </div>

          {/* Визуальная подсказка — иллюстрация шкафа */}
          <div className="mt-1 flex flex-col gap-1">
            {Array.from({ length: shelvesCount }).map((_, i) => (
              <div key={i} className="h-5 rounded bg-amber-50 border border-amber-100 w-full" />
            ))}
          </div>
          <p className="text-xs text-gray-400">
            {shelvesCount} {shelfWord(shelvesCount)} — можно добавить или убрать позже
          </p>
        </div>

        {/* Кнопки */}
        <div className="flex gap-2 justify-end pt-1">
          <Button type="button" variant="ghost" onClick={handleClose} disabled={isPending}>
            Отмена
          </Button>
          <Button type="submit" isLoading={isPending}>
            Создать шкаф
          </Button>
        </div>
      </form>
    </Modal>
  );
}

/** Склонение слова "полка" */
function shelfWord(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 14) return 'полок';
  if (mod10 === 1) return 'полка';
  if (mod10 >= 2 && mod10 <= 4) return 'полки';
  return 'полок';
}
