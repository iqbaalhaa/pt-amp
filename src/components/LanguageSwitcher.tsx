import Link from "next/link";
import { switchLocalePath, type Locale } from "@/lib/i18n";

// ID | EN links to the same page in the other language.
export function LanguageSwitcher({
  pathname,
  locale,
  label,
  className = "",
  onNavigate,
}: {
  pathname: string;
  locale: Locale;
  label: string;
  className?: string;
  onNavigate?: () => void;
}) {
  return (
    <div className={`flex items-center gap-1 text-sm font-medium ${className}`} aria-label={label}>
      {(["id", "en"] as const).map((target, i) => (
        <span key={target} className="flex items-center gap-1">
          {i > 0 && <span className="text-zinc-300">|</span>}
          <Link
            href={switchLocalePath(pathname, target)}
            hrefLang={target}
            lang={target}
            aria-current={target === locale ? "true" : undefined}
            onClick={onNavigate}
            className={
              target === locale
                ? "px-1 text-zinc-900 font-bold"
                : "px-1 text-zinc-500 hover:text-brand transition-colors"
            }
          >
            {target.toUpperCase()}
          </Link>
        </span>
      ))}
    </div>
  );
}
