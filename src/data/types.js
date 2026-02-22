export const TYPES = [
  { id: "sculpture", label: "조각" },
  { id: "non-sculpture", label: "조각이 아닌" },
  { id: "text", label: "말과 글" },
];

export const typeLabelById = (id) => TYPES.find((type) => type.id === id)?.label || "-";
