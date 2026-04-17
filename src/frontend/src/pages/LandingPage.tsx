import { useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

// ─── Pixel font grids (5 rows × N cols, 1=brick, 0=empty) ────────────────────

const PIXEL_FONT: Record<string, number[][]> = {
  I: [
    [1, 1, 1],
    [0, 1, 0],
    [0, 1, 0],
    [0, 1, 0],
    [1, 1, 1],
  ],
  n: [
    [0, 0, 0],
    [1, 1, 0],
    [1, 0, 1],
    [1, 0, 1],
    [1, 0, 1],
  ],
  f: [
    [0, 1, 1],
    [0, 1, 0],
    [1, 1, 0],
    [0, 1, 0],
    [0, 1, 0],
  ],
  r: [
    [0, 0, 0],
    [1, 1, 0],
    [1, 0, 1],
    [1, 0, 0],
    [1, 0, 0],
  ],
  a: [
    [0, 0, 0],
    [0, 1, 1],
    [1, 0, 1],
    [1, 1, 1],
    [1, 0, 1],
  ],
  S: [
    [0, 1, 1],
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
    [1, 1, 0],
  ],
  e: [
    [0, 0, 0],
    [0, 1, 1],
    [1, 1, 0],
    [1, 0, 0],
    [0, 1, 1],
  ],
  t: [
    [1, 1, 1],
    [0, 1, 0],
    [0, 1, 0],
    [0, 1, 0],
    [0, 0, 1],
  ],
  u: [
    [0, 0, 0],
    [1, 0, 1],
    [1, 0, 1],
    [1, 0, 1],
    [0, 1, 1],
  ],
};

const WORD = "InfraSetu";

// ─── Brick type ───────────────────────────────────────────────────────────────

interface Brick {
  id: number;
  letterIndex: number;
  row: number;
  col: number;
  delay: number;
}

interface DustParticle {
  id: number;
  x: number;
  y: number;
  brickId: number;
  side: "left" | "right";
}

// ─── Build all bricks from pixel font ────────────────────────────────────────

function buildBricks(): Brick[] {
  const bricks: Brick[] = [];
  let id = 0;

  for (let letterIndex = 0; letterIndex < WORD.length; letterIndex++) {
    const letter = WORD[letterIndex];
    const grid = PIXEL_FONT[letter];
    if (!grid) continue;
    const rows = grid.length; // always 5
    const cols = grid[0].length; // always 3

    // Animate: left-to-right columns, then top-to-bottom within column
    for (let col = 0; col < cols; col++) {
      for (let row = 0; row < rows; row++) {
        if (grid[row][col] === 1) {
          // delay: letter order drives base, then col, then row
          const delay = letterIndex * 0.18 + col * 0.04 + row * 0.015;
          bricks.push({ id: id++, letterIndex, row, col, delay });
        }
      }
    }
  }

  return bricks;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function LandingPage() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<
    "dropping" | "glow" | "tagline" | "buttons"
  >("dropping");
  const [dustParticles, setDustParticles] = useState<DustParticle[]>([]);
  const bricks = useRef(buildBricks()).current;
  const dustIdRef = useRef(0);

  // Last brick delay + fall duration
  const lastDelay = Math.max(...bricks.map((b) => b.delay));
  const TOTAL_END_MS = (lastDelay + 0.6) * 1000 + 120;

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("glow"), TOTAL_END_MS);
    const t2 = setTimeout(() => setPhase("tagline"), TOTAL_END_MS + 550);
    const t3 = setTimeout(() => setPhase("buttons"), TOTAL_END_MS + 1350);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [TOTAL_END_MS]);

  function handleBrickLand(brickId: number, x: number, y: number) {
    const newDust: DustParticle[] = [
      { id: dustIdRef.current++, x, y, brickId, side: "left" },
      { id: dustIdRef.current++, x, y, brickId, side: "right" },
    ];
    setDustParticles((prev) => [...prev, ...newDust]);
    setTimeout(() => {
      setDustParticles((prev) => prev.filter((d) => d.brickId !== brickId));
    }, 700);
  }

  return (
    <div
      data-ocid="landing.page"
      className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden"
      style={{
        background:
          "linear-gradient(160deg, #FEF3C7 0%, #FFFBEB 40%, #ffffff 100%)",
      }}
    >
      {/* Subtle grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 39px, #F59E0B22 39px, #F59E0B22 40px), repeating-linear-gradient(90deg, transparent, transparent 39px, #F59E0B22 39px, #F59E0B22 40px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative z-10 flex flex-col items-center px-4">
        {/* Crane accent */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-8 flex items-center gap-2"
        >
          <svg
            width="36"
            height="36"
            viewBox="0 0 36 36"
            fill="none"
            aria-hidden="true"
          >
            <rect x="4" y="28" width="28" height="4" rx="1" fill="#F59E0B" />
            <rect x="15" y="8" width="3" height="22" rx="1" fill="#D97706" />
            <rect x="8" y="8" width="20" height="3" rx="1" fill="#F59E0B" />
            <rect x="8" y="8" width="3" height="10" rx="1" fill="#D97706" />
            <circle cx="10" cy="20" r="2" fill="#F59E0B" />
            <rect x="23" y="11" width="2" height="6" rx="1" fill="#D97706" />
          </svg>
          <span className="text-xs font-semibold tracking-[0.2em] uppercase text-amber-600 font-body">
            Smart Construction Management
          </span>
        </motion.div>

        {/* ── Pixel-brick word ───────────────────────────── */}
        <BrickWord
          bricks={bricks}
          phase={phase}
          onBrickLand={handleBrickLand}
        />

        {/* Dust particles */}
        <AnimatePresence>
          {dustParticles.map((dust) => (
            <motion.div
              key={dust.id}
              initial={{ opacity: 0.5, scale: 1, x: 0, y: 0 }}
              animate={{
                opacity: 0,
                scale: 0.3,
                x: dust.side === "left" ? -12 : 12,
                y: -10,
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="absolute pointer-events-none"
              style={{ left: dust.x, top: dust.y }}
            >
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-300/70" />
            </motion.div>
          ))}
        </AnimatePresence>

        {/* ── Tagline ──────────────────────────────────── */}
        <AnimatePresence>
          {(phase === "tagline" || phase === "buttons") && (
            <motion.p
              key="tagline"
              data-ocid="landing.tagline"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="mt-7 text-base sm:text-lg md:text-xl text-amber-800/80 font-body font-medium tracking-wide text-center"
            >
              Bharat ke Nirmaan ko Digital Setu
            </motion.p>
          )}
        </AnimatePresence>

        {/* ── Buttons ──────────────────────────────────── */}
        <AnimatePresence>
          {phase === "buttons" && (
            <motion.div
              key="buttons"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
              className="mt-9 flex flex-col sm:flex-row items-center gap-4"
            >
              <motion.button
                data-ocid="landing.login_button"
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate({ to: "/login" })}
                className="px-9 py-3.5 rounded-xl font-semibold text-white font-body text-base tracking-wide shadow-amber transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2"
                style={{
                  background:
                    "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
                  boxShadow:
                    "0 6px 22px rgba(245,158,11,0.35), 0 2px 8px rgba(0,0,0,0.08)",
                }}
              >
                Login
              </motion.button>
              <motion.button
                data-ocid="landing.signup_button"
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate({ to: "/login" })}
                className="px-9 py-3.5 rounded-xl font-semibold font-body text-base tracking-wide border-2 border-amber-400 text-amber-700 bg-white/80 backdrop-blur-sm transition-smooth hover:bg-amber-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2"
                style={{ boxShadow: "0 2px 12px rgba(245,158,11,0.12)" }}
              >
                Sign Up
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer badge */}
        <AnimatePresence>
          {phase === "buttons" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="mt-10 text-xs text-amber-500/70 font-body tracking-widest uppercase"
            >
              © {new Date().getFullYear()} InfraSetu &nbsp;·&nbsp;{" "}
              <a
                href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(
                  typeof window !== "undefined" ? window.location.hostname : "",
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-amber-600 transition-colors"
              >
                Built with caffeine.ai
              </a>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── BrickWord ────────────────────────────────────────────────────────────────

interface BrickWordProps {
  bricks: Brick[];
  phase: string;
  onBrickLand: (id: number, x: number, y: number) => void;
}

// Responsive brick size via CSS clamp logic — we compute in JS from viewport
const BRICK_SIZE =
  typeof window !== "undefined" && window.innerWidth < 480 ? 8 : 13;
const BRICK_GAP = 2;
const LETTER_GAP = BRICK_SIZE + BRICK_GAP; // 1-column gap between letters
const ROWS = 5;
const COLS_PER_LETTER = 3;

function BrickWord({ bricks, phase, onBrickLand }: BrickWordProps) {
  const letterCount = WORD.length;
  const totalWidth =
    letterCount * (COLS_PER_LETTER * (BRICK_SIZE + BRICK_GAP) - BRICK_GAP) +
    (letterCount - 1) * LETTER_GAP;
  const totalHeight = ROWS * (BRICK_SIZE + BRICK_GAP) - BRICK_GAP;

  // Group bricks by letterIndex
  const byLetter: Record<number, Brick[]> = {};
  for (const b of bricks) {
    if (!byLetter[b.letterIndex]) byLetter[b.letterIndex] = [];
    byLetter[b.letterIndex].push(b);
  }

  return (
    <div
      className="relative select-none"
      style={{ width: totalWidth, height: totalHeight }}
    >
      {/* Render each letter block */}
      {WORD.split("").map((_letter, letterIndex) => {
        const offsetX =
          letterIndex *
          (COLS_PER_LETTER * (BRICK_SIZE + BRICK_GAP) - BRICK_GAP + LETTER_GAP);
        const letterBricks = byLetter[letterIndex] ?? [];
        const stableKey = `L${letterIndex}`;

        return (
          <div
            key={stableKey}
            className="absolute top-0"
            style={{ left: offsetX }}
          >
            {letterBricks.map((brick) => (
              <PixelBrick
                key={brick.id}
                brick={brick}
                brickSize={BRICK_SIZE}
                brickGap={BRICK_GAP}
                onLand={onBrickLand}
              />
            ))}
          </div>
        );
      })}

      {/* Golden glow overlay when phase >= glow */}
      <AnimatePresence>
        {(phase === "glow" || phase === "tagline" || phase === "buttons") && (
          <motion.div
            key="word-glow"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1.02 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="absolute pointer-events-none"
            style={{
              inset: "-12px",
              borderRadius: "8px",
              boxShadow:
                "0 0 56px 16px rgba(245,158,11,0.28), 0 0 20px 4px rgba(245,158,11,0.15)",
              background:
                "radial-gradient(ellipse at center, rgba(254,243,199,0.45) 0%, transparent 70%)",
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── PixelBrick ───────────────────────────────────────────────────────────────

interface PixelBrickProps {
  brick: Brick;
  brickSize: number;
  brickGap: number;
  onLand: (id: number, x: number, y: number) => void;
}

function PixelBrick({ brick, brickSize, brickGap, onLand }: PixelBrickProps) {
  const hasNotified = useRef(false);

  const left = brick.col * (brickSize + brickGap);
  const top = brick.row * (brickSize + brickGap);

  // Start high above, staggered per letter so earlier letters fall first
  const startY = -220 - brick.letterIndex * 30;

  function handleComplete() {
    if (hasNotified.current) return;
    hasNotified.current = true;
    onLand(brick.id, left + brickSize / 2, top + brickSize);
  }

  // Alternate two amber shades for texture
  const isEven = (brick.row + brick.col + brick.letterIndex) % 2 === 0;
  const bg = isEven ? "#F59E0B" : "#D97706";
  const shadow = isEven
    ? "inset 0 1px 0 rgba(255,255,255,0.38), inset 0 -1px 0 rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.12)"
    : "inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -1px 0 rgba(0,0,0,0.22), 0 2px 4px rgba(0,0,0,0.14)";

  return (
    <motion.div
      initial={{ y: startY, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{
        delay: brick.delay,
        duration: 0.52,
        ease: [0.2, 1.6, 0.4, 1],
        opacity: { duration: 0.08, delay: brick.delay },
      }}
      onAnimationComplete={handleComplete}
      className="absolute"
      style={{
        width: brickSize,
        height: brickSize,
        left,
        top,
        background: bg,
        boxShadow: shadow,
        borderRadius: "2px",
      }}
    >
      {/* Mortar texture lines */}
      <div
        className="absolute inset-x-0 bottom-0 h-px"
        style={{ background: "rgba(0,0,0,0.1)" }}
      />
      <div
        className="absolute inset-y-0 right-0 w-px"
        style={{ background: "rgba(0,0,0,0.07)" }}
      />
    </motion.div>
  );
}
