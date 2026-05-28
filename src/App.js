import React from 'react';
import { Routes, Route, NavLink } from 'react-router-dom';
import Play from './pages/Play';
import Win from './pages/Win';
import Enjoy from './pages/Enjoy';
import './App.css';

export default function App() {
  return (
    <div className="app">
      <nav className="nav">
        <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Play
        </NavLink>
        <NavLink to="/win" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Win
        </NavLink>
        <NavLink to="/enjoy" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Enjoy
        </NavLink>
      </nav>

      <main className="main">
        <Routes>
          <Route path="/" element={<Play />} />
          <Route path="/win" element={<Win />} />
          <Route path="/enjoy" element={<Enjoy />} />
        </Routes>
      </main>
    </div>
  );
}
