export interface ProcessingConfig {
    enable_bg_removal: boolean;
    enable_bg_replace: boolean;
    enable_rotation: boolean;
    enable_emojis: boolean;
    enable_random_emoji: boolean;
    enable_listing: boolean;
    enable_gradient_border: boolean;
    border_thickness: number;
    enable_auto_enhance: boolean;
    bg_blur_amount: number;
    logo_position: string;
    listing_template: string;
    brand_name: string;
    product_name: string;
    key_feature: string;
    emoji_size_scale: number;
    max_size_kb: number;
    variations_per_img: number;
    selection_area: [number, number, number, number] | null;
}

export interface UploadedFile {
    id: string;
    name: string;
    url: string;
    category: 'images' | 'backgrounds' | 'emojis' | 'logos';
}

export interface ProcessingRequest {
    image_id: string;
    config: ProcessingConfig;
    background_ids: string[];
    emoji_ids: string[];
    logo_id: string | null;
}
