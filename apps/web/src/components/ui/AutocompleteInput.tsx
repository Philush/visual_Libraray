'use client';

import { useState, useRef } from 'react';
import { Input } from './Input';

interface AutocompleteInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  suggestions: string[];
  placeholder?: string;
  maxLength?: number;
  error?: string;
  required?: boolean;
  autoFocus?: boolean;
}

/**
 * Инпут с выпадающим списком подсказок.
 * Подсказки фильтруются по вводу (регистронезависимо).
 * Клик по предложению заполняет поле и закрывает список.
 */
export function AutocompleteInput({
  label,
  value,
  onChange,
  suggestions,
  placeholder,
  maxLength,
  error,
  required,
  autoFocus,
}: AutocompleteInputProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = value.trim()
    ? suggestions.filter(
        (s) => s.toLowerCase().includes(value.toLowerCase()) && s !== value,
      )
    : suggestions;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    setOpen(true);
  };

  const handleSelect = (suggestion: string) => {
    onChange(suggestion);
    setOpen(false);
  };

  const handleBlur = () => {
    // Задержка чтобы клик по пункту списка успел сработать до закрытия
    setTimeout(() => setOpen(false), 120);
  };

  const showDropdown = open && filtered.length > 0;

  return (
    <div ref={containerRef} className="relative">
      <Input
        label={label}
        value={value}
        onChange={handleChange}
        onFocus={() => setOpen(true)}
        onBlur={handleBlur}
        placeholder={placeholder}
        maxLength={maxLength}
        error={error}
        required={required}
        autoFocus={autoFocus}
      />
      {showDropdown && (
        <ul className="absolute z-50 top-full left-0 right-0 mt-0.5 bg-white border border-gray-200 rounded-md shadow-lg max-h-44 overflow-y-auto">
          {filtered.map((s) => (
            <li
              key={s}
              onMouseDown={() => handleSelect(s)}
              className="px-3 py-2 text-sm text-gray-700 hover:bg-amber-50 cursor-pointer"
            >
              {s}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
