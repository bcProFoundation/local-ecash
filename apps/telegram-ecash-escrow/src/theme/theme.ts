import { createTheme } from "@mui/material/styles";

export const lightTheme = createTheme({
  palette: {
    primary: {
      main: "#9e2a9c",
    },
    secondary: {
      main: "#74546f",
    },
    mode: 'light'
  },
});

export const darkTheme = createTheme({
  palette: {
    primary: {
      main: "#9e2a9c",
    },
    secondary: {
      main: "#74546f",
    },
    mode: 'dark'
  },
});