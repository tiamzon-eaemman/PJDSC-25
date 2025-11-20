// Navbar.jsx
import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <footer className="h-16 bg-zinc-300 flex justify-around items-center absolute bottom-0 left-0 right-0 rounded-t-xl z-20">
      {/* Home icon */}
      <Link to="/" className="flex flex-col items-center">
        <img src="https://placehold.co/24x24" alt="Home" className="w-6 h-6" />
        <span className="text-sm font-inter text-zinc-900">Home</span>
      </Link>

      {/* Hazard Summary / Info icon */}
      <Link to="/hazard-summary" className="flex flex-col items-center">
        <img src="https://placehold.co/24x24" alt="Information" className="w-6 h-6" />
        <span className="text-sm font-inter text-zinc-900">Info</span>
      </Link>

      {/* Notifications / Alerts icon */}
      <Link to="/notifications" className="flex flex-col items-center">
        <img src="https://placehold.co/24x24" alt="Notifications" className="w-6 h-6" />
        <span className="text-sm font-inter text-zinc-900">Alerts</span>
      </Link>

      {/* Indicator bar */}
      <div className="absolute bottom-2 w-20 h-[5px] bg-black/50 rounded-full" />
    </footer>
  );
}
