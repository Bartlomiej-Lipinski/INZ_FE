import React from "react";

interface LoadingDotsProps {
  className?: string;
}

const LoadingDots: React.FC<LoadingDotsProps> = ({ className = "" }) => {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <span className="animate-bounce">.</span>
      <span className="animate-bounce" style={{ animationDelay: '0.1s' }}>.</span>
      <span className="animate-bounce" style={{ animationDelay: '0.2s' }}>.</span>
    </div>
  );
};

export default LoadingDots;
