import { Box, Button, LinearProgress, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useStore } from '../store/useStore';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const BottomBar: React.FC = () => {
    const { 
        config, 
        inputImages, 
        currentIdx, 
        backgrounds, 
        emojis, 
        logos, 
        isProcessing, 
        setIsProcessing,
        setPreviewUrl 
    } = useStore();

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const handlePreview = async () => {
        if (currentIdx === -1) return;
        setIsProcessing(true);
        try {
            const req = {
                image_id: inputImages[currentIdx].id,
                config,
                background_ids: backgrounds.map(b => b.id),
                emoji_ids: emojis.map(e => e.id),
                logo_id: logos[0]?.id || null
            };
            const res = await axios.post(`${API_BASE_URL}/api/preview`, req, { responseType: 'blob' });
            const url = URL.createObjectURL(res.data);
            setPreviewUrl(url);
        } catch (err) {
            console.error("Preview failed", err);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleStartProcessing = async () => {
        if (inputImages.length === 0) return;
        setIsProcessing(true);
        try {
            const requests = inputImages.map(img => ({
                image_id: img.id,
                config,
                background_ids: backgrounds.map(b => b.id),
                emoji_ids: emojis.map(e => e.id),
                logo_id: logos[0]?.id || null
            }));
            const res = await axios.post(`${API_BASE_URL}/api/process`, requests);
            window.open(`${API_BASE_URL}${res.data.zip_url}`, '_blank');
        } catch (err) {
            console.error("Processing failed", err);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <Box sx={{ 
            minHeight: { xs: 'auto', sm: 80 }, 
            py: { xs: 1.5, sm: 0 },
            px: { xs: 2, sm: 3 },
            borderTop: 1, 
            borderColor: 'divider', 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: 'center', 
            gap: 1.5
        }}>
            <Box sx={{ width: '100%', flex: { sm: 1 }, textAlign: { xs: 'center', sm: 'left' } }}>
                {isProcessing && <LinearProgress sx={{ mb: 0.5 }} />}
                <Typography variant="caption" color="textSecondary">
                    {isProcessing ? "Processing..." : "Ready"}
                </Typography>
            </Box>
            
            <Box sx={{ 
                display: 'flex', 
                width: { xs: '100%', sm: 'auto' }, 
                gap: 1.5,
                justifyContent: 'center'
            }}>
                <Button 
                    variant="contained" 
                    color="success" 
                    size={isMobile ? "medium" : "large"}
                    fullWidth={isMobile}
                    disabled={isProcessing || currentIdx === -1}
                    onClick={handlePreview}
                    sx={{ whiteSpace: 'nowrap' }}
                >
                    {isMobile ? "PREVIEW" : "LIVE PREVIEW"}
                </Button>
                
                <Button 
                    variant="contained" 
                    color="primary" 
                    size={isMobile ? "medium" : "large"}
                    fullWidth={isMobile}
                    disabled={isProcessing || inputImages.length === 0}
                    onClick={handleStartProcessing}
                    sx={{ whiteSpace: 'nowrap' }}
                >
                    {isMobile ? "GENERATE" : "START GENERATING"}
                </Button>
            </Box>
        </Box>
    );
};

export default BottomBar;
