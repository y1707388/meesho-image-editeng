import { Box, Button, Typography, IconButton, useMediaQuery, useTheme } from '@mui/material';
import { ChevronLeft, ChevronRight, Trash2, Upload, Menu } from 'lucide-react';
import { useStore } from '../store/useStore';
import axios from 'axios';
import { API_BASE_URL } from '../config';

interface TopBarProps {
    onToggleSidebar?: () => void;
    showMenuButton?: boolean;
}

const TopBar: React.FC<TopBarProps> = ({ onToggleSidebar, showMenuButton }) => {
    const { inputImages, currentIdx, setCurrentIdx, addFiles, removeCurrentImage } = useStore();
    const theme = useTheme();
    const isSmall = useMediaQuery(theme.breakpoints.down('sm'));

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        const formData = new FormData();
        Array.from(e.target.files).forEach(file => formData.append('files', file));
        
        try {
            const res = await axios.post(`${API_BASE_URL}/api/upload?category=images`, formData);
            const uploadedFiles = res.data.file_ids.map((id: string, index: number) => ({
                id,
                name: e.target.files![index].name,
                url: URL.createObjectURL(e.target.files![index]),
                category: 'images'
            }));
            addFiles(uploadedFiles, 'inputImages');
            if (currentIdx === -1) setCurrentIdx(0);
        } catch (err) {
            console.error("Upload failed", err);
        }
    };

    return (
        <Box sx={{ height: 60, borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', px: { xs: 1, sm: 2 }, gap: { xs: 1, sm: 2 } }}>
            {showMenuButton && (
                <IconButton onClick={onToggleSidebar} size="small" sx={{ color: 'white' }}>
                    <Menu size={20} />
                </IconButton>
            )}
            
            <Button 
                variant="contained" 
                startIcon={<Upload size={18} />} 
                component="label"
                size={isSmall ? "small" : "medium"}
                sx={{ whiteSpace: 'nowrap', minWidth: 'auto', fontSize: isSmall ? '0.75rem' : '0.875rem' }}
            >
                {isSmall ? "Select" : "Select Images"}
                <input type="file" hidden multiple onChange={handleFileUpload} />
            </Button>

            <IconButton
                aria-label="Delete selected image"
                disabled={currentIdx === -1 || inputImages.length === 0}
                onClick={removeCurrentImage}
                size="small"
                sx={{
                    color: 'error.main',
                    border: '1px solid',
                    borderColor: currentIdx === -1 || inputImages.length === 0 ? 'divider' : 'error.main',
                    width: isSmall ? 32 : 36,
                    height: isSmall ? 32 : 36,
                    '&:hover': {
                        bgcolor: 'rgba(244, 67, 54, 0.12)'
                    }
                }}
            >
                <Trash2 size={isSmall ? 16 : 18} />
            </IconButton>
            
            <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: { xs: 0.5, sm: 2 } }}>
                <IconButton 
                    disabled={currentIdx <= 0} 
                    onClick={() => setCurrentIdx(currentIdx - 1)}
                    size="small"
                >
                    <ChevronLeft size={isSmall ? 18 : 24} />
                </IconButton>
                <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: isSmall ? '0.75rem' : '0.875rem' }}>
                    {inputImages.length > 0 ? `${currentIdx + 1} / ${inputImages.length}` : '0 / 0'}
                </Typography>
                <IconButton 
                    disabled={currentIdx >= inputImages.length - 1} 
                    onClick={() => setCurrentIdx(currentIdx + 1)}
                    size="small"
                >
                    <ChevronRight size={isSmall ? 18 : 24} />
                </IconButton>
            </Box>
        </Box>
    );
};

export default TopBar;
