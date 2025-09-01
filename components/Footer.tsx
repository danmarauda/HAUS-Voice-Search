
import React from 'react';
import { Logo, ArrowRightIcon } from './IconComponents';

const Footer: React.FC = () => {
  return (
    <footer className="max-w-7xl sm:px-6 mt-10 mr-auto mb-12 ml-auto pr-4 pl-4">
      <div className="relative sm:mt-12 overflow-hidden shadow-[0px_0px_0px_1px_rgba(255,255,255,0.06),0px_1px_1px_-0.5px_rgba(0,0,0,0.3),0px_12px_24px_-12px_rgba(0,0,0,0.5)] bg-black/80 border-white/10 border rounded-3xl backdrop-blur">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-white/5 to-transparent"></div>
        </div>

        <div className="relative sm:p-8 pt-6 pr-6 pb-6 pl-6">
          <div className="grid lg:grid-cols-4 gap-10">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Logo />
              </div>
              <p className="text-sm leading-relaxed text-neutral-400 font-geist">
                Curated homes, verified sellers, and concierge support from first tour to closing. Move with confidence.
              </p>
              <a href="#" className="inline-flex items-center gap-2 text-sm font-medium tracking-tight text-neutral-900 bg-white hover:bg-white/90 rounded-lg px-3 py-1.5">
                <span className="font-geist">Contact us</span>
                <ArrowRightIcon className="w-4 h-4 stroke-[1.5]" />
              </a>
              <div className="text-xs text-neutral-500 font-geist">support@haus.com.au</div>
            </div>

            <div>
              <h4 className="text-xs tracking-wider text-neutral-300 uppercase font-geist">Company</h4>
              <ul className="mt-3 space-y-2">
                <li><a href="#" className="text-sm text-neutral-300 hover:text-white font-geist">About</a></li>
                <li><a href="#" className="text-sm text-neutral-300 hover:text-white font-geist">Press</a></li>
                <li><a href="#" className="text-sm text-neutral-300 hover:text-white font-geist">Careers</a></li>
                <li><a href="#" className="text-sm text-neutral-300 hover:text-white font-geist">Partners</a></li>
                <li><a href="#" className="text-sm text-neutral-300 hover:text-white font-geist">Investor Relations</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs tracking-wider text-neutral-300 uppercase font-geist">Apps</h4>
              <ul className="mt-3 space-y-2">
                <li><a href="#" className="text-sm text-neutral-300 hover:text-white font-geist">iOS App</a></li>
                <li><a href="#" className="text-sm text-neutral-300 hover:text-white font-geist">Android App</a></li>
                <li><a href="#" className="text-sm text-neutral-300 hover:text-white font-geist">TV App</a></li>
                <li><a href="#" className="text-sm text-neutral-300 hover:text-white font-geist">Virtual Reality</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs tracking-wider text-neutral-300 uppercase font-geist">Services</h4>
              <ul className="mt-3 space-y-2">
                <li><a href="#" className="text-sm text-neutral-300 hover:text-white font-geist">Buy with HAUS</a></li>
                <li><a href="#" className="text-sm text-neutral-300 hover:text-white font-geist">Sell with HAUS</a></li>
                <li><a href="#" className="text-sm text-neutral-300 hover:text-white font-geist">Concierge</a></li>
                <li><a href="#" className="text-sm text-neutral-300 hover:text-white font-geist">Agent Finder</a></li>
                <li><a href="#" className="text-sm text-neutral-300 hover:text-white font-geist">Neighborhood Guides</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-white/10 flex flex-col md:flex-row md:items-center gap-3 md:justify-between">
            <nav className="flex flex-wrap gap-x-4 gap-y-2 text-[11px] text-neutral-400 font-geist">
              <a href="#" className="hover:text-neutral-200">Real Estate Code of Conduct</a>
              <span className="text-neutral-700">|</span>
              <a href="#" className="hover:text-neutral-200">Privacy Policy</a>
              <span className="text-neutral-700">|</span>
              <a href="#" className="hover:text-neutral-200">Terms of Use</a>
              <span className="text-neutral-700">|</span>
              <a href="#" className="hover:text-neutral-200">Accessibility</a>
              <span className="text-neutral-700">|</span>
              <a href="#" className="hover:text-neutral-200">Copyright Notice</a>
              <span className="text-neutral-700">|</span>
              <a href="#" className="hover:text-neutral-200">Sitemap</a>
            </nav>
            <div className="text-[11px] text-neutral-500 font-geist">© 2024 HAUS Australia Pty Ltd. All rights reserved.</div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
