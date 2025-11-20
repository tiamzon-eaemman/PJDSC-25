import { Link } from 'react-router-dom';
import './HomePage.css';
import Navbar from './Navbar';

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

      {/* Bottom Navigation Bar */}
      <footer className="h-16 bg-zinc-300 flex justify-around items-center relative rounded-t-xl">
        {/* Home icon */}
        <Link to="/" className="flex flex-col items-center">
          <img src="https://placehold.co/24x24" alt="Home" className="w-6 h-6" />
          <span className="text-sm font-inter text-zinc-900">Home</span>
        </Link>

        {/* Information icon */}
        <Link to="/hazard-summary" className="flex flex-col items-center">
          <img src="https://placehold.co/24x24" alt="Information" className="w-6 h-6" />
          <span className="text-sm font-inter text-zinc-900">Info</span>
        </Link>

        {/* Notifications icon */}
        <Link to="/notifications" className="flex flex-col items-center">
          <img src="https://placehold.co/24x24" alt="Notifications" className="w-6 h-6" />
          <span className="text-sm font-inter text-zinc-900">Alerts</span>
        </Link>

        <div className="absolute bottom-2 w-20 h-[5px] bg-black/50 rounded-full" />
      </footer>
    </div>
  );
}
