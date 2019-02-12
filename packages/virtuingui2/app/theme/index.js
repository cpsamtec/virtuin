import {createMuiTheme } from '@material-ui/core/styles';


const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#F39952'
    },
    type: 'dark',
  },
  typography: {
    useNextVariants: true,
  },
  overrides: {
    // Name of the component ⚛️ / style sheet
    MuiDrawer: {
      root: {
        height: '100vh',
      },
      paper: {
        borderRight: 'none',
        width: '100%',
        position: 'relative',
        background: '#333'
      },
      paperAnchorDockedLeft: {
        borderRight: 'none',
      }
    },
    MuiList: {
      padding: {
        paddingTop: 0,
        paddingBottom: 0
      }
    },
    
    MuiListSubheader: {
      sticky: {
        height: 50,
        color: '#fff',
        fontWeight: 900,
        backgroundColor: '#222',
        textAlign: 'left'
      }
    },
    MuiListItemSecondaryAction: {
      root: {
        right: 16
      }
    },
    MuiCircularProgress: {
      root: {
        width: 36
      }
    },
    MuiDivider: {
      root: {
        backgroundColor: 'rgba(0,0,0,0.3)'
      }
    },
    MuiChip: {
      root: {
        height: 18,
        fontSize: 10
      }
    },
  },
});

export default theme;