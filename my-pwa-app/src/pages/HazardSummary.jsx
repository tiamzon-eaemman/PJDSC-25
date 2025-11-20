export default function HazardSummary() {
  const hazards = [
    { name: 'FLOOD', level: 2, color: 'bg-red-700' },
    { name: 'LANDSLIDE', level: 2, color: 'bg-amber-600' },
    { name: 'STORM SURGE', level: 0, color: 'bg-blue-400' },
    { name: 'WIND', level: 0, color: 'bg-fuchsia-500' },
    { name: 'THUNDERSTORM', level: 1, color: 'bg-green-500' },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-black font-inter">

      {/* Rounded Header with extra top padding */}
      <header className="relative flex flex-col items-center bg-zinc-800 rounded-b-3xl shadow-lg px-6 pt-12 pb-6">
        {/* Placeholder Icon */}
        <div className="w-10 h-10 -mt-4 mb-2 bg-amber-600 rounded-full flex items-center justify-center shadow-md">
            <span className="text-black font-bold text-xl">!</span>
        </div>

        {/* Header Text */}
        <h1 className="text-center text-3xl font-bold text-zinc-100">
            HAZARD <br /> SUMMARY
        </h1>
        </header>

      {/* Scrollable hazard cards */}
      <main className="flex flex-col gap-3 px-4 py-4 overflow-y-auto">
        {hazards.map((h, idx) => (
            <div
            key={idx}
            className="flex justify-between items-center bg-zinc-700 rounded-2xl shadow-lg p-3 min-h-[50px] relative z-10"
            >
            {/* Hazard name */}
            <p className="text-white font-bold text-base truncate relative z-20">
                {h.name || 'Dummy Hazard'}
            </p>

            {/* Colored box with hazard level */}
            <div
                className={`w-10 h-10 flex items-center justify-center rounded-2xl shadow-md ${h.color} relative z-20`}
            >
                <span className="text-white font-bold text-lg">{h.level}</span>
            </div>
            </div>
        ))}
        </main>


      {/* Spacer pushes navbar to bottom */}
      <div className="flex-1"></div>

      {/* Bottom Navbar */}
      <footer className="h-16 bg-zinc-300 flex items-center justify-center relative rounded-t-xl">
        <div className="absolute bottom-2 w-20 h-[5px] bg-black/50 rounded-full" />
      </footer>
    </div>
  );
}
