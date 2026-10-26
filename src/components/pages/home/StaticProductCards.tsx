import { DEFAULT_IMAGES } from "@/lib/default-images";

// Placeholder product cards shown when the catalog is empty.
export function StaticProductCards() {
  return (
    <>
        <div className="group bg-white rounded-2xl border border-zinc-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="h-56 bg-gradient-to-br from-zinc-100 to-zinc-200 group-hover:scale-105 transition-transform duration-500 flex items-center justify-center text-zinc-400 relative">
            <img
              src={DEFAULT_IMAGES.gradeA}
              alt="Cinnamon Grade A"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-6">
            <div className="text-xl font-semibold mb-2 text-zinc-900">
              Cinnamon Grade A
            </div>
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-zinc-100 text-zinc-800">
                Export Quality
              </span>
              <span className="text-zinc-600 text-sm font-medium">
                Ball 40–60 kg
              </span>
            </div>
          </div>
        </div>

        <div className="group bg-white rounded-2xl border border-zinc-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="h-56 bg-gradient-to-br from-zinc-100 to-zinc-200 group-hover:scale-105 transition-transform duration-500 flex items-center justify-center text-zinc-400 relative">
            <img
              src={DEFAULT_IMAGES.gradeB}
              alt="Cinnamon Grade B"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-6">
            <div className="text-xl font-semibold mb-2 text-zinc-900">
              Cinnamon Grade B
            </div>
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-zinc-100 text-zinc-800">
                Standard
              </span>
              <span className="text-zinc-600 text-sm font-medium">
                Ball 40–60 kg
              </span>
            </div>
          </div>
        </div>

        <div className="group bg-white rounded-2xl border border-zinc-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="h-56 bg-gradient-to-br from-zinc-100 to-zinc-200 group-hover:scale-105 transition-transform duration-500 flex items-center justify-center text-zinc-400 relative">
            <img
              src={DEFAULT_IMAGES.broken}
              alt="Cinnamon Broken"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="p-6">
            <div className="text-xl font-semibold mb-2 text-zinc-900">
              Cinnamon Broken
            </div>
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-zinc-100 text-zinc-800">
                Industrial
              </span>
              <span className="text-zinc-600 text-sm font-medium">
                Sack 25 kg
              </span>
            </div>
          </div>
        </div>
      </>
  );
}
