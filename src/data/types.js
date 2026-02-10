export const TYPES = [
  { id: "artwork", label: "Artwork" },
  { id: "text", label: "Text" },
];

export const typeLabelById = (id) => TYPES.find((type) => type.id === id)?.label || "-";
