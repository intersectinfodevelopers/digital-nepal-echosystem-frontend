"use client";

import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#0B2D6B',
      contrastText: '#ffffff',
    },
    background: {
      default: '#F7F8FB',
      paper: '#ffffff',
    },
    text: {
      primary: '#1E293B',
      secondary: '#64748B',
    },
  },
  typography: {
    fontFamily: '"Inter", sans-serif',
    h3: {
      fontWeight: 700,
      letterSpacing: '-0.5px',
    },
    h6: {
      fontWeight: 600,
    },
    subtitle1: {
      fontWeight: 600,
    },
    subtitle2: {
      fontWeight: 600,
    },
    body1: {
      fontSize: '16px',
    },
    body2: {
      fontSize: '14px',
    },
    caption: {
      fontSize: '11px',
      fontWeight: 500,
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: '4px',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          borderRadius: '4px',
        },
      },
    },
  },
});

export default theme;
