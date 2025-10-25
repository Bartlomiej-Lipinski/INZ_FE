import React from "react";
import { Button as MuiButton, ButtonProps as MuiButtonProps } from '@mui/material';

interface ButtonProps extends Omit<MuiButtonProps, 'color'> {
  background?: string;
}

const Button: React.FC<ButtonProps> = ({ 
  background, 
  children, 
  disabled, 
  sx,
  ...props 
}) => {
  return (
    <MuiButton
      variant="contained"
      disabled={disabled}
      sx={{
        backgroundColor: background || 'primary.main',
        color: 'white',
        borderRadius: 3,
        padding: '12px 24px',
        fontSize: '16px',
        fontWeight: 500,
        textTransform: 'none',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          backgroundColor: background || 'primary.dark',
          transform: 'translateY(-1px)',
          opacity: 0.8,
        },
        '&:disabled': {
          backgroundColor: '#cccccc',
          opacity: 0.6,
        },
        ...sx,
      }}
      {...props}
    >
      {children}
    </MuiButton>
  );
};

export default Button; 