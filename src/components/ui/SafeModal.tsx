import { ReactNode } from "react";

export default function SafeModal({
  open,
  title,
  onClose,
  children,
  footer,
}: {
  open: boolean;
  title?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        aria-label="Tutup dialog"
        onClick={onClose}
        className="absolute inset-0 bg-black/40"
      />

      <div className="relative w-full max-w-2xl max-h-[90vh] rounded-xl border border-[var(--glass-border)] bg-white/95 text-black shadow-2xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-black/10">
          <div className="font-semibold text-sm">{title ?? "Dialog"}</div>
          <button
            type="button"
            onClick={onClose}
            className="text-xs px-2 py-1 rounded-lg border border-black/15 hover:bg-black/5"
          >
            Tutup
          </button>
        </div>

        <div className="p-4 overflow-auto flex-1">{children}</div>

        {footer ? (
          <div className="px-4 py-3 border-t border-black/10 flex justify-end gap-2">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  );
}
