import { Box, Button, Typography, IconButton } from '@mui/material';
import { ChevronLeft, ChevronRight, Upload } from 'lucide-react';
import { useStore } from '../store/useStore';
import axios from 'axios';
import { API_BASE_URL } from '../config';

const TopBar: React.FC = () => {
    const { inputImages, currentIdx, setCurrentIdx, addFiles } = useStore();

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
        <Box sx={{ height: 60, borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', px: 2, gap: 2 }}>
            <Button variant="contained" startIcon={<Upload size={18} />} component="label">
                Select Images
                <input type="file" hidden multiple onChange={handleFileUpload} />
            </Button>
            
            <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2 }}>
                <IconButton 
                    disabled={currentIdx <= 0} 
                    onClick={() => setCurrentIdx(currentIdx - 1)}
                >
                    <ChevronLeft />
                </IconButton>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {inputImages.length > 0 ? `${currentIdx + 1} / ${inputImages.length}` : '0 / 0'}
                </Typography>
                <IconButton 
                    disabled={currentIdx >= inputImages.length - 1} 
                    onClick={() => setCurrentIdx(currentIdx + 1)}
                >
                    <ChevronRight />
                </IconButton>
            </Box>
        </Box>
    );
};

export default TopBar;
