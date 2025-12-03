import React, { useState, useRef, useEffect } from "react";
import * as Lucide from "lucide-react";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  label?: string;
}

const Select: React.FC<SelectProps> = ({
  value,
  onChange,
  options,
  placeholder = "یک گزینه انتخاب کنید",
  label,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedOption = options.find(option => option.value === value);

  // Close dropdown when clicking outside
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
  }, []);

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all text-right"
        >
          <div className="flex items-center justify-between">
            <span className={!selectedOption ? "text-gray-500" : ""}>
              {selectedOption ? selectedOption.label : placeholder}
            </span>
            <Lucide.ChevronDown className="w-4 h-4 text-gray-500" />
          </div>
        </button>

        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            <div className="p-2 border-b border-gray-100 sticky top-0 bg-white">
              <div className="relative">
                <Lucide.Search className="absolute left-2 top-2.5 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="جستجو..."
                  className="w-full pl-8 pr-2 py-1.5 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
            </div>

            {filteredOptions.length === 0 ? (
              <div className="py-4 text-center text-gray-500 text-sm">
                هیچ نتیجه‌ای یافت نشد
              </div>
            ) : (
              <div className="py-1">
                {filteredOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                      setSearchTerm("");
                    }}
                    className={`w-full text-right px-4 py-2 text-sm hover:bg-primary-50 transition-colors ${
                      value === option.value ? "bg-primary-100 text-primary-700" : "text-gray-700"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Select;