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
  gap: "8px",
  width: "106px",
  height: "40px",
  border: "none",
  fontWeight: 500,
  fontSize: "16px",
  cursor: "pointer",
};

const Button: React.FC<ButtonProps> = ({ background = "#786599", style, children, ...props }) => {
  return (
    <button
      style={{ ...defaultStyles, background, ...style }}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button; 