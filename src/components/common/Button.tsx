import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  background?: string;
}

const defaultStyles: React.CSSProperties = {
  color: "#fff",
  borderRadius: "12px",
  display: "flex",
  flexDirection: "row",
  justifyContent: "center",
  alignItems: "center",
  border: "none",
  fontWeight: 500,
  fontSize: "16px",
  cursor: "pointer",
  padding: "12px",
  transition: "all 0.2s ease-in-out",
};

const Button: React.FC<ButtonProps> = ({ background = "#9042fb", style, children, disabled, ...props }) => {
  const buttonStyles: React.CSSProperties = {
    ...defaultStyles,
    background: disabled ? "#cccccc" : background,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.6 : 1,
    ...style,
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled && e.currentTarget) {
      e.currentTarget.style.opacity = "0.8"; // Ciemniejszy efekt przez zmniejszenie opacity
      e.currentTarget.style.transform = "translateY(-1px)";
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled && e.currentTarget) {
      e.currentTarget.style.opacity = "1";
      e.currentTarget.style.transform = "translateY(0)";
    }
  };

  return (
    <button
      style={buttonStyles}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button; 