import { ArrowRight, Mic, Navigation, Play, QrCode, Rocket, Wifi } from "lucide-react";
import { ZoomScene, scenes, useSceneCycle } from "../../components/park/HeroZoom";
import {Link} from "react-router-dom";

const pills = [
  { icon: Wifi, label: "Real-time\nAvailability" },
  { icon: Mic, label: "AI Voice\nAssistant" },
  { icon: QrCode, label: "QR Code\nEntry" },
  { icon: Navigation, label: "Smart\nNavigation" },
];

export function Hero() {
  const [index, setIndex] = useSceneCycle();

  return (
    <section className="aurora relative overflow-hidden px-5 pt-14 pb-20">
      <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3.5 py-1.5 text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
            <Rocket className="h-3.5 w-3.5 text-violet-glow" /> AI-Powered Parking Solution
          </span>

          <h1 className="mt-6 font-display text-4xl leading-[1.08] font-extrabold sm:text-5xl lg:text-[3.6rem]">
            ParkSmart
            <br />
            <span className="relative block min-h-[2.4em] sm:min-h-[2.3em]">
              {scenes.map((s, i) => (
                <span
                  key={s.headline}
                  aria-hidden={i !== index}
                  className={`text-gradient absolute inset-0 transition-all duration-700 ease-out ${
                    i === index ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
                  }`}
                >
                  {s.headline}
                </span>
              ))}
            </span>
          </h1>

          <p className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground">
            Find, reserve, and navigate to parking spaces in seconds. Powered by AI, built for
            smarter cities.
          </p>

          <ul className="mt-8 flex flex-wrap gap-4">
            {pills.map(({ icon: Icon, label }) => (
              <li key={label} className="w-[92px]">
                <div className="panel grid h-14 w-14 place-items-center rounded-2xl">
                  <Icon className="h-5 w-5 text-violet-glow" />
                </div>
                <p className="mt-2 text-xs leading-tight whitespace-pre-line text-muted-foreground">
                  {label}
                </p>
              </li>
            ))}
          </ul>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link
              to="/register"
              className="bg-brand-gradient glow inline-flex items-center gap-2.5 rounded-full px-7 py-3.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.03]"
            >
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Link>
            
            <a
              href="#demo"
              className="panel inline-flex items-center gap-3 rounded-full px-6 py-3.5 text-sm font-semibold"
            >
              <span className="grid h-7 w-7 place-items-center rounded-full bg-foreground/10">
                <Play className="h-3 w-3 fill-current" />
              </span>
              Watch Demo
            </a>
          </div>

          <div className="mt-8 flex items-center gap-3">
            <div className="flex -space-x-2.5">
              {[0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  className="h-8 w-8 rounded-full border-2 border-background bg-accent"
                  style={{ background: `oklch(0.5 0.12 ${260 + i * 25})` }}
                />
              ))}
              <span className="grid h-8 w-8 place-items-center rounded-full border-2 border-background bg-violet text-xs font-bold text-primary-foreground">
                +
              </span>
            </div>
            <p className="text-sm text-muted-foreground">Trusted by 15,000+ users worldwide</p>
          </div>
        </div>

        <ZoomScene index={index} onSelect={setIndex} />
      </div>
    </section>
  );
}
