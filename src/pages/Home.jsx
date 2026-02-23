import { useNavigate } from "react-router-dom";

const TYPE_BUTTONS = [
  { id: "sculpture", label: "조각", subLabel: "sculpture" },
  { id: "text", label: "말과 글", subLabel: "text" },
  { id: "non-sculpture", label: "비조각", subLabel: "non" },
];

export default function Home() {
  const navigate = useNavigate();

  const handleTypeClick = (typeId, event) => {
    navigate(`/type/${typeId}`, {
      state: { x: event.clientX, y: event.clientY },
    });
  };

  return (
    <div className="page home-page">
      <section className="front-shell">
        <div className="button-stack">
          {TYPE_BUTTONS.map((type) => (
            <div key={type.id} className="slot">
              <button
                type="button"
                className="type-button"
                onClick={(event) => handleTypeClick(type.id, event)}
              >
                <span className="type-label">{type.label}</span>
                <span className="type-sublabel">{type.subLabel}</span>
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
