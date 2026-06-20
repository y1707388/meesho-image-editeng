import { 
    Box, 
    Typography, 
    Accordion, 
    AccordionSummary, 
    AccordionDetails, 
    Checkbox, 
    FormControlLabel, 
    Slider, 
    TextField, 
    Button,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    IconButton
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { X } from 'lucide-react';
import { useStore } from '../store/useStore';
import axios from 'axios';
import { API_BASE_URL } from '../config';

interface SidebarProps {
    onClose?: () => void;
    showCloseButton?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ onClose, showCloseButton = false }) => {
    const { config, setConfig, addFiles } = useStore();

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, category: string) => {
        if (!e.target.files) return;
        const formData = new FormData();
        Array.from(e.target.files).forEach(file => formData.append('files', file));
        
        try {
            const res = await axios.post(`${API_BASE_URL}/api/upload?category=${category}`, formData);
            const uploadedFiles = res.data.file_ids.map((id: string, index: number) => ({
                id,
                name: e.target.files![index].name,
                url: URL.createObjectURL(e.target.files![index]),
                category
            }));
            addFiles(uploadedFiles, category === 'images' ? 'inputImages' : category);
        } catch (err) {
            console.error("Upload failed", err);
        }
    };

    return (
        <Box sx={{ width: { xs: '100%', sm: 320 }, maxWidth: 320, height: '100%', borderRight: 1, borderColor: 'divider', overflowY: 'auto', p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Toolbox</Typography>
                {showCloseButton && (
                    <IconButton
                        aria-label="Close toolbox"
                        onClick={onClose}
                        size="small"
                        sx={{
                            color: 'primary.main',
                            border: '1px solid',
                            borderColor: 'primary.main',
                            width: 30,
                            height: 30,
                            '&:hover': {
                                bgcolor: 'rgba(63, 169, 245, 0.12)'
                            }
                        }}
                    >
                        <X size={18} />
                    </IconButton>
                )}
            </Box>
            
            {/* Background Module */}
            <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography sx={{ fontWeight: 'bold' }}>Background Module</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <FormControlLabel
                        control={<Checkbox checked={config.enable_bg_removal} onChange={(e) => setConfig({ enable_bg_removal: e.target.checked })} />}
                        label="Remove Background"
                    />
                    <FormControlLabel
                        control={<Checkbox checked={config.enable_bg_replace} onChange={(e) => setConfig({ enable_bg_replace: e.target.checked })} />}
                        label="Replace Background"
                    />
                    <Button variant="outlined" component="label" fullWidth sx={{ my: 1 }}>
                        Upload Backgrounds
                        <input type="file" hidden multiple onChange={(e) => handleFileUpload(e, 'backgrounds')} />
                    </Button>
                    <Typography variant="caption">Background Blur</Typography>
                    <Slider
                        value={config.bg_blur_amount}
                        min={0}
                        max={10}
                        onChange={(_, v) => setConfig({ bg_blur_amount: v as number })}
                    />
                </AccordionDetails>
            </Accordion>

            {/* Emoji Module */}
            <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography sx={{ fontWeight: 'bold' }}>Emoji Module</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <FormControlLabel
                        control={<Checkbox checked={config.enable_emojis} onChange={(e) => setConfig({ enable_emojis: e.target.checked })} />}
                        label="Enable Emojis"
                    />
                    <FormControlLabel
                        control={<Checkbox checked={config.enable_random_emoji} onChange={(e) => setConfig({ enable_random_emoji: e.target.checked })} />}
                        label="Random Placement"
                    />
                    <Button variant="outlined" component="label" fullWidth sx={{ my: 1 }}>
                        Upload Emojis
                        <input type="file" hidden multiple onChange={(e) => handleFileUpload(e, 'emojis')} />
                    </Button>
                    <FormControl fullWidth sx={{ mt: 1 }}>
                        <InputLabel>Emoji Size</InputLabel>
                        <Select
                            value={config.emoji_size_scale}
                            label="Emoji Size"
                            onChange={(e) => setConfig({ emoji_size_scale: e.target.value as number })}
                        >
                            <MenuItem value={0.08}>Small</MenuItem>
                            <MenuItem value={0.15}>Medium</MenuItem>
                            <MenuItem value={0.25}>Large</MenuItem>
                        </Select>
                    </FormControl>
                </AccordionDetails>
            </Accordion>

            {/* Listing Section */}
            <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography sx={{ fontWeight: 'bold' }}>Meesho Listing</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <FormControlLabel
                        control={<Checkbox checked={config.enable_listing} onChange={(e) => setConfig({ enable_listing: e.target.checked })} />}
                        label="Enable Listing Gen"
                    />
                    <TextField
                        fullWidth
                        label="Brand Name"
                        size="small"
                        sx={{ mt: 1 }}
                        value={config.brand_name}
                        onChange={(e) => setConfig({ brand_name: e.target.value })}
                    />
                    <TextField
                        fullWidth
                        label="Product Name"
                        size="small"
                        sx={{ mt: 1 }}
                        value={config.product_name}
                        onChange={(e) => setConfig({ product_name: e.target.value })}
                    />
                    <TextField
                        fullWidth
                        label="Key Feature"
                        size="small"
                        sx={{ mt: 1 }}
                        value={config.key_feature}
                        onChange={(e) => setConfig({ key_feature: e.target.value })}
                    />
                </AccordionDetails>
            </Accordion>

            {/* Design & Branding */}
            <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography sx={{ fontWeight: 'bold' }}>Branding & Design</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <Button variant="outlined" component="label" fullWidth sx={{ mb: 1 }}>
                        Upload Logo
                        <input type="file" hidden onChange={(e) => handleFileUpload(e, 'logos')} />
                    </Button>
                    <FormControl fullWidth size="small" sx={{ mb: 1 }}>
                        <InputLabel>Logo Position</InputLabel>
                        <Select
                            value={config.logo_position}
                            label="Logo Position"
                            onChange={(e) => setConfig({ logo_position: e.target.value })}
                        >
                            <MenuItem value="Top Left">Top Left</MenuItem>
                            <MenuItem value="Top Center">Top Center</MenuItem>
                            <MenuItem value="Top Right">Top Right</MenuItem>
                            <MenuItem value="Bottom Left">Bottom Left</MenuItem>
                            <MenuItem value="Bottom Center">Bottom Center</MenuItem>
                            <MenuItem value="Bottom Right">Bottom Right</MenuItem>
                        </Select>
                    </FormControl>
                    <FormControlLabel
                        control={<Checkbox checked={config.enable_gradient_border} onChange={(e) => setConfig({ enable_gradient_border: e.target.checked })} />}
                        label="Add Gradient Border"
                    />
                    <TextField
                        fullWidth
                        label="Border Thickness"
                        type="number"
                        size="small"
                        sx={{ mt: 1 }}
                        value={config.border_thickness}
                        onChange={(e) => setConfig({ border_thickness: parseInt(e.target.value) || 0 })}
                    />
                </AccordionDetails>
            </Accordion>

            {/* Export Settings */}
            <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography sx={{ fontWeight: 'bold' }}>Export Settings</Typography>
                </AccordionSummary>
                <AccordionDetails>
                    <TextField
                        fullWidth
                        label="Variations per Image"
                        type="number"
                        size="small"
                        sx={{ mb: 1 }}
                        value={config.variations_per_img}
                        onChange={(e) => setConfig({ variations_per_img: parseInt(e.target.value) || 1 })}
                    />
                    <TextField
                        fullWidth
                        label="Max Size (KB)"
                        type="number"
                        size="small"
                        value={config.max_size_kb}
                        onChange={(e) => setConfig({ max_size_kb: parseInt(e.target.value) || 500 })}
                    />
                </AccordionDetails>
            </Accordion>
        </Box>
    );
};

export default Sidebar;
