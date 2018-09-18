import { createMuiTheme } from '@material-ui/core/styles';
// import createPalette from 'material-ui/styles/palette';

// http://mcg.mbitson.com/
const primary = {
  50: '#eee',
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


export const light = {
  text: {
    primary: 'rgba(0, 0, 0, 1)',
    secondary: 'rgba(0, 0, 0, 0.7)',
    disabled: 'rgba(0, 0, 0, 0.5)',
    hint: 'rgba(0, 0, 0, 0.5)',
    icon: 'rgba(0, 0, 0, 0.5)',
    divider: 'rgba(0, 0, 0, 0.12)',
    lightDivider: 'rgba(0, 0, 0, 0.075)',
  },
  input: {
    bottomLine: 'rgba(0, 0, 0, 0.7)',
    helperText: 'rgba(0, 0, 0, 0.7)',
    labelText: 'rgba(0, 0, 0, 0.7)',
    inputText: 'rgba(0, 0, 0, 1)',
    disabled: 'rgba(0, 0, 0, 0.5)',
  },
  action: {
    active: 'rgba(0, 0, 0, 1)',
    disabled: 'rgba(0, 0, 0, 0.3)',
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
    type: 'light',
    primary,
    accent,
    grey,
    light,
  },
  overrides: {
    MuiButton: {
      root: {
        borderRadius: 0,
      },
      mini: {
        minWidth: '20px',
      }
    },
    MuiTable: {
      root: {
        width: '100%',
      }
    },
    MuiTableHead: {
      root: {
        color: '#fff',
        background: 'rgba(0,0,0,0)',
      }
    },
    MuiTableRow: {
      root: {
        height: 'auto',
        borderBottom: `solid 1px ${grey[300]}`,
        '&:nth-of-type(2n)': {
          background: primary[50],
        }
      },
      head: {
        borderBottom: 'none',
        height: 'auto',
        backgroundColor: accent[500],
      }
    },
    MuiTableCell: {
      root: {
        textAlign: 'center',
        borderBottom: 'none',
        '&:first-of-type': {
          width: '0.01%',
          textAlign: 'left',
          paddingRight: 50,
          background: 'rgba(0,0,0,0.05)',
        }
      },
      paddingNone: {
        padding: '10px 15px',
        '&:last-child': {
          padding: '100px 150px',
          // paddingRight: 'inherit',
        }
      },
      head: {
        borderRight: 'solid 0px #fff',
        borderBottom: 'none',
        fontWeight: '600',
        paddingTop: '20px !important',
        paddingBottom: '20px !important',
        fontSize: 14,
        color: '#fff',
        '&:first-of-type': {
          width: '0.01%',
          textAlign: 'left',
          paddingLeft: 15
        }
      },
    },
    MuiList: {
      padding: {
        paddingTop: '0',
        paddingBottom: '0',
      }
    },
    MuiListSubheader: {
      root: {
        background: accent[500],
        backgroundColor: accent[500],
        color: '#fff',
        padding: '5px 15px',
        paddingLeft: '15px',
        paddingRight: '15px',
        flexDirection: 'row',
        display: 'flex',
        justifyContent: 'space-between',
      },
      sticky: {
        background: accent[500],
        backgroundColor: accent[500]
      }
    },
    MuiListItem: {
      gutters: {
        paddingLeft: '15px',
        paddingRight: '15px',
        paddingTop: '10px',
        paddingBottom: '9px',
      },
      root: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderBottom: `solid 1px ${grey[300]}`,
        '&:nth-of-type(2n)': {
          background: primary[50],
        }

      }
    },
    MuiListItemText: {
      root: {
        fontSize: '13px',
        flex: 'none',
        padding: '0',
      }
    }
  }
});


export default theme;
