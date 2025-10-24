import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  label?: string;
  className?: string;
}

const PasswordInput: React.FC<PasswordInputProps> = ({
  value,
  onChange,
  error,
  label = "Hasło",
  className = "",
  disabled,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <label className={`flex flex-col w-5/6 sm:w-full text-white mt-2 ${className}`}>
      {label}
      <div className="relative w-full">
        <input
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={onChange}
          className="inputStyle focus:ring-lilac w-full"
          style={{ paddingRight: "42px" }}
          disabled={disabled}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="myGray absolute right-4 top-1/2 transform -translate-y-1/2"
          tabIndex={-1}
          disabled={disabled}
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>
      {error && <span className="text-red-400 text-sm mt-2 text-center">{error}</span>}
    </label>
  );
};

export default PasswordInput; 