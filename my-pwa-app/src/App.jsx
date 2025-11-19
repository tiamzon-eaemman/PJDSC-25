import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

export default function App() {
  return (
    <div className="app">
      <h1>🌤 React PWA App</h1>
      <p>This app is installable on mobile and works offline!</p>
      <button onClick={() => alert("Hello from your PWA!")}>
        Tap me
      </button>
    </div>
  );
}

