import Link from "next/link";
import { Container } from "./container";
import { Icon } from "@/components/ui/icon";
import siteData from "@/data/site.json";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-4 mt-auto">
      <Container>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Copyright */}
          <p className="text-sm text-muted-foreground">
            &copy; {currentYear} {siteData.name}. All rights reserved.
          </p>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            <Link
              href={`mailto:${siteData.email}`}
              className="text-muted-foreground hover:text-accent transition-colors"
              aria-label="Email"
            >
              <Icon name="email" className="w-5 h-5" />
            </Link>

            <Link
              href={siteData.social.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-accent transition-colors"
              aria-label="LinkedIn"
            >
              <Icon name="linkedin" className="w-5 h-5" />
            </Link>

            <Link
              href={siteData.social.github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-accent transition-colors"
              aria-label="GitHub"
            >
              <Icon name="github" className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
