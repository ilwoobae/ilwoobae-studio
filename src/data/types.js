export const TYPES = [
  { id: "sculpture", label: "조각" },
  { id: "non-sculpture", label: "非조각" },
  { id: "text", label: "글" },
];

export const typeLabelById = (id) => TYPES.find((type) => type.id === id)?.label || "-";
