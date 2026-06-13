'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import HomeSearch from './HomeSearch';

/* Immersive hero carousel banner with a search bar fixed over the bottom.
   Placeholder slides for now — drop real banner images into SLIDES later
   (give each an `image` and the gradient becomes a fallback). */

type Slide = {
  eyebrow: string;
  title: string;
  subtitle: string;
  background: string;
};

const SLIDES: Slide[] = [
  {
    eyebrow: "Sri Lanka's tech accessories store",
    title: 'Tech accessories, delivered across Sri Lanka',
    subtitle: 'Pay on delivery · Island-wide',
    background: 'linear-gradient(120deg, #19191a 0%, #2d2e2f 60%, #414244 100%)',
  },
  {
    eyebrow: 'Everyday essentials',
    title: 'Earbuds, chargers, power banks & cables',
    subtitle: 'Warranty-backed · Fair prices',
    background: 'linear-gradient(120deg, #2d2e2f 0%, #555658 100%)',
  },
  {
    eyebrow: 'Just in',
    title: 'New arrivals, every week',
    subtitle: 'Follow us for the latest drops',
    background: 'linear-gradient(120deg, #19191a 0%, #3a3b3d 100%)',
  },
];

const DURATION = 600; // ms — must match the CSS transition below

export default function HeroBanner() {
  const n = SLIDES.length;
  // Extended track: [lastClone, ...SLIDES, firstClone] for a seamless loop.
  const extended = [SLIDES[n - 1], ...SLIDES, SLIDES[0]];
  const [pos, setPos] = useState(1); // start on the first real slide
  const [transitionOn, setTransitionOn] = useState(true);
  const [paused, setPaused] = useState(false);

  // Cap at the clone boundaries (0 = last clone, n+1 = first clone) so rapid
  // clicks / auto-advance can never overshoot.
  const next = useCallback(() => { setTransitionOn(true); setPos(p => Math.min(p + 1, n + 1)); }, [n]);
  const prev = useCallback(() => { setTransitionOn(true); setPos(p => Math.max(p - 1, 0)); }, [n]);

  // When we land on a clone, snap to the matching real slide after the slide
  // animation finishes (timer-based — transitionend is unreliable here).
  useEffect(() => {
    if (pos !== 0 && pos !== n + 1) return;
    const t = setTimeout(() => { setTransitionOn(false); setPos(pos === 0 ? n : 1); }, DURATION);
    return () => clearTimeout(t);
  }, [pos, n]);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(next, 6000);
    return () => clearInterval(t);
  }, [paused, next]);

  return (
    <section
      aria-label="Featured"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      style={{
        position: 'relative', width: '100%',
        height: 'min(68vh, 600px)', minHeight: 420,
        overflow: 'hidden', background: 'var(--surface-ink)',
      }}
    >
      {/* Slides track */}
      <div style={{ display: 'flex', height: '100%', transform: `translateX(-${pos * 100}%)`, transition: transitionOn ? `transform ${DURATION}ms var(--ease-standard)` : 'none' }}>
        {extended.map((s, idx) => (
          <div key={idx} style={{ flex: '0 0 100%', height: '100%', position: 'relative', background: s.background, overflow: 'hidden' }}>
            {/* Wordmark watermark */}
            <Image src="/novatek-logo.svg" alt="" aria-hidden width={520} height={143}
              style={{ position: 'absolute', right: -30, top: -10, width: 'min(48vw, 460px)', height: 'auto', opacity: 0.07, filter: 'invert(1)', pointerEvents: 'none' }} />
            {/* Copy */}
            <div className="wrap" style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingBottom: 96, maxWidth: 'var(--container)' }}>
              <div style={{ maxWidth: 620 }}>
                <p className="eyebrow" style={{ color: 'rgba(255,255,255,.55)', marginBottom: 16 }}>{s.eyebrow}</p>
                <h1 style={{ fontSize: 'clamp(34px,5vw,60px)', fontFamily: 'var(--font-head)', fontWeight: 700, letterSpacing: '-0.01em', lineHeight: 1, color: '#fff', marginBottom: 18 }}>
                  {s.title}
                </h1>
                <p style={{ fontSize: 19, color: 'rgba(255,255,255,.72)', lineHeight: 1.45 }}>{s.subtitle}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Prev / Next arrows */}
      <button aria-label="Previous slide" onClick={prev} className="hero-arrow" style={arrowStyle('left')}>
        <Chevron dir="left" />
      </button>
      <button aria-label="Next slide" onClick={next} className="hero-arrow" style={arrowStyle('right')}>
        <Chevron dir="right" />
      </button>

      {/* Search overlay — fixed over the bottom of the banner */}
      <div style={{ position: 'absolute', bottom: 28, left: 0, right: 0, display: 'flex', justifyContent: 'center', padding: '0 24px', zIndex: 3 }}>
        <HomeSearch maxWidth={520} fieldStyle={{ background: '#fff', border: 'none', height: 54, boxShadow: 'var(--shadow-lg)' }} />
      </div>

      <style>{`
        .hero-arrow:hover { background: #fff !important; color: var(--ink) !important; }
        @media (max-width: 720px) {
          .hero-arrow { display: none !important; }
        }
      `}</style>
    </section>
  );
}

function arrowStyle(side: 'left' | 'right'): React.CSSProperties {
  return {
    position: 'absolute', top: '46%', [side]: 20, transform: 'translateY(-50%)',
    width: 44, height: 44, borderRadius: 'var(--pill)', border: 'none', cursor: 'pointer',
    background: 'rgba(255,255,255,.85)', color: 'var(--ink)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3,
    transition: 'background .2s, color .2s',
  };
}

function Chevron({ dir }: { dir: 'left' | 'right' }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"
      style={{ transform: dir === 'left' ? 'rotate(180deg)' : undefined }}>
      <path d="M9 6l6 6-6 6" />
    </svg>
  );
}
