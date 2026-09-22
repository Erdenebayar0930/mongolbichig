"use client";

import { useState } from "react";

/**
 * Гол зураг + доор нь жижиг сонголтууд. Зураг ганц бол сонголтын эгнээ
 * харагдахгүй — нэг зурагтай бүтээгдэхүүнд хоосон эгнээ утгагүй.
 */
export default function ProductGallery({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  const [active, setActive] = useState(0);
  const current = images[active] ?? images[0];

  return (
    <div>
      <div className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={current}
          alt={alt}
          className="aspect-square w-full object-cover"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute inset-3 frame-gold"
        />
      </div>

      {images.length > 1 ? (
        <div className="mt-4 grid grid-cols-5 gap-3">
          {images.map((image, index) => (
            <button
              key={image}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`${index + 1}-р зураг`}
              aria-current={index === active}
              className={`relative aspect-square overflow-hidden border transition duration-300 ${
                index === active
                  ? "border-gold-500"
                  : "border-[color:var(--line)] opacity-65 hover:opacity-100"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image}
                alt=""
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
