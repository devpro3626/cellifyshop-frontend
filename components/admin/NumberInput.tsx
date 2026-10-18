"use client";

import { useState, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";
import { inputClass } from "./ui";

type NumberInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange" | "type"> & {
  value: number;
  onChange(value: number): void;
  /** Allow a decimal point, e.g. for prices. */
  decimal?: boolean;
};

const toNumber = (text: string) => (text === "" || text === "." ? 0 : Number(text));

/**
 * Number field that can be cleared and retyped freely: the text is kept as
 * typed, so deleting "0" leaves an empty field instead of snapping back.
 * An empty field counts as 0. The whole value is selected on focus.
 */
export function NumberInput({ value, onChange, decimal = false, className, onFocus, onBlur, ...rest }: NumberInputProps) {
  const [text, setText] = useState(String(value));
  const [synced, setSynced] = useState(value);

  // Follow changes made outside the field (e.g. "Apply to all").
  if (value !== synced) {
    setSynced(value);
    if (toNumber(text) !== value) setText(String(value));
  }

  return (
    <input
      {...rest}
      type="text"
      inputMode={decimal ? "decimal" : "numeric"}
      autoComplete="off"
      value={text}
      onFocus={(e) => {
        e.currentTarget.select();
        onFocus?.(e);
      }}
      onChange={(e) => {
        const raw = e.target.value.replace(decimal ? /[^\d.]/g : /\D/g, "");
        // Keep at most one decimal point and drop leading zeros ("0140" -> "140").
        const [whole, ...rest] = raw.split(".");
        const next = (whole.replace(/^0+(?=\d)/, "") + (decimal && rest.length ? `.${rest.join("")}` : "")).slice(0, 12);
        setText(next);
        setSynced(toNumber(next));
        onChange(toNumber(next));
      }}
      onBlur={(e) => {
        if (text === "" || text === ".") setText("0");
        onBlur?.(e);
      }}
      className={cn(inputClass, "tabular-nums", className)}
    />
  );
}
