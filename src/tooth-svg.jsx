// Photo-realistic tooth SVG renderer
// Each tooth has two stacked views: occlusal (top-down biting surface) and profile (side with crown + roots)
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

// Shared palette — natural ivory enamel + warm dentin/root
const ENAMEL = {
  hi:    "#FFFDF5",
  base:  "#F2EBD8",
  mid:   "#DDD0AE",
  shade: "#B8A572",
  deep:  "#8B7945",
};
const ROOT = {
  hi:    "#F0DDB6",
  base:  "#E2C68F",
  mid:   "#C8A669",
  shade: "#A47F45",
  deep:  "#74552C",
};

const condFill = {
  cavity:  "#9A3527",
  decay:   "#9A3527",
  treated: "#5C8FB0",
  crown:   "#C9AC73",
  planned: "#E8B86A",
  rct:     "#8C6CB0",
  missing: "transparent",
};

// Paint a per-class crown shape (profile view)
// All shapes are sized for a 60×130 viewBox; the occlusal sits 0–34, profile 36–130.
const ToothSVG = ({ num, condition = "healthy", planned = [], selected = false, hovered = false, onClick, onMouseEnter, onMouseLeave }) => {
  const type = TOOTH_TYPE(num);
  const upper = IS_UPPER(num);
  const isMissing = condition === "missing";
  const cf = condFill[condition];

  // unique gradient ids per tooth so siblings don't collide
  const gid = `tg-${num}`;
  const grad = (
    <defs>
      <linearGradient id={`${gid}-enamel`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor={ENAMEL.hi}/>
        <stop offset="55%" stopColor={ENAMEL.base}/>
        <stop offset="100%" stopColor={ENAMEL.mid}/>
      </linearGradient>
      <linearGradient id={`${gid}-root`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={ROOT.hi}/>
        <stop offset="40%" stopColor={ROOT.base}/>
        <stop offset="100%" stopColor={ROOT.shade}/>
      </linearGradient>
      <radialGradient id={`${gid}-shine`} cx="0.32" cy="0.28" r="0.55">
        <stop offset="0%" stopColor="#fff" stopOpacity="0.8"/>
        <stop offset="60%" stopColor="#fff" stopOpacity="0"/>
      </radialGradient>
      <linearGradient id={`${gid}-cervical`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={ENAMEL.shade} stopOpacity="0"/>
        <stop offset="100%" stopColor={ENAMEL.shade} stopOpacity="0.55"/>
      </linearGradient>
    </defs>
  );

  // ---- PROFILE VIEW (crown + root) — varies by class ----
  let profile;
  if (type === "incisor") {
    // Long flat blade-like crown, single conical root
    profile = (
      <g>
        {/* Root */}
        <path d="M 23 50 Q 22 70 25 92 Q 28 104 30 105 Q 32 104 35 92 Q 38 70 37 50 Z" fill={`url(#${gid}-root)`} stroke={ROOT.deep} strokeWidth="0.5"/>
        <path d="M 30 56 Q 30 80 30 100" stroke={ROOT.deep} strokeWidth="0.6" strokeOpacity=".4" fill="none"/>
        {/* Crown */}
        <path d="M 19 14 Q 22 7 30 5 Q 38 7 41 14 L 43 38 Q 43 46 40 50 L 20 50 Q 17 46 17 38 Z"
              fill={`url(#${gid}-enamel)`} stroke={ENAMEL.deep} strokeWidth="0.6"/>
        {/* Mamelon ridges (vertical contours on facial surface) */}
        <path d="M 22 14 Q 23 30 24 48" stroke={ENAMEL.shade} strokeWidth="0.5" fill="none" strokeOpacity=".55"/>
        <path d="M 30 12 Q 30 30 30 48" stroke={ENAMEL.shade} strokeWidth="0.5" fill="none" strokeOpacity=".55"/>
        <path d="M 38 14 Q 37 30 36 48" stroke={ENAMEL.shade} strokeWidth="0.5" fill="none" strokeOpacity=".55"/>
        {/* Soft enamel shine */}
        <path d="M 22 14 Q 23 26 25 38" stroke="#fff" strokeWidth="2" strokeOpacity=".6" fill="none" strokeLinecap="round"/>
        {/* Incisal edge translucency */}
        <path d="M 19 47 Q 30 50 41 47" stroke="#fff" strokeOpacity=".7" strokeWidth="1.4" fill="none" strokeLinecap="round"/>
        {/* Cervical line shadow (gum line) */}
        <path d="M 19 49 Q 30 52 41 49" stroke={ENAMEL.shade} strokeWidth="0.8" fill="none" strokeOpacity=".7"/>
      </g>
    );
  } else if (type === "canine") {
    profile = (
      <g>
        {/* Long single root, more tapered */}
        <path d="M 21 50 Q 21 75 25 96 Q 28 106 30 108 Q 32 106 35 96 Q 39 75 39 50 Z" fill={`url(#${gid}-root)`} stroke={ROOT.deep} strokeWidth="0.5"/>
        <path d="M 30 56 Q 30 82 30 102" stroke={ROOT.deep} strokeWidth="0.6" strokeOpacity=".4" fill="none"/>
        {/* Pointed cusp crown */}
        <path d="M 17 16 Q 22 6 30 4 Q 38 6 43 16 L 44 38 Q 43 46 40 49 L 30 51 L 20 49 Q 17 46 16 38 Z"
              fill={`url(#${gid}-enamel)`} stroke={ENAMEL.deep} strokeWidth="0.6"/>
        {/* Cusp ridge — central */}
        <path d="M 30 5 L 30 50" stroke={ENAMEL.shade} strokeWidth="0.7" fill="none" strokeOpacity=".55"/>
        <path d="M 23 10 Q 26 30 28 50" stroke={ENAMEL.shade} strokeWidth="0.5" fill="none" strokeOpacity=".5"/>
        <path d="M 37 10 Q 34 30 32 50" stroke={ENAMEL.shade} strokeWidth="0.5" fill="none" strokeOpacity=".5"/>
        {/* Enamel highlight along mesial slope */}
        <path d="M 23 12 Q 26 25 27 38" stroke="#fff" strokeWidth="2" strokeOpacity=".55" fill="none" strokeLinecap="round"/>
        <path d="M 19 49 Q 30 52 41 49" stroke={ENAMEL.shade} strokeWidth="0.8" fill="none" strokeOpacity=".7"/>
      </g>
    );
  } else if (type === "premolar") {
    profile = (
      <g>
        {/* Single (sometimes bifurcated) root */}
        <path d="M 19 52 Q 19 72 23 92 Q 27 102 30 103 Q 33 102 37 92 Q 41 72 41 52 Z" fill={`url(#${gid}-root)`} stroke={ROOT.deep} strokeWidth="0.5"/>
        <path d="M 30 56 Q 30 80 30 99" stroke={ROOT.deep} strokeWidth="0.6" strokeOpacity=".4" fill="none"/>
        {/* Subtle root furrow hinting at bifurcation */}
        <path d="M 30 56 Q 31 78 32 96" stroke={ROOT.shade} strokeWidth="0.3" fill="none" strokeOpacity=".7"/>
        {/* Two-cusp crown */}
        <path d="M 16 14 Q 19 7 25 5 Q 30 4 35 5 Q 41 7 44 14 L 45 40 Q 44 47 41 51 L 19 51 Q 16 47 15 40 Z"
              fill={`url(#${gid}-enamel)`} stroke={ENAMEL.deep} strokeWidth="0.6"/>
        {/* Buccal cusp tip */}
        <path d="M 23 6 Q 23 28 23 50" stroke={ENAMEL.shade} strokeWidth="0.5" fill="none" strokeOpacity=".55"/>
        <path d="M 37 6 Q 37 28 37 50" stroke={ENAMEL.shade} strokeWidth="0.5" fill="none" strokeOpacity=".55"/>
        {/* Central groove on facial */}
        <path d="M 30 10 L 30 49" stroke={ENAMEL.shade} strokeWidth="0.5" fill="none" strokeOpacity=".55"/>
        {/* Shine */}
        <path d="M 20 14 Q 22 26 23 38" stroke="#fff" strokeWidth="2" strokeOpacity=".55" fill="none" strokeLinecap="round"/>
        <path d="M 16 50 Q 30 53 44 50" stroke={ENAMEL.shade} strokeWidth="0.8" fill="none" strokeOpacity=".7"/>
      </g>
    );
  } else { // molar
    profile = (
      <g>
        {upper ? (
          <g>
            {/* 3 splayed roots — palatal, mesiobuccal, distobuccal */}
            <path d="M 14 53 Q 12 72 13 88 Q 14 96 18 99 Q 22 97 22 88 Q 22 70 22 53 Z" fill={`url(#${gid}-root)`} stroke={ROOT.deep} strokeWidth="0.5"/>
            <path d="M 38 53 Q 38 70 38 88 Q 38 97 42 99 Q 46 96 47 88 Q 48 72 46 53 Z" fill={`url(#${gid}-root)`} stroke={ROOT.deep} strokeWidth="0.5"/>
            <path d="M 26 53 Q 25 75 25 95 Q 27 105 30 106 Q 33 105 35 95 Q 35 75 34 53 Z" fill={`url(#${gid}-root)`} stroke={ROOT.deep} strokeWidth="0.5"/>
            {/* Root central lines */}
            <path d="M 18 60 Q 18 80 18 95" stroke={ROOT.deep} strokeWidth="0.4" strokeOpacity=".4" fill="none"/>
            <path d="M 30 60 Q 30 82 30 102" stroke={ROOT.deep} strokeWidth="0.4" strokeOpacity=".4" fill="none"/>
            <path d="M 42 60 Q 42 80 42 95" stroke={ROOT.deep} strokeWidth="0.4" strokeOpacity=".4" fill="none"/>
          </g>
        ) : (
          <g>
            {/* 2 roots — mesial, distal — splayed apart */}
            <path d="M 17 53 Q 14 75 17 95 Q 20 104 23 104 Q 26 102 26 92 Q 26 75 24 53 Z" fill={`url(#${gid}-root)`} stroke={ROOT.deep} strokeWidth="0.5"/>
            <path d="M 36 53 Q 34 75 34 92 Q 34 102 37 104 Q 40 104 43 95 Q 46 75 43 53 Z" fill={`url(#${gid}-root)`} stroke={ROOT.deep} strokeWidth="0.5"/>
            <path d="M 22 60 Q 21 78 21 96" stroke={ROOT.deep} strokeWidth="0.4" strokeOpacity=".4" fill="none"/>
            <path d="M 38 60 Q 39 78 39 96" stroke={ROOT.deep} strokeWidth="0.4" strokeOpacity=".4" fill="none"/>
          </g>
        )}
        {/* Wide 4-cusp crown */}
        <path d="M 12 14 Q 16 6 24 5 Q 30 4 36 5 Q 44 6 48 14 L 49 41 Q 47 49 43 52 L 17 52 Q 13 49 11 41 Z"
              fill={`url(#${gid}-enamel)`} stroke={ENAMEL.deep} strokeWidth="0.6"/>
        {/* Cusp ridges */}
        <path d="M 20 6 L 20 51" stroke={ENAMEL.shade} strokeWidth="0.5" fill="none" strokeOpacity=".5"/>
        <path d="M 30 5 L 30 51" stroke={ENAMEL.shade} strokeWidth="0.5" fill="none" strokeOpacity=".5"/>
        <path d="M 40 6 L 40 51" stroke={ENAMEL.shade} strokeWidth="0.5" fill="none" strokeOpacity=".5"/>
        {/* Subtle developmental groove curve */}
        <path d="M 14 22 Q 30 25 46 22" stroke={ENAMEL.shade} strokeWidth="0.4" fill="none" strokeOpacity=".4"/>
        {/* Enamel highlight */}
        <path d="M 16 14 Q 19 26 21 38" stroke="#fff" strokeWidth="2.2" strokeOpacity=".55" fill="none" strokeLinecap="round"/>
        {/* Cervical line */}
        <path d="M 13 51 Q 30 54 47 51" stroke={ENAMEL.shade} strokeWidth="0.9" fill="none" strokeOpacity=".75"/>
      </g>
    );
  }

  // Cervical gradient overlay (darker near gumline) — applied on top of crown for depth
  const cervicalShade = (
    <rect x="12" y="38" width="36" height="14" fill={`url(#${gid}-cervical)`} opacity="0.6"/>
  );

  // ---- OCCLUSAL VIEW (top-down) ----
  let occlusal;
  if (type === "incisor") {
    occlusal = (
      <g>
        <ellipse cx="30" cy="20" rx="15" ry="6" fill={`url(#${gid}-enamel)`} stroke={ENAMEL.deep} strokeWidth="0.5"/>
        <ellipse cx="30" cy="19" rx="12" ry="3.5" fill="#fff" fillOpacity=".4"/>
        <path d="M 18 21 Q 30 24 42 21" stroke={ENAMEL.shade} strokeWidth="0.5" fill="none" strokeOpacity=".7"/>
      </g>
    );
  } else if (type === "canine") {
    occlusal = (
      <g>
        <path d="M 19 22 Q 22 13 30 11 Q 38 13 41 22 Q 39 28 30 30 Q 21 28 19 22 Z" fill={`url(#${gid}-enamel)`} stroke={ENAMEL.deep} strokeWidth="0.5"/>
        <circle cx="30" cy="19" r="3" fill="#fff" fillOpacity=".55"/>
        <path d="M 22 18 Q 30 26 38 18" stroke={ENAMEL.shade} strokeWidth="0.5" fill="none" strokeOpacity=".55"/>
      </g>
    );
  } else if (type === "premolar") {
    occlusal = (
      <g>
        <path d="M 17 14 Q 18 9 24 7 L 36 7 Q 42 9 43 14 L 44 26 Q 42 32 36 33 L 24 33 Q 18 32 16 26 Z" fill={`url(#${gid}-enamel)`} stroke={ENAMEL.deep} strokeWidth="0.5"/>
        <ellipse cx="25" cy="16" rx="4.2" ry="3.2" fill="#fff" fillOpacity=".55"/>
        <ellipse cx="35" cy="16" rx="4.2" ry="3.2" fill="#fff" fillOpacity=".55"/>
        <path d="M 22 22 Q 30 24 38 22" stroke={ENAMEL.deep} strokeWidth="0.6" fill="none" strokeOpacity=".7"/>
        <path d="M 30 11 L 30 28" stroke={ENAMEL.shade} strokeWidth="0.4" fill="none" strokeOpacity=".55"/>
        <circle cx="30" cy="22" r="0.8" fill={ENAMEL.deep} fillOpacity=".5"/>
      </g>
    );
  } else { // molar — square with 4 cusps + cross grooves
    occlusal = (
      <g>
        <path d="M 13 12 Q 16 7 22 6 L 38 6 Q 44 7 47 12 L 48 26 Q 46 33 39 34 L 21 34 Q 14 33 12 26 Z" fill={`url(#${gid}-enamel)`} stroke={ENAMEL.deep} strokeWidth="0.5"/>
        <ellipse cx="22" cy="14" rx="4.2" ry="3.4" fill="#fff" fillOpacity=".55"/>
        <ellipse cx="38" cy="14" rx="4.2" ry="3.4" fill="#fff" fillOpacity=".55"/>
        <ellipse cx="22" cy="26" rx="4" ry="3" fill="#fff" fillOpacity=".5"/>
        <ellipse cx="38" cy="26" rx="4" ry="3" fill="#fff" fillOpacity=".5"/>
        {/* Grooves — central pit cross */}
        <path d="M 14 20 L 46 20" stroke={ENAMEL.deep} strokeWidth="0.7" fill="none" strokeOpacity=".75"/>
        <path d="M 30 8 L 30 32" stroke={ENAMEL.deep} strokeWidth="0.7" fill="none" strokeOpacity=".75"/>
        <circle cx="30" cy="20" r="1" fill={ENAMEL.deep} fillOpacity=".5"/>
        {/* Marginal ridge highlight */}
        <path d="M 15 11 Q 30 9 45 11" stroke="#fff" strokeWidth="1.2" strokeOpacity=".4" fill="none"/>
      </g>
    );
  }

  // Condition silhouette path matches crown outline so colored fill stays inside crown.
  let crownClip = null;
  if (condition && condition !== "healthy" && condition !== "missing") {
    const path = type === "incisor"
      ? "M 19 14 Q 22 7 30 5 Q 38 7 41 14 L 43 38 Q 43 46 40 50 L 20 50 Q 17 46 17 38 Z"
      : type === "canine"
      ? "M 17 16 Q 22 6 30 4 Q 38 6 43 16 L 44 38 Q 43 46 40 49 L 30 51 L 20 49 Q 17 46 16 38 Z"
      : type === "premolar"
      ? "M 16 14 Q 19 7 25 5 Q 30 4 35 5 Q 41 7 44 14 L 45 40 Q 44 47 41 51 L 19 51 Q 16 47 15 40 Z"
      : "M 12 14 Q 16 6 24 5 Q 30 4 36 5 Q 44 6 48 14 L 49 41 Q 47 49 43 52 L 17 52 Q 13 49 11 41 Z";
    const op = condition === "treated" || condition === "planned" ? 0.6 : condition === "crown" ? 0.78 : 0.72;
    crownClip = (
      <g style={{mixBlendMode:"multiply"}} opacity={op}>
        <path d={path} fill={cf}/>
      </g>
    );
  }

  return (
    <svg
      width="48" height="124" viewBox="0 0 60 130"
      style={{
        cursor:"pointer",
        overflow:"visible",
        filter: hovered ? "drop-shadow(0 8px 18px rgba(22,43,65,.22))" : "drop-shadow(0 1px 2px rgba(54,54,54,.08))",
        transition:"transform .18s cubic-bezier(.2,.8,.2,1), filter .18s",
        transform: hovered ? "translateY(-3px) scale(1.06)" : "none",
        opacity: isMissing ? 0.3 : 1,
      }}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {grad}

      {/* OCCLUSAL — top */}
      <g transform="translate(0, 2)">{occlusal}</g>

      {/* PROFILE — flipped for lower teeth so roots point downward into the gum */}
      <g transform={upper ? "translate(0, 24)" : "translate(60, 134) scale(-1, -1)"}>
        {profile}
        {crownClip}
        {cervicalShade}
        {/* Glossy specular highlight on enamel — top-left of crown */}
        <ellipse cx="22" cy="16" rx="6" ry="9" fill={`url(#${gid}-shine)`}/>
      </g>

      {/* Missing X */}
      {isMissing && (
        <g stroke="#A64242" strokeWidth="2.4" strokeLinecap="round" opacity="0.75">
          <path d="M 16 28 L 44 92"/>
          <path d="M 44 28 L 16 92"/>
        </g>
      )}

      {/* Selected ring — pulses subtly */}
      {selected && (
        <rect x="3" y="3" width="54" height="124" rx="10" ry="10"
              fill="var(--persimmon)" fillOpacity="0.06"
              stroke="var(--persimmon)" strokeWidth="2" strokeDasharray="4 3" opacity="0.95"/>
      )}

      {/* Hover halo */}
      {hovered && !selected && (
        <rect x="4" y="4" width="52" height="122" rx="10" ry="10"
              fill="none" stroke="var(--ink)" strokeOpacity=".25" strokeWidth="1.4"/>
      )}

      {/* Planned-procedure dots, top-right of crown */}
      {planned && planned.length > 0 && (
        <g transform="translate(50, 28)">
          {planned.slice(0,3).map((p,i)=>(
            <circle key={i} cx={0} cy={i*8} r="3.5" fill={p.color || "var(--persimmon)"} stroke="#fff" strokeWidth="1.2"/>
          ))}
        </g>
      )}
    </svg>
  );
};

window.ToothSVG = ToothSVG;
window.TOOTH_TYPE = TOOTH_TYPE;
window.TOOTH_NAMES = TOOTH_NAMES;
window.TOOTH_SURFACES = TOOTH_SURFACES;
window.IS_UPPER = IS_UPPER;
