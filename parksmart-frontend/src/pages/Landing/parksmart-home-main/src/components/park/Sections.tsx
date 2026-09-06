import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Calendar,
  Car,
  ChevronLeft,
  ChevronRight,
  Headphones,
  MapPin,
  Mic,
  Navigation,
  QrCode,
  Search,
  Shield,
  Star,
  Wifi,
} from "lucide-react";
import parkingPreviewAsset from "../../assets/parking-preview.jpg";
import featuresBackground from "../../assets/smart-parking-features-bg.jpg";

const stats = [
  {
    icon: Car,
    value: 15000,
    suffix: "+",
    label: "Total Bookings",
    trend: "+24%",
    trendText: "this month",
    iconColor: "text-violet-glow",
    accent: "border-violet-500",
  },
  {
    icon: MapPin,
    value: 120,
    suffix: "+",
    label: "Smart Locations",
    trend: "+12%",
    trendText: "this month",
    iconColor: "text-emerald-500",
    accent: "border-emerald-500",
  },
  {
    icon: Shield,
    value: 98,
    suffix: "%",
    label: "Accuracy Rate",
    trend: "+2%",
    trendText: "improvement",
    iconColor: "text-blue-500",
    accent: "border-blue-500",
  },
  {
    icon: Headphones,
    value: 24,
    suffix: "/7",
    label: "Customer Support",
    trend: "Always",
    trendText: "here for you",
    iconColor: "text-orange-500",
    accent: "border-orange-500",
  },
];

function CountUp({
  end,
  duration = 1500,
}: {
  end: number;
  duration?: number;
}) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const elementRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const element = elementRef.current;

    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;

    let animationFrame: number;
    let startTime: number | null = null;

    const animate = (currentTime: number) => {
      if (startTime === null) {
        startTime = currentTime;
      }

      const progress = Math.min(
        (currentTime - startTime) / duration,
        1
      );

      const easeOut = 1 - Math.pow(1 - progress, 3);

      setCount(Math.floor(end * easeOut));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration, started]);

  return (
    <span ref={elementRef}>
      {count.toLocaleString()}
    </span>
  );
}

export function Stats() {
  return (
    <section className="px-5 py-6 sm:py-8">
      <div className="mx-auto max-w-[1400px] rounded-[32px] border border-border/60 bg-card/30 p-4 sm:p-5">
        
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map(
            ({
              icon: Icon,
              value,
              suffix,
              label,
              trend,
              trendText,
              iconColor,
              accent,
            }) => (
              <article
                key={label}
                className={`
                  group relative flex min-h-[145px] items-center
                  overflow-hidden rounded-[28px]
                  border border-border/70
                  bg-card/90 px-5 py-4
                  shadow-sm
                  transition-all duration-300
                  hover:-translate-y-1
                  hover:shadow-lg
                `}
              >
                {/* Colored left accent */}
                <div
                  className={`absolute left-0 top-0 h-full w-[3px] ${accent}`}
                />

                {/* Main content */}
                <div className="flex w-full items-center gap-4">
                  
                  {/* Icon */}
                  <div className="grid h-16 w-16 shrink-0 place-items-center rounded-[22px] bg-secondary">
                    <Icon className={`h-7 w-7 ${iconColor}`} />
                  </div>

                  {/* Text content */}
                  <div className="min-w-0 flex-1">
                    
                    {/* Number */}
                    <h3 className="font-display text-3xl font-bold tracking-tight text-foreground">
                      <CountUp end={value} />
                      {suffix}
                    </h3>

                    {/* Label */}
                    <p className="mt-1 text-base font-medium text-foreground">
                      {label}
                    </p>

                    {/* Trend */}
                    <div className="mt-2 flex items-center gap-1.5 text-sm">
                      {label !== "Customer Support" ? (
                        <>
                          <span className="font-semibold text-emerald-500">
                            ↑ {trend}
                          </span>

                          <span className="text-muted-foreground">
                            {trendText}
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="h-2 w-2 rounded-full bg-orange-500" />

                          <span className="text-muted-foreground">
                            {trendText}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Trend badge */}
                <span className="absolute right-4 top-4 rounded-full bg-secondary px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
                  ↗ {trend}
                </span>

                {/* Decorative chart for Total Bookings */}
                {label === "Total Bookings" && (
                  <div className="absolute bottom-4 right-4 flex items-end gap-1 opacity-50">
                    {[20, 30, 42, 55].map((height, index) => (
                      <span
                        key={index}
                        className="w-2 rounded-t-md bg-violet-500"
                        style={{
                          height: `${height}px`,
                        }}
                      />
                    ))}
                  </div>
                )}
              </article>
            )
          )}
        </div>
      </div>
    </section>
  );
}

