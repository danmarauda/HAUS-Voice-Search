import React, { useState, useEffect, useRef } from "react";
import { 
    SettingsIcon as Settings, 
    CreditCardIcon as CreditCard, 
    FileTextIcon as FileText, 
    LogOutIcon as LogOut, 
    UserIcon as User, 
    GeminiIcon as Gemini 
} from "./IconComponents";

interface Profile {
    name: string;
    email: string;
    avatar: string;
    subscription?: string;
    model?: string;
}

interface MenuItem {
    label: string;
    value?: string;
    href: string;
    icon: React.ReactNode;
    external?: boolean;
}

const SAMPLE_PROFILE_DATA: Profile = {
    name: "Eugene An",
    email: "eugene@haus.com",
    avatar: "https://picsum.photos/100/100?random=99",
    subscription: "PRO",
    model: "Gemini 2.5 Flash",
};

interface ProfileDropdownProps extends React.HTMLAttributes<HTMLDivElement> {
    data?: Profile;
}

export default function ProfileDropdown({
    data = SAMPLE_PROFILE_DATA,
    className,
    ...props
}: ProfileDropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const menuItems: MenuItem[] = [
        { label: "Profile", href: "#", icon: <User className="w-4 h-4" /> },
        { label: "Model", value: data.model, href: "#", icon: <Gemini className="w-4 h-4" /> },
        { label: "Subscription", value: data.subscription, href: "#", icon: <CreditCard className="w-4 h-4" /> },
        { label: "Settings", href: "#", icon: <Settings className="w-4 h-4" /> },
        { label: "Terms & Policies", href: "#", icon: <FileText className="w-4 h-4" />, external: true },
    ];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dropdownRef]);

    return (
        <div className={`relative ${className || ''}`} {...props} ref={dropdownRef}>
            <div className="group relative">
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-16 p-3 rounded-xl bg-white/5 border border-transparent hover:border-white/10 hover:bg-white/10 transition-all duration-200 focus:outline-none w-full"
                >
                    <div className="text-left flex-1">
                        <div className="text-sm font-medium text-zinc-100 tracking-tight leading-tight font-geist">
                            {data.name}
                        </div>
                        <div className="text-xs text-zinc-400 tracking-tight leading-tight font-geist">
                            {data.email}
                        </div>
                    </div>
                    <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-0.5">
                            <div className="w-full h-full rounded-full overflow-hidden bg-neutral-900">
                                <img
                                    src={data.avatar}
                                    alt={data.name}
                                    width={36}
                                    height={36}
                                    className="w-full h-full object-cover rounded-full"
                                />
                            </div>
                        </div>
                    </div>
                </button>

                <div
                    className={`absolute -right-3 top-1/2 -translate-y-1/2 transition-all duration-200 ${isOpen ? "opacity-100" : "opacity-60 group-hover:opacity-100"}`}
                >
                    <svg width="12" height="24" viewBox="0 0 12 24" fill="none" className={`transition-all duration-200 ${isOpen ? "text-blue-400 scale-110" : "text-zinc-500 group-hover:text-zinc-300"}`} aria-hidden="true">
                        <path d="M2 4C6 8 6 16 2 20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                    </svg>
                </div>

                {isOpen && (
                    <div className="absolute top-full right-0 mt-2 w-64 p-2 bg-neutral-900/95 backdrop-blur-sm border border-white/10 rounded-xl shadow-xl shadow-black/20 z-50 origin-top-right">
                        <div className="space-y-1">
                            {menuItems.map((item) => (
                                <a key={item.label} href={item.href} className="flex items-center p-3 hover:bg-white/5 rounded-lg transition-all duration-200 cursor-pointer group hover:shadow-sm border border-transparent hover:border-white/10">
                                    <div className="flex items-center gap-2 flex-1 text-neutral-300 group-hover:text-white">
                                        {item.icon}
                                        <span className="text-sm font-medium tracking-tight leading-tight whitespace-nowrap font-geist">
                                            {item.label}
                                        </span>
                                    </div>
                                    <div className="flex-shrink-0 ml-auto">
                                        {item.value && (
                                            <span className={`text-xs font-medium rounded-md py-1 px-2 tracking-tight ${item.label === "Model" ? "text-blue-400 bg-blue-500/10 border border-blue-500/10" : "text-purple-400 bg-purple-500/10 border border-purple-500/10"}`}>
                                                {item.value}
                                            </span>
                                        )}
                                    </div>
                                </a>
                            ))}
                        </div>

                        <hr className="my-2 border-white/10" />

                        <button type="button" className="w-full flex items-center gap-3 p-3 duration-200 bg-red-500/10 rounded-lg hover:bg-red-500/20 cursor-pointer border border-transparent hover:border-red-500/30 hover:shadow-sm transition-all group">
                            <LogOut className="w-4 h-4 text-red-500 group-hover:text-red-600" />
                            <span className="text-sm font-medium text-red-500 group-hover:text-red-600 font-geist">
                                Sign Out
                            </span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}