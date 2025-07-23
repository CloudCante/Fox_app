import { createTheme, useTheme } from '@mui/material/styles';

const sidebarColor = '#1e3a5f';  // Dark blue for sidebar in both themes

// Define theme colors
const themeColors = {
    light: {
        primaryMain: '#1976d2',
        primaryDark: sidebarColor,
        backgroundDefault: '#f5f7fa',
        backgroundPaper: '#ffffff',
        textPrimary: '#000000',
        textSecondary: '#757575',
        divider: 'rgba(0, 0, 0, 0.12)'
    },
    dark: {
        primaryMain: '#90caf9',
        primaryDark: sidebarColor,
        backgroundDefault: '#2c3e50',
        backgroundPaper: '#34495e',
        textPrimary: '#ffffff',
        textSecondary: '#b0bec5',
        divider: 'rgba(255, 255, 255, 0.12)'
    }
};

// Function to apply theme colors as CSS variables
export const applyThemeColors = (isDarkMode) => {
    const colors = isDarkMode ? themeColors.dark : themeColors.light;
    const root = document.documentElement;
    
    // Set CSS variables
    root.style.setProperty('--primary-main', colors.primaryMain);
    root.style.setProperty('--primary-dark', colors.primaryDark);
    root.style.setProperty('--background-default', colors.backgroundDefault);
    root.style.setProperty('--background-paper', colors.backgroundPaper);
    root.style.setProperty('--text-primary', colors.textPrimary);
    root.style.setProperty('--text-secondary', colors.textSecondary);
    root.style.setProperty('--divider', colors.divider);
};

// Create MUI themes that reference the CSS variables
export const lightTheme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: themeColors.light.primaryMain,
            dark: themeColors.light.primaryDark,
        },
        background: {
            default: themeColors.light.backgroundDefault,
            paper: themeColors.light.backgroundPaper,
        },
        text: {
            primary: themeColors.light.textPrimary,
            secondary: themeColors.light.textSecondary
        },
        divider: themeColors.light.divider
    }
});

export const darkTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: themeColors.dark.primaryMain,
            dark: themeColors.dark.primaryDark,
        },
        background: {
            default: themeColors.dark.backgroundDefault,
            paper: themeColors.dark.backgroundPaper,
        },
        text: {
            primary: themeColors.dark.textPrimary,
            secondary: themeColors.dark.textSecondary
        },
        divider: themeColors.dark.divider
    }
}); 
