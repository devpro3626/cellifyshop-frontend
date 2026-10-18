"use client";

import { useRef, useState } from "react";
import { uploadImage } from "@/lib/admin/actions";
import { Icon } from "@/components/ui/Icon";

/** Uploads one or more images and reports each stored path back. */
export function UploadButton({ onUploaded, multiple = false, label = "Upload image" }: { onUploaded(src: string, fileName: string): void; multiple?: boolean; label?: string }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    setError(null);
    for (const file of Array.from(files)) {
      const form = new FormData();
      form.append("file", file);
      const result = await uploadImage(form);
      if (result.ok && result.data) onUploaded(result.data.src, file.name.replace(/\.[^.]+$/, ""));
      else if (!result.ok) setError(result.error);
    }
    setBusy(false);
    if (input.current) input.current.value = "";
  };

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={() => input.current?.click()}
        disabled={busy}
        className="inline-flex h-10 w-fit items-center gap-2 rounded-lg border border-line bg-surface px-3 text-[0.88rem] font-medium transition-colors hover:border-ink/40 disabled:opacity-50"
      >
        <Icon name="plus" size={16} /> {busy ? "Uploading…" : label}
      </button>
      <input ref={input} type="file" accept="image/*" multiple={multiple} hidden onChange={(e) => upload(e.target.files)} />
      {error && <span className="text-[0.8rem] text-[#a1261b]">{error}</span>}
    </div>
  );
}
