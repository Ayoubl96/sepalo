import { roadmapColumns, shippedItems } from '@/data/roadmap';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Roadmap',
  description:
    'Cosa stiamo costruendo, cosa viene dopo, e cosa potrebbe arrivare un giorno. Niente date — solo direzione.',
};

export default function RoadmapPage() {
  return (
    <div className=" bg-[#fdfaf2]">
      {/* SVG defs for rough/hand-drawn filters */}
      <svg width="0" height="0" className="absolute" aria-hidden="true">
        <defs>
          <filter id="rough-1">
            <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="2" seed="2" />
            <feDisplacementMap in="SourceGraphic" scale="2.2" />
          </filter>
          <filter id="rough-2">
            <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed="7" />
            <feDisplacementMap in="SourceGraphic" scale="1.6" />
          </filter>
          <filter id="rough-3">
            <feTurbulence type="fractalNoise" baseFrequency="0.06" numOctaves="2" seed="13" />
            <feDisplacementMap in="SourceGraphic" scale="1.2" />
          </filter>
          <marker
            id="arrow-road"
            viewBox="0 0 10 10"
            refX="6"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto"
          >
            <path d="M0,0 L10,5 L0,10 z" fill="#1e1e1e" />
          </marker>
        </defs>
      </svg>

      <div className="mx-auto max-w-360 px-14 py-12">
        {/* Title */}
        <div className="relative mb-2 inline-block">
          <h1 className="font-kalam text-[60px] font-bold leading-none text-[#1e1e1e]">Roadmap</h1>
          <svg
            width="220"
            height="20"
            className="absolute -bottom-2 -left-1"
            style={{ filter: 'url(#rough-1)' }}
            aria-hidden="true"
          >
            <path
              d="M 4 10 Q 60 4, 120 10 T 210 6"
              stroke="#e03131"
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <p className="font-kalam mt-6 max-w-2xl text-lg leading-relaxed text-[#1e1e1e]">
          Cosa stiamo facendo adesso, cosa subito dopo, e cosa ci piacerebbe fare un giorno.
          <br />
          Niente date — solo direzione.
        </p>

        {/* Columns */}
        <div className="mt-10 grid grid-cols-3 gap-14 relative">
          {roadmapColumns.map((col) => (
            <div key={col.label}>
              {/* Column header */}
              <div className="mb-5 relative">
                <div
                  className="font-kalam text-[38px] font-bold leading-none inline-block relative"
                  style={{ color: col.color }}
                >
                  {col.label}
                  <svg
                    width="100%"
                    height="14"
                    className="absolute -bottom-2 left-0"
                    style={{ filter: 'url(#rough-2)' }}
                    aria-hidden="true"
                  >
                    <path
                      d="M 4 6 Q 30 2, 60 6 T 120 6"
                      stroke={col.color}
                      strokeWidth="2.5"
                      fill="none"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <div className="font-kalam mt-5 text-[15px] text-[#868e96]">{col.sub}</div>
              </div>

              {/* Cards */}
              <div className="flex flex-col gap-3.5">
                {col.items.map((item, j) => {
                  const rotations = [-0.4, 0.5, -0.3, 0.6, -0.5];
                  const rotate = rotations[j] ?? 0;
                  return (
                    // biome-ignore lint/suspicious/noArrayIndexKey: display-only list, no stable id
                    <div key={j} className="relative" style={{ transform: `rotate(${rotate}deg)` }}>
                      <svg
                        className="absolute inset-0 overflow-visible"
                        width="100%"
                        height="100%"
                        aria-hidden="true"
                      >
                        <rect
                          x="3"
                          y="3"
                          width="calc(100% - 6)"
                          height="calc(100% - 6)"
                          rx="4"
                          fill="white"
                          stroke={col.color}
                          strokeWidth="1.8"
                          style={{ filter: 'url(#rough-2)' }}
                        />
                      </svg>
                      <div className="relative px-3.5 py-3 flex items-start gap-2.5">
                        <StatusIcon status={item.status} color={col.color} />
                        <div>
                          <div
                            className="font-kalam text-[17px] leading-snug text-[#1e1e1e]"
                            style={{
                              textDecoration: item.status === 'done' ? 'line-through' : 'none',
                              opacity: item.status === 'done' ? 0.55 : 1,
                            }}
                          >
                            {item.label}
                          </div>
                          {item.sub && (
                            <div className="font-kalam mt-1 text-[13px] text-[#868e96]">
                              {item.sub}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Shipped / Done */}
        <div className="mt-14">
          <div className="flex items-baseline gap-3 mb-4">
            <span className="font-kalam text-[28px] font-bold text-[#2f9e44]">Fatto</span>
            <span className="font-kalam text-[14px] text-[#868e96]">già nel prodotto</span>
          </div>
          <div className="flex flex-wrap gap-4">
            {shippedItems.map((item, i) => (
              <div
                key={item}
                className="flex items-center gap-2"
                style={{ transform: `rotate(${i % 2 === 0 ? -0.5 : 0.6}deg)` }}
              >
                <DoneIcon />
                <span
                  className="font-kalam text-[16px] text-[#1e1e1e]"
                  style={{ textDecoration: 'line-through', opacity: 0.6 }}
                >
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Sticky note */}
        <div
          className="fixed top-52 right-10 z-10 hidden xl:block"
          style={{ transform: 'rotate(3deg)' }}
        >
          <div className="relative w-[210px] h-[130px]">
            <svg
              className="absolute inset-0 overflow-visible"
              width="210"
              height="130"
              aria-hidden="true"
            >
              <rect
                x="3"
                y="3"
                width="204"
                height="124"
                rx="4"
                fill="#ffec99"
                stroke="#1e1e1e"
                strokeWidth="1.5"
                style={{ filter: 'url(#rough-2)' }}
              />
            </svg>
            <div className="relative p-3.5 font-kalam text-[15px] text-[#1e1e1e] leading-snug">
              <strong>Hai un&apos;idea?</strong>
              <br />
              Apri una issue su GitHub
              <br />
              con il tag <span className="bg-white rounded px-1">roadmap</span>.
              <br />
              Le più votate 👍 saltano
              <br />
              in cima. 🌱
            </div>
          </div>
        </div>

        {/* Footer signature */}
      </div>
    </div>
  );
}

function StatusIcon({ status, color }: { status: string; color: string }) {
  if (status === 'done') {
    return (
      <svg
        width="20"
        height="20"
        viewBox="0 0 22 22"
        className="shrink-0 mt-0.5"
        style={{ filter: 'url(#rough-3)' }}
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="8" fill={color} stroke={color} strokeWidth="1.5" />
        <path
          d="M 7 11 L 10 14 L 15 8"
          stroke="white"
          strokeWidth="2.4"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (status === 'doing') {
    return (
      <svg
        width="20"
        height="20"
        viewBox="0 0 22 22"
        className="shrink-0 mt-0.5"
        style={{ filter: 'url(#rough-3)' }}
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="8" fill="none" stroke={color} strokeWidth="2" />
        <path d="M 11 11 L 11 4 A 7 7 0 0 1 17.5 12 z" fill={color} />
      </svg>
    );
  }
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 22 22"
      className="shrink-0 mt-0.5"
      style={{ filter: 'url(#rough-3)' }}
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="8" fill="none" stroke={color} strokeWidth="2" />
    </svg>
  );
}

function DoneIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 22 22"
      className="shrink-0"
      style={{ filter: 'url(#rough-3)' }}
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="8" fill="#2f9e44" stroke="#2f9e44" strokeWidth="1.5" />
      <path
        d="M 7 11 L 10 14 L 15 8"
        stroke="white"
        strokeWidth="2.4"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
