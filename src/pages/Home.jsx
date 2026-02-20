import { Link } from "react-router-dom";

const TYPE_BUTTONS = [
  { id: "sculpture", label: "조각", image: "/images/buttons/1.png" },
  { id: "non-sculpture", label: "非조각", image: "/images/buttons/2.png" },
  { id: "text", label: "글", image: "/images/buttons/3.png" },
];

export default function Home() {
  return (
    <div className="page home-page">
      <section className="intro-section">
        <div className="type-buttons">
          {TYPE_BUTTONS.map((type) => (
            <Link
              key={type.id}
              className="type-button"
              to={`/type/${type.id}`}
              aria-label={type.label}
            >
              <img src={type.image} alt={type.label} />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
