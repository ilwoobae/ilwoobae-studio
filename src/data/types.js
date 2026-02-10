export const TYPES = [
  { id: "flat", label: "Flat" },
  { id: "sculptural", label: "Sculptural" },
  { id: "exhibition", label: "Exhibition" },
  { id: "text", label: "Text" },
  { id: "review", label: "Review" },
];

export const typeLabelById = (id) => TYPES.find((type) => type.id === id)?.label || "-";
