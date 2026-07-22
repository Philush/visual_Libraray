'use client';

import { Star } from 'lucide-react';

interface StarRatingProps {
  value: number;
  onChange?: (rating: number) => void;
  readOnly?: boolean;
  size?: 'sm' | 'md';
}

/**
 * Компонент рейтинга в виде 5 звёзд.
 * В режиме ввода (readOnly=false) клик по текущей звезде сбрасывает рейтинг в 0.
 */
export function StarRating({ value, onChange, readOnly = false, size = 'md' }: StarRatingProps) {
  const iconSize = size === 'sm' ? 'w-3.5 h-3.5' : 'w-5 h-5';

  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= value;
        return (
          <button
            key={star}
            type="button"
            disabled={readOnly}
            onClick={() => onChange?.(star === value ? 0 : star)}
            className={[
              'transition-colors focus:outline-none',
              readOnly ? 'cursor-default' : 'cursor-pointer hover:scale-110 transition-transform',
            ].join(' ')}
            aria-label={`${star} звезд`}
          >
            <Star
              className={[
                iconSize,
                filled ? 'fill-amber-400 text-amber-400' : 'text-gray-300',
              ].join(' ')}
            />
          </button>
        );
      })}
    </div>
  );
}
