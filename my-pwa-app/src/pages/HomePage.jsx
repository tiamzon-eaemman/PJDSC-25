import './HomePage.css';

export default function HomePage() {
  const features = [
    { name: "Map", icon: "https://placehold.co/80x80" },
    { name: "Information", icon: "https://placehold.co/80x80" },
    { name: "Digital Go-Bag", icon: "https://placehold.co/80x80" },
    { name: "Alerts", icon: "https://placehold.co/80x80" },
    { name: "Emergency Contacts", icon: "https://placehold.co/80x80" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-black text-zinc-100">

      {/* Main container */}
      <div className="flex flex-col flex-1 justify-center items-center">

        {/* Header */}
        <header className="text-3xl font-bold text-amber-500 mb-4">
          Home
        </header>

        {/* Feature grid */}
        <main className="grid grid-cols-2 gap-2 p-2 justify-items-center">
          {features.map((f) => (
            <div
              key={f.name}
              className="w-32 h-32 bg-neutral-900 border border-zinc-700 rounded-2xl flex flex-col items-center justify-center gap-2 shadow-lg hover:scale-105 transition"
            >
              <img src={f.icon} alt={f.name} className="w-14 h-14 object-contain" />
              <p className="text-amber-400 font-semibold text-sm text-center leading-tight">
                {f.name}
              </p>
            </div>
          ))}
        </main>
      </div>

      {/* Bottom bar */}
      <footer className="h-16 bg-zinc-300 flex items-center justify-center relative">
        <div className="absolute bottom-2 w-20 h-[5px] bg-black/50 rounded-full" />
      </footer>
    </div>
  );
}
