import { useNavigate } from "react-router-dom";

const TYPE_BUTTONS = [
  { id: "sculpture", label: "조각", subLabel: "sculpture" },
  { id: "non-sculpture", label: "조각이 아닌", subLabel: "non" },
  { id: "text", label: "말과 글", subLabel: "text" },
];

export default function Home() {
  const navigate = useNavigate();

  const handleTypeClick = (typeId) => {
    navigate(`/type/${typeId}`);
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
                onClick={() => handleTypeClick(type.id)}
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
