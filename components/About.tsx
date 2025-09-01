
import React from 'react';
import { ArrowRightIcon } from './IconComponents';

const About: React.FC = () => {
  return (
    <section className="max-w-7xl sm:px-6 mt-10 mx-auto mb-8 px-4">
      <div className="relative sm:mt-12 overflow-hidden shadow-[0px_0px_0px_1px_rgba(255,255,255,0.06),0px_1px_1px_-0.5px_rgba(0,0,0,0.3),0px_12px_24px_-12px_rgba(0,0,0,0.5)] bg-black/80 border-white/10 border rounded-3xl backdrop-blur">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-white/5 to-transparent"></div>
        </div>

        <div className="relative sm:p-8 pt-6 pr-6 pb-6 pl-6">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="relative rounded-xl overflow-hidden border border-white/10">
                <img src="https://picsum.photos/1600/900?random=2" alt="Clients touring a modern property" className="w-full h-[260px] sm:h-[360px] object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>
              </div>

              <div className="max-w-2xl">
                <div className="flex items-center gap-3">
                  <span className="h-px w-8 bg-white/20"></span>
                  <span className="text-sm text-neutral-300 font-geist">About HAUS</span>
                </div>
                <h2 className="mt-2 text-2xl sm:text-3xl text-neutral-100 font-geist tracking-tight font-medium">Our Story</h2>
                <p className="mt-3 text-sm sm:text-base leading-relaxed text-neutral-400 font-geist">
                  HAUS began with a simple idea: make finding an extraordinary home in Australia feel effortless. What started as a small collective of agents and designers in Sydney has grown into a nationwide network known for precision, transparency, and taste. From sun-drenched Queenslanders to chic Melbourne laneway apartments, we curate every listing, verify every document, and guide you from the first inspection to the final signature.
                </p>
                <p className="mt-3 text-sm sm:text-base leading-relaxed text-neutral-400 font-geist">
                  Today, our platform blends expert local insight with real-time property data, immersive media, and concierge-level service—so you can move with confidence.
                </p>

                <a href="#" className="mt-4 inline-flex items-center gap-2 text-sm font-medium tracking-tight text-neutral-200 bg-white/5 hover:bg-white/10 rounded-lg px-3 py-1.5 border border-white/10">
                  <span className="font-geist">See details</span>
                  <ArrowRightIcon className="w-4 h-4 stroke-[1.5]" />
                </a>
              </div>
            </div>

            <div className="lg:col-span-1">
              <ul className="space-y-6 sm:space-y-8">
                <li>
                  <div className="text-4xl sm:text-5xl text-neutral-100 font-geist tracking-tight font-medium">15,000+</div>
                  <p className="text-[11px] tracking-wider uppercase text-neutral-400 mt-1 font-geist">Active Listings</p>
                </li>
                <li>
                  <div className="text-4xl sm:text-5xl text-neutral-100 font-geist tracking-tight font-medium">All Major Capitals</div>
                  <p className="text-[11px] tracking-wider uppercase text-neutral-400 mt-1 font-geist">Markets Served</p>
                </li>
                <li>
                  <div className="text-4xl sm:text-5xl text-neutral-100 font-geist tracking-tight font-medium">500+</div>
                  <p className="text-[11px] tracking-wider uppercase text-neutral-400 mt-1 font-geist">Virtual Tours</p>
                </li>
                <li>
                  <div className="text-4xl sm:text-5xl text-neutral-100 font-geist tracking-tight font-medium">4.9</div>
                  <p className="text-[11px] tracking-wider uppercase text-neutral-400 mt-1 font-geist">Client Rating</p>
                </li>
              </ul>

              <div className="mt-8 pt-8 border-t border-white/10">
                <h3 className="text-xl text-neutral-100 font-geist tracking-tight font-medium">Concierge by HAUS</h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-400 font-geist">
                  From private showings to vetted contractors and movers, our team orchestrates every step for a seamless move‑in.
                </p>
                <a href="#" className="mt-4 inline-flex items-center gap-2 text-sm font-medium tracking-tight text-neutral-200 bg-white/5 hover:bg-white/10 rounded-lg px-3 py-1.5 border border-white/10">
                  <span className="font-geist">Explore more</span>
                  <ArrowRightIcon className="w-4 h-4 stroke-[1.5]" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
