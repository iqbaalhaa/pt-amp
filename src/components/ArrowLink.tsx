import Link from "next/link";

// Brand-colored text link with a right arrow ("Lihat Semua ...").
export function ArrowLink({
  href,
  className,
  children,
}: {
  href: string;
  className: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className={className} style={{ color: "var(--brand)" }}>
      {children}{" "}
      <svg
        className="w-4 h-4 ml-1"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M17 8l4 4m0 0l-4 4m4-4H3"
        />
      </svg>
    </Link>
  );
}
