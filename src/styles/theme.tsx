'use client';

import {createTheme, ThemeProvider as MuiThemeProvider} from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import {CacheProvider} from '@emotion/react';
import createCache from '@emotion/cache';
import {usePathname, useSearchParams, useServerInsertedHTML} from 'next/navigation';
import {type ReactNode, useEffect, useMemo} from 'react';


const customColors = {
    primary: {
        main: '#9042fb',
        light: '#b366ff',
        dark: '#6b2fc7',
        contrastText: '#ffffff',
    },
    secondary: {
        main: '#8D8C8C',
        light: '#b3b3b3',
        dark: '#666666',
        contrastText: '#ffffff',
    },
    background: {
        default: '#000000',
        paper: 'rgba(125, 125, 125, 0.5)',
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

const theme = createTheme({
    palette: customColors,
    typography: {
        fontFamily: 'var(--font-nunito), sans-serif',
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
                    borderRadius: 40,
                    backgroundColor: customColors.primary.main,
                    padding: '11px 19px',
                    fontSize: '15px',
                    fontWeight: 600,
                    textTransform: 'none',
                    transition: 'all 0.2s ease-in-out',
                    color: customColors.text.primary,
                    boxShadow: 'none',
                    '&:hover': {
                        transform: 'translateY(-1px)',
                        opacity: 0.8,
                        boxShadow: 'none',
                    },
                },
            },
        },
        MuiTextField: {
            defaultProps: {
                InputLabelProps: {
                    shrink: true,
                },
            },
        },
        MuiOutlinedInput: {
            styleOverrides: {
                root: {
                    borderRadius: 30,
                    backgroundColor: 'rgba(125, 125, 125, 0.5)',
                    color: customColors.text.primary,
                    paddingRight: '20px',
                    paddingLeft: '10px',
                    fontSize: '15px',
                    '& fieldset': {
                        borderColor: 'transparent',
                    },
                    '&.Mui-focused fieldset': {
                        borderColor: customColors.primary.main,
                        borderWidth: 2,
                    },
                    '& .MuiInputLabel-root': {
                        color: customColors.text.primary,
                        fontWeight: 600,
                        fontSize: '17px',
                        transform: 'translate(14px, -9px) scale(0.75)',
                        '&.MuiInputLabel-shrink': {
                            transform: 'translate(14px, -9px) scale(0.75)',
                        },
                        '&.Mui-focused': {
                            color: customColors.text.primary,
                        },
                    },
                },
            },
        },
        MuiInputBase: {
            styleOverrides: {
                root: {
                    color: customColors.text.primary,
                    '&.Mui-focused': {
                        '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: customColors.primary.main,
                        },
                    },
                },
            },
        },
        MuiButtonBase: {
            styleOverrides: {
                root: {
                    borderRadius: 40,
                },
            },
        },
        MuiInputLabel: {
            styleOverrides: {
                root: {
                    color: customColors.text.primary,
                    fontWeight: 600,
                    fontSize: '17px',
                    transform: 'translate(14px, -9px) scale(0.75)',
                    '&.MuiInputLabel-shrink': {
                        transform: 'translate(14px, -9px) scale(0.75)',
                    },
                    '&.Mui-focused': {
                        color: customColors.text.primary,
                    },
                },
            },
        },
        MuiDivider: {
            styleOverrides: {
                root: {
                    borderColor: customColors.text.secondary,
                },
            },
        },
        MuiLink: {
            styleOverrides: {
                root: {
                    color: customColors.text.secondary,
                    fontFamily: '"Nunito", sans-serif',
                    fontSize: '16px',
                    textDecoration: 'underline',
                    cursor: 'pointer',

                    '&:hover': {
                        color: customColors.primary.main,
                        textDecoration: 'underline',
                    },
                    '&:disabled': {
                        opacity: 0.5,
                        cursor: 'not-allowed',
                    },
                },
            },
        },
        MuiDialog: {
            styleOverrides: {
                paper: {
                    backgroundColor: customColors.grey[800],
                    border: `3px solid ${customColors.grey[600]}`,
                    padding: '0px 20px 20px 20px',
                    borderRadius: 30,
                },
            },
        },
        MuiDialogActions: {
            styleOverrides: {
                root: {
                    justifyContent: 'center',
                    gap: 10,
                },
            },
        },
        MuiDialogTitle: {
            styleOverrides: {
                root: {
                    fontSize: '18px',
                    textAlign: 'center',
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
                // to disable autofill effects
                'input:-webkit-autofill': {
                    WebkitBoxShadow: 'none !important',
                    WebkitTextFillColor: '#ffffff !important',
                    backgroundColor: 'rgba(125, 125, 125, 0.5) !important',
                    transition: 'background-color 5000s ease-in-out 0s',
                    boxShadow: 'none !important',
                },
                'input:-webkit-autofill:hover': {
                    WebkitBoxShadow: 'none !important',
                    WebkitTextFillColor: '#ffffff !important',
                    backgroundColor: 'rgba(125, 125, 125, 0.5) !important',
                    boxShadow: 'none !important',
                },
                'input:-webkit-autofill:focus': {
                    WebkitBoxShadow: 'none !important',
                    WebkitTextFillColor: '#ffffff !important',
                    backgroundColor: 'rgba(125, 125, 125, 0.5) !important',
                    boxShadow: 'none !important',
                },
                'input:-webkit-autofill:active': {
                    WebkitBoxShadow: 'none !important',
                    WebkitTextFillColor: '#ffffff !important',
                    backgroundColor: 'rgba(125, 125, 125, 0.5) !important',
                    boxShadow: 'none !important',
                },
                'input[data-autocompleted]': {
                    WebkitTextFillColor: '#ffffff !important',
                    WebkitBoxShadow: 'none !important',
                    boxShadow: 'none !important',
                },
                'input[autocomplete]': {
                    WebkitTextFillColor: '#ffffff !important',
                    WebkitBoxShadow: 'none !important',
                    boxShadow: 'none !important',
                },
            },
        },
    },
});

