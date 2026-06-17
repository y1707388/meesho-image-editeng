import { Box, CssBaseline, ThemeProvider, createTheme, Dialog, IconButton } from '@mui/material';
import { X } from 'lucide-react';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import BottomBar from './components/BottomBar';
import ImageCanvas from './components/ImageCanvas';
import { useStore } from './store/useStore';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#3fa9f5',
    },
    background: {
      default: '#0a0a0a',
      paper: '#121212',
    },
  },
});

function App() {
  const { previewUrl, setPreviewUrl } = useStore();

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', bgcolor: 'background.default' }}>
        <Sidebar />
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          <TopBar />
          <Box sx={{ flex: 1, position: 'relative', width: '100%', minHeight: 0, bgcolor: '#1a1a1a' }}>
            <ImageCanvas />
          </Box>
          <BottomBar />
        </Box>
      </Box>

      {/* Preview Dialog */}
      <Dialog 
        open={!!previewUrl} 
        onClose={() => setPreviewUrl(null)}
        maxWidth="lg"
        slotProps={{
          paper: {
            sx: { bgcolor: 'background.default', position: 'relative' }
          }
        }}
      >
        <IconButton 
          onClick={() => setPreviewUrl(null)}
          sx={{ position: 'absolute', right: 8, top: 8, zIndex: 1, color: 'white' }}
        >
          <X />
        </IconButton>
        {previewUrl && (
          <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <img 
              src={previewUrl} 
              alt="Preview" 
              style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: 8 }} 
            />
          </Box>
        )}
      </Dialog>
    </ThemeProvider>
  );
}

export default App;
