import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import HazardSummary from './pages/HazardSummary';
import Notifications from './pages/Notifications';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/hazard-summary" element={<HazardSummary />} />
        <Route path="/notifications" element={<Notifications />} />
      </Routes>
    </Router>
  );
}
