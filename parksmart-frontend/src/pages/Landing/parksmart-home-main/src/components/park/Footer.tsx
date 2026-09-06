import { ArrowRight, Facebook, Instagram, Linkedin, Twitter } from "lucide-react";
import ctaCarAsset from "../../assets/cta-car.png";
import {Link} from "react-router-dom";

export function FinalCta() {
  return (
    <section id="get-started" className="px-5 pb-16">
      <div className="bg-cta-gradient relative mx-auto flex max-w-7xl flex-col items-center gap-6 overflow-hidden rounded-3xl px-8 py-9 md:flex-row">
        <img
          src={ctaCarAsset}
          alt="Car with neon underglow"
          width={992}
          height={672}
          loading="lazy"
          className="w-48 shrink-0 md:w-64"
        />
        <div className="flex-1 text-center md:text-left">
          <h2 className="font-display text-2xl font-bold sm:text-3xl">Ready to Park Smarter?</h2>
          <p className="mt-2 text-sm text-primary-foreground/80">
            Join thousands of drivers who save time and stress with ParkSmart.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-full bg-background px-5 py-2.5 text-sm font-semibold text-primary transition-transform hover:scale-[1.03]"
            >
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Link>
          <a
            href="#contact"
            className="inline-flex items-center gap-2 rounded-full bg-background px-6 py-3 text-sm font-semibold text-foreground"
          >
            Contact Sales
          </a>
        </div>
      </div>
    </section>
  );
}

const columns = [
  { title: "Product", items: ["Features", "How It Works", "Pricing", "Updates"] },
  { title: "Solutions", items: ["For Drivers", "For Businesses", "For Cities", "Smart Cities"] },
  { title: "Company", items: ["About Us", "Careers", "Blog", "Contact Us"] },
  { title: "Legal", items: ["Privacy Policy", "Terms of Service", "Refund Policy", "Cookie Policy"] },
];

export function Footer() {
  return (
    <footer id="contact" className="border-t border-border px-5 py-14">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.3fr_repeat(4,0.7fr)_1.3fr]">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="bg-brand-gradient grid h-8 w-8 place-items-center rounded-lg font-display text-sm font-bold text-primary-foreground">
              P
            </span>
            <span className="font-display text-lg font-bold">
              Park<span className="text-gradient">Smart</span>
            </span>
          </div>
          <p className="mt-4 max-w-[220px] text-xs leading-relaxed text-muted-foreground">
            AI-powered smart parking solution for a smarter tomorrow.
          </p>
          <div className="mt-5 flex gap-3 text-muted-foreground">
            {[Twitter, Facebook, Instagram, Linkedin].map((Icon, i) => (
              <a
                key={i}
                href="#social"
                aria-label="Social link"
                className="grid h-8 w-8 place-items-center rounded-full border border-border transition-colors hover:text-foreground"
              >
                <Icon className="h-3.5 w-3.5" />
              </a>
            ))}
          </div>
        </div>

        {columns.map((c) => (
          <div key={c.title}>
            <h3 className="text-xs font-bold">{c.title}</h3>
            <ul className="mt-4 space-y-2.5">
              {c.items.map((item) => (
                <li key={item}>
                  <a
                    href="#footer"
                    className="text-xs text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <h3 className="text-xs font-bold">Subscribe to our newsletter</h3>
          <p className="mt-3 text-xs text-muted-foreground">Get updates and exclusive offers.</p>
          <form
            className="mt-4 flex items-center gap-2 rounded-full border border-border bg-secondary/60 p-1.5"
            onSubmit={(e) => e.preventDefault()}
          >
            <label className="sr-only" htmlFor="newsletter">
              Email address
            </label>
            <input
              id="newsletter"
              type="email"
              placeholder="Enter your email"
              className="w-full bg-transparent px-3 text-xs outline-none placeholder:text-muted-foreground"
            />
            <button
              type="submit"
              aria-label="Subscribe"
              className="bg-brand-gradient grid h-8 w-8 shrink-0 place-items-center rounded-full"
            >
              <ArrowRight className="h-4 w-4 text-primary-foreground" />
            </button>
          </form>
        </div>
      </div>
      <p className="mt-12 text-center text-xs text-muted-foreground">
        © 2026 ParkSmart. All rights reserved.
      </p>
    </footer>
  );
}
