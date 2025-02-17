import React from "react";

interface InputProps {
  label: string;
  placeholder?: string;
  type?: string;
  icon?: React.ReactNode;
}

const Input: React.FC<InputProps> = ({ label, placeholder, type = "text", icon }) => {
  return (
    <div className="max-w-sm mx-auto">
      <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
            {icon}
          </div>
        )}
        <input
          type={type}
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          placeholder={placeholder}
        />
      </div>
    </div>
  );
};

export default Input;
