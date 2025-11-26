'use client';

import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2', // Google Calendar風のブルー
      light: '#42a5f5',
      dark: '#1565c0',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#9c27b0',
      light: '#ba68c8',
      dark: '#7b1fa2',
    },
    success: {
      main: '#2e7d32',
      light: '#4caf50',
      dark: '#1b5e20',
    },
    warning: {
      main: '#ed6c02',
      light: '#ff9800',
      dark: '#e65100',
    },
    error: {
      main: '#d32f2f',
      light: '#ef5350',
      dark: '#c62828',
    },
    info: {
      main: '#0288d1',
      light: '#03a9f4',
      dark: '#01579b',
    },
    background: {
      default: '#fafafa',
      paper: '#ffffff',
    },
    text: {
      primary: 'rgba(0, 0, 0, 0.87)',
      secondary: 'rgba(0, 0, 0, 0.6)',
    },
    divider: 'rgba(0, 0, 0, 0.12)',
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
  },
  typography: {
    fontFamily: [
      'Roboto',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Helvetica',
      'Arial',
      'sans-serif',
    ].join(','),
    h5: {
      fontWeight: 600,
      letterSpacing: '-0.02em',
    },
    h6: {
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    button: {
      fontWeight: 600,
      letterSpacing: '0.02em',
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0px 1px 3px rgba(0, 0, 0, 0.08), 0px 1px 2px rgba(0, 0, 0, 0.12)',
    '0px 2px 4px rgba(0, 0, 0, 0.08), 0px 2px 6px rgba(0, 0, 0, 0.12)',
    '0px 3px 6px rgba(0, 0, 0, 0.08), 0px 3px 8px rgba(0, 0, 0, 0.12)',
    '0px 4px 8px rgba(0, 0, 0, 0.08), 0px 4px 10px rgba(0, 0, 0, 0.12)',
    '0px 5px 10px rgba(0, 0, 0, 0.08), 0px 5px 12px rgba(0, 0, 0, 0.12)',
    '0px 6px 12px rgba(0, 0, 0, 0.08), 0px 6px 14px rgba(0, 0, 0, 0.12)',
    '0px 7px 14px rgba(0, 0, 0, 0.08), 0px 7px 16px rgba(0, 0, 0, 0.12)',
    '0px 8px 16px rgba(0, 0, 0, 0.08), 0px 8px 18px rgba(0, 0, 0, 0.12)',
    '0px 9px 18px rgba(0, 0, 0, 0.08), 0px 9px 20px rgba(0, 0, 0, 0.12)',
    '0px 10px 20px rgba(0, 0, 0, 0.08), 0px 10px 22px rgba(0, 0, 0, 0.12)',
    '0px 11px 22px rgba(0, 0, 0, 0.08), 0px 11px 24px rgba(0, 0, 0, 0.12)',
    '0px 12px 24px rgba(0, 0, 0, 0.08), 0px 12px 26px rgba(0, 0, 0, 0.12)',
    '0px 13px 26px rgba(0, 0, 0, 0.08), 0px 13px 28px rgba(0, 0, 0, 0.12)',
    '0px 14px 28px rgba(0, 0, 0, 0.08), 0px 14px 30px rgba(0, 0, 0, 0.12)',
    '0px 15px 30px rgba(0, 0, 0, 0.08), 0px 15px 32px rgba(0, 0, 0, 0.12)',
    '0px 16px 32px rgba(0, 0, 0, 0.08), 0px 16px 34px rgba(0, 0, 0, 0.12)',
    '0px 17px 34px rgba(0, 0, 0, 0.08), 0px 17px 36px rgba(0, 0, 0, 0.12)',
    '0px 18px 36px rgba(0, 0, 0, 0.08), 0px 18px 38px rgba(0, 0, 0, 0.12)',
    '0px 19px 38px rgba(0, 0, 0, 0.08), 0px 19px 40px rgba(0, 0, 0, 0.12)',
    '0px 20px 40px rgba(0, 0, 0, 0.08), 0px 20px 42px rgba(0, 0, 0, 0.12)',
    '0px 21px 42px rgba(0, 0, 0, 0.08), 0px 21px 44px rgba(0, 0, 0, 0.12)',
    '0px 22px 44px rgba(0, 0, 0, 0.08), 0px 22px 46px rgba(0, 0, 0, 0.12)',
    '0px 23px 46px rgba(0, 0, 0, 0.08), 0px 23px 48px rgba(0, 0, 0, 0.12)',
    '0px 24px 48px rgba(0, 0, 0, 0.08), 0px 24px 50px rgba(0, 0, 0, 0.12)',
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.12)',
          },
        },
        contained: {
          '&:hover': {
            boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.16)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        elevation1: {
          boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.08), 0px 1px 2px rgba(0, 0, 0, 0.12)',
        },
        elevation2: {
          boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.08), 0px 2px 6px rgba(0, 0, 0, 0.12)',
        },
        elevation3: {
          boxShadow: '0px 3px 6px rgba(0, 0, 0, 0.08), 0px 3px 8px rgba(0, 0, 0, 0.12)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.08), 0px 2px 6px rgba(0, 0, 0, 0.12)',
          '&:hover': {
            boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.12), 0px 4px 10px rgba(0, 0, 0, 0.16)',
            transition: 'box-shadow 0.3s ease-in-out',
          },
        },
      },
    },
  },
});

export default function ClientThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}

