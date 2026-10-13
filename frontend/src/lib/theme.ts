import { createTheme } from '@mui/material/styles'

const azulMarca = '#2857A4'

export const theme = createTheme({
  palette: {
    primary: {
      main: azulMarca,
      dark: '#1D427F',
      light: '#EAF0FB',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#58708F',
    },
    background: {
      default: '#F5F7FA',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1D2939',
      secondary: '#667085',
    },
    divider: '#E6EAF0',
    success: {
      main: '#27845A',
      light: '#E8F5EE',
      dark: '#1D6846',
    },
    warning: {
      main: '#B7791F',
      light: '#FFF5DF',
      dark: '#8F5C11',
    },
    error: {
      main: '#C24141',
      light: '#FCECEC',
      dark: '#9E3030',
    },
    info: {
      main: '#2878A8',
      light: '#E8F3F9',
      dark: '#1E5F86',
    },
  },
  typography: {
    fontFamily: '"Inter", "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    h1: { fontWeight: 700, letterSpacing: '-0.035em' },
    h2: { fontWeight: 700, letterSpacing: '-0.03em' },
    h3: { fontWeight: 700, letterSpacing: '-0.025em' },
    h4: { fontWeight: 700, letterSpacing: '-0.02em' },
    h5: { fontWeight: 650, letterSpacing: '-0.015em' },
    h6: { fontWeight: 650, letterSpacing: '-0.01em' },
    button: { fontWeight: 600, textTransform: 'none' },
    subtitle1: { fontWeight: 600 },
  },
  shape: {
    borderRadius: 10,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          minWidth: 320,
          fontFeatureSettings: '"cv02", "cv03", "cv04", "cv11"',
        },
        '::selection': {
          backgroundColor: '#DCE7F8',
        },
      },
    },
    MuiPaper: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: '1px solid #E6EAF0',
          borderRadius: 12,
        },
      },
    },
    MuiButtonBase: {
      defaultProps: {
        disableRipple: true,
      },
      styleOverrides: {
        root: {
          '&.Mui-focusVisible': {
            outline: '3px solid #A9C5F2',
            outlineOffset: 2,
          },
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          minHeight: 40,
          borderRadius: 8,
          paddingInline: 16,
          '&.MuiButton-containedPrimary:hover': { backgroundColor: '#1D427F' },
          '&.Mui-focusVisible': {
            outline: '3px solid #A9C5F2',
            outlineOffset: 2,
          },
        },
        outlined: {
          borderColor: '#D0D7E2',
          '&:hover': { borderColor: '#9AA9BC', backgroundColor: '#F8FAFC' },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          '&.Mui-focusVisible': {
            outline: '3px solid #A9C5F2',
            outlineOffset: 1,
          },
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        size: 'small',
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          backgroundColor: '#FFFFFF',
          '& .MuiOutlinedInput-notchedOutline': { borderColor: '#D9E0E9' },
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#98A8BC' },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderWidth: 2 },
        },
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          borderRadius: '12px 12px 0 0',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          backgroundColor: '#F8FAFC',
          color: '#475467',
          fontSize: '0.75rem',
          fontWeight: 700,
          letterSpacing: '0.035em',
          textTransform: 'uppercase',
          whiteSpace: 'nowrap',
        },
        body: {
          color: '#344054',
          borderColor: '#EDF0F4',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&.MuiTableRow-hover:hover': { backgroundColor: '#F8FAFC' },
          '&:last-child td, &:last-child th': { borderBottom: 0 },
        },
      },
    },
    MuiTablePagination: {
      styleOverrides: {
        root: {
          borderTop: '1px solid #EDF0F4',
          color: '#667085',
        },
        toolbar: {
          minHeight: 56,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 600,
        },
        colorSuccess: { backgroundColor: '#E8F5EE', color: '#1D6846' },
        colorError: { backgroundColor: '#FCECEC', color: '#9E3030' },
        colorWarning: { backgroundColor: '#FFF5DF', color: '#8F5C11' },
        colorInfo: { backgroundColor: '#E8F3F9', color: '#1E5F86' },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 14,
          boxShadow: '0 20px 60px rgba(16, 24, 40, 0.16)',
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          padding: '22px 24px 12px',
          fontWeight: 700,
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          padding: '12px 24px 20px',
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          padding: '12px 24px 20px',
          gap: 1,
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 9,
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          borderRadius: 6,
          fontSize: '0.75rem',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundImage: 'none',
        },
      },
    },
  },
})
