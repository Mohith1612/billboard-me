const SURFACES = [
  "MacBook lid",
  "Jersey front",
  "Jersey sleeve",
  "T-shirt front",
  "T-shirt back",
  "MacBook palm rest",
];

export function SurfaceTicker() {
  return (
    <section aria-label="Surfaces we currently support" className="overflow-hidden bg-ink py-4">
      <div className="marquee-track">
        {[0, 1].map((copy) => (
          <ul
            key={copy}
            className={`flex shrink-0 items-center ${copy === 1 ? "marquee-clone" : ""}`}
            aria-hidden={copy === 1 ? true : undefined}
          >
            {SURFACES.map((surface) => (
              <li key={surface} className="flex items-center spec text-chalk">
                <span className="px-7">{surface}</span>
                <span aria-hidden="true" className="text-vermilion">
                  &#10033;
                </span>
              </li>
            ))}
          </ul>
        ))}
      </div>
    </section>
  );
}
