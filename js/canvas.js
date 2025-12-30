/**
 * Canvas Renderer for the Screenshot Mockup Tool
 */

window.CanvasRenderer = {
    // Canvas element and context
    canvas: null,
    ctx: null,

    // Initialize the canvas renderer
    init(canvasElement) {
        this.canvas = canvasElement;
        this.ctx = canvasElement.getContext('2d');
    },

    // Resize the canvas to fit the specified resolution
    resizeCanvas(width, height) {
        // Set the canvas dimensions at actual resolution (for rendering)
        this.canvas.width = width;
        this.canvas.height = height;

        // The CSS will handle scaling to 50%
        // Store the original dimensions for reference
        this.originalWidth = width;
        this.originalHeight = height;

        // Calculate aspect ratio
        this.aspectRatio = width / height;
    },

    // Clear the canvas
    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },

    // Render the complete mockup with all settings
    renderMockup(options) {
        // Extract options
        const {
            image,
            backgroundColor,
            backgroundGradient,
            backgroundImage,
            backgroundBlurRadius,
            backgroundTwirlAmount,
            backgroundSaturation,
            backgroundHueRotation,
            backgroundContrast,
            backgroundBrightness,
            backgroundWaveAmount,
            backgroundRippleAmount,
            backgroundZoomAmount,
            backgroundShakeAmount,
            backgroundLensAmount,
            noiseOverlay,
            cornerRadius,
            padding,
            shadowOpacity,
            shadowRadius,
            shadowOffsetX,
            shadowOffsetY,
            shadowColor,
            rotation,
            isFlippedHorizontally,
            isFlippedVertically,
            smartFillEnabled,
            panX,
            panY,
            watermarkImage,
            watermarkOpacity,
            watermarkScale,
            watermarkPosition,
            watermarkType,
            watermarkText,
            watermarkTextFont,
            watermarkTextSize,
            watermarkTextColor,
            watermarkTextBold,
            watermarkTextItalic,
            watermarkTextShadow,
            watermarkTextShadowColor,
            watermarkTextShadowBlur,
            textLayers,
            selectedTextLayerId,
            marketingCtaText,
            marketingCtaColor,
            marketingCtaTextColor,
            marketingShowCta
        } = options;

        // Ensure all numeric values are actually numbers
        const cornerRadiusVal = Math.max(0, Number(cornerRadius) || 0);
        const paddingVal = Math.max(0, Number(padding) || 0);
        const shadowOpacityVal = Math.max(0, Math.min(1, Number(shadowOpacity) || 0));
        const shadowRadiusVal = Math.max(0, Number(shadowRadius) || 0);
        const shadowOffsetXVal = Number(shadowOffsetX) || 0;
        const shadowOffsetYVal = Number(shadowOffsetY) || 0;
        const rotationVal = Number(rotation) || 0;

        // Clear the canvas
        this.clearCanvas();

        // Draw background with effects
        this.drawBackground(backgroundColor, backgroundGradient, backgroundImage, {
            blurRadius: backgroundBlurRadius,
            twirlAmount: backgroundTwirlAmount,
            saturation: backgroundSaturation,
            hueRotation: backgroundHueRotation,
            contrast: backgroundContrast,
            brightness: backgroundBrightness,
            waveAmount: backgroundWaveAmount,
            rippleAmount: backgroundRippleAmount,
            zoomAmount: backgroundZoomAmount,
            shakeAmount: backgroundShakeAmount,
            lensAmount: backgroundLensAmount
        });

        // Draw noise overlay if specified
        if (noiseOverlay) {
            this.drawNoiseOverlay(noiseOverlay);
        }

        // Sort text layers by z-index (lower z-index first)
        const sortedTextLayers = textLayers ? [...textLayers].sort((a, b) => {
            const zIndexA = a.zIndex !== undefined ? a.zIndex : 10; // Default to front (10)
            const zIndexB = b.zIndex !== undefined ? b.zIndex : 10;
            return zIndexA - zIndexB;
        }) : [];

        // Draw text layers that should appear behind the image (z-index < 5)
        sortedTextLayers
            .filter(layer => (layer.zIndex !== undefined ? layer.zIndex < 5 : false))
            .forEach(layer => this.drawTextOverlay(layer));

        // Draw images if available
        const images = options.images || (image ? [image] : []);
        const currentLayout = options.currentLayout || 'single';

        if (images.length > 0) {
            this.drawMultipleImages(
                images,
                currentLayout,
                cornerRadiusVal,
                paddingVal,
                shadowOpacityVal,
                shadowRadiusVal,
                shadowOffsetXVal,
                shadowOffsetYVal,
                shadowColor,
                rotationVal,
                isFlippedHorizontally,
                isFlippedVertically,
                smartFillEnabled,
                panX,
                panY,
                options.selectedImageIndex || 0
            );

            // Draw text layers that should appear in front of the images (z-index >= 5)
            sortedTextLayers
                .filter(layer => (layer.zIndex !== undefined ? layer.zIndex >= 5 : true))
                .forEach(layer => this.drawTextOverlay(layer));
        } else {
            // No images - draw all text layers with default z-index behavior
            sortedTextLayers.forEach(layer => this.drawTextOverlay(layer));
        }

        // Draw watermark if available
        if (watermarkImage || (watermarkType === 'text' && watermarkText)) {
            let watermarkData = null;

            if (watermarkType === 'text' && watermarkText) {
                // Create text watermark data structure
                watermarkData = {
                    type: 'text',
                    text: watermarkText,
                    font: watermarkTextFont || "'Inter', sans-serif",
                    size: watermarkTextSize || 24,
                    color: watermarkTextColor || '#FFFFFF',
                    bold: watermarkTextBold || false,
                    italic: watermarkTextItalic || false,
                    shadow: watermarkTextShadow || false,
                    shadowColor: watermarkTextShadowColor || '#000000',
                    shadowBlur: watermarkTextShadowBlur || 3
                };
            } else if (watermarkImage) {
                // Create image watermark data structure
                watermarkData = {
                    type: 'image',
                    image: watermarkImage
                };
            }

            if (watermarkData) {
                this.drawWatermark(
                    watermarkData,
                    watermarkOpacity,
                    watermarkScale,
                    watermarkPosition
                );
            }
        }

        // Draw Marketing CTA if enabled
        if (marketingShowCta && marketingCtaText) {
            this.drawMarketingCTA(marketingCtaText, marketingCtaColor, marketingCtaTextColor);
        }

        // Draw selection bounds for selected text layer (for visual feedback)
        if (selectedTextLayerId && textLayers) {
            const selectedLayer = textLayers.find(layer => layer.id === selectedTextLayerId);
            if (selectedLayer && selectedLayer.visible) {
                this.drawTextSelectionBounds(selectedLayer);
            }
        }

        return this.canvas;
    },

    // Draw the background
    drawBackground(color, gradient, backgroundImage, effects = {}) {
        const { width, height } = this.canvas;
        const {
            blurRadius = 0,
            twirlAmount = 0,
            saturation = 100,
            hueRotation = 0,
            contrast = 100,
            brightness = 100,
            waveAmount = 0,
            rippleAmount = 0,
            zoomAmount = 0,
            shakeAmount = 0,
            lensAmount = 0
        } = effects;

        // Create an offscreen canvas for background rendering
        const bgCanvas = document.createElement('canvas');
        bgCanvas.width = width;
        bgCanvas.height = height;
        const bgCtx = bgCanvas.getContext('2d');

        // Draw the base background to the offscreen canvas
        if (backgroundImage) {
            bgCtx.drawImage(backgroundImage, 0, 0, width, height);
        } else if (gradient) {
            const { colors, direction } = gradient;
            const gradientFill = Utils.applyGradient(bgCtx, 0, 0, width, height, colors, direction);
            bgCtx.fillStyle = gradientFill;
            bgCtx.fillRect(0, 0, width, height);
        } else if (color) {
            bgCtx.fillStyle = color;
            bgCtx.fillRect(0, 0, width, height);
        }

        // Apply twirl effect if enabled
        if (twirlAmount > 0) {
            this.applyTwirlEffect(bgCanvas, twirlAmount);
        }

        // Apply wave effect if enabled
        if (waveAmount > 0) {
            this.applyWaveEffect(bgCanvas, waveAmount);
        }

        // Apply ripple effect if enabled
        if (rippleAmount > 0) {
            this.applyRippleEffect(bgCanvas, rippleAmount);
        }

        // Apply zoom effect if enabled
        if (zoomAmount !== 100) {
            this.applyZoomEffect(bgCanvas, zoomAmount);
        }

        // Apply shake effect if enabled
        if (shakeAmount > 0) {
            this.applyShakeEffect(bgCanvas, shakeAmount);
        }

        // Apply lens distortion if enabled
        if (lensAmount > 0) {
            this.applyLensEffect(bgCanvas, lensAmount);
        }

        // Apply CSS filters for color adjustments and blur
        let filterString = '';

        if (blurRadius > 0) {
            filterString += `blur(${blurRadius}px) `;
        }

        if (saturation !== 100) {
            filterString += `saturate(${saturation}%) `;
        }

        if (hueRotation !== 0) {
            filterString += `hue-rotate(${hueRotation}deg) `;
        }

        if (contrast !== 100) {
            filterString += `contrast(${contrast}%) `;
        }

        if (brightness !== 100) {
            filterString += `brightness(${brightness}%) `;
        }

        // Apply filters if any are set
        if (filterString.trim()) {
            this.ctx.filter = filterString.trim();
        }

        // Draw the background canvas to the main canvas
        this.ctx.drawImage(bgCanvas, 0, 0);

        // Reset filter
        this.ctx.filter = 'none';
    },

    // Apply twirl distortion effect
    applyTwirlEffect(canvas, amount) {
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const newData = new Uint8ClampedArray(data.length);

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const maxRadius = Math.min(centerX, centerY);
        const twirlStrength = (amount / 100) * Math.PI * 2; // Convert to radians

        for (let y = 0; y < canvas.height; y++) {
            for (let x = 0; x < canvas.width; x++) {
                const dx = x - centerX;
                const dy = y - centerY;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < maxRadius) {
                    // Calculate twirl
                    const normalizedDistance = distance / maxRadius;
                    const angle = Math.atan2(dy, dx);
                    const twirlAngle = twirlStrength * (1 - normalizedDistance);

                    const newAngle = angle + twirlAngle;
                    const sourceX = Math.round(centerX + distance * Math.cos(newAngle));
                    const sourceY = Math.round(centerY + distance * Math.sin(newAngle));

                    if (sourceX >= 0 && sourceX < canvas.width && sourceY >= 0 && sourceY < canvas.height) {
                        const sourceIndex = (sourceY * canvas.width + sourceX) * 4;
                        const targetIndex = (y * canvas.width + x) * 4;

                        newData[targetIndex] = data[sourceIndex];         // R
                        newData[targetIndex + 1] = data[sourceIndex + 1]; // G
                        newData[targetIndex + 2] = data[sourceIndex + 2]; // B
                        newData[targetIndex + 3] = data[sourceIndex + 3]; // A
                    } else {
                        // Fill with transparent if source is out of bounds
                        const targetIndex = (y * canvas.width + x) * 4;
                        newData[targetIndex] = 0;
                        newData[targetIndex + 1] = 0;
                        newData[targetIndex + 2] = 0;
                        newData[targetIndex + 3] = 0;
                    }
                } else {
                    // Copy original pixel for areas outside the effect radius
                    const sourceIndex = (y * canvas.width + x) * 4;
                    newData[sourceIndex] = data[sourceIndex];
                    newData[sourceIndex + 1] = data[sourceIndex + 1];
                    newData[sourceIndex + 2] = data[sourceIndex + 2];
                    newData[sourceIndex + 3] = data[sourceIndex + 3];
                }
            }
        }

        const newImageData = new ImageData(newData, canvas.width, canvas.height);
        ctx.putImageData(newImageData, 0, 0);
    },

    // Apply wave distortion effect
    applyWaveEffect(canvas, amount) {
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const newData = new Uint8ClampedArray(data.length);

        const waveAmplitude = (amount / 100) * 20; // Max 20px wave amplitude
        const waveFrequency = 0.02; // Wave frequency

        for (let y = 0; y < canvas.height; y++) {
            for (let x = 0; x < canvas.width; x++) {
                // Calculate wave offset
                const waveOffset = Math.sin(y * waveFrequency) * waveAmplitude;
                const sourceX = Math.round(x + waveOffset);

                if (sourceX >= 0 && sourceX < canvas.width) {
                    const sourceIndex = (y * canvas.width + sourceX) * 4;
                    const targetIndex = (y * canvas.width + x) * 4;

                    newData[targetIndex] = data[sourceIndex];         // R
                    newData[targetIndex + 1] = data[sourceIndex + 1]; // G
                    newData[targetIndex + 2] = data[sourceIndex + 2]; // B
                    newData[targetIndex + 3] = data[sourceIndex + 3]; // A
                } else {
                    // Fill with adjacent pixel if source is out of bounds
                    const targetIndex = (y * canvas.width + x) * 4;
                    const fallbackX = Math.max(0, Math.min(canvas.width - 1, x));
                    const fallbackIndex = (y * canvas.width + fallbackX) * 4;
                    newData[targetIndex] = data[fallbackIndex];
                    newData[targetIndex + 1] = data[fallbackIndex + 1];
                    newData[targetIndex + 2] = data[fallbackIndex + 2];
                    newData[targetIndex + 3] = data[fallbackIndex + 3];
                }
            }
        }

        const newImageData = new ImageData(newData, canvas.width, canvas.height);
        ctx.putImageData(newImageData, 0, 0);
    },

    // Apply ripple effect
    applyRippleEffect(canvas, amount) {
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const newData = new Uint8ClampedArray(data.length);

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const maxRadius = Math.min(centerX, centerY);
        const rippleStrength = (amount / 100) * 15;

        for (let y = 0; y < canvas.height; y++) {
            for (let x = 0; x < canvas.width; x++) {
                const dx = x - centerX;
                const dy = y - centerY;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < maxRadius) {
                    // Create ripple effect
                    const ripple = Math.sin(distance * 0.1) * rippleStrength;
                    const normalizedDistance = distance / maxRadius;
                    const rippleOffset = ripple * (1 - normalizedDistance);

                    const angle = Math.atan2(dy, dx);
                    const sourceX = Math.round(centerX + (distance + rippleOffset) * Math.cos(angle));
                    const sourceY = Math.round(centerY + (distance + rippleOffset) * Math.sin(angle));

                    if (sourceX >= 0 && sourceX < canvas.width && sourceY >= 0 && sourceY < canvas.height) {
                        const sourceIndex = (sourceY * canvas.width + sourceX) * 4;
                        const targetIndex = (y * canvas.width + x) * 4;

                        newData[targetIndex] = data[sourceIndex];         // R
                        newData[targetIndex + 1] = data[sourceIndex + 1]; // G
                        newData[targetIndex + 2] = data[sourceIndex + 2]; // B
                        newData[targetIndex + 3] = data[sourceIndex + 3]; // A
                    } else {
                        const targetIndex = (y * canvas.width + x) * 4;
                        const fallbackIndex = (y * canvas.width + x) * 4;
                        newData[targetIndex] = data[fallbackIndex];
                        newData[targetIndex + 1] = data[fallbackIndex + 1];
                        newData[targetIndex + 2] = data[fallbackIndex + 2];
                        newData[targetIndex + 3] = data[fallbackIndex + 3];
                    }
                } else {
                    // Copy original pixel for areas outside the effect radius
                    const sourceIndex = (y * canvas.width + x) * 4;
                    newData[sourceIndex] = data[sourceIndex];
                    newData[sourceIndex + 1] = data[sourceIndex + 1];
                    newData[sourceIndex + 2] = data[sourceIndex + 2];
                    newData[sourceIndex + 3] = data[sourceIndex + 3];
                }
            }
        }

        const newImageData = new ImageData(newData, canvas.width, canvas.height);
        ctx.putImageData(newImageData, 0, 0);
    },

    // Apply zoom/scale effect
    applyZoomEffect(canvas, zoomAmount) {
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const newData = new Uint8ClampedArray(data.length);

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const scale = zoomAmount / 100; // Convert percentage to scale factor

        for (let y = 0; y < canvas.height; y++) {
            for (let x = 0; x < canvas.width; x++) {
                // Apply zoom from center
                const dx = x - centerX;
                const dy = y - centerY;

                const sourceX = Math.round(centerX + dx / scale);
                const sourceY = Math.round(centerY + dy / scale);

                if (sourceX >= 0 && sourceX < canvas.width && sourceY >= 0 && sourceY < canvas.height) {
                    const sourceIndex = (sourceY * canvas.width + sourceX) * 4;
                    const targetIndex = (y * canvas.width + x) * 4;

                    newData[targetIndex] = data[sourceIndex];         // R
                    newData[targetIndex + 1] = data[sourceIndex + 1]; // G
                    newData[targetIndex + 2] = data[sourceIndex + 2]; // B
                    newData[targetIndex + 3] = data[sourceIndex + 3]; // A
                } else {
                    // Fill with transparent or edge color for out-of-bounds areas
                    const targetIndex = (y * canvas.width + x) * 4;
                    newData[targetIndex] = 0;
                    newData[targetIndex + 1] = 0;
                    newData[targetIndex + 2] = 0;
                    newData[targetIndex + 3] = 0;
                }
            }
        }

        const newImageData = new ImageData(newData, canvas.width, canvas.height);
        ctx.putImageData(newImageData, 0, 0);
    },

    // Apply shake/vibration effect
    applyShakeEffect(canvas, amount) {
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const newData = new Uint8ClampedArray(data.length);

        const shakeIntensity = (amount / 100) * 5; // Max 5px shake

        for (let y = 0; y < canvas.height; y++) {
            for (let x = 0; x < canvas.width; x++) {
                // Create random shake offset for each pixel
                const shakeX = (Math.random() - 0.5) * shakeIntensity;
                const shakeY = (Math.random() - 0.5) * shakeIntensity;

                const sourceX = Math.round(x + shakeX);
                const sourceY = Math.round(y + shakeY);

                if (sourceX >= 0 && sourceX < canvas.width && sourceY >= 0 && sourceY < canvas.height) {
                    const sourceIndex = (sourceY * canvas.width + sourceX) * 4;
                    const targetIndex = (y * canvas.width + x) * 4;

                    newData[targetIndex] = data[sourceIndex];         // R
                    newData[targetIndex + 1] = data[sourceIndex + 1]; // G
                    newData[targetIndex + 2] = data[sourceIndex + 2]; // B
                    newData[targetIndex + 3] = data[sourceIndex + 3]; // A
                } else {
                    // Use original pixel if shake goes out of bounds
                    const targetIndex = (y * canvas.width + x) * 4;
                    newData[targetIndex] = data[targetIndex];
                    newData[targetIndex + 1] = data[targetIndex + 1];
                    newData[targetIndex + 2] = data[targetIndex + 2];
                    newData[targetIndex + 3] = data[targetIndex + 3];
                }
            }
        }

        const newImageData = new ImageData(newData, canvas.width, canvas.height);
        ctx.putImageData(newImageData, 0, 0);
    },

    // Apply lens distortion effect
    applyLensEffect(canvas, amount) {
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        const newData = new Uint8ClampedArray(data.length);

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const maxRadius = Math.min(centerX, centerY);
        const lensStrength = (amount / 100) * 0.5; // Lens distortion strength

        for (let y = 0; y < canvas.height; y++) {
            for (let x = 0; x < canvas.width; x++) {
                const dx = x - centerX;
                const dy = y - centerY;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < maxRadius) {
                    // Apply barrel/pincushion distortion
                    const normalizedDistance = distance / maxRadius;
                    const distortion = 1 + lensStrength * normalizedDistance * normalizedDistance;

                    const sourceX = Math.round(centerX + dx * distortion);
                    const sourceY = Math.round(centerY + dy * distortion);

                    if (sourceX >= 0 && sourceX < canvas.width && sourceY >= 0 && sourceY < canvas.height) {
                        const sourceIndex = (sourceY * canvas.width + sourceX) * 4;
                        const targetIndex = (y * canvas.width + x) * 4;

                        newData[targetIndex] = data[sourceIndex];         // R
                        newData[targetIndex + 1] = data[sourceIndex + 1]; // G
                        newData[targetIndex + 2] = data[sourceIndex + 2]; // B
                        newData[targetIndex + 3] = data[sourceIndex + 3]; // A
                    } else {
                        const targetIndex = (y * canvas.width + x) * 4;
                        newData[targetIndex] = data[targetIndex];
                        newData[targetIndex + 1] = data[targetIndex + 1];
                        newData[targetIndex + 2] = data[targetIndex + 2];
                        newData[targetIndex + 3] = data[targetIndex + 3];
                    }
                } else {
                    // Copy original pixel for areas outside the effect radius
                    const sourceIndex = (y * canvas.width + x) * 4;
                    newData[sourceIndex] = data[sourceIndex];
                    newData[sourceIndex + 1] = data[sourceIndex + 1];
                    newData[sourceIndex + 2] = data[sourceIndex + 2];
                    newData[sourceIndex + 3] = data[sourceIndex + 3];
                }
            }
        }

        const newImageData = new ImageData(newData, canvas.width, canvas.height);
        ctx.putImageData(newImageData, 0, 0);
    },

    // Calculate the image position and size
    calculateImageRect(image, width, height, padding) {
        // Ensure padding is a non-negative number
        padding = Math.max(0, Number(padding) || 0);

        const imageAspect = image.width / image.height;
        const containerWidth = width;
        const containerHeight = height;

        // Max dimensions with padding
        const maxWidth = containerWidth - (padding * 2);
        const maxHeight = containerHeight - (padding * 2);

        // Calculate size based on aspect ratio
        let newWidth, newHeight;

        if (imageAspect > maxWidth / maxHeight) {
            // Image is wider than container
            newWidth = maxWidth;
            newHeight = newWidth / imageAspect;
        } else {
            // Image is taller than container
            newHeight = maxHeight;
            newWidth = newHeight * imageAspect;
        }

        // Center position, accounting for padding
        const x = (containerWidth - newWidth) / 2;
        const y = (containerHeight - newHeight) / 2;

        return {
            x,
            y,
            width: newWidth,
            height: newHeight
        };
    },

    // Draw multiple images using layout
    drawMultipleImages(images, layoutId, cornerRadius, padding, shadowOpacity, shadowRadius, shadowOffsetX, shadowOffsetY, shadowColor, rotation, flipH, flipV, smartFillEnabled, panX, panY, selectedIndex) {
        // Get layout configuration
        const layout = Config.multiImageLayouts?.find(l => l.id === layoutId) || Config.multiImageLayouts?.[0];
        if (!layout) {
            console.error('Layout not found:', layoutId);
            return;
        }

        const { width: canvasWidth, height: canvasHeight } = this.canvas;
        const globalPadding = Math.max(0, Number(padding) || 0);

        // Calculate available drawing area after global padding
        const availableWidth = canvasWidth - (globalPadding * 2);
        const availableHeight = canvasHeight - (globalPadding * 2);
        const offsetX = globalPadding;
        const offsetY = globalPadding;

        // Draw each image in its position
        layout.positions.forEach((position, index) => {
            const image = images[index];
            if (!image) return; // Skip empty slots

            // Calculate position and size within the available area
            const imageX = offsetX + (position.x * availableWidth);
            const imageY = offsetY + (position.y * availableHeight);
            const imageWidth = position.width * availableWidth;
            const imageHeight = position.height * availableHeight;

            // Add some gap between images (2% of canvas size)
            const gap = Math.min(canvasWidth, canvasHeight) * 0.01;
            const adjustedX = imageX + (position.x > 0 ? gap / 2 : 0);
            const adjustedY = imageY + (position.y > 0 ? gap / 2 : 0);
            const adjustedWidth = imageWidth - (position.x > 0 || position.width < 1 ? gap : gap / 2);
            const adjustedHeight = imageHeight - (position.y > 0 || position.height < 1 ? gap : gap / 2);

            // Note: Removed green dashed selection highlight visual

            // Draw the image in this slot
            this.drawImageInRect(
                image,
                adjustedX,
                adjustedY,
                adjustedWidth,
                adjustedHeight,
                cornerRadius,
                shadowOpacity,
                shadowRadius,
                shadowOffsetX,
                shadowOffsetY,
                shadowColor,
                rotation,
                flipH,
                flipV,
                smartFillEnabled,
                panX,
                panY
            );
        });
    },

    // Draw image within specific rectangle
    drawImageInRect(image, x, y, width, height, cornerRadius, shadowOpacity, shadowRadius, shadowOffsetX, shadowOffsetY, shadowColor, rotation, flipH, flipV, smartFillEnabled, panX, panY) {
        // Ensure cornerRadius is a number
        cornerRadius = Number(cornerRadius) || 0;

        // Calculate the image aspect ratio
        const imageAspect = image.width / image.height;
        const rectAspect = width / height;

        // Calculate actual draw dimensions based on Smart Fill setting
        let drawWidth, drawHeight, drawX, drawY;
        let sourceX = 0, sourceY = 0, sourceWidth = image.width, sourceHeight = image.height;

        if (smartFillEnabled) {
            // Smart Fill: Image fills the entire rectangle (crop to fill)
            drawWidth = width;
            drawHeight = height;
            drawX = x;
            drawY = y;

            // Calculate source crop area with panning
            if (imageAspect > rectAspect) {
                // Image is wider than rect - crop horizontally, allow horizontal panning
                sourceHeight = image.height;
                sourceWidth = sourceHeight * rectAspect;
                const maxPanX = (image.width - sourceWidth) / 2;

                sourceX = (image.width - sourceWidth) / 2 + (panX / 100) * maxPanX;
                sourceY = (panY / 100) * 0; // No vertical panning when cropping horizontally

                // Clamp source position
                sourceX = Math.max(0, Math.min(sourceX, image.width - sourceWidth));
            } else {
                // Image is taller than rect - crop vertically, allow vertical panning
                sourceWidth = image.width;
                sourceHeight = sourceWidth / rectAspect;
                const maxPanY = (image.height - sourceHeight) / 2;

                sourceX = (panX / 100) * 0; // No horizontal panning when cropping vertically
                sourceY = (image.height - sourceHeight) / 2 + (panY / 100) * maxPanY;

                // Clamp source position
                sourceY = Math.max(0, Math.min(sourceY, image.height - sourceHeight));
            }
        } else {
            // Normal mode: Fit image within rect maintaining aspect ratio
            if (imageAspect > rectAspect) {
                // Image is wider than rect - fit to width
                drawWidth = width;
                drawHeight = width / imageAspect;
                drawX = x;
                drawY = y + (height - drawHeight) / 2;
            } else {
                // Image is taller than rect - fit to height
                drawHeight = height;
                drawWidth = height * imageAspect;
                drawX = x + (width - drawWidth) / 2;
                drawY = y;
            }
        }

        // Get the center point for transformations
        const centerX = drawX + drawWidth / 2;
        const centerY = drawY + drawHeight / 2;

        // Create rounded version of the image on an offscreen canvas
        const roundedCanvas = document.createElement('canvas');
        roundedCanvas.width = drawWidth;
        roundedCanvas.height = drawHeight;
        const roundedCtx = roundedCanvas.getContext('2d');

        // Create the rounded rectangle path
        if (cornerRadius > 0) {
            const maxRadius = Math.min(drawWidth, drawHeight) / 2;
            const effectiveRadius = Math.min(cornerRadius, maxRadius);

            roundedCtx.beginPath();
            roundedCtx.moveTo(effectiveRadius, 0);
            roundedCtx.lineTo(drawWidth - effectiveRadius, 0);
            roundedCtx.arc(drawWidth - effectiveRadius, effectiveRadius, effectiveRadius, -Math.PI / 2, 0, false);
            roundedCtx.lineTo(drawWidth, drawHeight - effectiveRadius);
            roundedCtx.arc(drawWidth - effectiveRadius, drawHeight - effectiveRadius, effectiveRadius, 0, Math.PI / 2, false);
            roundedCtx.lineTo(effectiveRadius, drawHeight);
            roundedCtx.arc(effectiveRadius, drawHeight - effectiveRadius, effectiveRadius, Math.PI / 2, Math.PI, false);
            roundedCtx.lineTo(0, effectiveRadius);
            roundedCtx.arc(effectiveRadius, effectiveRadius, effectiveRadius, Math.PI, 3 * Math.PI / 2, false);
            roundedCtx.closePath();
            roundedCtx.clip();
        }

        // Clear and draw the image
        roundedCtx.clearRect(0, 0, drawWidth, drawHeight);
        roundedCtx.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, drawWidth, drawHeight);

        // Create shadow if enabled
        if (shadowOpacity > 0) {
            const shadowCanvas = document.createElement('canvas');
            shadowCanvas.width = this.canvas.width;
            shadowCanvas.height = this.canvas.height;
            const shadowCtx = shadowCanvas.getContext('2d');

            // Apply transformations to shadow canvas
            shadowCtx.save();
            shadowCtx.translate(centerX, centerY);
            shadowCtx.rotate((rotation * Math.PI) / 180);
            if (flipH) shadowCtx.scale(-1, 1);
            if (flipV) shadowCtx.scale(1, -1);
            shadowCtx.translate(-centerX, -centerY);

            // Get shadow color with opacity
            let shadowColorWithOpacity;
            if (shadowColor) {
                if (shadowColor.startsWith('#')) {
                    const rgb = this.hexToRgb(shadowColor);
                    shadowColorWithOpacity = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${shadowOpacity})`;
                } else if (shadowColor.startsWith('rgba')) {
                    shadowColorWithOpacity = shadowColor.replace(/,([^,]*)$/, `,${shadowOpacity})`);
                } else if (shadowColor.startsWith('rgb')) {
                    shadowColorWithOpacity = shadowColor.replace(')', `, ${shadowOpacity})`);
                } else {
                    shadowColorWithOpacity = `rgba(0, 0, 0, ${shadowOpacity})`;
                }
            } else {
                shadowColorWithOpacity = `rgba(0, 0, 0, ${shadowOpacity})`;
            }

            // Apply shadow settings
            shadowCtx.shadowColor = shadowColorWithOpacity;
            shadowCtx.shadowBlur = shadowRadius;
            shadowCtx.shadowOffsetX = shadowOffsetX;
            shadowCtx.shadowOffsetY = shadowOffsetY;

            // Draw shadow
            shadowCtx.drawImage(roundedCanvas, drawX, drawY);
            shadowCtx.restore();

            // Draw the shadow canvas first
            this.ctx.drawImage(shadowCanvas, 0, 0);
        }

        // Save context for actual image transformations
        this.ctx.save();

        // Apply transformations
        this.ctx.translate(centerX, centerY);
        this.ctx.rotate((rotation * Math.PI) / 180);
        if (flipH) this.ctx.scale(-1, 1);
        if (flipV) this.ctx.scale(1, -1);
        this.ctx.translate(-centerX, -centerY);

        // Draw the actual image
        this.ctx.drawImage(roundedCanvas, drawX, drawY);

        // Restore context
        this.ctx.restore();
    },

    // Draw the image with transformations (legacy single image method)
    drawImage(image, cornerRadius, padding, shadowOpacity, shadowRadius, shadowOffsetX, shadowOffsetY, shadowColor, rotation, flipH, flipV) {
        const { width: canvasWidth, height: canvasHeight } = this.canvas;

        // Ensure cornerRadius is a number
        cornerRadius = Number(cornerRadius) || 0;

        // Calculate the image position and size
        const imageRect = this.calculateImageRect(
            image,
            canvasWidth,
            canvasHeight,
            padding
        );

        // Get the center point for transformations
        const centerX = imageRect.x + imageRect.width / 2;
        const centerY = imageRect.y + imageRect.height / 2;

        // First, create a rounded version of the image on an offscreen canvas
        const roundedCanvas = document.createElement('canvas');
        roundedCanvas.width = imageRect.width;
        roundedCanvas.height = imageRect.height;
        const roundedCtx = roundedCanvas.getContext('2d');

        // Create the rounded rectangle path on the offscreen canvas
        roundedCtx.beginPath();
        roundedCtx.moveTo(cornerRadius, 0);
        roundedCtx.lineTo(roundedCanvas.width - cornerRadius, 0);
        roundedCtx.arc(roundedCanvas.width - cornerRadius, cornerRadius, cornerRadius, -Math.PI / 2, 0, false);
        roundedCtx.lineTo(roundedCanvas.width, roundedCanvas.height - cornerRadius);
        roundedCtx.arc(roundedCanvas.width - cornerRadius, roundedCanvas.height - cornerRadius, cornerRadius, 0, Math.PI / 2, false);
        roundedCtx.lineTo(cornerRadius, roundedCanvas.height);
        roundedCtx.arc(cornerRadius, roundedCanvas.height - cornerRadius, cornerRadius, Math.PI / 2, Math.PI, false);
        roundedCtx.lineTo(0, cornerRadius);
        roundedCtx.arc(cornerRadius, cornerRadius, cornerRadius, Math.PI, 3 * Math.PI / 2, false);
        roundedCtx.closePath();

        // Fill with a transparent color to ensure proper clipping
        roundedCtx.fillStyle = 'rgba(0,0,0,0)';
        roundedCtx.fill();

        // Clip to the rounded shape
        roundedCtx.clip();

        // Clear the canvas to ensure transparency
        roundedCtx.clearRect(0, 0, roundedCanvas.width, roundedCanvas.height);

        // Draw the image inside the clipped area
        roundedCtx.drawImage(image, 0, 0, roundedCanvas.width, roundedCanvas.height);

        // Create a shadow canvas to properly handle alpha
        if (shadowOpacity > 0) {
            const shadowCanvas = document.createElement('canvas');
            shadowCanvas.width = this.canvas.width;
            shadowCanvas.height = this.canvas.height;
            const shadowCtx = shadowCanvas.getContext('2d');

            // Apply transformations to shadow canvas
            shadowCtx.save();
            shadowCtx.translate(centerX, centerY);
            shadowCtx.rotate((rotation * Math.PI) / 180);
            if (flipH) shadowCtx.scale(-1, 1);
            if (flipV) shadowCtx.scale(1, -1);
            shadowCtx.translate(-centerX, -centerY);

            // Get shadow color with opacity
            let shadowColorWithOpacity;
            if (shadowColor) {
                if (shadowColor.startsWith('#')) {
                    const rgb = this.hexToRgb(shadowColor);
                    shadowColorWithOpacity = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${shadowOpacity})`;
                } else if (shadowColor.startsWith('rgba')) {
                    shadowColorWithOpacity = shadowColor.replace(/,([^,]*)$/, `,${shadowOpacity})`);
                } else if (shadowColor.startsWith('rgb')) {
                    shadowColorWithOpacity = shadowColor.replace(')', `, ${shadowOpacity})`);
                } else {
                    shadowColorWithOpacity = `rgba(0, 0, 0, ${shadowOpacity})`;
                }
            } else {
                shadowColorWithOpacity = `rgba(0, 0, 0, ${shadowOpacity})`;
            }

            // Apply shadow settings to shadow canvas
            shadowCtx.shadowColor = shadowColorWithOpacity;
            shadowCtx.shadowBlur = shadowRadius;
            shadowCtx.shadowOffsetX = shadowOffsetX;
            shadowCtx.shadowOffsetY = shadowOffsetY;

            // Draw only the silhouette for the shadow to prevent dark rectangles
            shadowCtx.drawImage(roundedCanvas, imageRect.x, imageRect.y);
            shadowCtx.restore();

            // Draw the shadow canvas first
            this.ctx.drawImage(shadowCanvas, 0, 0);
        }

        // Save context for the actual image transformations
        this.ctx.save();

        // Apply transformations (rotation and flipping)
        this.ctx.translate(centerX, centerY);
        this.ctx.rotate((rotation * Math.PI) / 180);
        if (flipH) this.ctx.scale(-1, 1);
        if (flipV) this.ctx.scale(1, -1);
        this.ctx.translate(-centerX, -centerY);

        // Draw the actual rounded image without shadow
        this.ctx.drawImage(roundedCanvas, imageRect.x, imageRect.y);

        // Restore context
        this.ctx.restore();

        return imageRect;
    },

    // Draw watermark
    drawWatermark(watermarkData, opacity, scale, position) {
        if (!watermarkData) return;

        const { width: canvasWidth, height: canvasHeight } = this.canvas;

        // Check if it's a text watermark or image watermark
        if (watermarkData.type === 'text' && watermarkData.text) {
            this.drawTextWatermark(watermarkData, opacity, position, canvasWidth, canvasHeight);
        } else if (watermarkData.type === 'image' && watermarkData.image) {
            this.drawImageWatermark(watermarkData.image, opacity, scale, position, canvasWidth, canvasHeight);
        }
    },

    // Draw image watermark
    drawImageWatermark(watermarkImage, opacity, scale, position, canvasWidth, canvasHeight) {
        // Calculate watermark dimensions based on scale
        const baseWidth = canvasWidth * 0.3; // 30% of canvas width
        const watermarkWidth = baseWidth * scale;
        const aspectRatio = watermarkImage.width / watermarkImage.height;
        const watermarkHeight = watermarkWidth / aspectRatio;

        // Calculate position
        const positionCoords = Utils.calculateWatermarkPosition(
            position,
            watermarkWidth,
            watermarkHeight,
            canvasWidth,
            canvasHeight
        );

        // Save context for opacity
        this.ctx.save();

        // Set global alpha for watermark
        this.ctx.globalAlpha = opacity;

        // Draw the watermark
        this.ctx.drawImage(
            watermarkImage,
            positionCoords.x,
            positionCoords.y,
            watermarkWidth,
            watermarkHeight
        );

        // Restore context
        this.ctx.restore();
    },

    // Draw text watermark
    drawTextWatermark(watermarkData, opacity, position, canvasWidth, canvasHeight) {
        // Save context
        this.ctx.save();

        // Set up font style
        let fontStyle = '';
        if (watermarkData.bold) fontStyle += 'bold ';
        if (watermarkData.italic) fontStyle += 'italic ';

        this.ctx.font = `${fontStyle}${watermarkData.size}px ${watermarkData.font}`;

        // Set text color with opacity
        this.ctx.fillStyle = Utils.adjustColorOpacity(watermarkData.color, opacity);
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'top';

        // Apply text shadow if enabled
        if (watermarkData.shadow) {
            this.ctx.shadowColor = watermarkData.shadowColor;
            this.ctx.shadowBlur = watermarkData.shadowBlur;
            this.ctx.shadowOffsetX = 0;
            this.ctx.shadowOffsetY = 0;
        }

        // Measure text dimensions
        const textMetrics = this.ctx.measureText(watermarkData.text);
        const textWidth = textMetrics.width;
        const textHeight = watermarkData.size;

        // Calculate position coordinates
        const positionCoords = Utils.calculateWatermarkPosition(
            position,
            textWidth,
            textHeight,
            canvasWidth,
            canvasHeight
        );

        // Draw the text watermark
        this.ctx.fillText(watermarkData.text, positionCoords.x, positionCoords.y);

        // Restore context
        this.ctx.restore();
    },

    // Draw text overlay
    drawTextOverlay(overlay) {
        if (!overlay || !overlay.text || !overlay.visible) return;

        const { width, height } = this.canvas;

        // If zIndex is 0, skip drawing if we want it behind the image 
        // (the renderer will manage when to draw based on zIndex)
        if (overlay.zIndex === undefined && typeof overlay.isInFront !== 'undefined') {
            // For backward compatibility
            overlay.zIndex = overlay.isInFront ? 10 : 0;
        }

        // Handle both old format (x, y) and new format (position.x, position.y)
        let x, y;
        if (overlay.position && typeof overlay.position.x !== 'undefined') {
            // New format: normalized coordinates (0-1)
            x = width * overlay.position.x;
            y = height * overlay.position.y;
        } else if (typeof overlay.x !== 'undefined' && typeof overlay.y !== 'undefined') {
            // Old format: absolute coordinates - convert to normalized
            x = overlay.x;
            y = overlay.y;
        } else {
            // Fallback to center if no position data
            x = width * 0.5;
            y = height * 0.5;
        }

        // Setup text style
        this.ctx.save();

        // Determine font style modifiers
        let fontStyle = '';
        if (overlay.bold) fontStyle += 'bold ';
        if (overlay.italic) fontStyle += 'italic ';

        // Apply font and style
        this.ctx.font = `${fontStyle}${overlay.fontSize}px ${overlay.fontFamily || 'Arial, sans-serif'}`;

        // Set text color with opacity
        const opacity = typeof overlay.opacity === 'number' ? overlay.opacity : 1;
        this.ctx.fillStyle = Utils.adjustColorOpacity(overlay.color || '#FFFFFF', opacity);

        // Apply text alignment
        this.ctx.textAlign = overlay.align || 'center';
        this.ctx.textBaseline = 'middle';

        // Calculate maximum width for text wrapping (90% of canvas width)
        const maxWidth = width * 0.9;

        // Handle line breaks and text wrapping
        const textLines = this.getWrappedTextLines(overlay.text, maxWidth, overlay.fontSize);

        // Calculate text dimensions for background
        const textHeight = overlay.fontSize * 1.2;
        const totalHeight = textHeight * textLines.length;

        // Find the widest line to determine background width
        let maxLineWidth = 0;
        textLines.forEach(line => {
            const metrics = this.ctx.measureText(line);
            maxLineWidth = Math.max(maxLineWidth, metrics.width);
        });

        // Draw background if enabled and has opacity
        if (overlay.background && overlay.backgroundColor && overlay.backgroundOpacity > 0) {
            const padding = overlay.padding || 10;
            const bgX = x - (overlay.align === 'center' ? maxLineWidth / 2 : (overlay.align === 'right' ? maxLineWidth : 0)) - padding;
            const bgY = y - totalHeight / 2 - padding;
            const bgWidth = maxLineWidth + padding * 2;
            const bgHeight = totalHeight + padding * 2;

            // Get border radius from the overlay or use default
            const borderRadius = overlay.backgroundRadius || 4;

            // Get background opacity, defaulting to 1 if not specified
            const backgroundOpacity = overlay.backgroundOpacity !== undefined ? overlay.backgroundOpacity : 1;

            this.ctx.fillStyle = Utils.adjustColorOpacity(overlay.backgroundColor, backgroundOpacity);
            this.ctx.beginPath();
            this.ctx.roundRect(bgX, bgY, bgWidth, bgHeight, borderRadius);
            this.ctx.fill();

            // Reset fill style for text
            this.ctx.fillStyle = Utils.adjustColorOpacity(overlay.color || '#FFFFFF', opacity);
        }

        // Apply text shadow if enabled and has opacity
        if (overlay.shadow && overlay.shadowOpacity > 0) {
            const shadowOpacity = overlay.shadowOpacity || 1;
            const shadowColor = overlay.shadowColor || 'rgba(0, 0, 0, 0.5)';

            // Apply opacity to shadow color
            this.ctx.shadowColor = Utils.adjustColorOpacity(shadowColor, shadowOpacity);
            this.ctx.shadowBlur = overlay.shadowBlur || 3;
            this.ctx.shadowOffsetX = overlay.shadowOffsetX || 2;
            this.ctx.shadowOffsetY = overlay.shadowOffsetY || 2;
        }

        // Draw the text lines
        const lineHeight = textHeight;
        const startY = y - (totalHeight / 2) + (lineHeight / 2);

        textLines.forEach((line, index) => {
            const lineY = startY + (index * lineHeight);
            this.ctx.fillText(line, x, lineY);

            // Draw underline if enabled
            if (overlay.underline) {
                const lineWidth = this.ctx.measureText(line).width;
                const underlineY = lineY + (textHeight / 2) - (textHeight * 0.1);
                const underlineStartX = x - (overlay.align === 'center' ? lineWidth / 2 : (overlay.align === 'right' ? lineWidth : 0));

                this.ctx.beginPath();
                this.ctx.moveTo(underlineStartX, underlineY);
                this.ctx.lineTo(underlineStartX + lineWidth, underlineY);
                this.ctx.lineWidth = Math.max(1, overlay.fontSize / 15);
                this.ctx.strokeStyle = Utils.adjustColorOpacity(overlay.color || '#FFFFFF', opacity);
                this.ctx.stroke();
            }
        });

        this.ctx.restore();
    },

    // Split text into wrapped lines based on max width
    getWrappedTextLines(text, maxWidth, fontSize) {
        // Handle manual line breaks first
        const manualLines = text.split('\n');
        const wrappedLines = [];

        manualLines.forEach(manualLine => {
            // Empty lines should be preserved
            if (manualLine.trim() === '') {
                wrappedLines.push('');
                return;
            }

            // Split the line into words
            const words = manualLine.split(' ');
            let currentLine = words[0];

            for (let i = 1; i < words.length; i++) {
                const word = words[i];
                const testLine = currentLine + ' ' + word;
                const testWidth = this.ctx.measureText(testLine).width;

                if (testWidth <= maxWidth) {
                    currentLine = testLine;
                } else {
                    wrappedLines.push(currentLine);
                    currentLine = word;
                }
            }

            // Add the last line
            wrappedLines.push(currentLine);
        });

        return wrappedLines;
    },

    // Create a thumbnail from an image object
    createThumbnail(image, maxWidth = 100, maxHeight = 100, cornerRadius = 0) {
        try {
            // Validate the image parameter
            if (!image) {
                console.error('Error: No image provided to createThumbnail');
                return '';
            }

            // Check if the image is a valid drawable object
            if (!(image instanceof HTMLImageElement ||
                image instanceof HTMLCanvasElement ||
                image instanceof HTMLVideoElement ||
                image instanceof ImageBitmap ||
                image instanceof OffscreenCanvas ||
                image instanceof SVGImageElement)) {
                console.error('Error: Invalid image type provided to createThumbnail:', typeof image, image);
                return '';
            }

            // Check if image has valid dimensions
            const imgWidth = image.width || image.naturalWidth || 0;
            const imgHeight = image.height || image.naturalHeight || 0;

            if (imgWidth <= 0 || imgHeight <= 0) {
                console.error('Error: Image has invalid dimensions:', imgWidth, 'x', imgHeight);
                return '';
            }

            // Create thumbnail canvas
            const thumbnailCanvas = document.createElement('canvas');
            const thumbCtx = thumbnailCanvas.getContext('2d');

            // Calculate aspect ratios
            const imageAspect = imgWidth / imgHeight;
            const maxAspect = maxWidth / maxHeight;

            let thumbWidth, thumbHeight;

            if (imageAspect > maxAspect) {
                // Image is wider than max dimensions
                thumbWidth = maxWidth;
                thumbHeight = maxWidth / imageAspect;
            } else {
                // Image is taller than max dimensions
                thumbHeight = maxHeight;
                thumbWidth = maxHeight * imageAspect;
            }

            // Set thumbnail dimensions
            thumbnailCanvas.width = thumbWidth;
            thumbnailCanvas.height = thumbHeight;

            // Enable smooth scaling
            thumbCtx.imageSmoothingEnabled = true;
            thumbCtx.imageSmoothingQuality = 'high';

            // Apply corner radius if specified
            if (cornerRadius > 0) {
                // Create clipping path for rounded corners
                thumbCtx.beginPath();
                thumbCtx.roundRect(0, 0, thumbWidth, thumbHeight, cornerRadius);
                thumbCtx.clip();
            }

            // Clear the canvas before drawing
            thumbCtx.clearRect(0, 0, thumbWidth, thumbHeight);

            // Draw the image onto the thumbnail canvas
            thumbCtx.drawImage(image, 0, 0, thumbWidth, thumbHeight);

            // Generate a unique thumbnail URL
            return thumbnailCanvas.toDataURL('image/jpeg', 0.95);
        } catch (error) {
            console.error('Error generating thumbnail:', error);
            return '';
        }
    },

    // Export the current canvas as an image
    exportImage(format = 'png', quality = 0.9, width, height) {
        // If dimensions are specified, create a resized version
        if (width && height && (width !== this.canvas.width || height !== this.canvas.height)) {
            // Create temporary canvas for resizing
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = width;
            tempCanvas.height = height;
            const tempCtx = tempCanvas.getContext('2d');

            // Use better image smoothing
            tempCtx.imageSmoothingEnabled = true;
            tempCtx.imageSmoothingQuality = 'high';

            // Draw the original canvas at the new size
            // Preserve the aspect ratio by calculating the destination drawing dimensions
            const originalAspect = this.canvas.width / this.canvas.height;
            const newAspect = width / height;

            let destWidth, destHeight, destX, destY;

            if (Math.abs(originalAspect - newAspect) < 0.01) {
                // Aspects are close enough, just scale directly
                destWidth = width;
                destHeight = height;
                destX = 0;
                destY = 0;
            } else if (originalAspect > newAspect) {
                // Original is wider, fit to width
                destWidth = width;
                destHeight = width / originalAspect;
                destX = 0;
                destY = (height - destHeight) / 2;
            } else {
                // Original is taller, fit to height
                destHeight = height;
                destWidth = height * originalAspect;
                destX = (width - destWidth) / 2;
                destY = 0;
            }

            // Fill background first
            tempCtx.fillStyle = '#000000';
            tempCtx.fillRect(0, 0, width, height);

            // Draw the image respecting aspect ratio
            tempCtx.drawImage(
                this.canvas,
                0, 0, this.canvas.width, this.canvas.height,
                destX, destY, destWidth, destHeight
            );

            // Export from the temp canvas
            if (format.toLowerCase() === 'png') {
                return tempCanvas.toDataURL('image/png'); // PNG doesn't use quality parameter
            } else {
                return tempCanvas.toDataURL(this.getFormatMimeType(format), quality);
            }
        }

        // Otherwise, export the current canvas directly
        if (format.toLowerCase() === 'png') {
            return this.canvas.toDataURL('image/png'); // PNG doesn't use quality parameter
        } else {
            return this.canvas.toDataURL(this.getFormatMimeType(format), quality);
        }
    },

    // Get the MIME type for a format
    getFormatMimeType(format) {
        switch (format.toLowerCase()) {
            case 'jpeg':
            case 'jpg':
                return 'image/jpeg';
            case 'webp':
                return 'image/webp';
            case 'png':
            default:
                return 'image/png';
        }
    },

    // Create a thumbnail from the current canvas
    createCanvasThumbnail(maxWidth = 100, maxHeight = 100) {
        const thumbnailCanvas = document.createElement('canvas');
        const thumbCtx = thumbnailCanvas.getContext('2d');

        // Calculate thumbnail size
        const canvasAspect = this.canvas.width / this.canvas.height;
        const thumbAspect = maxWidth / maxHeight;

        let thumbWidth, thumbHeight;

        if (canvasAspect > thumbAspect) {
            // Canvas is wider than thumbnail
            thumbWidth = maxWidth;
            thumbHeight = thumbWidth / canvasAspect;
        } else {
            // Canvas is taller than thumbnail
            thumbHeight = maxHeight;
            thumbWidth = thumbHeight * canvasAspect;
        }

        // Set thumbnail dimensions
        thumbnailCanvas.width = thumbWidth;
        thumbnailCanvas.height = thumbHeight;

        // Draw the current canvas onto the thumbnail canvas
        thumbCtx.drawImage(this.canvas, 0, 0, thumbWidth, thumbHeight);

        return thumbnailCanvas.toDataURL('image/jpeg', 0.7);
    },

    // First update the renderPreview method to accept the shadowColor parameter
    renderPreview(
        image,
        cornerRadius,
        padding,
        shadowOpacity,
        shadowRadius,
        shadowOffsetX,
        shadowOffsetY,
        shadowColor,
        rotation,
        flipH,
        flipV
    ) {
        // Clear the canvas
        this.clear();

        // Set canvas size based on the image, padding, and shadow
        const {
            width,
            height,
            canvasWidth,
            canvasHeight,
            paddingVal,
            cornerRadiusVal,
            shadowOpacityVal,
            shadowRadiusVal,
            shadowOffsetXVal,
            shadowOffsetYVal
        } = this.calculateDimensions(
            image.width,
            image.height,
            cornerRadius,
            padding,
            shadowOpacity,
            shadowRadius,
            shadowOffsetX,
            shadowOffsetY
        );

        // Now draw the image with the new shadowColor parameter
        this.drawImage(
            image,
            cornerRadiusVal,
            paddingVal,
            shadowOpacityVal,
            shadowRadiusVal,
            shadowOffsetXVal,
            shadowOffsetYVal,
            shadowColor,
            rotation,
            flipH,
            flipV
        );
    },

    // Helper function to convert hex colors to RGB
    hexToRgb(hex) {
        // Remove the hash if it exists
        hex = hex.replace(/^#/, '');

        // Parse hex values
        let r, g, b;
        if (hex.length === 3) {
            // Short notation: #RGB
            r = parseInt(hex.charAt(0) + hex.charAt(0), 16);
            g = parseInt(hex.charAt(1) + hex.charAt(1), 16);
            b = parseInt(hex.charAt(2) + hex.charAt(2), 16);
        } else {
            // Standard notation: #RRGGBB
            r = parseInt(hex.substring(0, 2), 16);
            g = parseInt(hex.substring(2, 4), 16);
            b = parseInt(hex.substring(4, 6), 16);
        }

        return { r, g, b };
    },

    // Clear the canvas (alias for clearCanvas for backward compatibility)
    clear() {
        this.clearCanvas();
    },

    // Draw text layers
    drawTextLayers(textLayers) {
        textLayers.forEach(layer => {
            if (!layer.visible) return;

            // Save context state
            this.ctx.save();

            // Set font
            this.ctx.font = layer.getFontString();
            this.ctx.fillStyle = layer.color;
            this.ctx.textAlign = layer.align;
            this.ctx.globalAlpha = layer.opacity;

            // Calculate position
            const x = layer.position.x * this.canvas.width;
            const y = layer.position.y * this.canvas.height;

            // Draw background if enabled
            if (layer.backgroundColor) {
                this.ctx.save();
                this.ctx.fillStyle = layer.backgroundColor;

                // Measure text
                const metrics = this.ctx.measureText(layer.text);
                const padding = layer.padding || 0;

                // Calculate background dimensions
                const bgWidth = metrics.width + (padding * 2);
                const bgHeight = (metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent) + (padding * 2);

                // Draw background rectangle
                this.ctx.fillRect(
                    x - (bgWidth / 2),
                    y - metrics.actualBoundingBoxAscent - padding,
                    bgWidth,
                    bgHeight
                );
                this.ctx.restore();
            }

            // Draw shadow if enabled
            if (layer.shadow) {
                this.ctx.shadowColor = layer.shadowColor;
                this.ctx.shadowBlur = layer.shadowBlur;
                this.ctx.shadowOffsetX = layer.shadowOffsetX;
                this.ctx.shadowOffsetY = layer.shadowOffsetY;
            }

            // Draw text
            this.ctx.fillText(layer.text, x, y);

            // Restore context state
            this.ctx.restore();
        });
    },

    // Draw noise overlay
    drawNoiseOverlay(noiseOverlay) {
        const { width, height } = this.canvas;

        try {
            // Generate noise overlay canvas with the custom scale
            const noisePattern = {
                ...noiseOverlay,
                scale: noiseOverlay.scale || 1.0
            };
            const overlayCanvas = NoiseGenerator.createNoiseOverlay(width, height, noisePattern);

            // Apply invert if needed
            if (noiseOverlay.invert) {
                this.invertCanvas(overlayCanvas);
            }

            // Set blend mode for overlay effect
            this.ctx.globalCompositeOperation = noiseOverlay.blendMode || 'multiply';
            this.ctx.globalAlpha = noiseOverlay.opacity || 0.7;

            // Draw the noise overlay
            this.ctx.drawImage(overlayCanvas, 0, 0, width, height);

            // Reset blend mode and alpha
            this.ctx.globalCompositeOperation = 'source-over';
            this.ctx.globalAlpha = 1.0;

        } catch (error) {
            console.error('Failed to draw noise overlay:', error);
        }
    },

    // Invert a canvas
    invertCanvas(canvas) {
        try {
            const ctx = canvas.getContext('2d');
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            // Invert each pixel
            for (let i = 0; i < data.length; i += 4) {
                data[i] = 255 - data[i];     // Red
                data[i + 1] = 255 - data[i + 1]; // Green
                data[i + 2] = 255 - data[i + 2]; // Blue
                // Keep alpha unchanged
            }

            ctx.putImageData(imageData, 0, 0);
        } catch (error) {
            console.error('Failed to invert canvas:', error);
        }
    },

    // Draw text selection bounds
    drawTextSelectionBounds(layer) {
        if (!layer || !layer.text || !layer.visible) return;

        const { width, height } = this.canvas;

        // Save context state
        this.ctx.save();

        // Setup text style to measure text (same as drawTextOverlay)
        let fontStyle = '';
        if (layer.bold) fontStyle += 'bold ';
        if (layer.italic) fontStyle += 'italic ';
        this.ctx.font = `${fontStyle}${layer.fontSize}px ${layer.fontFamily || 'Arial, sans-serif'}`;

        // Calculate position in canvas coordinates
        const x = width * layer.position.x;
        const y = height * layer.position.y;

        // Calculate maximum width for text wrapping (90% of canvas width)
        const maxWidth = width * 0.9;

        // Get wrapped text lines
        const textLines = this.getWrappedTextLines(layer.text, maxWidth, layer.fontSize);

        // Calculate text dimensions
        const textHeight = layer.fontSize * 1.2;
        const totalHeight = textHeight * textLines.length;

        // Find the widest line
        let maxLineWidth = 0;
        textLines.forEach(line => {
            const metrics = this.ctx.measureText(line);
            maxLineWidth = Math.max(maxLineWidth, metrics.width);
        });

        // Add background padding if background is enabled
        const padding = (layer.background && layer.backgroundOpacity > 0) ?
            (layer.padding || 10) : 8; // Add minimum padding for selection bounds

        // Calculate bounds based on text alignment
        let left, right, top, bottom;

        if (layer.align === 'left') {
            left = x - padding;
            right = x + maxLineWidth + padding;
        } else if (layer.align === 'right') {
            left = x - maxLineWidth - padding;
            right = x + padding;
        } else { // center (default)
            left = x - maxLineWidth / 2 - padding;
            right = x + maxLineWidth / 2 + padding;
        }

        top = y - totalHeight / 2 - padding;
        bottom = y + totalHeight / 2 + padding;

        // Note: Removed green dashed text selection bounds visual

        // Restore context state
        this.ctx.restore();
    },

    // Draw Marketing CTA Button
    drawMarketingCTA(text, color, textColor) {
        if (!text) return;

        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;

        ctx.save();

        // Button Dimensions - Scale based on canvas size
        const fontSize = Math.max(24, Math.min(width, height) * 0.04);
        ctx.font = `bold ${fontSize}px "Inter", sans-serif`;
        const textMetrics = ctx.measureText(text);
        const textWidth = textMetrics.width;
        const buttonPaddingX = fontSize * 1.5;
        const buttonPaddingY = fontSize * 0.8;
        const buttonWidth = textWidth + buttonPaddingX * 2;
        const buttonHeight = fontSize + buttonPaddingY * 2;

        // Position: Bottom center, 15% from bottom
        const x = (width - buttonWidth) / 2;
        const y = height * 0.85 - (buttonHeight / 2);

        // Draw Shadow
        ctx.shadowColor = 'rgba(0,0,0,0.3)';
        ctx.shadowBlur = 30;
        ctx.shadowOffsetY = 15;

        // Draw Button Background
        ctx.fillStyle = color;
        this.ctxRoundRect(ctx, x, y, buttonWidth, buttonHeight, buttonHeight / 2);
        ctx.fill();

        // Reset Shadow for text
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;

        // Draw Text
        ctx.fillStyle = textColor;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        // Add slight offset for optical centering
        ctx.fillText(text, width / 2, y + buttonHeight / 2 + (fontSize * 0.05));

        ctx.restore();
    },

    // Helper for rounded rectangle
    ctxRoundRect(ctx, x, y, w, h, r) {
        if (w < 2 * r) r = w / 2;
        if (h < 2 * r) r = h / 2;
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.arcTo(x + w, y, x + w, y + h, r);
        ctx.arcTo(x + w, y + h, x, y + h, r);
        ctx.arcTo(x, y + h, x, y, r);
        ctx.arcTo(x, y, x + w, y, r);
        ctx.closePath();
    }
}; 