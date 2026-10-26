// Placeholder product cards shown when the catalog is empty.
export function StaticProductCards() {
  return (
    <>
        <div className="group bg-white rounded-2xl border border-zinc-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="h-56 bg-gradient-to-br from-zinc-100 to-zinc-200 group-hover:scale-105 transition-transform duration-500 flex items-center justify-center text-zinc-400 relative">
            <img
              src="https://images.unsplash.com/photo-1599940778173-e276d4acb2e7?q=80&w=2070&auto=format&fit=crop"
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
              src="https://images.unsplash.com/photo-1615485400323-952445c71b47?q=80&w=2074&auto=format&fit=crop"
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
              src="https://images.unsplash.com/photo-1596483582103-605b7668636b?q=80&w=2070&auto=format&fit=crop"
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