const features = [
  { icon: Wifi, title: "Real-time Availability", body: "Live parking slot updates across all locations." },
  { icon: Mic, title: "AI Voice Assistant", body: 'Hey Jarvis, find parking near me."' },
  { icon: QrCode, title: "QR Code Entry", body: "Seamless entry and exit with QR-based access." },
  { icon: Navigation, title: "Smart Navigation", body: "Get the fastest route to your reserved spot." },
];

function Eyebrow({ children }: { children: string }) {
  return (
    <span className="inline-block rounded-full border border-border bg-card/70 px-3.5 py-1.5 text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
      {children}
    </span>
  );
}

export function Features() {
  return (
    <section
      id="features"
      className="relative overflow-hidden px-5 py-20 sm:py-24"
    >
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={featuresBackground}
          alt=""
          className="
            absolute right-0 top-0
            h-full w-full
            object-cover
            object-right
            opacity-70
          "
        />

        {/* Light overlay */}
        <div
          className="
            absolute inset-0
            bg-gradient-to-r
            from-background
            via-background/95
            to-background/45
          "
        />

        {/* Bottom fade */}
        <div
          className="
            absolute inset-x-0 bottom-0
            h-32
            bg-gradient-to-t
            from-background
            to-transparent
          "
        />
      </div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-7xl">

        <div className="grid items-center gap-10 lg:grid-cols-[420px_1fr]">

          {/* LEFT SIDE */}
          <div>
            <Eyebrow>Our Features</Eyebrow>

            <h2 className="mt-5 font-display text-3xl font-bold leading-tight sm:text-4xl">
              Everything you need for
              <span className="mt-1 block bg-brand-gradient bg-clip-text text-transparent">
                hassle-free parking
              </span>
            </h2>

            <p className="mt-5 max-w-md text-sm leading-7 text-muted-foreground sm:text-base">
              Smart technology, real-time updates and AI assistance
              to make your parking experience seamless, safe and
              stress-free.
            </p>
          </div>

          {/* RIGHT SIDE - HORIZONTAL RECTANGULAR CARDS */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

            {features.map(({ icon: Icon, title, body }, index) => {
              const iconStyles = [
                "text-violet-glow bg-violet/10",
                "text-cyan bg-cyan/10",
                "text-success bg-success/10",
                "text-magenta bg-magenta/10",
              ];

              return (
                <article
                  key={title}
                  className="
                    group
                    min-h-[175px]
                    rounded-3xl
                    border border-white/60
                    bg-card/80
                    px-5
                    py-5
                    shadow-lg
                    shadow-black/5
                    backdrop-blur-md
                    transition-all
                    duration-300
                    hover:-translate-y-1
                    hover:bg-card/95
                    hover:shadow-xl
                  "
                >
                  {/* Icon */}
                  <div
                    className={`
                      grid h-12 w-12
                      place-items-center
                      rounded-xl
                      ${iconStyles[index]}
                    `}
                  >
                    <Icon className="h-5 w-5" />
                  </div>

                  {/* Content */}
                  <h3 className="mt-5 text-sm font-bold leading-6 text-foreground">
                    {title}
                  </h3>

                  <p className="mt-2 text-xs leading-5 text-muted-foreground">
                    {body}
                  </p>
                </article>
              );
            })}

          </div>
        </div>
      </div>
    </section>
  );
}

const jarvisPrompts = [
  "Find parking near me",
  "Book nearest available slot",
  "Navigate to my booking",
  "Show my bookings",
];
const ascendingHeights = [12, 18, 38, 66, 42, 22];

  // Slope array that scales DOWN from tall to small
  const descendingHeights = [...ascendingHeights].reverse();

  // Slope array for left sound waves (small to high)
  const leftHeights = ascendingHeights;

  // Slope array for right sound waves (high to small)
  const rightHeights = descendingHeights;

export function LivePreview() {
  return (
    <section
      id="solutions"
      className="relative overflow-hidden px-5 py-16 lg:py-20"
    >
      {/* ================= BACKGROUND DECORATION ================= */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 bottom-0 h-96 w-96 rounded-full bg-violet/10 blur-3xl" />

        <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-cyan/10 blur-3xl" />
      </div>

      {/* ================= MAIN CONTAINER ================= */}

      <div className="relative mx-auto max-w-[1450px]">

        {/* =====================================================
            TOP SECTION
            OUR SOLUTIONS + LIVE PARKING PREVIEW
        ===================================================== */}

        <div className="grid items-center gap-8 lg:grid-cols-[420px_minmax(0,1fr)]">

          {/* =============================================
              LEFT SIDE — OUR SOLUTIONS
          ============================================== */}

          <div className="px-2 lg:px-4">

            {/* Label */}
            <div className="inline-flex items-center gap-2 rounded-full border border-violet/40 bg-card/60 px-4 py-2">

              <span className="h-2 w-2 rounded-full bg-violet" />

              <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-violet-glow">
                Our Solutions
              </span>

            </div>


            {/* Heading */}
            <h2 className="mt-6 font-display text-4xl font-bold leading-[1.18] tracking-tight text-foreground lg:text-5xl">

              Smarter Parking

              <br />

              for a{" "}

              <span className="text-violet-glow">
                Better Tomorrow
              </span>

            </h2>


            {/* Description */}
            <p className="mt-5 max-w-md text-base leading-relaxed text-muted-foreground">

              Experience a smarter way to park with real-time
              monitoring, intelligent navigation, and AI-powered
              assistance.

            </p>


            {/* Decorative Line */}
            <div className="mt-7 h-1 w-16 rounded-full bg-brand-gradient" />

          </div>


          {/* =============================================
              RIGHT SIDE — LIVE PARKING PREVIEW
          ============================================== */}

          <div className="rounded-3xl border border-border bg-card/80 p-4 shadow-lg backdrop-blur-sm">

            {/* Header */}
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">

              {/* Title */}
              <div className="flex items-center gap-3">

                <div className="bg-brand-gradient grid h-10 w-10 place-items-center rounded-xl">

                  <Car className="h-5 w-5 text-primary-foreground" />

                </div>


                <div>

                  <h3 className="text-base font-bold text-foreground">
                    Live Parking Preview
                  </h3>

                  <p className="text-xs text-muted-foreground">
                    Real-time parking availability
                  </p>

                </div>

              </div>


              {/* Available / Occupied */}
              <div className="flex items-center gap-5 text-xs">

                <span className="flex items-center gap-2 text-muted-foreground">

                  <span className="h-2.5 w-2.5 rounded-full bg-success" />

                  Available

                </span>


                <span className="flex items-center gap-2 text-muted-foreground">

                  <span className="h-2.5 w-2.5 rounded-full bg-danger" />

                  Occupied

                </span>

              </div>

            </div>


            {/* Parking Content */}
            <div className="grid gap-4 md:grid-cols-[1.8fr_1fr]">

              {/* Parking Image */}
              <div className="overflow-hidden rounded-2xl border border-border">

                <img
                  src={parkingPreviewAsset}
                  alt="Live parking availability"
                  className="h-44 w-full object-cover"
                />

              </div>


              {/* Zone Information */}
              <div className="rounded-2xl border border-border bg-secondary/30 p-4">

                {/* Zone Header */}
                <div className="flex items-center justify-between">

                  <h4 className="text-base font-bold text-foreground">
                    Zone A
                  </h4>

                  <MapPin className="h-4 w-4 text-violet-glow" />

                </div>


                {/* Statistics */}
                <div className="mt-3 space-y-2">

                  {/* Available */}
                  <div className="flex items-center justify-between border-b border-border pb-2">

                    <span className="flex items-center gap-2 text-sm text-muted-foreground">

                      <span className="h-2.5 w-2.5 rounded-full bg-success" />

                      Available

                    </span>

                    <span className="font-bold text-success">
                      14
                    </span>

                  </div>


                  {/* Occupied */}
                  <div className="flex items-center justify-between border-b border-border pb-2">

                    <span className="flex items-center gap-2 text-sm text-muted-foreground">

                      <span className="h-2.5 w-2.5 rounded-full bg-danger" />

                      Occupied

                    </span>

                    <span className="font-bold text-danger">
                      6
                    </span>

                  </div>


                  {/* Total Slots */}
                  <div className="flex items-center justify-between pt-1">

                    <span className="text-sm text-muted-foreground">
                      Total Slots
                    </span>

                    <span className="font-bold text-foreground">
                      20
                    </span>

                  </div>

                </div>


                {/* Button */}
                <Link
  to="/register"
  className="bg-brand-gradient mt-4 block w-full rounded-xl px-4 py-2 text-center text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02]"
>
  Find Parking →
</Link>
                

              </div>

            </div>

          </div>

        </div>

        {/* =====================================================
            TOP GRID ENDS HERE
            IMPORTANT: MEET JARVIS IS NOT INSIDE THE GRID
        ===================================================== */}


        {/* =====================================================
            MEET JARVIS — CENTERED BELOW
        ===================================================== */}

        <div className="mt-8 flex w-full justify-center">

          <div className="w-full max-w-[1160px] rounded-3xl border border-border bg-card/80 px-6 py-5 shadow-lg backdrop-blur-sm">

            <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">


              {/* =============================================
                  LEFT SIDE — JARVIS COMMANDS
              ============================================== */}

              <div>

                {/* Header */}
                <div className="mb-4 flex items-center gap-3">

                  <div className="bg-brand-gradient grid h-11 w-11 shrink-0 place-items-center rounded-xl">

                    <Mic className="h-5 w-5 text-primary-foreground" />

                  </div>


                  <div>

                    <h3 className="text-lg font-bold text-foreground">
                      Meet Jarvis
                    </h3>

                    <p className="text-sm text-muted-foreground">
                      Your AI Parking Assistant
                    </p>

                  </div>

                </div>


                {/* Commands */}
                <div className="space-y-2">


                  {/* Hey Jarvis */}
                  <div className="flex h-11 items-center gap-3 rounded-xl border border-border bg-secondary/30 px-4">

                    <MapPin className="h-4 w-4 shrink-0 text-violet-glow" />

                    <span className="text-sm font-semibold text-foreground">
                      "Hey Jarvis"
                    </span>

                  </div>


                  {/* Find Parking */}
                  <div className="flex h-11 items-center gap-3 rounded-xl border border-border bg-secondary/30 px-4">

                    <MapPin className="h-4 w-4 shrink-0 text-violet-glow" />

                    <span className="text-sm text-muted-foreground">
                      Find parking near me
                    </span>

                  </div>


                  {/* Book Parking */}
                  <div className="flex h-11 items-center gap-3 rounded-xl border border-border bg-secondary/30 px-4">

                    <Car className="h-4 w-4 shrink-0 text-violet-glow" />

                    <span className="text-sm text-muted-foreground">
                      Book nearest available slot
                    </span>

                  </div>


                  {/* Navigation */}
                  <div className="flex h-11 items-center gap-3 rounded-xl border border-border bg-secondary/30 px-4">

                    <Navigation className="h-4 w-4 shrink-0 text-violet-glow" />

                    <span className="text-sm text-muted-foreground">
                      Navigate to my booking
                    </span>

                  </div>

                </div>

              </div>


              {/* =============================================
                  RIGHT SIDE — AI ASSISTANT
              ============================================== */}

              <div className="flex flex-col items-center justify-center py-2">
                <div className="flex items-center justify-center gap-4 sm:gap-6">
                  <div className="flex h-10 items-end gap-[3px] sm:h-12">
                    {leftHeights.map((height, i) => (
                      <span
                        key={`left-${i}`}
                        className="inline-block rounded-full bg-violet-500/80"
                        style={{
                          width: "3px",
                          height: `${height}px`,
                          display: "inline-block",
                          opacity: 0.35 + i * 0.08,
                        }}
                      />
                    ))}
                  </div>

                  <div className="relative flex h-32 w-32 items-center justify-center sm:h-36 sm:w-36">
                    <div className="absolute inset-0 rounded-full border border-violet-200/80 bg-violet-50/60" />
                    <div className="absolute inset-5 rounded-full border border-violet-200/60 bg-violet-100/50" />
                    <div className="relative z-10 grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-violet-500 to-violet-600 shadow-[0_10px_30px_rgba(139,92,246,0.3)] sm:h-24 sm:w-24">
                      <Mic className="h-8 w-8 text-white sm:h-9 sm:w-9" />
                    </div>
                  </div>

                  <div className="flex h-10 items-end gap-[3px] sm:h-12">
                    {rightHeights.map((height, i) => (
                      <span
                        key={`right-${i}`}
                        className="inline-block rounded-full bg-violet-500/80"
                        style={{
                          width: "3px",
                          height: `${height}px`,
                          display: "inline-block",
                          opacity: 0.35 + i * 0.08,
                        }}
                      />
                    ))}
                  </div>
                </div>

                <p className="mt-5 text-center text-[11px] font-medium tracking-[0.12em] text-slate-400 uppercase">
                  Listening for your command...
                </p>
              </div>
            </div>

          </div>

        </div>

      </div>

    </section>
  );
}


/* ================= HELPER COMPONENTS ================= */


function SolutionRow({
  label,
  value,
  dot,
  valueColor,
}: {
  label: string;
  value: string;
  dot: string;
  valueColor: string;
}) {
  return (
    <div className="flex items-center justify-between border-b border-border py-4 last:border-b-0">

      <div className="flex items-center gap-3">

        <span className={`h-3 w-3 rounded-full ${dot}`} />

        <span className="text-sm text-muted-foreground">
          {label}
        </span>

      </div>

      <span className={`text-base font-bold ${valueColor}`}>
        {value}
      </span>

    </div>
  );
}


function SoundWave({ reverse = false }: { reverse?: boolean }) {
  const heights = reverse
    ? [22, 42, 66, 38, 18, 12]
    : [14, 26, 46, 66, 42, 20];

  return (
    <div
      className={`hidden items-center gap-1.5 md:flex ${
        reverse ? "flex-row-reverse" : ""
      }`}
    >
      {heights.map((height, index) => (
        <span
          key={index}
          className="w-1.5 rounded-full bg-violet-glow/70"
          style={{
            height: `${height}px`,
            opacity: 0.35 + index * 0.1,
          }}
        />
      ))}
    </div>
  );
}

const steps = [
  { icon: Search, title: "Search", body: "Search for parking near your location." },
  { icon: Calendar, title: "Reserve", body: "Select and reserve your preferred spot." },
  { icon: Navigation, title: "Navigate", body: "Get the best route to your parking." },
  { icon: Car, title: "Park", body: "Park, scan QR, and you're good to go!" },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="relative overflow-hidden px-5 py-20 sm:py-24"
    >
      {/* ================= BACKGROUND IMAGE ================= */}
      <div className="absolute inset-0">
        <img
          src={featuresBackground}
          alt=""
          className="
            absolute right-0 top-0
            h-full w-full
            object-cover
            object-right
            opacity-70
          "
        />

        {/* Same gradient overlay as Our Features */}
        <div
          className="
            absolute inset-0
            bg-gradient-to-r
            from-background
            via-background/95
            to-background/45
          "
        />

        {/* Bottom fade */}
        <div
          className="
            absolute inset-x-0 bottom-0
            h-32
            bg-gradient-to-t
            from-background
            to-transparent
          "
        />
      </div>

      {/* ================= CONTENT ================= */}
      <div className="relative z-10 mx-auto max-w-7xl">

        <div className="grid items-center gap-10 lg:grid-cols-[420px_1fr]">

          {/* ================= LEFT SIDE ================= */}
          <div>
            <Eyebrow>How It Works</Eyebrow>

            <h2 className="mt-5 font-display text-3xl font-bold leading-tight sm:text-4xl">
              Park smarter in
              <span className="mt-1 block bg-brand-gradient bg-clip-text text-transparent">
                four simple steps
              </span>
            </h2>

            <p className="mt-5 max-w-md text-sm leading-7 text-muted-foreground sm:text-base">
              Find, reserve and access your parking space effortlessly.
              ParkSmart makes your entire parking journey simple and
              convenient.
            </p>
          </div>

          {/* ================= RIGHT SIDE - STEP CARDS ================= */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">

            {steps.map(({ icon: Icon, title, body }, index) => {
              const iconStyles = [
                "text-violet-glow bg-violet/10",
                "text-cyan bg-cyan/10",
                "text-success bg-success/10",
                "text-magenta bg-magenta/10",
              ];

              return (
                <article
                  key={title}
                  className="
                    group
                    min-h-[175px]
                    rounded-3xl
                    border border-white/60
                    bg-card/80
                    px-5
                    py-5
                    shadow-lg
                    shadow-black/5
                    backdrop-blur-md
                    transition-all
                    duration-300
                    hover:-translate-y-1
                    hover:bg-card/95
                    hover:shadow-xl
                  "
                >
                  {/* STEP NUMBER */}
                  <div className="flex items-start justify-between">

                    {/* Icon */}
                    <div
                      className={`
                        grid h-12 w-12
                        place-items-center
                        rounded-xl
                        ${iconStyles[index]}
                      `}
                    >
                      <Icon className="h-5 w-5" />
                    </div>

                    {/* Number */}
                    <span className="font-display text-lg font-bold text-muted-foreground/50">
                      0{index + 1}
                    </span>
                  </div>

                  {/* Content */}
                  <h3 className="mt-5 text-sm font-bold leading-6 text-foreground">
                    {title}
                  </h3>

                  <p className="mt-2 text-xs leading-5 text-muted-foreground">
                    {body}
                  </p>
                </article>
              );
            })}

          </div>
        </div>
      </div>
    </section>
  );
}

const reviews = [
  { quote: "ParkSmart saved me so much time! Finding parking is now effortless.", name: "Rohan Mehta", role: "Business Owner" },
  { quote: "The AI assistant is super intuitive. It feels like magic!", name: "Ananya Singh", role: "Software Engineer" },
  { quote: "Best parking app I've ever used. Highly recommended!", name: "Arjun Patel", role: "Product Manager" },
];

export function Testimonials() {
  return (
    <section id="about-us" className="px-5 pb-20">
      <div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-[1fr_2.2fr]">
        <div>
          <Eyebrow>What Our Users Say</Eyebrow>
          <h2 className="mt-5 font-display text-3xl leading-tight font-bold sm:text-4xl">
            Loved by Thousands of Smart Drivers
          </h2>
        </div>
        <div className="panel relative rounded-3xl px-7 py-7">
          <div className="grid gap-5 md:grid-cols-3">
            {reviews.map((r) => (
              <figure key={r.name} className="rounded-2xl border border-border bg-secondary/40 p-5">
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-chart-5 text-chart-5" />
                  ))}
                </div>
                <blockquote className="mt-4 text-xs leading-relaxed text-muted-foreground">
                  “{r.quote}”
                </blockquote>
                <figcaption className="mt-5 flex items-center gap-3">
                  <span className="h-8 w-8 rounded-full bg-accent" />
                  <span>
                    <span className="block text-xs font-bold">{r.name}</span>
                    <span className="block text-[11px] text-muted-foreground">{r.role}</span>
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
          <div className="absolute right-5 bottom-5 flex gap-2">
            <button
              aria-label="Previous testimonial"
              className="grid h-8 w-8 place-items-center rounded-full border border-border bg-secondary"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              aria-label="Next testimonial"
              className="bg-brand-gradient grid h-8 w-8 place-items-center rounded-full"
            >
              <ChevronRight className="h-4 w-4 text-primary-foreground" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
