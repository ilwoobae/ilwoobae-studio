import { useState } from "react";

const TYPE_BUTTONS = [
  { id: "sculpture", label: "조각", image: "/images/buttons/1.png" },
  { id: "non-sculpture", label: "非조각", image: "/images/buttons/2.png" },
  { id: "text", label: "글", image: "/images/buttons/3.png" },
];

export default function Home() {
  const [activeId, setActiveId] = useState(null);

  const handleClick = (id) => {
    setActiveId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="page home-page">
      <section className="front-shell">
        <div className="button-stack">
          {TYPE_BUTTONS.map((type) => (
            <button
              key={type.id}
              type="button"
              className="type-button"
              onClick={() => handleClick(type.id)}
              aria-label={type.label}
            >
              {activeId && activeId !== type.id ? null : (
                <img src={type.image} alt={type.label} />
              )}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
