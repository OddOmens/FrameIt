/**
 * Utility functions for the Screenshot Mockup Tool
 */

window.Utils = {
    // Load image from URL and return a Promise
    loadImage(url) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.onload = () => resolve(img);
            img.onerror = () => {
                console.warn(`Failed to load image: ${url}. Using placeholder instead.`);
                // Create a placeholder with a gradient as fallback
                const placeholderCanvas = document.createElement('canvas');
                placeholderCanvas.width = 400;
                placeholderCanvas.height = 400;
                const ctx = placeholderCanvas.getContext('2d');

                // Draw gradient background
                const gradient = ctx.createLinearGradient(0, 0, 400, 400);
                gradient.addColorStop(0, '#333333');
                gradient.addColorStop(1, '#111111');
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, 400, 400);

                // Add error text
                ctx.font = '14px Arial';
                ctx.fillStyle = '#ffffff';
                ctx.textAlign = 'center';
                ctx.fillText('Image could not be loaded', 200, 190);
                ctx.fillText(url.split('/').pop(), 200, 210);

                // Convert canvas to image
                const placeholderImg = new Image();
                placeholderImg.src = placeholderCanvas.toDataURL();
                resolve(placeholderImg);
            };
            img.src = url;
        });
    },

    // Load image from File and return a Promise
    loadImageFromFile(file) {
        console.log('🖼️ Utils.loadImageFromFile called for:', file.name);
        return new Promise((resolve, reject) => {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                console.error('❌ Invalid file type:', file.type);
                reject(new Error('File must be an image'));
                return;
            }

            // Validate file size (max 10MB)
            if (file.size > 10 * 1024 * 1024) {
                console.error('❌ File too large:', file.size);
                reject(new Error('Image size must be less than 10MB'));
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                console.log('📖 FileReader loaded successfully');
                const img = new Image();
                img.onload = () => {
                    console.log('✅ Image object loaded:', img.width, 'x', img.height);
                    // Validate image dimensions
                    if (img.width < 50 || img.height < 50) {
                        reject(new Error('Image dimensions must be at least 50x50 pixels'));
                        return;
                    }
                    if (img.width > 8000 || img.height > 8000) {
                        reject(new Error('Image dimensions must not exceed 8000x8000 pixels'));
                        return;
                    }
                    resolve(img);
                };
                img.onerror = (err) => {
                    console.error('❌ Image object failed to load:', err);
                    reject(new Error('Failed to load image. Please ensure it is a valid image file.'));
                };
                img.src = e.target.result;
            };
            reader.onerror = (err) => {
                console.error('❌ FileReader failed:', err);
                reject(new Error('Failed to read file. Please try again.'));
            };
            reader.readAsDataURL(file);
        });
    },

    // Create a canvas with specified dimensions
    createCanvas(width, height) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        return canvas;
    },

    // Return calculated image rectangle based on container size and settings
    calculateImageRect(imageWidth, imageHeight, containerWidth, containerHeight, settings) {
        const imageAspect = imageWidth / imageHeight;
        const containerAspect = containerWidth / containerHeight;

        const padding = settings.padding || 0;

        // Max dimensions with padding
        const containerScale = 0.95;
        const scaledContainerWidth = containerWidth * containerScale;
        const scaledContainerHeight = containerHeight * containerScale;
        const maxWidth = scaledContainerWidth - (padding * 2);
        const maxHeight = scaledContainerHeight - (padding * 2);

        // Calculate size based on aspect ratio
        let width, height;

        if (imageAspect > maxWidth / maxHeight) {
            // Image is wider than container
            width = maxWidth;
            height = width / imageAspect;
        } else {
            // Image is taller than container
            height = maxHeight;
            width = height * imageAspect;
        }

        // Center position
        const x = (containerWidth - width) / 2;
        const y = (containerHeight - height) / 2;

        return {
            x,
            y,
            width,
            height
        };
    },

    // Apply corner radius clipping to a canvas context
    applyCornerRadius(ctx, x, y, width, height, radius) {
        // Ensure radius is a positive number
        radius = Math.max(0, Number(radius) || 0);

        if (radius <= 0) {
            ctx.rect(x, y, width, height);
            return;
        }

        // Make sure the radius isn't too large for the rectangle
        const maxRadius = Math.min(width / 2, height / 2);
        radius = Math.min(radius, maxRadius);

        // Draw rounded rectangle path - draw with full control to ensure proper rounding
        // Start at top left, moving clockwise
        ctx.moveTo(x + radius, y); // Top left corner, start after the arc

        // Top side and top right corner
        ctx.lineTo(x + width - radius, y); // Top side
        ctx.arc(x + width - radius, y + radius, radius, -Math.PI / 2, 0, false); // Top right corner

        // Right side and bottom right corner
        ctx.lineTo(x + width, y + height - radius); // Right side
        ctx.arc(x + width - radius, y + height - radius, radius, 0, Math.PI / 2, false); // Bottom right corner

        // Bottom side and bottom left corner
        ctx.lineTo(x + radius, y + height); // Bottom side
        ctx.arc(x + radius, y + height - radius, radius, Math.PI / 2, Math.PI, false); // Bottom left corner

        // Left side and top left corner
        ctx.lineTo(x, y + radius); // Left side
        ctx.arc(x + radius, y + radius, radius, Math.PI, 3 * Math.PI / 2, false); // Top left corner

        // Path is automatically closed
    },

    // Apply a linear gradient to a canvas context
    applyGradient(ctx, x, y, width, height, colors, direction = 'to bottom') {
        let gradient;

        // Handle radial gradients
        if (direction.includes('radial-gradient')) {
            // Parse radial gradient syntax: "radial-gradient(circle at 20% 50%"
            let centerX = width / 2;  // Default center
            let centerY = height / 2;
            let radius = Math.max(width, height) / 2;

            // Extract position if specified
            const atMatch = direction.match(/at\s+(\d+)%\s+(\d+)%/);
            if (atMatch) {
                centerX = (parseInt(atMatch[1]) / 100) * width;
                centerY = (parseInt(atMatch[2]) / 100) * height;
            }

            // Determine if it's ellipse or circle
            if (direction.includes('ellipse')) {
                radius = Math.max(width, height) / 1.5; // Ellipse uses smaller radius
            }

            gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
        }
        // Handle conic gradients - create a more accurate simulation
        else if (direction.includes('conic-gradient')) {
            // Since Canvas doesn't support conic gradients natively, we'll create a custom pattern
            return this.applyConicGradient(ctx, x, y, width, height, colors, direction);
        }
        // Handle linear gradients
        else {
            switch (direction) {
                case 'to right':
                    gradient = ctx.createLinearGradient(x, y, x + width, y);
                    break;
                case 'to bottom right':
                    gradient = ctx.createLinearGradient(x, y, x + width, y + height);
                    break;
                case 'to bottom left':
                    gradient = ctx.createLinearGradient(x + width, y, x, y + height);
                    break;
                case 'to top':
                    gradient = ctx.createLinearGradient(x, y + height, x, y);
                    break;
                case 'to top right':
                    gradient = ctx.createLinearGradient(x, y + height, x + width, y);
                    break;
                case 'to top left':
                    gradient = ctx.createLinearGradient(x + width, y + height, x, y);
                    break;
                case 'to left':
                    gradient = ctx.createLinearGradient(x + width, y, x, y);
                    break;
                case 'to bottom':
                default:
                    gradient = ctx.createLinearGradient(x, y, x, y + height);
                    break;
            }
        }

        // Add color stops
        for (let i = 0; i < colors.length; i++) {
            gradient.addColorStop(i / (colors.length - 1), colors[i]);
        }

        return gradient;
    },

    // Apply a conic gradient simulation to a canvas context
    applyConicGradient(ctx, x, y, width, height, colors, direction) {
        // Parse starting angle from direction (e.g., "from 90deg")
        let startAngle = 0;
        const angleMatch = direction.match(/from\s+(\d+)deg/);
        if (angleMatch) {
            startAngle = parseInt(angleMatch[1]);
        }

        // Convert to radians and adjust for Canvas coordinate system
        startAngle = (startAngle - 90) * Math.PI / 180; // -90 to make 0deg point up

        // Create a temporary canvas for the conic gradient
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = width;
        tempCanvas.height = height;
        const tempCtx = tempCanvas.getContext('2d');

        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.sqrt((centerX * centerX) + (centerY * centerY)); // Distance to farthest corner

        // Create the conic gradient by drawing colored segments
        const numSegments = 360; // Higher number = smoother gradient
        const segmentAngle = (2 * Math.PI) / numSegments;

        for (let i = 0; i < numSegments; i++) {
            const angle = startAngle + (i * segmentAngle);
            const nextAngle = startAngle + ((i + 1) * segmentAngle);

            // Calculate which color to use based on position around the circle
            const colorPosition = i / numSegments;
            const colorIndex = colorPosition * (colors.length - 1);
            const lowerIndex = Math.floor(colorIndex);
            const upperIndex = Math.min(lowerIndex + 1, colors.length - 1);
            const mix = colorIndex - lowerIndex;

            // Normalize colors to RGB values
            const lowerColor = this.normalizeColorToRgb(colors[lowerIndex]);
            const upperColor = this.normalizeColorToRgb(colors[upperIndex]);

            // Interpolate between colors
            const r = Math.round(lowerColor.r + (upperColor.r - lowerColor.r) * mix);
            const g = Math.round(lowerColor.g + (upperColor.g - lowerColor.g) * mix);
            const b = Math.round(lowerColor.b + (upperColor.b - lowerColor.b) * mix);

            // Draw the segment
            tempCtx.beginPath();
            tempCtx.moveTo(centerX, centerY);
            tempCtx.arc(centerX, centerY, radius, angle, nextAngle);
            tempCtx.closePath();
            tempCtx.fillStyle = `rgb(${r}, ${g}, ${b})`;
            tempCtx.fill();
        }

        // Create a pattern from the temporary canvas
        const pattern = ctx.createPattern(tempCanvas, 'no-repeat');
        return pattern;
    },

    // Normalize any color format to RGB values
    normalizeColorToRgb(color) {
        // If it's already a hex color, use the existing function
        if (color.startsWith('#')) {
            return this.hexToRgb(color);
        }

        // If it's an rgb() color, parse it
        if (color.startsWith('rgb')) {
            const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
            if (match) {
                return {
                    r: parseInt(match[1]),
                    g: parseInt(match[2]),
                    b: parseInt(match[3])
                };
            }
        }

        // If it's an rgba() color, parse it (ignore alpha for now)
        if (color.startsWith('rgba')) {
            const match = color.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*[\d\.]+\)/);
            if (match) {
                return {
                    r: parseInt(match[1]),
                    g: parseInt(match[2]),
                    b: parseInt(match[3])
                };
            }
        }

        // For any unknown format, return black
        return { r: 0, g: 0, b: 0 };
    },

    // Apply a shadow to a canvas context
    applyShadow(ctx, shadowOptions) {
        if (shadowOptions.opacity <= 0) return;

        const opacity = Math.max(0, Math.min(1, shadowOptions.opacity));
        const color = `rgba(0, 0, 0, ${opacity})`;

        ctx.shadowColor = color;
        ctx.shadowBlur = shadowOptions.radius || 0;
        ctx.shadowOffsetX = shadowOptions.offsetX || 0;
        ctx.shadowOffsetY = shadowOptions.offsetY || 0;
    },

    // Apply rotation to a canvas context
    applyRotation(ctx, centerX, centerY, degrees) {
        if (degrees === 0) return;

        const radians = (degrees * Math.PI) / 180;
        ctx.translate(centerX, centerY);
        ctx.rotate(radians);
        ctx.translate(-centerX, -centerY);
    },

    // Apply flipping (horizontal and/or vertical) to a canvas context
    applyFlipping(ctx, centerX, centerY, flipH, flipV) {
        if (!flipH && !flipV) return;

        ctx.translate(centerX, centerY);
        ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
        ctx.translate(-centerX, -centerY);
    },

    // Apply a blur filter to an image
    applyBlur(img, radius) {
        if (radius === 0) return img;

        const canvas = this.createCanvas(img.width, img.height);
        const ctx = canvas.getContext('2d');

        // Draw the image
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Apply CSS filter for blur (not supported in all browsers)
        if (typeof ctx.filter !== 'undefined') {
            ctx.filter = `blur(${radius}px)`;
            ctx.drawImage(canvas, 0, 0);
            ctx.filter = 'none';
        }

        // Create a new image from the blurred canvas
        const blurredImg = new Image();
        blurredImg.src = canvas.toDataURL();

        return blurredImg;
    },

    // Download canvas as an image
    downloadCanvasImage(canvas, filename, format = 'png', quality = 0.9) {
        return new Promise((resolve, reject) => {
            try {
                // Determine the correct mime type
                let mimeType;
                switch (format.toLowerCase()) {
                    case 'jpeg':
                    case 'jpg':
                        mimeType = 'image/jpeg';
                        break;
                    case 'webp':
                        mimeType = 'image/webp';
                        break;
                    case 'png':
                    default:
                        mimeType = 'image/png';
                        break;
                }

                // Convert to data URL
                const dataUrl = canvas.toDataURL(mimeType, quality);

                // Create a temporary link and trigger download
                const link = document.createElement('a');
                link.href = dataUrl;
                link.download = filename;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                resolve(dataUrl);
            } catch (error) {
                reject(error);
            }
        });
    },

    // Format date for display
    formatDate(date) {
        return new Date(date).toLocaleString();
    },

    // Save data to localStorage
    saveToStorage(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Failed to save to localStorage:', error);
            return false;
        }
    },

    // Load data from localStorage
    loadFromStorage(key, defaultValue = null) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (error) {
            console.error('Failed to load from localStorage:', error);
            return defaultValue;
        }
    },

    // Check if a string is a valid URL
    isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    },

    // Generate a thumbnail from an image
    generateThumbnail(img, maxWidth = 100, maxHeight = 100) {
        const canvas = this.createCanvas(maxWidth, maxHeight);
        const ctx = canvas.getContext('2d');

        // Calculate thumbnail dimensions
        const imgAspect = img.width / img.height;
        const thumbnailAspect = maxWidth / maxHeight;

        let drawWidth, drawHeight, offsetX = 0, offsetY = 0;

        if (imgAspect > thumbnailAspect) {
            // Image is wider than thumbnail
            drawWidth = maxWidth;
            drawHeight = maxWidth / imgAspect;
            offsetY = (maxHeight - drawHeight) / 2;
        } else {
            // Image is taller than thumbnail
            drawHeight = maxHeight;
            drawWidth = maxHeight * imgAspect;
            offsetX = (maxWidth - drawWidth) / 2;
        }

        // Draw image in center of thumbnail
        ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);

        return canvas.toDataURL('image/jpeg', 0.7);
    },

    // Calculate position of watermark
    calculateWatermarkPosition(position, watermarkWidth, watermarkHeight, containerWidth, containerHeight, padding = 20) {
        switch (position) {
            case 'top-left':
                return {
                    x: padding,
                    y: padding
                };
            case 'top-right':
                return {
                    x: containerWidth - watermarkWidth - padding,
                    y: padding
                };
            case 'bottom-left':
                return {
                    x: padding,
                    y: containerHeight - watermarkHeight - padding
                };
            case 'bottom-right':
                return {
                    x: containerWidth - watermarkWidth - padding,
                    y: containerHeight - watermarkHeight - padding
                };
            case 'center':
                return {
                    x: (containerWidth - watermarkWidth) / 2,
                    y: (containerHeight - watermarkHeight) / 2
                };
            default:
                return {
                    x: containerWidth - watermarkWidth - padding,
                    y: containerHeight - watermarkHeight - padding
                };
        }
    },

    // Check if the browser supports the WebP format
    supportsWebP() {
        const canvas = document.createElement('canvas');
        if (!canvas.getContext || !canvas.getContext('2d')) {
            return false;
        }

        return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    },

    // Create a placeholder (empty) image
    createPlaceholderImage(width, height, color = '#FFFFFF') {
        const canvas = this.createCanvas(width, height);
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = color;
        ctx.fillRect(0, 0, width, height);

        const img = new Image();
        img.src = canvas.toDataURL();

        return img;
    },

    // Calculate relative position within an element
    getRelativePosition(clientX, clientY, element) {
        const rect = element.getBoundingClientRect();
        return {
            x: (clientX - rect.left) / rect.width,
            y: (clientY - rect.top) / rect.height
        };
    },

    // Convert a data URL to a Blob
    dataURLtoBlob(dataURL) {
        const arr = dataURL.split(',');
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);

        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }

        return new Blob([u8arr], { type: mime });
    },

    // Copy canvas image to clipboard (may not work in all browsers)
    copyCanvasToClipboard(canvas) {
        return new Promise((resolve, reject) => {
            try {
                canvas.toBlob(blob => {
                    if (!blob) {
                        reject(new Error('Could not create blob from canvas'));
                        return;
                    }

                    const item = new ClipboardItem({ 'image/png': blob });
                    navigator.clipboard.write([item])
                        .then(() => resolve())
                        .catch(err => reject(err));
                });
            } catch (error) {
                reject(error);
            }
        });
    },

    // Check if a point is inside a rectangle
    isPointInRect(x, y, rect) {
        return (
            x >= rect.x &&
            x <= rect.x + rect.width &&
            y >= rect.y &&
            y <= rect.y + rect.height
        );
    },

    // Adjust color opacity
    adjustColorOpacity(color, opacity) {
        if (!color) {
            return 'rgba(255, 255, 255, ' + opacity + ')';
        }

        if (color.startsWith('rgba')) {
            // Already has alpha, replace it
            return color.replace(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*[\d\.]+\)/, `rgba($1, $2, $3, ${opacity})`);
        } else if (color.startsWith('rgb')) {
            // Convert rgb to rgba
            return color.replace(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/, `rgba($1, $2, $3, ${opacity})`);
        } else if (color.startsWith('#')) {
            // Convert hex to rgba
            const rgb = this.hexToRgb(color);
            return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
        }

        // If unknown format, return color as is
        return color;
    },

    // Convert hex color to RGB
    hexToRgb(hex) {
        // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
        const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);

        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 0, g: 0, b: 0 };
    },

    // Get gradient by ID
    getGradientById(gradientId) {
        const allGradients = Config.getAllGradients();
        const gradientPreset = allGradients.find(g => g.id === gradientId);
        if (gradientPreset) {
            return {
                colors: gradientPreset.colors,
                direction: gradientPreset.direction
            };
        }
        return null;
    },

    // Get background image by ID
    getBackgroundImageById(imageId) {
        for (const category of Config.backgroundCategories) {
            const image = category.images.find(img => img.id === imageId);
            if (image && image.loadedImage) {
                return image.loadedImage;
            }
        }
        return null;
    },
}; 