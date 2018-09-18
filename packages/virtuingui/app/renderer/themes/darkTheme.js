import { createMuiTheme } from '@material-ui/core/styles';
// import createPalette from '@material-ui/core/palette';

// http://mcg.mbitson.com/
const primary = {
  50: '#e9e9e9',
  100: '#c7c7c7',
  200: '#a2a2a2',
  300: '#7c7c7c',
  400: '#606060',
  500: '#444444',
  600: '#3e3e3e',
  700: '#353535',
  800: '#2d2d2d',
  900: '#1f1f1f',
  A100: '#7c7c7c',
  A200: '#f29e5e',
  A400: '#444444',
  A700: '#353535',
  contrastDefaultColor: 'light',
};

const accent = {
  50: '#fdf3ec',
  100: '#fbe2cf',
  200: '#f9cfaf',
  300: '#f6bb8e',
  400: '#f4ad76',
  500: '#f29e5e', // 500 is default
  600: '#f09656',
  700: '#ee8c4c',
  800: '#ec8242',
  900: '#e87031',
  A100: '#ffffff',
  A200: '#fffbf9',
  A400: '#ffd8c6',
  A700: '#ffc7ad',
  contrastDefaultColor: 'dark',
};

const grey = {
  50: '#f9f9f9',
  100: '#f0f0f0',
  200: '#e6e6e6',
  300: '#dbdbdb',
  400: '#d4d4d4',
  500: '#cccccc',
  600: '#c7c7c7',
  700: '#c0c0c0',
  800: '#b9b9b9',
  900: '#adadad',
  A100: '#ffffff',
  A200: '#ffffff',
  A400: '#fffcfc',
  A700: '#ffe2e2',
  contrastDefaultColor: 'dark',
};


export const dark = {
  text: {
    primary: 'rgba(255, 255, 255, 1)',
    secondary: 'rgba(255, 255, 255, 0.7)',
    disabled: 'rgba(255, 255, 255, 0.5)',
    hint: 'rgba(255, 255, 255, 0.5)',
    icon: 'rgba(255, 255, 255, 0.5)',
    divider: 'rgba(255, 255, 255, 0.12)',
    lightDivider: 'rgba(255, 255, 255, 0.075)',
  },
  input: {
    bottomLine: 'rgba(255, 255, 255, 0.7)',
    helperText: 'rgba(255, 255, 255, 0.7)',
    labelText: 'rgba(255, 255, 255, 0.7)',
    inputText: 'rgba(255, 255, 255, 1)',
    disabled: 'rgba(255, 255, 255, 0.5)',
  },
  action: {
    active: 'rgba(255, 255, 255, 1)',
    disabled: 'rgba(255, 255, 255, 0.3)',
  },
  background: {
    default: primary[500],
    paper: primary[700],
    appBar: primary[500],
    contentFrame: primary[900],
    status: primary[300],
  },
};

const theme = createMuiTheme({
  spacing: {
    unit: 10
  },
  palette: {
    type: 'dark',
    primary,
    accent,
    grey,
    dark,
  },
  overrides: {
    MuiToolbar: {
      gutters: {
        paddingLeft: '30px !important',
      }
    },
    MuiAppBar: {
      root: {
        boxShadow: 'none',
      }
    },
    MuiButton: {
      root: {
        height: '100%',
        borderRadius: '0',
      },
      mini: {
        height: 'auto',
        minWidth: '0',
        padding: '10px 15px'
      }
    },
    MuiLinearProgress: {
      root: {
        width: '100%',
        height: '2px',
        background: 'blue',
      },
      colorPrimary: {
        backgroundColor: primary[300],
      },
      barColorPrimary: {
        background: '#00BD26',
      }
    },
    MuiFormControl: {
      root: {
        width: '100%',
        display: 'block'
      },
    },
    MuiInput: {
      root: {
        width: '100%',
      },
    },
    MuiListItemIcon: {
      root: {
        marginRight: '0',
      }
    },
    MuiListItem: {
      gutters: {
        paddingLeft: 15,
        paddingRight: 15,
      }
    }
  }
});


export default theme;
