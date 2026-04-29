// Tooth chart renderer — uses PNG images (assets/teeth/t{N}.png)
// Each PNG already contains 3 stacked views: occlusal (top), root profile, and side view.
// Universal Numbering 1–32:
//   Molars: 1,2,3, 14,15,16, 17,18,19, 30,31,32
//   Premolars: 4,5, 12,13, 20,21, 28,29
//   Canines: 6, 11, 22, 27
//   Incisors: 7,8,9,10, 23,24,25,26

const TOOTH_TYPE = (n) => {
  const molars = new Set([1,2,3,14,15,16,17,18,19,30,31,32]);
  const premolars = new Set([4,5,12,13,20,21,28,29]);
  const canines = new Set([6,11,22,27]);
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
    const which = (n===1||n===16||n===17||n===32)?"3rd": (n===2||n===15||n===18||n===31)?"2nd":"1st";
    return `${arch} ${which} molar`;
  }
  if (t === "premolar") {
    const first = [5,12,21,28].includes(n);
    return `${arch} ${first?"1st":"2nd"} premolar`;
  }
  if (t === "canine") return `${arch} canine`;
  const central = [8,9,24,25].includes(n);
  return `${arch} ${central?"central":"lateral"} incisor`;
};

const TOOTH_SURFACES = (n) => {
  const t = TOOTH_TYPE(n);
  if (t === "molar" || t === "premolar") return ["M","O","D","B","L"];
  return ["M","I","D","F","L"];
};

// Color overlays for conditions (applied via blend on top of tooth image)
const condTint = {
  cavity:  "rgba(154, 53, 39, 0.42)",
  decay:   "rgba(154, 53, 39, 0.42)",
  treated: "rgba(92, 143, 176, 0.42)",
  crown:   "rgba(201, 172, 115, 0.55)",
  planned: "rgba(232, 184, 106, 0.45)",
  rct:     "rgba(140, 108, 176, 0.4)",
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
  const upper = IS_UPPER(num);
  const isMissing = condition === "missing";
  const tint = condTint[condition];

  // Image is 205x700 = ~3.4 aspect. Render at 48 wide -> 164 tall.
  const W = 48, H = 164;

  return (
    <div
      className={"tooth-img" + (selected ? " sel" : "") + (hovered ? " hov" : "")}
      style={{
        width: W,
        height: H,
        position: "relative",
        cursor: "pointer",
        userSelect: "none",
        opacity: isMissing ? 0.32 : 1,
        transition: "transform .15s cubic-bezier(.2,.8,.2,1)",
        transform: hovered && !selected ? "translateY(-2px)" : "none",
      }}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <img
        src={`assets/teeth/t${num}.png`}
        alt={`Tooth ${num}`}
        draggable="false"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          // Lower teeth: roots should sit at the BOTTOM (closest to gum line midline at top)
          // Image is drawn with crown on top, root at bottom — flip vertically for lower jaw
          // so root points up toward midline.
          transform: upper ? "none" : "scaleY(-1)",
          display: "block",
          pointerEvents: "none",
        }}
      />

      {/* Condition tint overlay (multiply blend, masked to image alpha is approximated via opacity) */}
      {tint && !isMissing && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: tint,
            mixBlendMode: "multiply",
            pointerEvents: "none",
            borderRadius: 6,
          }}
        />
      )}

      {/* Missing X */}
      {isMissing && (
        <svg
          viewBox="0 0 48 164"
          style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
        >
          <path d="M 8 24 L 40 140" stroke="#A64242" strokeWidth="2.4" strokeLinecap="round" opacity="0.7"/>
          <path d="M 40 24 L 8 140" stroke="#A64242" strokeWidth="2.4" strokeLinecap="round" opacity="0.7"/>
        </svg>
      )}

      {/* Selection — red dashed border */}
      {selected && (
        <div
          style={{
            position: "absolute",
            inset: -2,
            border: "1.8px dashed var(--persimmon)",
            borderRadius: 8,
            background: "rgba(247,60,31,0.05)",
            pointerEvents: "none",
          }}
        />
      )}

      {/* Hover halo */}
      {hovered && !selected && (
        <div
          style={{
            position: "absolute",
            inset: -2,
            border: "1.4px solid rgba(22,43,65,0.22)",
            borderRadius: 8,
            pointerEvents: "none",
          }}
        />
      )}

      {/* Planned-procedure dots (top-right) */}
      {planned && planned.length > 0 && (
        <div
          style={{
            position: "absolute",
            top: 4,
            right: 2,
            display: "flex",
            flexDirection: "column",
            gap: 3,
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
                boxShadow: "0 0 0 1.4px #fff",
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
