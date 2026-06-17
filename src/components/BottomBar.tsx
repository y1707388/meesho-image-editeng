import { Box, Button, LinearProgress, Typography } from '@mui/material';
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
        <Box sx={{ height: 80, borderTop: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', px: 3, gap: 2 }}>
            <Box sx={{ flex: 1 }}>
                {isProcessing && <LinearProgress />}
                <Typography variant="caption" color="textSecondary">
                    {isProcessing ? "Processing..." : "Ready"}
                </Typography>
            </Box>
            
            <Button 
                variant="contained" 
                color="success" 
                size="large"
                disabled={isProcessing || currentIdx === -1}
                onClick={handlePreview}
            >
                LIVE PREVIEW
            </Button>
            
            <Button 
                variant="contained" 
                color="primary" 
                size="large"
                disabled={isProcessing || inputImages.length === 0}
                onClick={handleStartProcessing}
            >
                START GENERATING
            </Button>
        </Box>
    );
};

export default BottomBar;
