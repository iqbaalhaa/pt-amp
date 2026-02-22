import GlassCard from "@/components/ui/GlassCard";
import GlassButton from "@/components/ui/GlassButton";
import StatusBadge from "@/components/ui/StatusBadge";

export default function FormExamplePage() {
  return (
    <div className="grid gap-4 md:gap-6">
      <GlassCard className="p-5 md:p-6">
        <div className="text-xl font-semibold mb-4">Create Product</div>
        <form className="grid md:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <label className="text-sm text-secondary">Name</label>
            <input className="glass rounded-xl px-3 py-2 focus-ring-brand" placeholder="Product name" />
          </div>
          <div className="grid gap-2">
            <label className="text-sm text-secondary">Unit</label>
            <input className="glass rounded-xl px-3 py-2 focus-ring-brand" placeholder="kg, pcs, etc." />
          </div>
          <div className="grid gap-2 md:col-span-2">
            <label className="text-sm text-secondary">Type</label>
            <select className="glass rounded-xl px-3 py-2 focus-ring-brand">
              <option>raw</option>
              <option>finished</option>
            </select>
          </div>
          <div className="md:col-span-2 flex items-center justify-between">
            <StatusBadge status="neutral">Keyboard accessible</StatusBadge>
            <div className="flex gap-2">
              <GlassButton variant="ghost" type="reset">Reset</GlassButton>
              <GlassButton variant="primary" type="submit">Save</GlassButton>
            </div>
          </div>
        </form>
      </GlassCard>
    </div>
  );
}

