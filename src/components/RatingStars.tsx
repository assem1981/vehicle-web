'use client';

import React from 'react';
import { Star } from 'lucide-react';

interface RatingStarsProps {
  rating: number;
  maxStars?: number;
  onRate?: (rating: number) => void;
  size?: number;
}

export default function RatingStars({ rating, maxStars = 5, onRate, size = 18 }: RatingStarsProps) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: maxStars }).map((_, i) => {
        const starValue = i + 1;
        const isFilled = starValue <= rating;

        return (
          <button
            key={i}
            type="button"
            disabled={!onRate}
            onClick={() => onRate && onRate(starValue)}
            className={`${onRate ? 'cursor-pointer hover:scale-115' : 'cursor-default'} transition-transform`}
          >
            <Star
              size={size}
              className={`${
                isFilled
                  ? 'text-amber-400 fill-amber-400'
                  : 'text-slate-600 fill-slate-800'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}
