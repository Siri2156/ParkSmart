import { useEffect, useState } from "react";
import isoCityAsset from "../../assets/iso-city-green.png";
import scene1Asset from "../../assets/iso-scene-1.png";
import scene2Asset from "../../assets/iso-scene-2.png";
import scene3Asset from "../../assets/iso-scene-3.png";
import scene4Asset from "../../assets/iso-scene-4.png";
import scene5Asset from "../../assets/iso-scene-5.png";

export type Scene = {
  headline: string;
  image: string;
  alt: string;
  /** lens center position within the illustration, in % */
  x: number;
  y: number;
};

export const scenes: Scene[] = [
  {
    headline: "with an AI parking assistant",
    image: scene1Asset,
    alt: "Car passing an automated parking barrier with a ticket kiosk",
    x: 46,
    y: 58,
  },
  {
    headline: "supports app-free parking",
    image: scene2Asset,
    alt: "Parking garage entrance with a QR code entry panel",
    x: 60,
    y: 40,
  },
  {
    headline: "earns 25% more ROI",
    image: scene3Asset,
    alt: "Rooftop parking deck with reserved bay signage",
    x: 72,
    y: 52,
  },
  {
    headline: "gives you access control",
    image: scene4Asset,
    alt: "Electric cars charging in reserved parking bays",
    x: 34,
    y: 46,
  },
  {
    headline: "digitizes parking operations",
    image: scene5Asset,
    alt: "Hand holding a phone with the parking booking app open",
    x: 55,
    y: 66,
  },
];

const INTRO_DELAY = 1800;

export function useSceneCycle(intervalMs = 4200) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    let interval = 0;
    const start = window.setTimeout(() => {
      interval = window.setInterval(
        () => setIndex((i) => (i + 1) % scenes.length),
        intervalMs,
      );
    }, INTRO_DELAY + intervalMs);
    return () => {
      window.clearTimeout(start);
      window.clearInterval(interval);
    };
  }, [intervalMs]);
  return [index, setIndex] as const;
}

export function ZoomScene({
  index,
  onSelect,
}: {
  index: number;
  onSelect: (i: number) => void;
}) {
  const scene = scenes[index] ?? scenes[0]!;
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setRevealed(true), INTRO_DELAY);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <div className="relative">
      <div className="relative overflow-hidden">
        <img
          src={isoCityAsset}
          alt="Isometric view of a smart city parking district"
          width={1600}
          height={1200}
          className="w-full select-none"
        />

        {/* animated zoom lens */}
        <div
          className={`pointer-events-none absolute h-[46%] w-[34%] transition-[left,top,opacity,transform] duration-[1200ms] ease-[cubic-bezier(0.65,0,0.35,1)] ${
            revealed ? "scale-100 opacity-100" : "scale-75 opacity-0"
          }`}
          style={{
            left: `calc(${scene.x}% - 17%)`,
            top: `calc(${scene.y}% - 23%)`,
          }}
        >
          <div className="lens-ring relative h-full w-full overflow-hidden rounded-full bg-[oklch(0.96_0.02_290)]">

            {scenes.map((s, i) => (
              <img
                key={s.image}
                src={s.image}
                alt={s.alt}
                width={912}
                height={912}
                loading={i === 0 ? "eager" : "lazy"}
                className={`absolute inset-0 h-full w-full object-cover transition-all duration-[900ms] ease-out ${
                  i === index
                    ? "scale-100 opacity-100 blur-0"
                    : "scale-[1.35] opacity-0 blur-[2px]"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
