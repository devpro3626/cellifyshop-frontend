import { attributes } from "./attributes";

/** Resolve attribute value ids to `{ id, label }` pairs for seed data. */
export function valuesOf(attributeId: string, ids: string[]) {
  const attribute = attributes.find((a) => a.id === attributeId);
  if (!attribute) throw new Error(`Unknown attribute "${attributeId}"`);
  return ids.map((id) => {
    const value = attribute.values.find((v) => v.id === id);
    if (!value) throw new Error(`Unknown value "${id}" for attribute "${attributeId}"`);
    return value;
  });
}
