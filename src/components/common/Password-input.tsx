import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { 
  TextField, 
  InputAdornment, 
  IconButton, 
  Box,
  Typography 
} from '@mui/material';

interface PasswordInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  label?: string;
  disabled?: boolean;
  required?: boolean;
  sx?: any;
}

const PasswordInput: React.FC<PasswordInputProps> = ({
  value,
  onChange,
  error,
  label = "Hasło",
  disabled,
  required,
  sx,
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const handleClickShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <Box sx={{ width: '100%', ...sx }}>
      <TextField
        type={showPassword ? "text" : "password"}
        value={value}
        onChange={onChange}
        label={label}
        disabled={disabled}
        required={required}
        error={!!error}
        helperText={error}
        fullWidth
        variant="outlined"
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={handleClickShowPassword}
                disabled={disabled}
                edge="end"
                sx={{ color: 'text.secondary' }}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </IconButton>
            </InputAdornment>
          ),
        }}
        // sx={{
        //   '& .MuiOutlinedInput-root': {
        //     borderRadius: 3,
        //     backgroundColor: 'rgba(125, 125, 125, 0.5)',
        //     color: 'white',
        //     '& fieldset': {
        //       borderColor: 'transparent',
        //     },
        //     '&.Mui-focused fieldset': {
        //       borderColor: 'primary.main',
        //       borderWidth: 2,
        //     },
        //     '&.Mui-error fieldset': {
        //       borderColor: 'error.main',
        //     },
        //   },
        //   '& .MuiInputLabel-root': {
        //     color: 'white',
        //     '&.Mui-focused': {
        //       color: 'primary.main',
        //     },
        //     '&.Mui-error': {
        //       color: 'error.main',
        //     },
        //   },
        //   '& .MuiFormHelperText-root': {
        //     color: 'error.main',
        //     textAlign: 'center',
        //   },
        // }}
      />
    </Box>
  );
};

export default PasswordInput; 