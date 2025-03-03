export default function Card() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md aspect-[9/5] rounded-3xl p-6 relative overflow-hidden bg-gradient-to-br from-red-800 via-red-700 to-red-900 text-white shadow-xl">
        {/* Circular gradient overlay */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-red-500/20 to-transparent rounded-full transform translate-x-20 -translate-y-20" />

        {/* Date in top right corner */}
        <div className="absolute top-4 right-6 font-['IBM_Plex_Mono'] text-sm text-white/80">
          01/25
        </div>

        <div className="relative z-10 h-full flex flex-col justify-between">
          <div className="space-y-4">
            <div className="space-y-1">
              <p className="text-sm text-red-100/80">Whitlow's DC</p>
              <h2 className="text-3xl font-semibold">Happy Hour</h2>
            </div>

            <div className="inline-block bg-white/30 rounded-full px-3 py-1 text-sm">
              Save $1.50 per drink
            </div>
          </div>

          <div className="flex justify-between items-end">
            <div className="space-y-1">
              <p className="text-xs text-red-100/80">Reg. Price: $10</p>
              <p className="text-sm font-semibold">Happy Hour: $5</p>
            </div>
            <button className="bg-white hover:bg-gray-100 text-black font-semibold py-2 px-6 rounded-full transition-colors duration-200">
              Join Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
