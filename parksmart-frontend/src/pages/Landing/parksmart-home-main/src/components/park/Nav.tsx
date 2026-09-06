import { ArrowRight, ChevronDown } from "lucide-react";
import {Link} from "react-router-dom";

const links = ["Features", "Solutions", "How It Works", "About Us", "Contact"];

export function Nav() {
    const handleScroll = (sectionId: string) => {
    const element = document.getElementById(sectionId);

    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  };
  return (
    <header className="sticky top-0 z-50">
      <div className="bg-cta-gradient px-5 py-2 text-center text-xs font-semibold text-primary-foreground">
        Introducing Jarvis: your AI parking assistant for every step of the journey.
      </div>
      <div className="bg-brand-gradient">
        <div className="mx-auto flex h-18 max-w-7xl items-center gap-8 px-5 py-4">
          <a href="/" className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-background font-display text-lg font-bold text-primary">
              P
            </span>
            <span className="font-display text-xl font-bold text-primary-foreground">
              Park<span className="text-primary-foreground/70">Smart</span>
            </span>
          </a>

          <nav className="hidden flex-1 items-center justify-center gap-7 lg:flex">
            {links.map((l) => (
              <a
                key={l}
                href={`#${l.toLowerCase().replace(/\s+/g, "-")}`}
                onClick={(e) => {
                  e.preventDefault();

                  handleScroll(
                    l.toLowerCase().replace(/\s+/g, "-")
                  );
                }}
                className="flex items-center gap-1 text-sm font-medium text-primary-foreground/80 transition-colors hover:text-primary-foreground"
              >
                {l}

                {l === "Solutions" && (
                  <ChevronDown className="h-3.5 w-3.5" />
                )}
              </a>
            ))}
          </nav>

          {/* Login and Register */}
          <div className="ml-auto flex items-center gap-4 lg:ml-0">
            
            <Link to="/login">
              <a
                href="#login"
                className="hidden text-sm font-semibold text-primary-foreground sm:inline"
              >
                Login
              </a>
            </Link>

            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-full bg-background px-5 py-2.5 text-sm font-semibold text-primary transition-transform hover:scale-[1.03]"
            >
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Link>

          </div>
        </div>
      </div>
    </header>
  );
}
