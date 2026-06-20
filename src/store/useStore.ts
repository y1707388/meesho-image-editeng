import { create } from 'zustand';
import type { ProcessingConfig, UploadedFile } from '../types';

interface AppState {
    config: ProcessingConfig;
    inputImages: UploadedFile[];
    backgrounds: UploadedFile[];
    emojis: UploadedFile[];
    logos: UploadedFile[];
    currentIdx: number;
    isProcessing: boolean;
    previewUrl: string | null;
    
    // Actions
    setConfig: (config: Partial<ProcessingConfig>) => void;
    addFiles: (files: UploadedFile[], category: string) => void;
    setCurrentIdx: (idx: number) => void;
    removeCurrentImage: () => void;
    setIsProcessing: (status: boolean) => void;
    setPreviewUrl: (url: string | null) => void;
    updateImageSelection: (area: [number, number, number, number] | null) => void;
}

export const useStore = create<AppState>((set) => ({
    config: {
        enable_bg_removal: false,
        enable_bg_replace: false,
        enable_rotation: false,
        enable_emojis: false,
        enable_random_emoji: false,
        enable_listing: false,
        enable_gradient_border: false,
        border_thickness: 15,
        enable_auto_enhance: true,
        bg_blur_amount: 0.0,
        logo_position: "Bottom Right",
        listing_template: "Modern Top Bar",
        brand_name: "",
        product_name: "",
        key_feature: "",
        emoji_size_scale: 0.15,
        max_size_kb: 500,
        variations_per_img: 1,
        selection_area: null,
    },
    inputImages: [],
    backgrounds: [],
    emojis: [],
    logos: [],
    currentIdx: -1,
    isProcessing: false,
    previewUrl: null,

    setConfig: (newConfig) => set((state) => ({ 
        config: { ...state.config, ...newConfig } 
    })),

    addFiles: (files, category) => set((state) => {
        const key = category as keyof Pick<AppState, 'inputImages' | 'backgrounds' | 'emojis' | 'logos'>;
        return { [key]: [...state[key], ...files] };
    }),

    setCurrentIdx: (idx) => set({ currentIdx: idx }),

    removeCurrentImage: () => set((state) => {
        if (state.currentIdx < 0 || state.inputImages.length === 0) {
            return {};
        }

        const removedImage = state.inputImages[state.currentIdx];
        if (removedImage?.url?.startsWith('blob:')) {
            URL.revokeObjectURL(removedImage.url);
        }

        const inputImages = state.inputImages.filter((_, index) => index !== state.currentIdx);
        const currentIdx = inputImages.length === 0
            ? -1
            : Math.min(state.currentIdx, inputImages.length - 1);

        return {
            inputImages,
            currentIdx,
            config: { ...state.config, selection_area: null }
        };
    }),
    
    setIsProcessing: (status) => set({ isProcessing: status }),
    
    setPreviewUrl: (url) => set({ previewUrl: url }),

    updateImageSelection: (area) => set((state) => {
        // Note: In a real app we might store selection per image
        // For simplicity, we can just update the active config if needed
        return { config: { ...state.config, selection_area: area } };
    }),
}));
