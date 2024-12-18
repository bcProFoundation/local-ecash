'use client';

import { createTheme } from '@mui/material/styles';

export const darkTheme = createTheme({
  palette: {
    primary: {
      main: '#0076c4'
    },
    secondary: {
      main: '#74546f'
    },
    mode: 'dark',
    background: {
      default: 'url(/bg-dialog.svg)', // Light gray background
      paper: '#ffffff' // White background for paper elements
    },
    grey: {
      '300': '#f1f1f147'
    }
  },
  typography: {
    h1: {
      color: '#fff'
    },
    h2: {
      color: '#fff'
    },
    h3: {
      color: '#fff'
    },
    h4: {
      color: '#fff'
    },
    h5: {
      color: '#fff'
    },
    body1: {
      color: '#fff'
    },
    body2: {
      color: '#fff'
    }
  },
  components: {
    MuiAlert: {
      styleOverrides: {
        action: {
          color: '#fff'
        },
        message: {
          color: '#fff'
        },
        icon: {
          color: '#fff'
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          color: '#fff',
          fontWeight: 600,
          borderRadius: '8px'
        }
      }
    }
  }
});

export const lightTheme = createTheme({
  palette: {
    primary: {
      main: '#0076c4' // Keep the same primary color
    },
    secondary: {
      main: '#74546f' // Keep the same secondary color
    },
    mode: 'light', // Set mode to 'light'
    background: {
      default: '#fff', // Light gray background
      paper: '#fff' // White background for paper elements
    },
    text: {
      primary: '#000', // Dark gray text
      secondary: '#555555' // Slightly lighter gray
    },
    grey: {
      '300': '#e0e0e0'
    }
  },
  typography: {
    h1: {
      color: '#000'
    },
    h2: {
      color: '#000'
    },
    h3: {
      color: '#000'
    },
    h4: {
      color: '#000'
    },
    h5: {
      color: '#000'
    },
    body1: {
      color: '#555555'
    },
    body2: {
      color: '#555555'
    }
  },
  components: {
    MuiAlert: {
      styleOverrides: {
        action: {
          color: '#fff'
        },
        message: {
          color: '#fff'
        },
        icon: {
          color: '#fff'
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          color: '#000',
          fontWeight: 600,
          borderRadius: '8px'
        }
      }
    }
  }
});
