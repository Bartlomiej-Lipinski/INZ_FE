import React from "react";
import { CircularProgress, Box } from '@mui/material';

interface LoadingDotsProps {
  size?: number;
  sx?: any;
}

const LoadingDots: React.FC<LoadingDotsProps> = ({ size = 20, sx }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...sx,
      }}
    >
      <CircularProgress
        size={size}
        thickness={4}
        sx={{
          color: 'white',
          ...sx,
        }}
      />
    </Box>
  );
};

export default LoadingDots;
