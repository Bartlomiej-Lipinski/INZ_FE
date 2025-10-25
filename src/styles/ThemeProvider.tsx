'use client';

import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { createTheme } from '@mui/material/styles';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { useServerInsertedHTML } from 'next/navigation';
import { useState } from 'react';

// Niestandardowe kolory dla aplikacji
const customColors = {
  primary: {
    main: '#9042fb', // Główny kolor lilac z projektu
    light: '#b366ff',
    dark: '#6b2fc7',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#8D8C8C', // Kolor szary używany w projekcie
    light: '#b3b3b3',
    dark: '#666666',
    contrastText: '#ffffff',
  },
  background: {
    default: '#000000',
    paper: 'rgba(125, 125, 125, 0.5)', // Kolor tła inputów
  },
  text: {
    primary: '#ffffff',
    secondary: '#8D8C8C',
  },
  error: {
    main: '#f44336',
  },
  warning: {
    main: '#ff9800',
  },
  info: {
    main: '#2196f3',
  },
  success: {
    main: '#4caf50',
  },
  grey: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#eeeeee',
    300: '#e0e0e0',
    400: '#bdbdbd',
    500: '#9e9e9e',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },
};

// Utworzenie motywu
const theme = createTheme({
  palette: customColors,
  typography: {
    fontFamily: '"Geist", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 500,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 500,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 500,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 500,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.43,
    },
    button: {
      fontSize: '1rem',
      fontWeight: 500,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '12px 24px',
          fontSize: '16px',
          fontWeight: 500,
          textTransform: 'none',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-1px)',
            opacity: 0.8,
          },
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 24,
            backgroundColor: 'rgba(125, 125, 125, 0.5)',
            color: '#ffffff',
            '& fieldset': {
              borderColor: 'transparent',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(144, 66, 251, 0.3)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#9042fb',
              borderWidth: 2,
            },
          },
          '& .MuiInputLabel-root': {
            color: '#ffffff',
            '&.Mui-focused': {
              color: '#9042fb',
            },
          },
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          color: '#ffffff',
          '&.Mui-focused': {
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: '#9042fb',
            },
          },
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: '#8D8C8C',
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: 'linear-gradient(to bottom, #000000, #303030, #737373)',
          minHeight: '100vh',
          overflowY: 'auto',
          height: '100%',
        },
        '*': {
          scrollbarWidth: 'thin',
          scrollbarColor: '#454545 transparent',
        },
        '*::-webkit-scrollbar': {
          width: '10px',
          height: '10px',
        },
        '*::-webkit-scrollbar-track': {
          background: 'transparent',
        },
        '*::-webkit-scrollbar-thumb': {
          backgroundColor: '#454545',
          borderRadius: '8px',
          border: '2px solid transparent',
          backgroundClip: 'content-box',
        },
      },
    },
  },
});

interface ThemeProviderProps {
  children: React.ReactNode;
}

export default function ThemeProvider({ children }: ThemeProviderProps) {
  const [{ cache, flush }] = useState(() => {
    const cache = createCache({ key: 'mui' });
    cache.compat = true;
    const prevInsert = cache.insert;
    let inserted: string[] = [];
    cache.insert = (...args) => {
      const serialized = args[1];
      if (cache.inserted[serialized.name] === undefined) {
        inserted.push(serialized.name);
      }
      return prevInsert(...args);
    };
    const flush = () => {
      const prevInserted = inserted;
      inserted = [];
      return prevInserted;
    };
    return { cache, flush };
  });

  useServerInsertedHTML(() => {
    const names = flush();
    if (names.length === 0) {
      return null;
    }
    let styles = '';
    for (const name of names) {
      styles += cache.inserted[name];
    }
    return (
      <style
        key={cache.key}
        data-emotion={`${cache.key} ${names.join(' ')}`}
        dangerouslySetInnerHTML={{
          __html: styles,
        }}
      />
    );
  });

  return (
    <CacheProvider value={cache}>
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </CacheProvider>
  );
}