const DEFAULT_BACKGROUND = 'linear-gradient(to bottom, #000000, #303030, #737373)';

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
        }
        : null;
}

function darkenColor(hex: string, factor: number): string {
    const rgb = hexToRgb(hex);
    if (!rgb) return hex;

    const r = Math.max(0, Math.floor(rgb.r * (1 - factor)));
    const g = Math.max(0, Math.floor(rgb.g * (1 - factor)));
    const b = Math.max(0, Math.floor(rgb.b * (1 - factor)));

    return `#${[r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('')}`;
}

function createGroupGradient(groupColor: string): string {
    const darkColor = darkenColor(groupColor, 0.6);
    return `linear-gradient(to bottom, #000000, ${darkColor}, ${groupColor})`;
}

export function ThemeProvider({children}: { children: ReactNode }) {
    const cache = useMemo(() => {
        const cache = createCache({
            key: 'mui',
            prepend: true,
        });
        cache.compat = true;
        return cache;
    }, []);

    useServerInsertedHTML(() => {
        const names = Object.keys(cache.inserted);
        if (names.length === 0) {
            return null;
        }
        const styles = Object.values(cache.inserted).join(' ');
        const ids = names.join(' ');
        return (
            <style
                key={cache.key}
                data-emotion={`${cache.key} ${ids}`}
                dangerouslySetInnerHTML={{__html: styles}}
            />
        );
    });

    return (
        <CacheProvider value={cache}>
            <MuiThemeProvider theme={theme}>
                <CssBaseline/>
                <div suppressHydrationWarning>
                    {children}
                </div>
            </MuiThemeProvider>
        </CacheProvider>
    );
}


const GROUP_COLOR_STORAGE_KEY = 'currentGroupColor';

export function GroupThemeUpdater() {
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const groupColor = searchParams?.get('groupColor');

    useEffect(() => {
        const body = document.body;
        const isGroupMenuPath = pathname?.startsWith('/group-menu') ?? false;


        if (groupColor) {
            const decodedColor = decodeURIComponent(groupColor);
            localStorage.setItem(GROUP_COLOR_STORAGE_KEY, decodedColor);
            body.style.background = createGroupGradient(decodedColor);
        } else if (isGroupMenuPath) {
            const savedColor = localStorage.getItem(GROUP_COLOR_STORAGE_KEY);
            if (savedColor) {
                body.style.background = createGroupGradient(savedColor);
            } else {
                body.style.background = DEFAULT_BACKGROUND;
            }
        } else {
            localStorage.removeItem(GROUP_COLOR_STORAGE_KEY);
            body.style.background = DEFAULT_BACKGROUND;
        }
    }, [groupColor, pathname]);

    return null;
}