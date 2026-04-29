const TOOTH_TYPE = (n) => {
  const molars = new Set([1, 2, 3, 14, 15, 16, 17, 18, 19, 30, 31, 32]);
  const premolars = new Set([4, 5, 12, 13, 20, 21, 28, 29]);
  const canines = new Set([6, 11, 22, 27]);
  if (molars.has(n)) return "molar";
  if (premolars.has(n)) return "premolar";
  if (canines.has(n)) return "canine";
  return "incisor";
};
const IS_UPPER = (n) => n >= 1 && n <= 16;

const TOOTH_NAMES = (n) => {
  const t = TOOTH_TYPE(n);
  const upper = IS_UPPER(n);
  const arch = upper ? "Maxillary" : "Mandibular";
  if (t === "molar") {
    const which =
      n === 1 || n === 16 || n === 17 || n === 32
        ? "3rd"
        : n === 2 || n === 15 || n === 18 || n === 31
          ? "2nd"
          : "1st";
    return `${arch} ${which} molar`;
  }
  if (t === "premolar") {
    const first = [5, 12, 21, 28].includes(n);
    return `${arch} ${first ? "1st" : "2nd"} premolar`;
  }
  if (t === "canine") return `${arch} canine`;
  const central = [8, 9, 24, 25].includes(n);
  return `${arch} ${central ? "central" : "lateral"} incisor`;
};

const TOOTH_SURFACES = (n) => {
  const t = TOOTH_TYPE(n);
  if (t === "molar" || t === "premolar") return ["M", "O", "D", "B", "L"];
  return ["M", "I", "D", "F", "L"];
};

const ToothSVG = ({
  num,
  condition = "healthy",
  planned = [],
  selected = false,
  hovered = false,
  onClick,
  onMouseEnter,
  onMouseLeave,
}) => {
  const isMissing = condition === "missing";

  return (
    <div
      style={{
        position: "relative",
        width: 48,
        height: 124,
        cursor: "pointer",
        flexShrink: 0,
        filter: hovered
          ? "drop-shadow(0 8px 18px rgba(22,43,65,.22))"
          : "drop-shadow(0 1px 2px rgba(54,54,54,.08))",
        transform: hovered ? "translateY(-3px) scale(1.06)" : "none",
        transition: "transform .18s cubic-bezier(.2,.8,.2,1), filter .18s",
        opacity: isMissing ? 0.3 : 1,
      }}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <img
        src={`assets/teeth/t${num}_tooth.png`}
        alt={`Tooth ${num}`}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          display: "block",
        }}
      />

      {/* Missing X */}
      {isMissing && (
        <svg
          width="48"
          height="124"
          viewBox="0 0 48 124"
          style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
        >
          <g
            stroke="#A64242"
            strokeWidth="2.4"
            strokeLinecap="round"
            opacity="0.75"
          >
            <line x1="12" y1="28" x2="36" y2="96" />
            <line x1="36" y1="28" x2="12" y2="96" />
          </g>
        </svg>
      )}

      {/* Selected ring */}
      {selected && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 10,
            border: "2px dashed var(--persimmon)",
            background: "rgba(var(--persimmon-rgb, 196,78,53), 0.06)",
            pointerEvents: "none",
          }}
        />
      )}

      {/* Hover halo */}
      {hovered && !selected && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 10,
            border: "1.4px solid rgba(0,0,0,.25)",
            pointerEvents: "none",
          }}
        />
      )}

      {/* Planned-procedure dots, top-right */}
      {planned && planned.length > 0 && (
        <div
          style={{
            position: "absolute",
            top: 28,
            right: -4,
            display: "flex",
            flexDirection: "column",
            gap: 4,
            pointerEvents: "none",
          }}
        >
          {planned.slice(0, 3).map((p, i) => (
            <div
              key={i}
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: p.color || "var(--persimmon)",
                border: "1.2px solid #fff",
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

window.ToothSVG = ToothSVG;
window.TOOTH_TYPE = TOOTH_TYPE;
window.TOOTH_NAMES = TOOTH_NAMES;
window.TOOTH_SURFACES = TOOTH_SURFACES;
window.IS_UPPER = IS_UPPER;
