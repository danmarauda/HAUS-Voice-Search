
import React from 'react';
import { Logo } from './IconComponents';
import ProfileDropdown from './ProfileDropdown';

const Header: React.FC = () => {
  return (
    <header className="max-w-7xl sm:px-6 mx-auto pt-6 px-4 sticky top-4 z-50">
      <div className="flex shadow-[0_8px_30px_rgba(0,0,0,0.35)] bg-white/5 border-white/10 border rounded-2xl pt-2 pr-2 pb-2 pl-4 backdrop-blur-md items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Logo />
          </div>
        </div>
        <div className="flex items-center gap-6">
          <nav className="hidden md:flex items-center gap-6">
            <a href="#" className="text-sm font-medium text-neutral-300 hover:text-white tracking-tight font-geist">Buy</a>
            <a href="#" className="text-sm font-medium text-neutral-300 hover:text-white tracking-tight font-geist">Rent</a>
            <a href="#" className="text-sm font-medium text-neutral-300 hover:text-white tracking-tight font-geist">Sell</a>
            <a href="#" className="text-sm font-medium text-neutral-300 hover:text-white tracking-tight font-geist">Agents</a>
          </nav>
          <ProfileDropdown />
        </div>
      </div>
    </header>
  );
};

export default Header;