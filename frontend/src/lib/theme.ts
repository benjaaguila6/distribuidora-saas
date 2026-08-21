import { createTheme } from '@mui/material/styles'

export const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
  },
  shape: {
    borderRadius: 4,
  },
  components: {
    MuiTable: {
      defaultProps: {
        size: 'small',
      },
    },
    MuiButtonBase: {
      defaultProps: {
        disableRipple: true,
      },
    },
  },
})
