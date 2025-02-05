import React, { useState, useRef, useEffect } from 'react';
import { Search, Check } from 'lucide-react';

interface Option {
  id: number;
  label: string;
}

interface MultiSearchableSelectProps {
  options: Option[];
  values: number[];
  onChange: (values: number[]) => void;
  placeholder: string;
  required?: boolean;
  className?: string;
}

export default function MultiSearchableSelect({
  options,
  values,
  onChange,
  placeholder,
  required = false,
  className = ''
}: MultiSearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(search.toLowerCase())
  );

  const selectedLabels = options
    .filter(option => values.includes(option.id))
    .map(option => option.label)
    .join(', ');

  const handleOptionClick = (optionId: number) => {
    const newValues = values.includes(optionId)
      ? values.filter(id => id !== optionId)
      : [...values, optionId];
    onChange(newValues);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <div className={`relative cursor-pointer ${className}`}>
        <input
          type="text"
          value={isOpen ? search : selectedLabels}
          onChange={(e) => setSearch(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm cursor-pointer"
          required={required && values.length === 0}
        />
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
      </div>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto focus:outline-none sm:text-sm">
          {filteredOptions.length === 0 ? (
            <div className="px-4 py-2 text-sm text-gray-500">
              No hay resultados
            </div>
          ) : (
            filteredOptions.map((option) => (
              <div
                key={option.id}
                className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-blue-50"
                onClick={() => handleOptionClick(option.id)}
              >
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={values.includes(option.id)}
                    onChange={() => {}}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-3 block truncate">{option.label}</span>
                </div>
                {values.includes(option.id) && (
                  <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-blue-600">
                    <Check className="h-4 w-4" />
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}