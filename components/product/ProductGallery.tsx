"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { ProductMedia } from "@/lib/catalog/types";
import { cn } from "@/lib/cn";
import { Icon } from "@/components/ui/Icon";

interface GalleryProps {
  media: ProductMedia[];
  tint: string;
  /** Photography fills the frame; cut-outs float on the tint. */
  fit: "contain" | "cover";
}

export function ProductGallery({ media, tint, fit }: GalleryProps) {
  const [index, setIndex] = useState(0);
  // Keep the index in range when the selection changes the available images.
  const safeIndex = Math.min(index, media.length - 1);
  const current = media[safeIndex];
  const go = (dir: 1 | -1) => setIndex((safeIndex + dir + media.length) % media.length);

  return (
    <div className="flex flex-col gap-3">
      <div
        className="group relative aspect-square w-full overflow-hidden rounded-[32px]"
        style={{ backgroundColor: tint }}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") go(1);
          if (e.key === "ArrowLeft") go(-1);
        }}
        tabIndex={media.length > 1 ? 0 : undefined}
        role={media.length > 1 ? "region" : undefined}
        aria-roledescription={media.length > 1 ? "carousel" : undefined}
        aria-label="Product images"
      >
        <AnimatePresence initial={false} mode="popLayout">
          <motion.div
            key={current.src}
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <Image
              src={current.src}
              alt={current.alt}
              fill
              preload
              quality={90}
              sizes="(min-width: 1024px) 55vw, 100vw"
              className={fit === "cover" ? "object-cover" : "object-contain p-[8%]"}
            />
          </motion.div>
        </AnimatePresence>

        {media.length > 1 && (
          <div className="absolute inset-x-4 bottom-4 flex items-center justify-between">
            <span className="rounded-full bg-surface/80 px-3 py-1 font-medium tabular-nums text-xs tabular-nums backdrop-blur">
              {safeIndex + 1} / {media.length}
            </span>
            <div className="flex gap-2 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100">
              {([-1, 1] as const).map((dir) => (
                <button
                  key={dir}
                  type="button"
                  onClick={() => go(dir)}
                  aria-label={dir === 1 ? "Next image" : "Previous image"}
                  className="grid h-10 w-10 place-items-center rounded-full bg-surface/90 shadow-sm backdrop-blur transition-transform hover:scale-105"
                >
                  <Icon name={dir === 1 ? "chevronRight" : "chevronLeft"} size={18} />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {media.length > 1 && (
        <ul className="no-scrollbar flex gap-2.5 overflow-x-auto">
          {media.map((m, i) => (
            <li key={m.src} className="shrink-0">
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Show image ${i + 1}`}
                aria-current={i === safeIndex}
                className={cn(
                  "relative block h-[72px] w-[72px] overflow-hidden rounded-xl border-[1.5px] transition-colors md:h-20 md:w-20",
                  i === safeIndex ? "border-ink" : "border-transparent hover:border-line-strong",
                )}
                style={{ backgroundColor: tint }}
              >
                <Image src={m.src} alt="" fill sizes="96px" className={fit === "cover" ? "object-cover" : "object-contain p-1.5"} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
