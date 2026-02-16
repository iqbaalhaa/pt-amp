import { ReactNode } from "react";
import ReceiptLongRoundedIcon from "@mui/icons-material/ReceiptLongRounded";

export default function PageHeader({
  title,
  subtitle,
  actions,
  icon,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 w-10 h-10 rounded-xl border border-[var(--glass-border)] bg-white/60 backdrop-blur flex items-center justify-center shadow-sm">
          {icon ?? <ReceiptLongRoundedIcon className="text-[var(--brand)]" />}
        </div>

        <div>
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-black">
            {title}
          </h1>
          {subtitle ? (
            <p className="text-xs md:text-sm text-black/55 mt-0.5">
              {subtitle}
            </p>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">{actions}</div>
    </div>
  );
}
