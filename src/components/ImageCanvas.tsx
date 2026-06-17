import { useState, useEffect, useRef } from 'react';
import { Stage, Layer, Image as KonvaImage, Rect, Transformer, Group } from 'react-konva';
import useImage from 'use-image';
import { useStore } from '../store/useStore';

const CANVAS_PADDING = 64;
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 4;
const ZOOM_STEP = 0.2;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const ImageCanvas: React.FC = () => {
    const { inputImages, currentIdx, config, setConfig } = useStore();
    const currentImageUrl = inputImages[currentIdx]?.url || '';
    const [image] = useImage(currentImageUrl);
    
    const [stageSize, setStageSize] = useState({ width: 0, height: 0 });
    const [userZoom, setUserZoom] = useState(1);
    
    const viewportRef = useRef<HTMLDivElement>(null);
    const stageRef = useRef<any>(null);
    const rectRef = useRef<any>(null);
    const trRef = useRef<any>(null);
    const previousZoomRef = useRef(userZoom);

    useEffect(() => {
        setUserZoom(1);
    }, [currentImageUrl]);

    // Handle container resizing
    useEffect(() => {
        if (!viewportRef.current) return;

        const observer = new ResizeObserver((entries) => {
            const entry = entries[0];
            if (entry) {
                setStageSize({
                    width: entry.contentRect.width,
                    height: entry.contentRect.height,
                });
            }
        });

        observer.observe(viewportRef.current);
        return () => observer.disconnect();
    }, []);

    const fitScale = image && stageSize.width > 0 && stageSize.height > 0
        ? Math.max(
            0.05,
            Math.min(
                (stageSize.width - CANVAS_PADDING * 2) / image.width,
                (stageSize.height - CANVAS_PADDING * 2) / image.height
            )
        )
        : 1;
    const imageScale = fitScale * userZoom;
    const scaledImageWidth = image ? image.width * imageScale : 0;
    const scaledImageHeight = image ? image.height * imageScale : 0;
    const canvasWidth = Math.max(stageSize.width, scaledImageWidth + CANVAS_PADDING * 2);
    const canvasHeight = Math.max(stageSize.height, scaledImageHeight + CANVAS_PADDING * 2);

    const imageX = image ? (canvasWidth - scaledImageWidth) / 2 : 0;
    const imageY = image ? (canvasHeight - scaledImageHeight) / 2 : 0;
    const zoomPercent = Math.round(userZoom * 100);

    useEffect(() => {
        const viewport = viewportRef.current;
        if (!viewport || !image) return;

        if (userZoom > 1 && previousZoomRef.current !== userZoom) {
            viewport.scrollLeft = Math.max(0, (canvasWidth - viewport.clientWidth) / 2);
            viewport.scrollTop = Math.max(0, (canvasHeight - viewport.clientHeight) / 2);
        }

        if (userZoom <= 1) {
            viewport.scrollLeft = 0;
            viewport.scrollTop = 0;
        }

        previousZoomRef.current = userZoom;
    }, [canvasHeight, canvasWidth, image, userZoom]);

    // Update Transformer nodes
    useEffect(() => {
        if (trRef.current && rectRef.current) {
            trRef.current.nodes([rectRef.current]);
            trRef.current.getLayer().batchDraw();
        }
    }, [config.selection_area, imageScale]);

    if (!image) {
        return (
            <div
                ref={viewportRef}
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#0a0a0a',
                    color: '#777'
                }}
            >
                Select an image from the top bar to start
            </div>
        );
    }

    const handleWheel = (e: any) => {
        e.evt.preventDefault();
        const direction = e.evt.deltaY < 0 ? 1 : -1;
        setUserZoom((zoom) => clamp(zoom + direction * ZOOM_STEP, MIN_ZOOM, MAX_ZOOM));
    };

    const zoomIn = () => setUserZoom((zoom) => clamp(zoom + ZOOM_STEP, MIN_ZOOM, MAX_ZOOM));
    const zoomOut = () => setUserZoom((zoom) => clamp(zoom - ZOOM_STEP, MIN_ZOOM, MAX_ZOOM));
    const resetZoom = () => setUserZoom(1);

    const handleStageMouseDown = (e: any) => {
        const clickedOnImage = e.target.className === 'Image';

        if (clickedOnImage) {
            const pos = stageRef.current.getPointerPosition();
            const localPos = {
                x: (pos.x - imageX) / imageScale,
                y: (pos.y - imageY) / imageScale,
            };
            
            const smallestSide = Math.min(image.width, image.height);
            const size = clamp(smallestSide * 0.08, 24, smallestSide * 0.18);
            const x = Math.max(0, Math.min(localPos.x, image.width - size));
            const y = Math.max(0, Math.min(localPos.y, image.height - size));
            
            setConfig({ selection_area: [x, y, x + size, y + size] });
        }
    };

    const handleRectTransformEnd = () => {
        const node = rectRef.current;
        const scaleX = node.scaleX();
        const scaleY = node.scaleY();

        node.scaleX(1);
        node.scaleY(1);

        let x = node.x();
        let y = node.y();
        let w = node.width() * scaleX;
        let h = node.height() * scaleY;

        if (x < 0) { w += x; x = 0; }
        if (y < 0) { h += y; y = 0; }
        if (x + w > image.width) w = image.width - x;
        if (y + h > image.height) h = image.height - y;

        setConfig({ selection_area: [x, y, x + w, y + h] });
    };

    return (
        <div 
            style={{ 
                width: '100%', 
                height: '100%', 
                backgroundColor: '#0a0a0a', 
                overflow: 'hidden', 
                position: 'relative' 
            }}
        >
            {/* Workspace Frame - Strictly fixed */}
            <div style={{
                position: 'absolute',
                top: 32,
                left: 32,
                right: 32,
                bottom: 32,
                border: '1px solid rgba(255,255,255,0.05)',
                pointerEvents: 'none',
                borderRadius: '8px',
                zIndex: 0
            }} />
            
            <div
                ref={viewportRef}
                style={{
                    width: '100%',
                    height: '100%',
                    overflowX: userZoom > 1 ? 'auto' : 'hidden',
                    overflowY: userZoom > 1 ? 'auto' : 'hidden',
                    position: 'relative'
                }}
            >
                <Stage
                    ref={stageRef}
                    width={canvasWidth}
                    height={canvasHeight}
                    onWheel={handleWheel}
                    onMouseDown={handleStageMouseDown}
                >
                    <Layer>
                        <Group x={imageX} y={imageY} scaleX={imageScale} scaleY={imageScale}>
                            <Rect
                                x={-5}
                                y={-5}
                                width={image.width + 10}
                                height={image.height + 10}
                                fill="rgba(0,0,0,0.5)"
                                shadowBlur={20 / imageScale}
                            />

                            <KonvaImage
                                image={image}
                                width={image.width}
                                height={image.height}
                            />

                            {config.selection_area && (
                                <Group>
                                    <Rect
                                        ref={rectRef}
                                        x={config.selection_area[0]}
                                        y={config.selection_area[1]}
                                        width={config.selection_area[2] - config.selection_area[0]}
                                        height={config.selection_area[3] - config.selection_area[1]}
                                        stroke="#3fa9f5"
                                        strokeWidth={2 / imageScale}
                                        fill="rgba(63, 169, 245, 0.1)"
                                        draggable
                                        onDragEnd={(e) => {
                                            const node = e.target;
                                            const w = config.selection_area![2] - config.selection_area![0];
                                            const h = config.selection_area![3] - config.selection_area![1];
                                            let nx = Math.max(0, Math.min(node.x(), image.width - w));
                                            let ny = Math.max(0, Math.min(node.y(), image.height - h));
                                            setConfig({ selection_area: [nx, ny, nx + w, ny + h] });
                                        }}
                                        onTransformEnd={handleRectTransformEnd}
                                    />
                                    <Transformer
                                        ref={trRef}
                                        rotateEnabled={false}
                                        anchorSize={8}
                                        borderStrokeWidth={1}
                                        borderStroke="#3fa9f5"
                                        anchorFill="#3fa9f5"
                                        anchorStroke="#fff"
                                        anchorCornerRadius={2}
                                        boundBoxFunc={(oldBox, newBox) => {
                                            const isOut = 
                                                newBox.x < 0 || 
                                                newBox.y < 0 || 
                                                newBox.x + newBox.width > image.width || 
                                                newBox.y + newBox.height > image.height;
                                            if (isOut || newBox.width < 20 || newBox.height < 20) return oldBox;
                                            return newBox;
                                        }}
                                    />
                                </Group>
                            )}
                        </Group>
                    </Layer>
                </Stage>
            </div>
            
            {/* UI Overlays - Using standard inline styles for maximum stability */}
            <div style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                display: 'flex',
                gap: '8px',
                pointerEvents: 'none'
            }}>
                <div style={{
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    backdropFilter: 'blur(10px)',
                    padding: '6px 12px',
                    borderRadius: '100px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    fontSize: '10px',
                    color: '#ccc',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    fontWeight: 'bold'
                }}>
                    Interactive Workspace
                </div>
            </div>

            <div style={{
                position: 'absolute',
                bottom: '24px',
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: '16px',
                pointerEvents: 'none'
            }}>
                <div style={{
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    backdropFilter: 'blur(10px)',
                    padding: '8px 24px',
                    borderRadius: '12px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '24px'
                }}>
                    <span style={{ color: '#aaa', fontSize: '11px', fontWeight: '500' }}>Image: Center Fit</span>
                    <div style={{ width: '1px', height: '12px', backgroundColor: 'rgba(255,255,255,0.1)' }} />
                    <span style={{ color: '#aaa', fontSize: '11px', fontWeight: '500' }}>Wheel: Zoom</span>
                    <div style={{ width: '1px', height: '12px', backgroundColor: 'rgba(255,255,255,0.1)' }} />
                    <span style={{ color: '#aaa', fontSize: '11px', fontWeight: '500' }}>Drag Box: Move</span>
                    <div style={{ width: '1px', height: '12px', backgroundColor: 'rgba(255,255,255,0.1)' }} />
                    <span style={{ color: '#aaa', fontSize: '11px', fontWeight: '500' }}>Click: Select</span>
                </div>
            </div>

            <div style={{
                position: 'absolute',
                right: '16px',
                bottom: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: 'rgba(0,0,0,0.68)',
                backdropFilter: 'blur(10px)',
                padding: '6px',
                borderRadius: '10px',
                border: '1px solid rgba(255,255,255,0.12)'
            }}>
                <button
                    type="button"
                    onClick={zoomOut}
                    style={{
                        width: 30,
                        height: 30,
                        border: '1px solid rgba(255,255,255,0.12)',
                        borderRadius: 6,
                        background: '#151515',
                        color: '#fff',
                        cursor: 'pointer',
                        fontSize: 18,
                        lineHeight: '26px'
                    }}
                >
                    -
                </button>
                <button
                    type="button"
                    onClick={resetZoom}
                    style={{
                        minWidth: 54,
                        height: 30,
                        border: '1px solid rgba(255,255,255,0.12)',
                        borderRadius: 6,
                        background: '#151515',
                        color: '#ddd',
                        cursor: 'pointer',
                        fontSize: 11
                    }}
                >
                    {zoomPercent}%
                </button>
                <button
                    type="button"
                    onClick={zoomIn}
                    style={{
                        width: 30,
                        height: 30,
                        border: '1px solid rgba(255,255,255,0.12)',
                        borderRadius: 6,
                        background: '#151515',
                        color: '#fff',
                        cursor: 'pointer',
                        fontSize: 18,
                        lineHeight: '26px'
                    }}
                >
                    +
                </button>
            </div>
        </div>
    );
};

export default ImageCanvas;
