
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon } from './IconComponents';

interface Option {
  value: string;
  label: string;
}

interface CustomDropdownProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  ariaLabel: string;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({ options, value, onChange, placeholder, ariaLabel }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className="relative font-geist" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel}
        className="w-full bg-neutral-900/50 border border-white/10 rounded-md px-3 py-2 text-sm text-left text-neutral-200 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 flex items-center justify-between"
      >
        <span className={selectedOption ? 'text-neutral-200' : 'text-neutral-400'}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDownIcon
          className={`w-4 h-4 text-neutral-400 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div
          role="listbox"
          className="absolute z-10 mt-1 w-full bg-neutral-900/95 backdrop-blur-sm border border-white/10 rounded-md shadow-lg max-h-60 overflow-y-auto animate-fade-in"
          style={{ animationDuration: '150ms' }}
        >
          <ul className="p-1">
             <li
              onClick={() => handleSelect('any')}
              role="option"
              aria-selected={value === 'any'}
              className={`px-3 py-1.5 text-sm cursor-pointer rounded-md ${value === 'any' ? 'bg-blue-600/50 text-white' : 'text-neutral-300 hover:bg-white/10 hover:text-white'}`}
            >
              Any
            </li>
            {options.map(option => (
              <li
                key={option.value}
                onClick={() => handleSelect(option.value)}
                role="option"
                aria-selected={value === option.value}
                className={`px-3 py-1.5 text-sm cursor-pointer rounded-md ${value === option.value ? 'bg-blue-600/50 text-white' : 'text-neutral-300 hover:bg-white/10 hover:text-white'}`}
              >
                {option.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CustomDropdown;
