/**
 * Main Application for the Screenshot Mockup Tool
 */

window.App = {
    // Application state
    state: {
        selectedImage: null,
        images: [], // Array of image objects for multi-image support
        selectedImageIndex: 0, // Currently selected image for manipulation
        currentLayout: 'single', // Current multi-image layout
        backgroundColor: '#FFFFFF',
        backgroundGradientId: null,
        backgroundImageId: null,
        backgroundImage: null,
        backgroundBlurRadius: 0,
        backgroundTwirlAmount: 0,
        backgroundSaturation: 100,
        backgroundHueRotation: 0,
        backgroundContrast: 100,
        backgroundBrightness: 100,
        backgroundWaveAmount: 0,
        backgroundRippleAmount: 0,
        backgroundZoomAmount: 100,
        backgroundShakeAmount: 0,
        backgroundLensAmount: 0,
        noiseOverlayId: null,
        noiseOverlayIntensity: 1.0,
        noiseOpacity: Config.defaultNoiseOpacity,
        noiseBlendMode: Config.defaultNoiseBlendMode,
        noiseScale: Config.defaultNoiseScale,
        noiseInvert: Config.defaultNoiseInvert,
        cornerRadius: Config.defaultCornerRadius,
        padding: Config.defaultPadding,
        shadowOpacity: Config.defaultShadowOpacity,
        shadowRadius: Config.defaultShadowRadius,
        shadowOffsetX: Config.defaultShadowOffsetX,
        shadowOffsetY: Config.defaultShadowOffsetY,
        shadowColor: Config.defaultShadowColor,
        rotation: Config.defaultRotation,
        isFlippedHorizontally: false,
        isFlippedVertically: false,
        smartFillEnabled: false,
        panX: 0,
        panY: 0,
        watermarkImage: null,
        watermarkOpacity: 0.5,
        watermarkScale: 1.0,
        watermarkPosition: 'bottom-right',
        resolution: { id: 'portrait', width: 1080, height: 1350 },
        exportSettings: {
            format: 'png',
            quality: 0.9,
            dimensionOption: 'original',
            customWidth: null,
            customHeight: null,
            maintainAspectRatio: true
        },
        textLayers: [],
        selectedTextLayerId: null,
        canvases: [],
        selectedCanvasId: null,
        currentCanvasId: 'canvas_default',
        history: [],
        undoManager: new Models.UndoManager(),
        canvasWidth: 1080,
        canvasHeight: 1350,
        watermarkText: 'Made with FrameIt.Social',
        watermarkFontSize: 32,
        watermarkColor: '#000000',
        marketingCtaText: 'Download Now',
        marketingCtaColor: '#3B82F6',
        marketingCtaTextColor: '#FFFFFF',
        marketingShowCta: false
    },

    // Multi-image layout management
    setLayout(layoutId) {
        console.log('🎯 Setting layout:', layoutId);
        this.saveStateForUndo();

        const layout = Config.multiImageLayouts.find(l => l.id === layoutId);
        if (!layout) {
            console.error('Layout not found:', layoutId);
            return;
        }

        this.state.currentLayout = layoutId;

        // Trim or pad images array to match layout requirements
        if (this.state.images.length > layout.maxImages) {
            // Too many images, keep only the first ones
            this.state.images = this.state.images.slice(0, layout.maxImages);
        } else if (this.state.images.length < layout.maxImages) {
            // Not enough images, add empty slots
            while (this.state.images.length < layout.maxImages) {
                this.state.images.push(null);
            }
        }

        // Update the selected image for backward compatibility
        this.state.selectedImage = this.state.images[0];

        // Re-render
        this.renderPreview();

        // Update UI
        UI.updateLayoutSelection(layoutId);
        UI.updateImageSlots(this.state.images, this.state.selectedImageIndex);

        // Collapsible section recalculation removed as we moved to tabs

        UI.showNotification(`Layout changed to ${layout.name}`, 'success', 2000);
    },

    // Add image to specific slot
    addImageToSlot(image, slotIndex) {
        console.log('🖼️ Adding image to slot:', slotIndex);

        if (slotIndex < 0 || slotIndex >= this.state.images.length) {
            console.error('Invalid slot index:', slotIndex);
            return;
        }

        this.saveStateForUndo();
        this.state.images[slotIndex] = image;

        // Update selected image for backward compatibility
        this.state.selectedImage = this.state.images[0];
        this.state.selectedImageIndex = slotIndex;

        this.renderPreview();
        UI.updateImageSlots(this.state.images, this.state.selectedImageIndex);
    },

    // Remove image from slot
    removeImageFromSlot(slotIndex) {
        console.log('🗑️ Removing image from slot:', slotIndex);

        if (slotIndex < 0 || slotIndex >= this.state.images.length) {
            console.error('Invalid slot index:', slotIndex);
            return;
        }

        this.saveStateForUndo();
        this.state.images[slotIndex] = null;

        // Update selected image for backward compatibility
        if (slotIndex === this.state.selectedImageIndex) {
            // Find the first non-null image
            const firstImageIndex = this.state.images.findIndex(img => img !== null);
            if (firstImageIndex !== -1) {
                this.state.selectedImage = this.state.images[firstImageIndex];
                this.state.selectedImageIndex = firstImageIndex;
            } else {
                this.state.selectedImage = null;
                this.state.selectedImageIndex = 0;
            }
        }

        this.renderPreview();
        UI.updateImageSlots(this.state.images, this.state.selectedImageIndex);
    },

    // Select image slot for editing
    selectImageSlot(slotIndex) {
        console.log('👆 Selecting image slot:', slotIndex);

        if (slotIndex < 0 || slotIndex >= this.state.images.length) {
            console.error('Invalid slot index:', slotIndex);
            return;
        }

        this.state.selectedImageIndex = slotIndex;
        this.state.selectedImage = this.state.images[slotIndex];

        UI.updateImageSlots(this.state.images, this.state.selectedImageIndex);

        // Show which image is selected
        if (this.state.selectedImage) {
            UI.showNotification(`Selected image ${slotIndex + 1}`, 'info', 1500);
        }
    },

    // Replace image in specific slot
    replaceImageInSlot(image, slotIndex) {
        console.log('🔄 Replacing image in slot:', slotIndex);
        this.saveStateForUndo();

        const layout = this.getCurrentLayout();
        if (slotIndex < 0 || slotIndex >= layout.maxImages) {
            console.error('Invalid slot index:', slotIndex);
            return;
        }

        // Replace image in the specified slot
        this.state.images[slotIndex] = image;

        // If this is the first image, also update selectedImage for compatibility
        if (slotIndex === 0) {
            this.state.selectedImage = image;
        }

        // Keep the slot selected
        this.state.selectedImageIndex = slotIndex;

        // Update UI and render
        UI.updateImageSlots(this.state.images, this.state.selectedImageIndex);
        this.renderPreview();
        this.saveSettings();

        console.log('✅ Image replaced in slot successfully');
    },

    // Move image between slots
    moveImageSlot(fromIndex, toIndex) {
        console.log('🔄 Moving image from slot', fromIndex, 'to slot', toIndex);
        this.saveStateForUndo();

        const layout = this.getCurrentLayout();
        if (fromIndex < 0 || fromIndex >= layout.maxImages || toIndex < 0 || toIndex >= layout.maxImages) {
            console.error('Invalid slot indices:', fromIndex, toIndex);
            return;
        }

        // Swap images
        const tempImage = this.state.images[fromIndex];
        this.state.images[fromIndex] = this.state.images[toIndex];
        this.state.images[toIndex] = tempImage;

        // Update selectedImage if first slot is involved
        if (fromIndex === 0 || toIndex === 0) {
            this.state.selectedImage = this.state.images[0];
        }

        // Update selected index if needed
        if (this.state.selectedImageIndex === fromIndex) {
            this.state.selectedImageIndex = toIndex;
        } else if (this.state.selectedImageIndex === toIndex) {
            this.state.selectedImageIndex = fromIndex;
        }

        // Update UI and render
        UI.updateImageSlots(this.state.images, this.state.selectedImageIndex);
        this.renderPreview();
        this.saveSettings();

        console.log('✅ Image moved successfully');
    },

    // Duplicate image to another slot
    duplicateImageToSlot(fromIndex, toIndex) {
        console.log('📋 Duplicating image from slot', fromIndex, 'to slot', toIndex);
        this.saveStateForUndo();

        const layout = this.getCurrentLayout();
        if (fromIndex < 0 || fromIndex >= layout.maxImages || toIndex < 0 || toIndex >= layout.maxImages) {
            console.error('Invalid slot indices:', fromIndex, toIndex);
            return;
        }

        const sourceImage = this.state.images[fromIndex];
        if (!sourceImage) {
            console.error('No image in source slot:', fromIndex);
            return;
        }

        // Copy image to target slot
        this.state.images[toIndex] = sourceImage;

        // Update selectedImage if first slot is involved
        if (toIndex === 0) {
            this.state.selectedImage = sourceImage;
        }

        // Select the target slot
        this.state.selectedImageIndex = toIndex;

        // Update UI and render
        UI.updateImageSlots(this.state.images, this.state.selectedImageIndex);
        this.renderPreview();
        this.saveSettings();

        console.log('✅ Image duplicated successfully');
    },

    // Get current layout configuration
    getCurrentLayout() {
        return Config.multiImageLayouts.find(l => l.id === this.state.currentLayout) || Config.multiImageLayouts[0];
    },

    // Initialize multi-image system
    initializeMultiImageSystem() {
        // Set up initial layout (single image by default)
        const defaultLayout = Config.multiImageLayouts[0]; // 'single'
        this.state.currentLayout = defaultLayout.id;

        // Initialize images array with empty slots
        this.state.images = new Array(defaultLayout.maxImages).fill(null);

        // If there's a selected image, put it in the first slot
        if (this.state.selectedImage) {
            this.state.images[0] = this.state.selectedImage;
        }

        // Update UI
        UI.updateLayoutSelection(this.state.currentLayout);
        UI.updateImageSlots(this.state.images, this.state.selectedImageIndex);

        // Collapsible section recalculation removed as we moved to tabs

        console.log('✅ Multi-image system initialized');
    },

    // Initialize the application
    async init() {
        console.log('Initializing FrameIt App...');

        // Initialize UI components first
        UI.init();

        // Initialize Marketing
        if (window.Marketing) {
            Marketing.init();
        }

        // Initialize canvas renderer
        CanvasRenderer.init(document.getElementById('preview-canvas'));

        // Load persistent data first
        this.loadFromLocalStorage();

        // Setup templates and resolutions
        UI.renderTemplates();
        UI.setupResolutionOptions();
        UI.renderLayoutOptions();

        // Enable export from start (can create designs without images)
        document.getElementById('export-btn').disabled = false;


        // Show upload prompt if no canvases exist, otherwise hide it
        const dropZone = document.getElementById('image-drop-zone');
        if (dropZone) {
            if (this.state.canvases.length === 0 && !this.state.selectedImage) {
                dropZone.classList.remove('hidden');
                dropZone.style.display = '';
            } else {
                dropZone.style.display = 'none';
            }
        }

        // Initialize multi-image system
        this.initializeMultiImageSystem();

        // Initialize with background and render initial preview
        this.renderPreview();

        // Update gallery display
        UI.renderGallery(this.state.canvases, this.state.selectedCanvasId);

        // Update text layers display
        if (this.state.textLayers && this.state.textLayers.length > 0) {
            UI.renderTextLayers(this.state.textLayers, this.state.selectedTextLayerId);
        }

        // Save initial state
        this.saveToLocalStorage();

        console.log('FrameIt App initialized successfully');

        // Initialize zoom controls after UI is ready
        UI.initZoomControls();

        // Update UI with initial state
        UI.updateButtonStates();

        // Show What's New modal for first-time visitors or after updates
        this.checkAndShowWhatsNew();

        // Force enable export buttons to ensure they're always clickable
        const exportBtn = document.getElementById('export-btn');
        const exportAllBtn = document.getElementById('export-all-btn');
        if (exportBtn) {
            exportBtn.disabled = false;
            exportBtn.style.pointerEvents = 'auto';
            console.log('✅ Export button force-enabled');
        }
        if (exportAllBtn) {
            exportAllBtn.disabled = false;
            exportAllBtn.style.pointerEvents = 'auto';
            console.log('✅ Export All button force-enabled');
        }
    },

    // Save current state for undo
    saveStateForUndo() {
        // Create a simplified state object to save
        const stateToSave = {
            cornerRadius: this.state.cornerRadius,
            padding: this.state.padding,
            shadowOpacity: this.state.shadowOpacity,
            shadowRadius: this.state.shadowRadius,
            shadowOffsetX: this.state.shadowOffsetX,
            shadowOffsetY: this.state.shadowOffsetY,
            shadowColor: this.state.shadowColor,
            rotation: this.state.rotation,
            isFlippedHorizontally: this.state.isFlippedHorizontally,
            isFlippedVertically: this.state.isFlippedVertically,
            backgroundColor: this.state.backgroundColor,
            backgroundGradientId: this.state.backgroundGradientId,
            backgroundImageId: this.state.backgroundImageId,
            backgroundBlurRadius: this.state.backgroundBlurRadius,
            backgroundTwirlAmount: this.state.backgroundTwirlAmount,
            backgroundSaturation: this.state.backgroundSaturation,
            backgroundHueRotation: this.state.backgroundHueRotation,
            backgroundContrast: this.state.backgroundContrast,
            backgroundBrightness: this.state.backgroundBrightness,
            backgroundWaveAmount: this.state.backgroundWaveAmount,
            backgroundRippleAmount: this.state.backgroundRippleAmount,
            backgroundZoomAmount: this.state.backgroundZoomAmount,
            backgroundShakeAmount: this.state.backgroundShakeAmount,
            backgroundLensAmount: this.state.backgroundLensAmount,
            noiseOverlayId: this.state.noiseOverlayId,
            noiseOverlayIntensity: this.state.noiseOverlayIntensity,
            noiseOpacity: this.state.noiseOpacity,
            noiseBlendMode: this.state.noiseBlendMode,
            noiseScale: this.state.noiseScale,
            noiseInvert: this.state.noiseInvert,
            watermarkText: this.state.watermarkText,
            watermarkFontSize: this.state.watermarkFontSize,
            watermarkColor: this.state.watermarkColor,
            watermarkOpacity: this.state.watermarkOpacity,
            watermarkPosition: this.state.watermarkPosition,
            smartFillEnabled: this.state.smartFillEnabled,
            panX: this.state.panX,
            panY: this.state.panY,
            marketingCtaText: this.state.marketingCtaText,
            marketingCtaColor: this.state.marketingCtaColor,
            marketingCtaTextColor: this.state.marketingCtaTextColor,
            marketingShowCta: this.state.marketingShowCta
        };

        this.state.undoManager.saveState(stateToSave);
        UI.updateButtonStates();
    },

    // Perform undo
    undo() {
        const previousState = this.state.undoManager.undo();
        if (previousState) {
            // Apply the previous state
            this.applyState(previousState);

            // Update UI buttons
            UI.updateButtonStates();

            // Render preview with new state
            this.renderPreview();

            // Show visual feedback
            UI.showNotification('Undo applied', 'success', 1500);
        } else {
            UI.showNotification('Nothing to undo', 'info', 1500);
        }
    },

    // Perform redo
    redo() {
        const nextState = this.state.undoManager.redo();
        if (nextState) {
            // Apply the redone state
            this.applyState(nextState);

            // Update UI buttons
            UI.updateButtonStates();

            // Render preview with new state
            this.renderPreview();

            // Show visual feedback
            UI.showNotification('Redo applied', 'success', 1500);
        } else {
            UI.showNotification('Nothing to redo', 'info', 1500);
        }
    },

    // Apply a saved state
    applyState(state) {
        Object.keys(state).forEach(key => {
            this.state[key] = state[key];
        });

        // Update sliders to match state
        document.getElementById('corner-radius-slider').value = this.state.cornerRadius;
        document.getElementById('padding-slider').value = this.state.padding;
        document.getElementById('shadow-opacity-slider').value = this.state.shadowOpacity;
        document.getElementById('shadow-radius-slider').value = this.state.shadowRadius;
        document.getElementById('shadow-offset-y-slider').value = this.state.shadowOffsetY;
        document.getElementById('shadow-color-input').value = this.state.shadowColor;
        document.getElementById('rotation-slider').value = this.state.rotation;
        document.getElementById('bg-blur-slider').value = this.state.backgroundBlurRadius;

        // Update background selection
        this.loadBackgroundById();
        UI.updateBackgroundSelection(
            this.state.backgroundColor,
            this.state.backgroundGradientId,
            this.state.backgroundImageId
        );
    },

    // Load background patterns
    loadBackgroundImages() {
        // Render background UI (colors and gradients)
        UI.renderBackgroundImages();

        // No longer need to generate patterns as backgrounds
        // Noise will be applied as an overlay effect
    },

    // Load a specific background by ID
    loadBackgroundById() {
        // Only handle actual background images if any exist
        if (!this.state.backgroundImageId) {
            this.state.backgroundImage = null;
            return;
        }

        // For now, no background images are configured
        // This can be extended later for actual image backgrounds
        this.state.backgroundImage = null;
        this.state.backgroundImageId = null;
        this.renderPreview();
    },

    // Load settings from localStorage
    loadSettings() {
        const savedSettings = Utils.loadFromStorage(Config.storageKeys.settings);
        if (savedSettings) {
            // Apply saved settings
            const validKeys = [
                'cornerRadius',
                'padding',
                'shadowOpacity',
                'shadowRadius',
                'shadowOffsetX',
                'shadowOffsetY',
                'shadowColor',
                'backgroundColor',
                'backgroundGradientId',
                'backgroundImageId',
                'backgroundBlurRadius',
                'backgroundTwirlAmount',
                'backgroundSaturation',
                'backgroundHueRotation',
                'backgroundContrast',
                'backgroundBrightness',
                'backgroundWaveAmount',
                'backgroundRippleAmount',
                'backgroundZoomAmount',
                'backgroundShakeAmount',
                'backgroundLensAmount',
                'noiseOverlayId',
                'noiseOverlayIntensity',
                'noiseOpacity',
                'noiseBlendMode',
                'noiseScale',
                'noiseInvert',
                'resolution',
                'watermarkOpacity',
                'watermarkScale',
                'watermarkPosition',
                'marketingCtaText',
                'marketingCtaColor',
                'marketingCtaTextColor',
                'marketingShowCta'
            ];

            validKeys.forEach(key => {
                if (savedSettings[key] !== undefined) {
                    this.state[key] = savedSettings[key];
                }
            });

            // Update UI to match loaded settings
            this.applyState(this.state);

            // Load background if needed
            if (this.state.backgroundImageId) {
                this.loadBackgroundById();
            }

            // Update noise overlay UI
            if (this.state.noiseOverlayId) {
                document.getElementById('noise-overlay-select').value = this.state.noiseOverlayId;
                document.getElementById('noise-options').style.display = 'block';
                document.getElementById('noise-intensity-slider').value = this.state.noiseOverlayIntensity;
                document.getElementById('noise-intensity-value').textContent = `${Math.round(this.state.noiseOverlayIntensity * 100)}%`;
                document.getElementById('noise-opacity-slider').value = this.state.noiseOpacity;
                document.getElementById('noise-opacity-value').textContent = `${Math.round(this.state.noiseOpacity * 100)}%`;
                document.getElementById('noise-blend-mode').value = this.state.noiseBlendMode;
                document.getElementById('noise-scale-slider').value = this.state.noiseScale;
                document.getElementById('noise-scale-value').textContent = `${Math.round(this.state.noiseScale * 100)}%`;
                document.getElementById('noise-invert-toggle').checked = this.state.noiseInvert;
            } else {
                document.getElementById('noise-overlay-select').value = 'none';
                document.getElementById('noise-options').style.display = 'none';
            }

            // Update resolution selection
            if (this.state.resolution) {
                this.updateCanvasSize();
                UI.updateResolutionSelection(this.state.resolution.width);
            }
        }
    },

    // Save settings to localStorage
    saveSettings() {
        const settingsToSave = {
            cornerRadius: this.state.cornerRadius,
            padding: this.state.padding,
            shadowOpacity: this.state.shadowOpacity,
            shadowRadius: this.state.shadowRadius,
            shadowOffsetX: this.state.shadowOffsetX,
            shadowOffsetY: this.state.shadowOffsetY,
            shadowColor: this.state.shadowColor,
            backgroundColor: this.state.backgroundColor,
            backgroundGradientId: this.state.backgroundGradientId,
            backgroundImageId: this.state.backgroundImageId,
            backgroundBlurRadius: this.state.backgroundBlurRadius,
            backgroundTwirlAmount: this.state.backgroundTwirlAmount,
            backgroundSaturation: this.state.backgroundSaturation,
            backgroundHueRotation: this.state.backgroundHueRotation,
            backgroundContrast: this.state.backgroundContrast,
            backgroundBrightness: this.state.backgroundBrightness,
            backgroundWaveAmount: this.state.backgroundWaveAmount,
            backgroundRippleAmount: this.state.backgroundRippleAmount,
            backgroundZoomAmount: this.state.backgroundZoomAmount,
            backgroundShakeAmount: this.state.backgroundShakeAmount,
            backgroundLensAmount: this.state.backgroundLensAmount,
            noiseOverlayId: this.state.noiseOverlayId,
            noiseOverlayIntensity: this.state.noiseOverlayIntensity,
            noiseOpacity: this.state.noiseOpacity,
            noiseBlendMode: this.state.noiseBlendMode,
            noiseScale: this.state.noiseScale,
            noiseInvert: this.state.noiseInvert,
            resolution: this.state.resolution,
            watermarkOpacity: this.state.watermarkOpacity,
            watermarkScale: this.state.watermarkScale,
            watermarkPosition: this.state.watermarkPosition,
            watermarkText: this.state.watermarkText,
            watermarkFontSize: this.state.watermarkFontSize,
            watermarkColor: this.state.watermarkColor,
            smartFillEnabled: this.state.smartFillEnabled,
            panX: this.state.panX,
            panY: this.state.panY,
            marketingCtaText: this.state.marketingCtaText,
            marketingCtaColor: this.state.marketingCtaColor,
            marketingCtaTextColor: this.state.marketingCtaTextColor,
            marketingShowCta: this.state.marketingShowCta
        };

        Utils.saveToStorage(Config.storageKeys.settings, settingsToSave);
    },

    // Update the canvas size based on selected resolution
    updateCanvasSize() {
        const { width, height } = this.state.resolution;
        CanvasRenderer.resizeCanvas(width, height);
    },

    // Add the current canvas state to the gallery
    addCurrentCanvasToGallery() {
        if (!this.state.selectedImage) return;

        // Check if current canvas is already in gallery
        const existingIndex = this.state.canvases.findIndex(c => c.id === this.state.currentCanvasId);

        const canvasData = {
            id: this.state.currentCanvasId || Date.now().toString(),
            image: this.state.selectedImage,
            images: [...this.state.images],
            settings: this.getCurrentSettings(),
            textLayers: JSON.parse(JSON.stringify(this.state.textLayers)),
            currentLayout: this.state.currentLayout,
            selectedImageIndex: this.state.selectedImageIndex,
            thumbnail: document.getElementById('preview-canvas').toDataURL('image/jpeg', 0.5)
        };

        if (existingIndex >= 0) {
            this.state.canvases[existingIndex] = canvasData;
        } else {
            this.state.canvases.push(canvasData);
        }

        this.saveToLocalStorage();
    },

    // Add a new canvas with an image
    addCanvas(image, options = {}) {
        // Save current first
        this.addCurrentCanvasToGallery();

        // Create new canvas state
        const newCanvasId = Date.now().toString();
        this.state.currentCanvasId = newCanvasId;
        this.state.selectedCanvasId = newCanvasId;
        this.state.selectedImage = image;
        this.state.images = [image];
        this.state.selectedImageIndex = 0;
        this.state.currentLayout = 'single';
        this.state.textLayers = [];
        this.state.selectedTextLayerId = null;

        // Inherit current settings (do not reset)
        // We only apply overrides if provided

        if (options.backgroundColor) this.state.backgroundColor = options.backgroundColor;
        if (options.backgroundGradientId) this.state.backgroundGradientId = options.backgroundGradientId;
        if (options.noiseOpacity) this.state.noiseOpacity = options.noiseOpacity;

        // Render
        this.renderPreview();
        UI.renderGallery(this.state.canvases, this.state.currentCanvasId);
        UI.updateImageSlots(this.state.images, 0);

        // Hide drop zone
        const dropZone = document.getElementById('image-drop-zone');
        if (dropZone) dropZone.style.display = 'none';

        console.log('✅ New canvas added:', newCanvasId);
    },

    // Handle file selection
    handleFileSelect(files) {
        console.log('📂 handleFileSelect called with', files ? files.length : 0, 'files');
        if (!files || files.length === 0) return;

        // Show loading state
        UI.showLoading('Processing image...');

        const promises = Array.from(files).map(file => {
            console.log('Processing file:', file.name, file.type, file.size);
            return Utils.loadImageFromFile(file);
        });

        Promise.all(promises)
            .then(async images => {
                console.log('✅ All images loaded successfully:', images.length);

                // Determine if this is adding to an existing canvas (has current canvas ID or any gallery entries)
                const hasExistingCanvas = this.state.currentCanvasId || this.state.canvases.length > 0;

                // If we have a single image
                if (images.length === 1) {
                    const image = images[0];

                    // Always replace the current image on the active canvas
                    // The user can use "New Canvas" button if they want a fresh one
                    this.saveStateForUndo();
                    this.state.selectedImage = image;
                    this.state.images[0] = image;
                    this.state.selectedImageIndex = 0;

                    // Reset layout to single if it was empty
                    if (!this.state.currentLayout) {
                        this.state.currentLayout = 'single';
                    }

                    this.renderPreview();
                    UI.updateImageSlots(this.state.images, this.state.selectedImageIndex);
                    UI.showNotification('Image updated', 'success');
                    UI.updateAddImageButtonText();

                    // Hide drop zone
                    const dropZone = document.getElementById('image-drop-zone');
                    if (dropZone) {
                        dropZone.style.display = 'none';
                    }
                }
                // If we have multiple images
                else if (images.length > 1) {
                    // Replace current with first image
                    const firstImage = images[0];
                    this.saveStateForUndo();
                    this.state.selectedImage = firstImage;
                    this.state.images[0] = firstImage;
                    this.state.selectedImageIndex = 0;

                    this.renderPreview();
                    UI.updateImageSlots(this.state.images, 0);

                    // Add remaining images as new canvases
                    for (let i = 1; i < images.length; i++) {
                        this.addCanvas(images[i]);
                    }

                    UI.showNotification(`${images.length} images imported`, 'success');
                }

                // Update gallery display
                if (this.state.canvases.length > 0) {
                    window.UI.renderGallery(this.state.canvases, this.state.currentCanvasId);
                }

                UI.hideLoading();

                // Reset file input
                const fileInput = document.getElementById('file-input');
                if (fileInput) fileInput.value = '';
            })
            .catch(error => {
                console.error('❌ Error loading images:', error);
                UI.hideLoading();
                UI.showError('Failed to load one or more images: ' + error.message);

                const fileInput = document.getElementById('file-input');
                if (fileInput) fileInput.value = '';
            });
    },

    // Select a canvas from the gallery
    selectCanvasFromGallery(id) {
        // Save current canvas state first
        this.addCurrentCanvasToGallery();

        // Find canvas in the gallery
        const canvas = this.state.canvases.find(c => c.id === id);
        if (!canvas) return;

        this.saveStateForUndo();

        // Update current canvas ID
        this.state.currentCanvasId = id;
        this.state.selectedCanvasId = id;

        // Clear text editor and selection completely before switching
        this.state.selectedTextLayerId = null;
        UI.hideTextEditor();

        // Load canvas data - deep copy to prevent reference issues
        this.state.selectedImage = canvas.image;
        this.state.images = canvas.images ? [...canvas.images] : (canvas.image ? [canvas.image] : []);
        this.state.currentLayout = canvas.currentLayout || 'single';
        this.state.selectedImageIndex = canvas.selectedImageIndex || 0;
        this.state.textLayers = canvas.textLayers ? JSON.parse(JSON.stringify(canvas.textLayers)) : [];

        // Apply canvas settings
        if (canvas.settings) {
            this.applySettings(canvas.settings);
        }

        // Update UI
        UI.renderTextLayers(this.state.textLayers, this.state.selectedTextLayerId);
        UI.renderGallery(this.state.canvases, this.state.selectedCanvasId);

        // Re-render canvas
        this.renderPreview();

        // Save settings and to localStorage
        this.saveSettings();
        this.saveToLocalStorage();

        // Update Add Image button text based on whether this canvas has an image
        if (window.UI && window.UI.updateAddImageButtonText) {
            window.UI.updateAddImageButtonText();
        }

        console.log('Canvas selected:', id);
    },

    // Get current settings for saving
    getCurrentSettings() {
        return {
            cornerRadius: this.state.cornerRadius,
            padding: this.state.padding,
            shadowOpacity: this.state.shadowOpacity,
            shadowRadius: this.state.shadowRadius,
            shadowOffsetX: this.state.shadowOffsetX,
            shadowOffsetY: this.state.shadowOffsetY,
            shadowColor: this.state.shadowColor,
            backgroundColor: this.state.backgroundColor,
            backgroundGradientId: this.state.backgroundGradientId,
            backgroundImageId: this.state.backgroundImageId,
            backgroundBlurRadius: this.state.backgroundBlurRadius,
            backgroundTwirlAmount: this.state.backgroundTwirlAmount,
            backgroundSaturation: this.state.backgroundSaturation,
            backgroundHueRotation: this.state.backgroundHueRotation,
            backgroundContrast: this.state.backgroundContrast,
            backgroundBrightness: this.state.backgroundBrightness,
            backgroundWaveAmount: this.state.backgroundWaveAmount,
            backgroundRippleAmount: this.state.backgroundRippleAmount,
            backgroundZoomAmount: this.state.backgroundZoomAmount,
            backgroundShakeAmount: this.state.backgroundShakeAmount,
            backgroundLensAmount: this.state.backgroundLensAmount,
            noiseOverlayId: this.state.noiseOverlayId,
            noiseOverlayIntensity: this.state.noiseOverlayIntensity,
            noiseOpacity: this.state.noiseOpacity,
            noiseBlendMode: this.state.noiseBlendMode,
            noiseScale: this.state.noiseScale,
            noiseInvert: this.state.noiseInvert,
            rotation: this.state.rotation,
            isFlippedHorizontally: this.state.isFlippedHorizontally,
            isFlippedVertically: this.state.isFlippedVertically,
            resolution: this.state.resolution,
            watermarkImage: this.state.watermarkImage,
            watermarkFilename: this.state.watermarkFilename,
            watermarkOpacity: this.state.watermarkOpacity,
            watermarkScale: this.state.watermarkScale,
            watermarkPosition: this.state.watermarkPosition,
            watermarkText: this.state.watermarkText,
            watermarkFontSize: this.state.watermarkFontSize,
            watermarkColor: this.state.watermarkColor,
            // Multi-image layout data
            currentLayout: this.state.currentLayout,
            images: this.state.images,
            selectedImageIndex: this.state.selectedImageIndex,
            smartFillEnabled: this.state.smartFillEnabled,
            panX: this.state.panX,
            panY: this.state.panY
        };
    },

    // Apply settings from an image entry
    applySettings(settings) {
        this.state.cornerRadius = settings.cornerRadius;
        this.state.padding = settings.padding;
        this.state.shadowOpacity = settings.shadowOpacity;
        this.state.shadowRadius = settings.shadowRadius;
        this.state.shadowOffsetX = settings.shadowOffsetX;
        this.state.shadowOffsetY = settings.shadowOffsetY;
        this.state.shadowColor = settings.shadowColor;

        // Handle both naming conventions for background gradient
        this.state.backgroundGradientId = settings.backgroundGradientId || settings.background;

        this.state.backgroundColor = settings.backgroundColor;
        this.state.backgroundImageId = settings.backgroundImageId;
        this.state.backgroundBlurRadius = settings.backgroundBlurRadius || 0;
        this.state.backgroundTwirlAmount = settings.backgroundTwirlAmount || 0;
        this.state.backgroundSaturation = settings.backgroundSaturation || 100;
        this.state.backgroundHueRotation = settings.backgroundHueRotation || 0;
        this.state.backgroundContrast = settings.backgroundContrast || 100;
        this.state.backgroundBrightness = settings.backgroundBrightness || 100;
        this.state.backgroundWaveAmount = settings.backgroundWaveAmount || 0;
        this.state.backgroundRippleAmount = settings.backgroundRippleAmount || 0;
        this.state.backgroundZoomAmount = settings.backgroundZoomAmount || 100;
        this.state.backgroundShakeAmount = settings.backgroundShakeAmount || 0;
        this.state.backgroundLensAmount = settings.backgroundLensAmount || 0;
        this.state.noiseOverlayId = settings.noiseOverlayId || null;
        this.state.noiseOverlayIntensity = settings.noiseOverlayIntensity || 1.0;
        this.state.noiseOpacity = settings.noiseOpacity || Config.defaultNoiseOpacity;
        this.state.noiseBlendMode = settings.noiseBlendMode || Config.defaultNoiseBlendMode;
        this.state.noiseScale = settings.noiseScale || Config.defaultNoiseScale;
        this.state.noiseInvert = settings.noiseInvert || Config.defaultNoiseInvert;
        this.state.rotation = settings.rotation || 0;
        this.state.isFlippedHorizontally = settings.isFlippedHorizontally || false;
        this.state.isFlippedVertically = settings.isFlippedVertically || false;
        this.state.smartFillEnabled = settings.smartFillEnabled || false;
        this.state.panX = settings.panX || 0;
        this.state.panY = settings.panY || 0;

        // Apply resolution if saved in settings
        if (settings.resolution) {
            this.state.resolution = settings.resolution;
            this.state.canvasWidth = settings.resolution.width;
            this.state.canvasHeight = settings.resolution.height;
            this.updateCanvasSize();

            // Update resolution selection in UI
            if (UI && UI.updateResolutionSelection) {
                UI.updateResolutionSelection(`${settings.resolution.width}x${settings.resolution.height}`);
            }
        }

        // Load background image if needed
        if (settings.backgroundImageId) {
            this.loadBackgroundById();
        } else {
            this.state.backgroundImage = null;
        }

        // Update UI elements to match the new settings
        document.getElementById('corner-radius-slider').value = this.state.cornerRadius;
        document.getElementById('corner-radius-value').textContent = `${this.state.cornerRadius}px`;

        document.getElementById('padding-slider').value = this.state.padding;
        document.getElementById('padding-value').textContent = `${this.state.padding}px`;

        document.getElementById('shadow-opacity-slider').value = this.state.shadowOpacity;
        document.getElementById('shadow-opacity-value').textContent = `${Math.round(this.state.shadowOpacity * 100)}%`;

        document.getElementById('shadow-radius-slider').value = this.state.shadowRadius;
        document.getElementById('shadow-radius-value').textContent = `${this.state.shadowRadius}px`;

        document.getElementById('shadow-offset-x-slider').value = this.state.shadowOffsetX;
        document.getElementById('shadow-offset-x-value').textContent = `${this.state.shadowOffsetX}px`;

        document.getElementById('shadow-offset-y-slider').value = this.state.shadowOffsetY;
        document.getElementById('shadow-offset-y-value').textContent = `${this.state.shadowOffsetY}px`;

        document.getElementById('shadow-color-input').value = this.state.shadowColor;
        document.getElementById('shadow-color-value').textContent = this.state.shadowColor;

        // Update noise UI controls
        if (this.state.noiseOverlayId) {
            const noiseSelect = document.getElementById('noise-overlay-select');
            if (noiseSelect) {
                noiseSelect.value = this.state.noiseOverlayId;
                const noiseOptions = document.getElementById('noise-options');
                if (noiseOptions) {
                    noiseOptions.style.display = 'block';
                }
            }

            // Update noise controls
            const intensitySlider = document.getElementById('noise-intensity-slider');
            const opacitySlider = document.getElementById('noise-opacity-slider');
            const blendSelect = document.getElementById('noise-blend-mode');
            const scaleSlider = document.getElementById('noise-scale-slider');
            const invertToggle = document.getElementById('noise-invert-toggle');

            if (intensitySlider) {
                intensitySlider.value = this.state.noiseOverlayIntensity;
            }
            if (opacitySlider) {
                opacitySlider.value = this.state.noiseOpacity;
            }
            if (blendSelect) {
                blendSelect.value = this.state.noiseBlendMode;
            }
            if (scaleSlider) {
                scaleSlider.value = this.state.noiseScale;
                document.getElementById('noise-scale-value').textContent = Math.round(this.state.noiseScale * 100) + '%';
            }
            if (invertToggle) {
                invertToggle.checked = this.state.noiseInvert;
            }
        }

        // Update UI selections
        UI.updateBackgroundSelection(this.state.backgroundColor, this.state.backgroundGradientId, this.state.backgroundImageId);

        // Update watermark UI controls
        if (document.getElementById('watermark-opacity-slider')) {
            document.getElementById('watermark-opacity-slider').value = this.state.watermarkOpacity;
            document.getElementById('watermark-opacity-value').textContent = `${Math.round(this.state.watermarkOpacity * 100)}%`;
        }
        if (document.getElementById('watermark-scale-slider')) {
            document.getElementById('watermark-scale-slider').value = this.state.watermarkScale;
            document.getElementById('watermark-scale-value').textContent = `${Math.round(this.state.watermarkScale * 100)}%`;
        }
        if (document.getElementById('watermark-position-select')) {
            document.getElementById('watermark-position-select').value = this.state.watermarkPosition;
        }

        this.renderPreview();
        this.saveSettings();

        // Apply watermark settings if available
        if (settings.watermarkImage) {
            this.state.watermarkImage = settings.watermarkImage;
            this.state.watermarkFilename = settings.watermarkFilename;

            // Show watermark preview and controls in UI
            if (UI && UI.showWatermarkPreview && UI.showWatermarkControls) {
                UI.showWatermarkPreview(settings.watermarkImage, settings.watermarkFilename || 'Watermark');
                UI.showWatermarkControls();
            }
        } else {
            this.state.watermarkImage = null;
            this.state.watermarkFilename = null;
        }

        this.state.watermarkOpacity = settings.watermarkOpacity || 0.5;
        this.state.watermarkScale = settings.watermarkScale || 1.0;
        this.state.watermarkPosition = settings.watermarkPosition || 'bottom-right';
        this.state.watermarkText = settings.watermarkText || '';
        this.state.watermarkFontSize = settings.watermarkFontSize || 32;
        this.state.watermarkColor = settings.watermarkColor || '#000000';

        // Apply multi-image layout data
        if (settings.currentLayout) {
            this.state.currentLayout = settings.currentLayout;
        }
        if (settings.images) {
            this.state.images = settings.images;
        }
        if (settings.selectedImageIndex !== undefined) {
            this.state.selectedImageIndex = settings.selectedImageIndex;
        }

        // Update multi-image UI
        UI.updateLayoutSelection(this.state.currentLayout);
        UI.updateImageSlots(this.state.images, this.state.selectedImageIndex);

        // Update Smart Fill UI
        this.updateSmartFillUI();
    },

    // Add to history without persisting to localStorage
    addToHistory(imageData, name) {
        const historyItem = new ExportModels.ExportHistoryItem(imageData, name);

        // Add to history
        this.state.history.unshift(historyItem);

        // Limit history size
        if (this.state.history.length > Config.maxHistoryItems) {
            this.state.history.pop();
        }
    },

    // Load history - don't load from localStorage anymore
    loadHistory() {
        // Start with empty history
        this.state.history = [];
        UI.renderHistory(this.state.history);
    },

    // Save history - don't save to localStorage
    saveHistory() {
        // Don't save to localStorage
    },

    // Clear all history
    clearHistory() {
        this.state.history = [];
        UI.renderHistory([]);
        UI.showSuccess('History cleared');
    },

    // Download a history item
    downloadHistoryItem(id) {
        const item = this.state.history.find(item => item.id === id);
        if (!item) return;

        // Create a download link
        const link = document.createElement('a');
        link.href = item.image;
        link.download = item.name;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    },

    // Delete a history item
    deleteHistoryItem(id) {
        const index = this.state.history.findIndex(item => item.id === id);
        if (index === -1) return;

        // Remove the item
        this.state.history.splice(index, 1);

        // Update UI
        UI.renderHistory(this.state.history);
    },

    // Set canvas resolution and re-render
    setResolution(width, height, id) {
        this.state.resolution = { width, height };

        // Update the export canvas size immediately
        this.updateCanvasSize();

        // Update UI to show selected resolution
        if (UI && UI.updateResolutionSelection) {
            UI.updateResolutionSelection(`${width}x${height}`);
        }

        // Save the state for undo functionality
        this.saveStateForUndo();

        // Re-render the current image with new dimensions
        this.renderPreview();

        // Save settings
        this.saveSettings();

        // Update UI button states
        UI.updateButtonStates();
    },

    // Load gallery images - modified to not persist images
    loadGalleryImages() {
        // Clear any previous canvases
        this.state.canvases = [];
        this.state.selectedCanvasId = null;

        // The initial canvas will be added by addCurrentCanvasToGallery() in init()
    },

    // Export all images in the gallery
    exportAllImages() {
        if (this.state.canvases.length === 0) {
            UI.showError('No canvases to export. Create some designs first.');
            return;
        }

        // Open export settings dialog first with a special flag for batch export
        UI.showExportSettingsModal(true);
    },

    // Set shadow color
    setShadowColor(value) {
        this.saveStateForUndo();
        this.state.shadowColor = value;
        document.getElementById('shadow-color-value').textContent = value;
        UI.updateButtonStates();
        this.renderPreview();
    },

    // Reset shadow color to default
    resetShadowColor() {
        this.saveStateForUndo();
        this.state.shadowColor = Config.defaultShadowColor;
        document.getElementById('shadow-color-input').value = Config.defaultShadowColor;
        document.getElementById('shadow-color-value').textContent = Config.defaultShadowColor;
        UI.updateButtonStates();
        this.renderPreview();
    },

    // Force update shadow color from input
    forceShadowColorUpdate() {
        const colorInput = document.getElementById('shadow-color-input');
        if (colorInput) {
            this.setShadowColor(colorInput.value);
        }
    },

    // Render the current image (alias for renderPreview for better readability)
    renderCurrentImage() {
        this.renderPreview();
    },

    // Add a new text layer
    addTextLayer(text = 'Your Text', options = {}) {
        const id = this.generateTextLayerId();

        const textLayer = {
            id: id,
            text: text,
            position: { x: 0.5, y: 0.5 }, // Use normalized position (center of canvas)
            fontSize: options.fontSize || 36,
            fontFamily: options.fontFamily || "'Inter', sans-serif",
            color: options.color || '#FFFFFF',
            bold: options.bold || false,
            italic: options.italic || false,
            underline: options.underline || false,
            align: options.align || 'center',
            opacity: options.opacity !== undefined ? options.opacity : 1,
            shadow: true, // Always enabled
            shadowColor: options.shadowColor || '#000000',
            shadowBlur: options.shadowBlur || 3,
            shadowOpacity: options.shadowOpacity !== undefined ? options.shadowOpacity : 0, // Default to 0 opacity
            shadowOffsetX: options.shadowOffsetX || 2,
            shadowOffsetY: options.shadowOffsetY || 2,
            background: true, // Always enabled
            backgroundColor: options.backgroundColor || '#333333',
            backgroundOpacity: options.backgroundOpacity !== undefined ? options.backgroundOpacity : 0, // Default to 0 opacity
            backgroundRadius: options.backgroundRadius || 4,
            padding: options.padding || 10,
            visible: options.visible !== undefined ? options.visible : true,
            zIndex: this.getNextTextLayerZIndex()
        };

        this.state.textLayers.push(textLayer);

        // Clear cache since layers changed
        this._clearTextLayerCache();

        // Select the new text layer
        this.state.selectedTextLayerId = id;

        // Update UI
        UI.renderTextLayers(this.state.textLayers, this.state.selectedTextLayerId);
        UI.showTextEditor(textLayer);

        // Render preview with the new text layer
        this.renderPreview();

        // Save state for undo
        this.saveStateForUndo();

        // Save to localStorage
        this.saveToLocalStorage();

        return id;
    },

    // Select a text layer for editing
    selectTextLayer(id) {
        this.state.selectedTextLayerId = id;

        // Update UI
        UI.renderTextLayers(this.state.textLayers, id);

        // Show text editor
        const textLayer = this.getTextLayerById(id);
        if (textLayer) {
            UI.showTextEditor(textLayer);
        }
    },

    // Get text layer by ID
    getTextLayerById(id) {
        if (!this.state.textLayers || !id) return null;

        // Cache text layer lookups for better performance
        if (!this._textLayerCache) {
            this._textLayerCache = new Map();
        }

        // Check cache first
        let textLayer = this._textLayerCache.get(id);
        if (textLayer) {
            // Verify it's still in the current layers
            const exists = this.state.textLayers.find(layer => layer.id === id);
            if (exists === textLayer) {
                return textLayer;
            }
        }

        // Find and cache the text layer
        textLayer = this.state.textLayers.find(layer => layer.id === id);
        if (textLayer) {
            this._textLayerCache.set(id, textLayer);
        }

        return textLayer;
    },

    // Update a text layer
    updateTextLayer(id, properties) {
        const index = this.state.textLayers.findIndex(layer => layer.id === id);
        if (index === -1) return;

        this.saveStateForUndo();

        // Update the layer
        this.state.textLayers[index] = {
            ...this.state.textLayers[index],
            ...properties
        };

        // Render preview
        this.renderPreview();

        // Update UI
        UI.renderTextLayers(this.state.textLayers, this.state.selectedTextLayerId);

        // Update editor if this is the selected layer
        if (this.state.selectedTextLayerId === id) {
            UI.updateTextEditor(this.state.textLayers[index]);
        }

        // Save to localStorage after text layer update
        this.saveToLocalStorage();
    },

    // Toggle text layer visibility
    toggleTextLayerVisibility(id) {
        const textLayer = this.getTextLayerById(id);
        if (!textLayer) return;

        this.updateTextLayer(id, { visible: !textLayer.visible });
    },

    // Delete a text layer
    deleteTextLayer(id) {
        this.saveStateForUndo();

        // Remove the layer
        this.state.textLayers = this.state.textLayers.filter(layer => layer.id !== id);

        // If the deleted layer was selected, deselect it
        if (this.state.selectedTextLayerId === id) {
            this.state.selectedTextLayerId = this.state.textLayers.length > 0 ? this.state.textLayers[0].id : null;
        }

        // Render preview
        this.renderPreview();

        // Update UI
        UI.renderTextLayers(this.state.textLayers, this.state.selectedTextLayerId);

        // Show editor for new selected layer or hide if none
        if (this.state.selectedTextLayerId) {
            const textLayer = this.getTextLayerById(this.state.selectedTextLayerId);
            UI.showTextEditor(textLayer);
        } else {
            UI.hideTextEditor();
        }
    },

    // Duplicate a text layer
    duplicateTextLayer(id) {
        const textLayer = this.getTextLayerById(id);
        if (!textLayer) return;

        this.saveStateForUndo();

        // Create a duplicate with a new ID and slightly offset position
        const newLayer = {
            ...textLayer,
            id: `text_${Date.now()}`,
            position: {
                x: Math.min(1, textLayer.position.x + 0.05),
                y: Math.min(1, textLayer.position.y + 0.05)
            }
        };

        // Add to state
        this.state.textLayers.push(newLayer);

        // Select the new layer
        this.selectTextLayer(newLayer.id);

        // Render the preview
        this.renderPreview();
    },

    // Update text layer position
    updateTextLayerPosition(id, x, y) {
        const textLayer = this.getTextLayerById(id);
        if (textLayer) {
            textLayer.position = { x, y };
            // Always render preview when position is updated via buttons
            this.renderPreview();
            // Save to localStorage
            this.saveToLocalStorage();
        }
    },

    // Bring text layer to front
    bringTextLayerToFront(id) {
        const textLayer = this.getTextLayerById(id);
        if (!textLayer) return;

        this.saveStateForUndo();

        // Update the layer's z-index to be in front of the image
        this.updateTextLayer(id, { zIndex: 10 });
    },

    // Send text layer to back
    sendTextLayerToBack(id) {
        const textLayer = this.getTextLayerById(id);
        if (!textLayer) return;

        this.saveStateForUndo();

        // Update the layer's z-index to be behind the image
        this.updateTextLayer(id, { zIndex: 0 });
    },

    // Toggle text layer shadow
    toggleTextLayerShadow(id) {
        const textLayer = this.getTextLayerById(id);
        if (!textLayer) return;

        this.updateTextLayer(id, { shadow: !textLayer.shadow });
    },

    // Toggle text layer background
    toggleTextLayerBackground(id, color = '#333333') {
        const textLayer = this.getTextLayerById(id);
        if (!textLayer) return;

        const newBackground = textLayer.background ? false : true;
        this.updateTextLayer(id, { background: newBackground, backgroundColor: color });
    },

    // Set noise overlay
    setNoiseOverlay(overlayId) {
        this.saveStateForUndo();

        this.state.noiseOverlayId = overlayId;
        this.renderPreview();
        this.saveSettings();
    },

    // Set noise overlay intensity
    setNoiseOverlayIntensity(intensity) {
        this.state.noiseOverlayIntensity = Number(intensity);
        this.renderPreview();
    },

    // Set noise opacity
    setNoiseOpacity(opacity) {
        this.state.noiseOpacity = Number(opacity);
        this.renderPreview();
    },

    // Set noise blend mode
    setNoiseBlendMode(blendMode) {
        this.saveStateForUndo();
        this.state.noiseBlendMode = blendMode;
        this.renderPreview();
        this.saveSettings();
    },

    // Set noise scale
    setNoiseScale(scale) {
        this.state.noiseScale = Number(scale);
        this.renderPreview();
    },

    // Toggle noise invert
    toggleNoiseInvert() {
        this.saveStateForUndo();
        this.state.noiseInvert = !this.state.noiseInvert;
        this.renderPreview();
        this.saveSettings();
    },

    // Select random noise
    selectRandomNoise() {
        this.saveStateForUndo();

        // Get all noise types except 'none'
        const noiseTypes = Config.noiseOverlayTypes.filter(type => type.id !== 'none');
        const randomNoise = noiseTypes[Math.floor(Math.random() * noiseTypes.length)];

        this.setNoiseOverlay(randomNoise.id);

        // Use the noise type's default settings as a base and add randomization
        const baseIntensity = randomNoise.intensity || 0.2;
        const baseScale = randomNoise.scale || 1.0;

        // Randomize settings based on the noise type defaults
        this.state.noiseOverlayIntensity = baseIntensity * (0.8 + Math.random() * 0.4); // ±20% of base intensity
        this.state.noiseOpacity = 0.4 + Math.random() * 0.5; // 40-90%
        this.state.noiseScale = baseScale * (0.7 + Math.random() * 0.6); // ±30% of base scale

        // Random blend mode from a selection of good ones
        const goodBlendModes = ['multiply', 'overlay', 'soft-light', 'screen', 'color-burn', 'linear-burn'];
        this.state.noiseBlendMode = goodBlendModes[Math.floor(Math.random() * goodBlendModes.length)];

        // Update ALL UI controls to reflect the new values

        // 1. Update noise type dropdown
        const noiseSelect = document.getElementById('noise-overlay-select');
        if (noiseSelect) {
            noiseSelect.value = this.state.noiseOverlayId;
        }

        // 2. Show noise options panel
        const noiseOptions = document.getElementById('noise-options');
        if (noiseOptions) {
            noiseOptions.style.display = 'block';
        }

        // 3. Update intensity slider and display
        const intensitySlider = document.getElementById('noise-intensity-slider');
        const intensityValue = document.getElementById('noise-intensity-value');
        if (intensitySlider) {
            intensitySlider.value = this.state.noiseOverlayIntensity;
        }
        if (intensityValue) {
            intensityValue.textContent = `${Math.round(this.state.noiseOverlayIntensity * 100)}%`;
        }

        // 4. Update opacity slider and display
        const opacitySlider = document.getElementById('noise-opacity-slider');
        const opacityValue = document.getElementById('noise-opacity-value');
        if (opacitySlider) {
            opacitySlider.value = this.state.noiseOpacity;
        }
        if (opacityValue) {
            opacityValue.textContent = `${Math.round(this.state.noiseOpacity * 100)}%`;
        }

        // 5. Update scale slider and display
        const scaleSlider = document.getElementById('noise-scale-slider');
        const scaleValue = document.getElementById('noise-scale-value');
        if (scaleSlider) {
            scaleSlider.value = this.state.noiseScale;
        }
        if (scaleValue) {
            scaleValue.textContent = `${Math.round(this.state.noiseScale * 100)}%`;
        }

        // 6. Update blend mode dropdown
        const blendSelect = document.getElementById('noise-blend-select');
        if (blendSelect) {
            blendSelect.value = this.state.noiseBlendMode;
        }

        this.renderPreview();
        this.saveSettings();
    },

    // Reset all noise settings
    resetAllNoise() {
        this.saveStateForUndo();
        this.state.noiseOverlayId = null;
        this.state.noiseOverlayIntensity = 1.0;
        this.state.noiseOpacity = Config.defaultNoiseOpacity;
        this.state.noiseBlendMode = Config.defaultNoiseBlendMode;
        this.state.noiseScale = Config.defaultNoiseScale;
        this.state.noiseInvert = Config.defaultNoiseInvert;
        this.renderPreview();
        this.saveSettings();
    },

    // Reset noise overlay
    resetNoiseOverlay() {
        this.resetAllNoise();
    },

    // Add or update current canvas in gallery
    addCurrentCanvasToGallery() {
        const currentCanvas = {
            id: this.state.currentCanvasId,
            date: new Date().toISOString(),
            image: this.state.selectedImage,
            images: [...this.state.images], // Include multi-image data
            currentLayout: this.state.currentLayout,
            selectedImageIndex: this.state.selectedImageIndex,
            settings: this.getCurrentSettings(),
            textLayers: [...this.state.textLayers],
            isCurrentCanvas: true
        };

        // Find existing canvas or add new one
        const existingIndex = this.state.canvases.findIndex(canvas => canvas.id === this.state.currentCanvasId);
        if (existingIndex !== -1) {
            this.state.canvases[existingIndex] = currentCanvas;
        } else {
            this.state.canvases.unshift(currentCanvas);
        }

        this.state.selectedCanvasId = this.state.currentCanvasId;

        // Force gallery re-render with updated thumbnails
        UI.renderGallery(this.state.canvases, this.state.selectedCanvasId);

        // Save to localStorage after canvas update
        this.saveToLocalStorage();
    },

    // Create a new canvas
    createNewCanvas() {
        console.log('🎨 Creating new canvas...');

        // Save current canvas first (if it exists and has content)
        if ((this.state.selectedImage || this.state.textLayers.length > 0) && this.state.currentCanvasId) {
            this.addCurrentCanvasToGallery();
        }

        // Generate new canvas ID
        const newCanvasId = `canvas_${Date.now()}`;
        console.log('🎨 New canvas ID:', newCanvasId);

        // Reset to default state
        this.state.selectedImage = null;
        this.state.images = [null]; // Initialize with single empty slot
        this.state.currentLayout = 'single';
        this.state.selectedImageIndex = 0;
        this.state.textLayers = [];
        this.state.selectedTextLayerId = null;
        this.state.currentCanvasId = newCanvasId;
        this.state.selectedCanvasId = newCanvasId;

        // Reset all settings to defaults
        this.resetUIToDefaults();

        // Show upload prompt
        const dropZone = document.getElementById('image-drop-zone');
        if (dropZone) {
            dropZone.classList.remove('hidden');
        }

        // Render empty canvas
        this.renderPreview();

        // Automatically select random background and noise for new canvas
        console.log('🎲 Auto-selecting random background and noise for new canvas...');
        try {
            this.selectRandomBackground();
            this.selectRandomNoise();
            UI.showNotification('New canvas with random styling created!', 'success', 2000);
            console.log('✅ Random background and noise applied to new canvas');
        } catch (error) {
            console.error('❌ Failed to apply random background/noise to new canvas:', error);
        }

        // The new canvas will be added to gallery when content is added via addCurrentCanvasToGallery()
        // Update gallery to reflect current selection
        if (window.UI && window.UI.renderGallery) {
            window.UI.renderGallery(this.state.canvases, this.state.selectedCanvasId);
        }

        // Update Add Image button text (should say "Add Image" for empty canvas)
        if (window.UI && window.UI.updateAddImageButtonText) {
            window.UI.updateAddImageButtonText();
        }

        // Track canvas creation analytics with a small delay to ensure everything is set up
        setTimeout(async () => {
            try {
                if (window.Analytics && window.Analytics.trackCanvasCreated) {
                    const result = await window.Analytics.trackCanvasCreated();
                    console.log('📊 Manual canvas creation tracked successfully:', result);
                } else {
                    console.log('📊 No analytics tracking needed - simplified mode');
                    const result = { success: true };
                    console.log('📊 Canvas creation tracking (simplified mode):', result);
                }
            } catch (analyticsError) {
                console.error('📊 Failed to track manual canvas creation:', analyticsError);
            }
        }, 100);

        console.log('✅ New canvas created successfully');
    },

    // Reset UI to default values
    resetUIToDefaults() {
        document.getElementById('corner-radius-slider').value = Config.defaultCornerRadius;
        document.getElementById('padding-slider').value = Config.defaultPadding;
        document.getElementById('shadow-opacity-slider').value = Config.defaultShadowOpacity;
        document.getElementById('shadow-radius-slider').value = Config.defaultShadowRadius;
        document.getElementById('shadow-offset-x-slider').value = Config.defaultShadowOffsetX;
        document.getElementById('shadow-offset-y-slider').value = Config.defaultShadowOffsetY;
        document.getElementById('shadow-color-input').value = Config.defaultShadowColor;
        document.getElementById('rotation-slider').value = Config.defaultRotation;
        document.getElementById('bg-blur-slider').value = 0;
        document.getElementById('bg-twirl-slider') && (document.getElementById('bg-twirl-slider').value = 0);
        document.getElementById('bg-saturation-slider') && (document.getElementById('bg-saturation-slider').value = 100);
        document.getElementById('bg-hue-slider') && (document.getElementById('bg-hue-slider').value = 0);
        document.getElementById('bg-contrast-slider') && (document.getElementById('bg-contrast-slider').value = 100);
        document.getElementById('bg-brightness-slider') && (document.getElementById('bg-brightness-slider').value = 100);
        document.getElementById('bg-wave-slider') && (document.getElementById('bg-wave-slider').value = 0);
        document.getElementById('bg-ripple-slider') && (document.getElementById('bg-ripple-slider').value = 0);
        document.getElementById('bg-zoom-slider') && (document.getElementById('bg-zoom-slider').value = 100);
        document.getElementById('bg-shake-slider') && (document.getElementById('bg-shake-slider').value = 0);
        document.getElementById('bg-lens-slider') && (document.getElementById('bg-lens-slider').value = 0);
        document.getElementById('noise-overlay-select').value = 'none';
        document.getElementById('noise-options').style.display = 'none';

        // Reset watermark controls
        if (document.getElementById('watermark-opacity-slider')) {
            document.getElementById('watermark-opacity-slider').value = 0.5;
            document.getElementById('watermark-opacity-value').textContent = '50%';
        }
        if (document.getElementById('watermark-scale-slider')) {
            document.getElementById('watermark-scale-slider').value = 1;
            document.getElementById('watermark-scale-value').textContent = '100%';
        }
        if (document.getElementById('watermark-position-select')) {
            document.getElementById('watermark-position-select').value = 'bottom-right';
        }

        // Hide watermark controls
        if (UI && UI.hideWatermarkControls) {
            UI.hideWatermarkControls();
        }

        // Update background selection
        UI.updateBackgroundSelection('#FFFFFF', null, null);

        // Clear text editor
        UI.hideTextEditor();
        UI.renderTextLayers([], null);

        // Update Smart Fill UI
        this.updateSmartFillUI();

        // Update button states
        UI.updateButtonStates();
    },

    // Remove a canvas from the gallery
    removeCanvas(id) {
        // Don't allow removing the current canvas if it's the only one
        if (this.state.canvases.length <= 1) {
            UI.showError('Cannot remove the last canvas');
            return false;
        }

        // Find the canvas to remove
        const canvasIndex = this.state.canvases.findIndex(canvas => canvas.id === id);
        if (canvasIndex === -1) {
            UI.showError('Canvas not found');
            return false;
        }

        // Store whether this was the current canvas
        const wasCurrentCanvas = this.state.currentCanvasId === id;

        // Remove the canvas from the array immediately
        this.state.canvases.splice(canvasIndex, 1);

        // If this was the currently selected canvas, switch to another one
        if (wasCurrentCanvas && this.state.canvases.length > 0) {
            // Select the next available canvas (or first if we removed the last one)
            const nextIndex = canvasIndex < this.state.canvases.length ? canvasIndex : 0;
            const newCanvas = this.state.canvases[nextIndex];

            // Switch to the new canvas without triggering gallery re-render
            this.state.currentCanvasId = newCanvas.id;
            this.state.selectedCanvasId = newCanvas.id;

            // Load the new canvas state
            this.state.selectedImage = newCanvas.image;
            this.state.textLayers = [...(newCanvas.textLayers || [])];
            this.state.selectedTextLayerId = null;
            this.applySettings(newCanvas.settings || {});
            this.renderPreview();
        }

        // Update the gallery once at the end
        UI.renderGallery(this.state.canvases, this.state.selectedCanvasId);

        return true;
    },

    // Update UI state after changes
    updateUIState() {
        UI.updateButtonStates();
        UI.updateBackgroundSelection(
            this.state.backgroundColor,
            this.state.backgroundGradientId,
            this.state.backgroundImageId
        );
        this.saveSettings();
    },

    // Add Dev Analytics button for dev users (called by Analytics module when profile loads)
    createDevAnalyticsButton() {
        // Analytics is now integrated into the account section instead of a separate button
        // This function remains for compatibility but doesn't create a separate button
        if (window.Analytics && window.Analytics.hasFeatureAccess && window.Analytics.hasFeatureAccess('dev')) {
            console.log('🔧 Dev user confirmed, analytics available in account section');
        } else {
            console.log('👤 Non-dev user');
        }
    },

    // This function is no longer needed as analytics is integrated into account section
    showDevAnalyticsButton() {
        // Analytics is now integrated into account section
        console.log('📊 Analytics is now available in the Account section under "Your Statistics"');
    },

    // Hide dev features for non-dev users
    hideDevFeatures() {
        // No separate button to remove since analytics is integrated into account section
    },

    // Export image with Stripe usage tracking
    async exportImage() {
        // Check if running locally (file:// protocol) OR if we're on frameit.social domain
        const isRunningLocally = window.location.protocol === 'file:' ||
            window.location.hostname === 'localhost' ||
            window.location.hostname === '127.0.0.1' ||
            window.location.hostname.includes('frameit.social');

        try {
            // Show loading indicator
            UI.showNotification('Preparing export...', 'info', 3000);

            // Get canvas and export settings
            const canvas = document.getElementById('preview-canvas');
            if (!canvas) {
                throw new Error('Canvas not found');
            }

            // Create high-quality export canvas
            const exportCanvas = document.createElement('canvas');
            const ctx = exportCanvas.getContext('2d');

            // Get export settings from modal or use defaults
            const exportFormat = document.getElementById('export-format')?.value || this.state.exportSettings?.format || 'png';
            const exportQuality = parseFloat(document.getElementById('export-quality')?.value || this.state.exportSettings?.quality || '0.9');
            const exportSize = document.getElementById('export-size')?.value || this.state.exportSettings?.dimensionOption || 'original';

            // Get custom filename or use default
            let filename = document.getElementById('export-filename')?.value || 'frameit-export';
            // Sanitize filename - remove invalid characters
            filename = filename.replace(/[^a-z0-9_\-]/gi, '_').replace(/_{2,}/g, '_');
            if (!filename) filename = 'frameit-export';

            // Calculate export dimensions
            let exportWidth = canvas.width;
            let exportHeight = canvas.height;

            if (exportSize !== 'original') {
                const dimensions = this.getExportDimensions(exportSize, canvas);
                exportWidth = dimensions.width;
                exportHeight = dimensions.height;
            }

            // Set canvas size
            exportCanvas.width = exportWidth;
            exportCanvas.height = exportHeight;

            // Update progress
            UI.showNotification('Rendering image...', 'info', 3000);

            // Scale and draw the original canvas
            ctx.drawImage(canvas, 0, 0, exportWidth, exportHeight);

            // Update progress
            UI.showNotification('Converting to file...', 'info', 3000);

            // Convert to blob
            const blob = await new Promise(resolve => {
                if (exportFormat === 'jpeg') {
                    exportCanvas.toBlob(resolve, 'image/jpeg', exportQuality);
                } else {
                    exportCanvas.toBlob(resolve, 'image/png');
                }
            });

            // Download the image
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${filename}.${exportFormat}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            // Show success message
            UI.showNotification(`✅ Exported as ${filename}.${exportFormat}`, 'success', 3000);

            // Track export analytics - ensure this always runs with detailed logging
            try {
                if (window.Analytics && window.Analytics.trackExport) {
                    await window.Analytics.trackExport();
                }
            } catch (analyticsError) {
                console.error('📊 Failed to track export:', analyticsError);
            }

            console.log('✅ Export completed successfully');

        } catch (error) {
            console.error('Export failed:', error);
            this.showNotification('Export failed. Please try again.', 'error');
        }
    },

    // Show upgrade prompt when export limit reached
    showUpgradePrompt(usage) {
        // Remove any existing upgrade modal first
        const existingModal = document.getElementById('upgrade-modal');
        if (existingModal) {
            existingModal.remove();
        }

        // Create upgrade modal
        const modal = document.createElement('div');
        modal.className = 'modal visible';
        modal.id = 'upgrade-modal';
        modal.style.zIndex = '10000'; // Ensure it's above other elements

        // Extract usage info or provide defaults
        const currentExports = usage?.current_exports || 5;
        const exportLimit = usage?.export_limit || 5;

        modal.innerHTML = `
            <div class="modal-content" style="max-width: 480px;">
                <div class="modal-header">
                    <h3><i class="fas fa-crown"></i> Upgrade Required</h3>
                    <button class="modal-close-btn" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body" style="text-align: center; padding: 32px;">
                    <div style="background: #fef3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                        <i class="fas fa-exclamation-triangle" style="color: #e17055; font-size: 24px; margin-bottom: 12px;"></i>
                        <h4 style="color: #2d3436; margin-bottom: 8px;">Export Limit Reached</h4>
                        <p style="color: #636e72; margin: 0;">You've reached your monthly export limit. Upgrade to Pro for unlimited exports!</p>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px;">
                        <div style="text-align: center;">
                            <div style="font-size: 24px; font-weight: 700; color: #e17055;">${currentExports}/${exportLimit}</div>
                            <div style="font-size: 12px; color: #636e72;">Exports Used</div>
                        </div>
                        <div style="text-align: center;">
                            <div style="font-size: 24px; font-weight: 700; color: #00b894;">∞</div>
                            <div style="font-size: 12px; color: #636e72;">With Pro</div>
                        </div>
                    </div>
                    
                    <button class="btn primary-btn upgrade-btn" style="width: 100%; margin-bottom: 12px;">
                        <i class="fas fa-arrow-up"></i>
                        View Pricing Plans
                    </button>
                    
                    <p style="font-size: 12px; color: #636e72; margin: 0;">
                        Your exports reset on the 1st of each month
                    </p>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Add event listeners with proper cleanup
        const closeBtn = modal.querySelector('.modal-close-btn');
        const upgradeBtn = modal.querySelector('.upgrade-btn');

        const closeModal = () => {
            modal.remove();
            // Re-enable export buttons that might have been disabled
            setTimeout(() => {
                const exportBtn = document.getElementById('export-btn');
                const exportAllBtn = document.getElementById('export-all-btn');
                if (exportBtn && exportBtn.disabled) {
                    exportBtn.disabled = false;
                    exportBtn.innerHTML = '<i class="fas fa-download"></i> Export';
                }
                if (exportAllBtn && exportAllBtn.disabled) {
                    exportAllBtn.disabled = false;
                    exportAllBtn.innerHTML = '<i class="fas fa-file-export"></i> Export All';
                }
            }, 100);
        };

        closeBtn.addEventListener('click', closeModal);

        upgradeBtn.addEventListener('click', () => {
            if (window.PaymentManager?.showPricingModal) {
                window.PaymentManager.showPricingModal();
            }
            closeModal();
        });

        // Remove modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });

        // Auto-remove after 10 seconds to prevent permanent interference
        setTimeout(() => {
            if (document.getElementById('upgrade-modal')) {
                closeModal();
            }
        }, 10000);
    },

    // Get export dimensions based on size setting
    getExportDimensions(sizeKey, canvas) {
        const aspectRatio = canvas.width / canvas.height;

        const sizePresets = {
            'small': { width: 800, height: 800 / aspectRatio },
            'medium': { width: 1200, height: 1200 / aspectRatio },
            'large': { width: 1920, height: 1920 / aspectRatio },
            '4k': { width: 3840, height: 3840 / aspectRatio },
            'instagram': { width: 1080, height: 1080 },
            'twitter': { width: 1200, height: 675 },
            'facebook': { width: 1200, height: 630 }
        };

        return sizePresets[sizeKey] || { width: canvas.width, height: canvas.height };
    },

    // Utility function to show notifications
    showNotification(message, type = 'info') {
        if (window.showNotification) {
            window.showNotification(message, type);
        } else {
            alert(message);
        }
    },

    // Select random background
    selectRandomBackground() {
        this.saveStateForUndo();

        // Get random gradient from config using getAllGradients method
        const gradients = Config.getAllGradients();
        const randomGradient = gradients[Math.floor(Math.random() * gradients.length)];

        // Set the random gradient
        this.setBackgroundGradient(randomGradient.id);

        console.log(`🎨 Random background selected: ${randomGradient.name}`);
    },

    // Set background color
    setBackgroundColor(color) {
        this.saveStateForUndo();
        this.state.backgroundColor = color;
        this.state.backgroundGradientId = null;
        this.state.backgroundImageId = null;
        this.state.backgroundImage = null;

        this.renderPreview();
        this.updateUIState();

        console.log(`🎨 Background color set to: ${color}`);
    },

    // Set background gradient
    setBackgroundGradient(gradientId) {
        this.saveStateForUndo();
        this.state.backgroundGradientId = gradientId;
        this.state.backgroundColor = null; // Clear solid color when gradient is set
        this.state.backgroundImageId = null; // Clear background image when gradient is set
        this.state.backgroundImage = null;

        this.renderPreview();
        this.saveSettings();

        // Update UI selection
        UI.updateBackgroundSelection(null, gradientId, null);
    },

    // Set background blur
    setBackgroundBlur(value) {
        this.state.backgroundBlurRadius = Number(value);
        document.getElementById('blur-value').textContent = `${value}px`;
        this.renderPreview();
        this.saveSettings();
    },

    // Set background saturation
    setBackgroundSaturation(value) {
        this.state.backgroundSaturation = Number(value);
        document.getElementById('saturation-value').textContent = `${value}%`;
        this.renderPreview();
        this.saveSettings();
    },

    // Set background hue rotation
    setBackgroundHueRotation(value) {
        this.state.backgroundHueRotation = Number(value);
        document.getElementById('hue-value').textContent = `${value}°`;
        this.renderPreview();
        this.saveSettings();
    },

    // Set background contrast
    setBackgroundContrast(value) {
        this.state.backgroundContrast = Number(value);
        document.getElementById('contrast-value').textContent = `${value}%`;
        this.renderPreview();
        this.saveSettings();
    },

    // Set background brightness
    setBackgroundBrightness(value) {
        this.state.backgroundBrightness = Number(value);
        document.getElementById('brightness-value').textContent = `${value}%`;
        this.renderPreview();
        this.saveSettings();
    },

    // Set background twirl effect
    setBackgroundTwirl(value) {
        this.state.backgroundTwirlAmount = Number(value);
        document.getElementById('twirl-value').textContent = `${value}%`;
        this.renderPreview();
        this.saveSettings();
    },

    // Set background wave distortion
    setBackgroundWaveAmount(value) {
        this.state.backgroundWaveAmount = Number(value);
        document.getElementById('wave-value').textContent = `${value}%`;
        this.renderPreview();
        this.saveSettings();
    },

    // Set background ripple effect
    setBackgroundRippleAmount(value) {
        this.state.backgroundRippleAmount = Number(value);
        document.getElementById('ripple-value').textContent = `${value}%`;
        this.renderPreview();
        this.saveSettings();
    },

    // Set background zoom scale
    setBackgroundZoomAmount(value) {
        this.state.backgroundZoomAmount = Number(value);
        document.getElementById('zoom-value').textContent = `${value}%`;
        this.renderPreview();
        this.saveSettings();
    },

    // Set background shake effect
    setBackgroundShakeAmount(value) {
        this.state.backgroundShakeAmount = Number(value);
        document.getElementById('shake-value').textContent = `${value}%`;
        this.renderPreview();
        this.saveSettings();
    },

    // Set background lens distortion
    setBackgroundLensAmount(value) {
        this.state.backgroundLensAmount = Number(value);
        document.getElementById('lens-value').textContent = `${value}%`;
        this.renderPreview();
        this.saveSettings();
    },

    // Set corner radius
    setCornerRadius(value) {
        console.log('🔧 App.setCornerRadius called with value:', value);
        this.saveStateForUndo();
        this.state.cornerRadius = Number(value);
        document.getElementById('corner-radius-value').textContent = `${value}px`;
        this.renderPreview();
        this.saveSettings();
    },

    // Set padding
    setPadding(value) {
        console.log('🔧 App.setPadding called with value:', value);
        this.saveStateForUndo();
        this.state.padding = Number(value);
        document.getElementById('padding-value').textContent = `${value}px`;
        this.renderPreview();
        this.saveSettings();
    },

    // Set shadow opacity
    setShadowOpacity(value) {
        console.log('🔧 App.setShadowOpacity called with value:', value);
        this.saveStateForUndo();
        this.state.shadowOpacity = Number(value);
        document.getElementById('shadow-opacity-value').textContent = `${Math.round(value * 100)}%`;
        this.renderPreview();
        this.saveSettings();
    },

    // Set shadow radius
    setShadowRadius(value) {
        console.log('🔧 App.setShadowRadius called with value:', value);
        this.saveStateForUndo();
        this.state.shadowRadius = Number(value);
        document.getElementById('shadow-radius-value').textContent = `${value}px`;
        this.renderPreview();
        this.saveSettings();
    },

    // Set shadow offset X
    setShadowOffsetX(value) {
        this.saveStateForUndo();
        this.state.shadowOffsetX = Number(value);
        document.getElementById('shadow-offset-x-value').textContent = `${value}px`;
        this.renderPreview();
        this.saveSettings();
    },

    // Set shadow offset Y
    setShadowOffsetY(value) {
        this.saveStateForUndo();
        this.state.shadowOffsetY = Number(value);
        document.getElementById('shadow-offset-y-value').textContent = `${value}px`;
        this.renderPreview();
        this.saveSettings();
    },

    // Set shadow offset (X and Y together)
    setShadowOffset(offsetX, offsetY) {
        this.saveStateForUndo();
        this.state.shadowOffsetX = Number(offsetX);
        this.state.shadowOffsetY = Number(offsetY);

        // Update UI
        document.getElementById('shadow-offset-x-slider').value = offsetX;
        document.getElementById('shadow-offset-y-slider').value = offsetY;
        document.getElementById('shadow-offset-x-value').textContent = `${offsetX}px`;
        document.getElementById('shadow-offset-y-value').textContent = `${offsetY}px`;

        this.renderPreview();
        this.saveSettings();
    },

    // Set rotation
    setRotation(value) {
        this.saveStateForUndo();
        this.state.rotation = Number(value);
        document.getElementById('rotation-value').textContent = `${value}°`;
        this.renderPreview();
        this.saveSettings();
    },

    // Reset shadow offset Y to default
    resetShadowOffsetY() {
        this.saveStateForUndo();
        this.state.shadowOffsetY = Config.defaultShadowOffsetY;
        document.getElementById('shadow-offset-y-slider').value = Config.defaultShadowOffsetY;
        document.getElementById('shadow-offset-y-value').textContent = `${Config.defaultShadowOffsetY}px`;
        this.renderPreview();
        this.saveSettings();
    },

    // Reset rotation to default
    resetRotation() {
        this.saveStateForUndo();
        this.state.rotation = Config.defaultRotation;
        document.getElementById('rotation-slider').value = Config.defaultRotation;
        document.getElementById('rotation-value').textContent = `${Config.defaultRotation}°`;
        this.renderPreview();
        this.saveSettings();
    },

    // Render preview (main rendering function) with throttling for performance
    renderPreview() {
        // Skip throttling during animations for 60 FPS
        const isAnimating = false;

        if (!isAnimating) {
            // Use throttling for normal UI interactions
            if (this._isRendering) {
                this._pendingRender = true;
                return;
            }

            this._isRendering = true;
            this._pendingRender = false;
        }

        // Use immediate rendering for animations, requestAnimationFrame for normal UI
        const renderFn = () => {
            try {
                // Get the selected image if any
                const image = this.state.selectedImage;

                // Get background gradient if selected
                let backgroundGradient = null;
                if (this.state.backgroundGradientId) {
                    const allGradients = Config.getAllGradients();
                    backgroundGradient = allGradients.find(g => g.id === this.state.backgroundGradientId);
                }

                // Get noise overlay if selected
                let noiseOverlay = null;
                if (this.state.noiseOverlayId) {
                    noiseOverlay = Config.noiseOverlayTypes.find(n => n.id === this.state.noiseOverlayId);
                }

                // Call the canvas renderer
                CanvasRenderer.renderMockup({
                    image: image,
                    images: this.state.images,
                    currentLayout: this.state.currentLayout,
                    selectedImageIndex: this.state.selectedImageIndex,
                    backgroundColor: this.state.backgroundColor,
                    backgroundGradient: backgroundGradient,
                    backgroundImage: this.state.backgroundImage,
                    backgroundBlurRadius: this.state.backgroundBlurRadius,
                    backgroundTwirlAmount: this.state.backgroundTwirlAmount,
                    backgroundSaturation: this.state.backgroundSaturation,
                    backgroundHueRotation: this.state.backgroundHueRotation,
                    backgroundContrast: this.state.backgroundContrast,
                    backgroundBrightness: this.state.backgroundBrightness,
                    backgroundWaveAmount: this.state.backgroundWaveAmount,
                    backgroundRippleAmount: this.state.backgroundRippleAmount,
                    backgroundZoomAmount: this.state.backgroundZoomAmount,
                    backgroundShakeAmount: this.state.backgroundShakeAmount,
                    backgroundLensAmount: this.state.backgroundLensAmount,
                    noiseOverlay: noiseOverlay ? {
                        ...noiseOverlay,
                        intensity: this.state.noiseOverlayIntensity,
                        opacity: this.state.noiseOpacity,
                        blendMode: this.state.noiseBlendMode,
                        scale: this.state.noiseScale,
                        invert: this.state.noiseInvert
                    } : null,
                    cornerRadius: this.state.cornerRadius,
                    padding: this.state.padding,
                    shadowOpacity: this.state.shadowOpacity,
                    shadowRadius: this.state.shadowRadius,
                    shadowOffsetX: this.state.shadowOffsetX,
                    shadowOffsetY: this.state.shadowOffsetY,
                    shadowColor: this.state.shadowColor,
                    rotation: this.state.rotation,
                    isFlippedHorizontally: this.state.isFlippedHorizontally,
                    isFlippedVertically: this.state.isFlippedVertically,
                    smartFillEnabled: this.state.smartFillEnabled,
                    panX: this.state.panX,
                    panY: this.state.panY,
                    watermarkImage: this.state.watermarkImage,
                    watermarkOpacity: this.state.watermarkOpacity,
                    watermarkScale: this.state.watermarkScale,
                    watermarkPosition: this.state.watermarkPosition,
                    watermarkType: 'text',
                    watermarkText: this.state.watermarkText,
                    watermarkTextFont: this.state.watermarkTextFont || "'Inter', sans-serif",
                    watermarkTextSize: this.state.watermarkTextSize || 16,
                    watermarkTextColor: this.state.watermarkTextColor || '#FFFFFF',
                    watermarkTextBold: this.state.watermarkTextBold || false,
                    watermarkTextItalic: this.state.watermarkTextItalic || false,
                    watermarkTextShadow: this.state.watermarkTextShadow || false,
                    watermarkTextShadowColor: this.state.watermarkTextShadowColor || '#000000',
                    watermarkTextShadowBlur: this.state.watermarkTextShadowBlur || 3,
                    textLayers: this.state.textLayers,
                    selectedTextLayerId: this.state.selectedTextLayerId
                });

                // Only update gallery and save to localStorage when NOT animating
                // This prevents excessive saves during 60 FPS animation previews
                if (!isAnimating) {
                    // Update gallery thumbnail automatically
                    this.addCurrentCanvasToGallery();

                    // Periodically save to localStorage (throttled to avoid excessive saves)
                    if (!this._saveTimeout) {
                        this._saveTimeout = setTimeout(() => {
                            this.saveToLocalStorage();
                            this._saveTimeout = null;
                        }, 1000); // Save after 1 second of no changes
                    }
                }
            } finally {
                if (!isAnimating) {
                    this._isRendering = false;

                    // If another render was requested while we were rendering, do it now
                    if (this._pendingRender) {
                        setTimeout(() => this.renderPreview(), 0);
                    }
                }
            }
        };

        if (isAnimating) {
            // Immediate rendering for animations
            renderFn();
        } else {
            // Use requestAnimationFrame for normal UI
            requestAnimationFrame(renderFn);
        }
    },

    // Alias for renderPreview for animation system compatibility
    renderCanvas() {
        this.renderPreview();
    },

    // Capture a screenshot
    captureScreenshot() {
        UI.showError('Screenshot capture is only available in desktop applications');
    },

    // Reset all settings to defaults
    resetSettings() {
        this.state.backgroundColor = Config.defaultBackgroundColor || '#000000';
        this.state.backgroundGradientId = null;
        this.state.backgroundImageId = null;
        this.state.backgroundBlurRadius = 0;
        this.state.cornerRadius = Config.defaultCornerRadius || 20;
        this.state.padding = Config.defaultPadding || 60;
        this.state.shadowOpacity = Config.defaultShadowOpacity || 0.5;
        this.state.shadowRadius = Config.defaultShadowRadius || 30;
        this.state.shadowOffsetX = Config.defaultShadowOffsetX || 0;
        this.state.shadowOffsetY = Config.defaultShadowOffsetY || 20;
        this.state.shadowColor = Config.defaultShadowColor || '#000000';
        this.state.rotation = 0;
        this.state.isFlippedHorizontally = false;
        this.state.isFlippedVertically = false;

        // Noise defaults
        this.state.noiseOverlayId = null;
        this.state.noiseOverlayIntensity = 0.5;
        this.state.noiseOpacity = 0.05;
        this.state.noiseBlendMode = 'overlay';
        this.state.noiseScale = 1;
        this.state.noiseInvert = false;

        // Watermark defaults
        this.state.watermarkImage = null;
        this.state.watermarkFilename = null;
        this.state.watermarkOpacity = 1;
        this.state.watermarkScale = 1;
        this.state.watermarkPosition = 'bottom-right';
        this.state.watermarkText = '';
        this.state.watermarkFontSize = 24;
        this.state.watermarkColor = '#ffffff';

        // Update UI controls if they exist
        if (window.UI) {
            window.UI.updateControls(this.state);
        }
    },

    // Reset background blur to default
    resetBlur() {
        this.saveStateForUndo();
        this.state.backgroundBlurRadius = 0;
        document.getElementById('bg-blur-slider').value = 0;
        document.getElementById('bg-blur-value').textContent = '0px';
        this.renderPreview();
        this.saveSettings();
    },

    // Reset corner radius to default
    resetCornerRadius() {
        this.saveStateForUndo();
        this.state.cornerRadius = Config.defaultCornerRadius;
        document.getElementById('corner-radius-slider').value = Config.defaultCornerRadius;
        document.getElementById('corner-radius-value').textContent = `${Config.defaultCornerRadius}px`;
        this.renderPreview();
        this.saveSettings();
    },

    // Reset padding to default
    resetPadding() {
        this.saveStateForUndo();
        this.state.padding = Config.defaultPadding;
        document.getElementById('padding-slider').value = Config.defaultPadding;
        document.getElementById('padding-value').textContent = `${Config.defaultPadding}px`;
        this.renderPreview();
        this.saveSettings();
    },

    // Reset shadow opacity to default
    resetShadowOpacity() {
        this.saveStateForUndo();
        this.state.shadowOpacity = Config.defaultShadowOpacity;
        document.getElementById('shadow-opacity-slider').value = Config.defaultShadowOpacity;
        document.getElementById('shadow-opacity-value').textContent = `${Math.round(Config.defaultShadowOpacity * 100)}%`;
        this.renderPreview();
        this.saveSettings();
    },

    // Reset shadow radius to default
    resetShadowRadius() {
        this.saveStateForUndo();
        this.state.shadowRadius = Config.defaultShadowRadius;
        document.getElementById('shadow-radius-slider').value = Config.defaultShadowRadius;
        document.getElementById('shadow-radius-value').textContent = `${Config.defaultShadowRadius}px`;
        this.renderPreview();
        this.saveSettings();
    },

    // Reset shadow offset X to default
    resetShadowOffsetX() {
        this.saveStateForUndo();
        this.state.shadowOffsetX = Config.defaultShadowOffsetX;
        document.getElementById('shadow-offset-x-slider').value = Config.defaultShadowOffsetX;
        document.getElementById('shadow-offset-x-value').textContent = `${Config.defaultShadowOffsetX}px`;
        this.renderPreview();
        this.saveSettings();
    },

    // Toggle horizontal flip
    toggleFlipHorizontal() {
        this.saveStateForUndo();
        this.state.isFlippedHorizontally = !this.state.isFlippedHorizontally;
        this.renderPreview();
        this.saveSettings();
        UI.updateButtonStates();
    },

    // Toggle vertical flip
    toggleFlipVertical() {
        this.saveStateForUndo();
        this.state.isFlippedVertically = !this.state.isFlippedVertically;
        this.renderPreview();
        this.saveSettings();

        // Update UI
        const flipVBtn = document.getElementById('flip-v-btn');
        if (flipVBtn) {
            flipVBtn.classList.toggle('active', this.state.isFlippedVertically);
        }
    },

    // Toggle Smart Fill and Crop
    toggleSmartFill() {
        console.log('🔧 App.toggleSmartFill called, current state:', this.state.smartFillEnabled);
        this.saveStateForUndo();
        this.state.smartFillEnabled = !this.state.smartFillEnabled;
        console.log('🔧 Smart fill toggled to:', this.state.smartFillEnabled);

        // Reset panning when toggling Smart Fill
        if (!this.state.smartFillEnabled) {
            this.state.panX = 0;
            this.state.panY = 0;
        }

        this.renderPreview();
        this.saveSettings();

        // Update UI
        this.updateSmartFillUI();
    },

    // Set pan X value
    setPanX(value) {
        this.saveStateForUndo();
        this.state.panX = Number(value) || 0;
        this.renderPreview();
        this.saveSettings();

        // Update UI
        const panXValue = document.getElementById('pan-x-value');
        if (panXValue) {
            panXValue.textContent = `${this.state.panX}%`;
        }
    },

    // Set pan Y value
    setPanY(value) {
        this.saveStateForUndo();
        this.state.panY = Number(value) || 0;
        this.renderPreview();
        this.saveSettings();

        // Update UI
        const panYValue = document.getElementById('pan-y-value');
        if (panYValue) {
            panYValue.textContent = `${this.state.panY}%`;
        }
    },

    // Reset pan X
    resetPanX() {
        this.setPanX(0);
        const panXSlider = document.getElementById('pan-x-slider');
        if (panXSlider) {
            panXSlider.value = 0;
        }
    },

    // Reset pan Y
    resetPanY() {
        this.setPanY(0);
        const panYSlider = document.getElementById('pan-y-slider');
        if (panYSlider) {
            panYSlider.value = 0;
        }
    },

    // Reset all image manipulation settings to defaults
    resetAllImageSettings() {
        this.saveStateForUndo();

        // Reset Smart Fill and panning
        this.state.smartFillEnabled = false;
        this.state.panX = 0;
        this.state.panY = 0;

        // Reset image manipulation settings
        this.state.cornerRadius = Config.defaultCornerRadius;
        this.state.padding = Config.defaultPadding;
        this.state.rotation = Config.defaultRotation;
        this.state.isFlippedHorizontally = false;
        this.state.isFlippedVertically = false;

        // Reset shadow settings
        this.state.shadowOpacity = Config.defaultShadowOpacity;
        this.state.shadowRadius = Config.defaultShadowRadius;
        this.state.shadowOffsetX = Config.defaultShadowOffsetX;
        this.state.shadowOffsetY = Config.defaultShadowOffsetY;
        this.state.shadowColor = Config.defaultShadowColor;

        // Update all UI elements
        this.updateAllImageSettingsUI();

        // Re-render and save
        this.renderPreview();
        this.saveSettings();

        // Show notification
        UI.showNotification('All image settings reset to defaults', 'success', 2000);
    },

    // Reset all background effects to defaults
    resetBackgroundEffects() {
        this.saveStateForUndo();

        // Reset blur and filters
        this.state.backgroundBlurRadius = 0;
        this.state.backgroundSaturation = 100;
        this.state.backgroundHueRotation = 0;
        this.state.backgroundContrast = 100;
        this.state.backgroundBrightness = 100;

        // Reset distortion effects
        this.state.backgroundTwirlAmount = 0;
        this.state.backgroundWaveAmount = 0;
        this.state.backgroundRippleAmount = 0;
        this.state.backgroundZoomAmount = 100;
        this.state.backgroundShakeAmount = 0;
        this.state.backgroundLensAmount = 0;

        // Update all UI elements
        this.updateBackgroundEffectsUI();

        // Re-render and save
        this.renderPreview();
        this.saveSettings();

        // Show notification
        UI.showNotification('All background effects reset to defaults', 'success', 2000);
    },

    // Update all image settings UI elements
    updateAllImageSettingsUI() {
        // Smart Fill and panning
        this.updateSmartFillUI();

        // Corner radius
        const cornerRadiusSlider = document.getElementById('corner-radius-slider');
        const cornerRadiusValue = document.getElementById('corner-radius-value');
        if (cornerRadiusSlider) cornerRadiusSlider.value = this.state.cornerRadius;
        if (cornerRadiusValue) cornerRadiusValue.textContent = `${this.state.cornerRadius}px`;

        // Padding
        const paddingSlider = document.getElementById('padding-slider');
        const paddingValue = document.getElementById('padding-value');
        if (paddingSlider) paddingSlider.value = this.state.padding;
        if (paddingValue) paddingValue.textContent = `${this.state.padding}px`;

        // Rotation
        const rotationSlider = document.getElementById('rotation-slider');
        const rotationValue = document.getElementById('rotation-value');
        const resetRotationBtn = document.getElementById('reset-rotation-btn');
        if (rotationSlider) rotationSlider.value = this.state.rotation;
        if (rotationValue) rotationValue.textContent = `${this.state.rotation}°`;
        if (resetRotationBtn) resetRotationBtn.disabled = this.state.rotation === 0;

        // Flip buttons
        const flipHBtn = document.getElementById('flip-h-btn');
        const flipVBtn = document.getElementById('flip-v-btn');
        if (flipHBtn) flipHBtn.classList.toggle('active', this.state.isFlippedHorizontally);
        if (flipVBtn) flipVBtn.classList.toggle('active', this.state.isFlippedVertically);

        // Shadow settings
        const shadowOpacitySlider = document.getElementById('shadow-opacity-slider');
        const shadowOpacityValue = document.getElementById('shadow-opacity-value');
        if (shadowOpacitySlider) shadowOpacitySlider.value = this.state.shadowOpacity;
        if (shadowOpacityValue) shadowOpacityValue.textContent = `${Math.round(this.state.shadowOpacity * 100)}%`;

        const shadowRadiusSlider = document.getElementById('shadow-radius-slider');
        const shadowRadiusValue = document.getElementById('shadow-radius-value');
        if (shadowRadiusSlider) shadowRadiusSlider.value = this.state.shadowRadius;
        if (shadowRadiusValue) shadowRadiusValue.textContent = `${this.state.shadowRadius}px`;

        const shadowOffsetXSlider = document.getElementById('shadow-offset-x-slider');
        const shadowOffsetXValue = document.getElementById('shadow-offset-x-value');
        if (shadowOffsetXSlider) shadowOffsetXSlider.value = this.state.shadowOffsetX;
        if (shadowOffsetXValue) shadowOffsetXValue.textContent = `${this.state.shadowOffsetX}px`;

        const shadowOffsetYSlider = document.getElementById('shadow-offset-y-slider');
        const shadowOffsetYValue = document.getElementById('shadow-offset-y-value');
        if (shadowOffsetYSlider) shadowOffsetYSlider.value = this.state.shadowOffsetY;
        if (shadowOffsetYValue) shadowOffsetYValue.textContent = `${this.state.shadowOffsetY}px`;

        const shadowColorInput = document.getElementById('shadow-color-input');
        const shadowColorValue = document.getElementById('shadow-color-value');
        if (shadowColorInput) shadowColorInput.value = this.state.shadowColor;
        if (shadowColorValue) shadowColorValue.textContent = this.state.shadowColor;

        // Update shadow position handle
        if (UI && UI.updateShadowHandleFromState) {
            UI.updateShadowHandleFromState();
        }
    },

    // Update Smart Fill UI
    updateSmartFillUI() {
        const smartFillToggle = document.getElementById('smart-fill-toggle');
        const panningControls = document.getElementById('panning-controls');

        if (smartFillToggle) {
            smartFillToggle.checked = this.state.smartFillEnabled;
        }

        if (panningControls) {
            if (this.state.smartFillEnabled) {
                panningControls.classList.remove('hidden');
            } else {
                panningControls.classList.add('hidden');
            }
        }

        // Update panning sliders and values
        const panXSlider = document.getElementById('pan-x-slider');
        const panYSlider = document.getElementById('pan-y-slider');
        const panXValue = document.getElementById('pan-x-value');
        const panYValue = document.getElementById('pan-y-value');

        if (panXSlider) panXSlider.value = this.state.panX;
        if (panYSlider) panYSlider.value = this.state.panY;
        if (panXValue) panXValue.textContent = `${this.state.panX}%`;
        if (panYValue) panYValue.textContent = `${this.state.panY}%`;
    },

    // Update background effects UI elements
    updateBackgroundEffectsUI() {
        // Blur & Filters
        const blurSlider = document.getElementById('bg-blur-slider');
        const blurValue = document.getElementById('blur-value');
        if (blurSlider) blurSlider.value = this.state.backgroundBlurRadius;
        if (blurValue) blurValue.textContent = `${this.state.backgroundBlurRadius}px`;

        const saturationSlider = document.getElementById('bg-saturation-slider');
        const saturationValue = document.getElementById('saturation-value');
        if (saturationSlider) saturationSlider.value = this.state.backgroundSaturation;
        if (saturationValue) saturationValue.textContent = `${this.state.backgroundSaturation}%`;

        const hueSlider = document.getElementById('bg-hue-slider');
        const hueValue = document.getElementById('hue-value');
        if (hueSlider) hueSlider.value = this.state.backgroundHueRotation;
        if (hueValue) hueValue.textContent = `${this.state.backgroundHueRotation}°`;

        const contrastSlider = document.getElementById('bg-contrast-slider');
        const contrastValue = document.getElementById('contrast-value');
        if (contrastSlider) contrastSlider.value = this.state.backgroundContrast;
        if (contrastValue) contrastValue.textContent = `${this.state.backgroundContrast}%`;

        const brightnessSlider = document.getElementById('bg-brightness-slider');
        const brightnessValue = document.getElementById('brightness-value');
        if (brightnessSlider) brightnessSlider.value = this.state.backgroundBrightness;
        if (brightnessValue) brightnessValue.textContent = `${this.state.backgroundBrightness}%`;

        // Distortion Effects
        const twirlSlider = document.getElementById('bg-twirl-slider');
        const twirlValue = document.getElementById('twirl-value');
        if (twirlSlider) twirlSlider.value = this.state.backgroundTwirlAmount;
        if (twirlValue) twirlValue.textContent = `${this.state.backgroundTwirlAmount}%`;

        const waveSlider = document.getElementById('bg-wave-slider');
        const waveValue = document.getElementById('wave-value');
        if (waveSlider) waveSlider.value = this.state.backgroundWaveAmount;
        if (waveValue) waveValue.textContent = `${this.state.backgroundWaveAmount}%`;

        const rippleSlider = document.getElementById('bg-ripple-slider');
        const rippleValue = document.getElementById('ripple-value');
        if (rippleSlider) rippleSlider.value = this.state.backgroundRippleAmount;
        if (rippleValue) rippleValue.textContent = `${this.state.backgroundRippleAmount}%`;

        const zoomSlider = document.getElementById('bg-zoom-slider');
        const zoomValue = document.getElementById('zoom-value');
        if (zoomSlider) zoomSlider.value = this.state.backgroundZoomAmount;
        if (zoomValue) zoomValue.textContent = `${this.state.backgroundZoomAmount}%`;

        const shakeSlider = document.getElementById('bg-shake-slider');
        const shakeValue = document.getElementById('shake-value');
        if (shakeSlider) shakeSlider.value = this.state.backgroundShakeAmount;
        if (shakeValue) shakeValue.textContent = `${this.state.backgroundShakeAmount}%`;

        const lensSlider = document.getElementById('bg-lens-slider');
        const lensValue = document.getElementById('lens-value');
        if (lensSlider) lensSlider.value = this.state.backgroundLensAmount;
        if (lensValue) lensValue.textContent = `${this.state.backgroundLensAmount}%`;
    },

    // Apply settings to all canvases
    applySettingsToAll() {
        if (this.state.canvases.length <= 1) {
            UI.showError('Need at least 2 canvases to apply settings to all');
            return;
        }

        const currentSettings = this.getCurrentSettings();

        // Apply to all canvases except current one
        this.state.canvases.forEach(canvas => {
            if (canvas.id !== this.state.currentCanvasId) {
                canvas.settings = { ...currentSettings };
            }
        });

        UI.showSuccess(`Settings applied to ${this.state.canvases.length - 1} other canvases`);
        UI.renderGallery(this.state.canvases, this.state.selectedCanvasId);
    },

    // Perform batch export of all canvases
    async performBatchExport() {
        if (this.state.canvases.length === 0) {
            UI.showError('No canvases to export');
            return;
        }

        // Store original button states
        const exportBtn = document.getElementById('export-btn');
        const exportAllBtn = document.getElementById('export-all-btn');
        const originalExportHTML = exportBtn ? exportBtn.innerHTML : '';
        const originalExportAllHTML = exportAllBtn ? exportAllBtn.innerHTML : '';

        try {
            // Disable all export buttons to prevent interference
            if (exportBtn) {
                exportBtn.disabled = true;
                exportBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Batch Exporting...';
            }
            if (exportAllBtn) {
                exportAllBtn.disabled = true;
                exportAllBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Exporting...';
            }

            const timestamp = new Date().toISOString().replace(/[:]/g, '-').replace(/[T]/g, '_').split('.')[0];
            let exportedCount = 0;

            // Export each canvas
            for (let i = 0; i < this.state.canvases.length; i++) {
                const canvas = this.state.canvases[i];

                // Save current state
                const originalState = { ...this.state };

                try {
                    // Temporarily switch to this canvas state
                    this.state.selectedImage = canvas.image;
                    this.state.textLayers = canvas.textLayers || [];
                    if (canvas.settings) {
                        this.applySettings(canvas.settings);
                    }

                    // Render this canvas
                    this.renderPreview();

                    // Wait a moment for rendering
                    await new Promise(resolve => setTimeout(resolve, 150));

                    // Update progress on button
                    if (exportAllBtn) {
                        exportAllBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Exporting ${i + 1}/${this.state.canvases.length}`;
                    }

                    // Export this canvas
                    const canvasElement = document.getElementById('preview-canvas');
                    if (canvasElement) {
                        const blob = await new Promise(resolve => {
                            canvasElement.toBlob(resolve, 'image/png');
                        });

                        if (blob) {
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `frameit-batch-${timestamp}-${i + 1}.png`;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            URL.revokeObjectURL(url);
                            exportedCount++;

                            // Track each export in analytics
                            try {
                                if (window.Analytics && window.Analytics.trackExport) {
                                    await window.Analytics.trackExport();
                                    console.log(`📊 Batch export ${i + 1} tracked successfully`);
                                }
                            } catch (analyticsError) {
                                console.error(`📊 Failed to track batch export ${i + 1}:`, analyticsError);
                            }
                        }
                    }
                } catch (canvasError) {
                    console.error(`Failed to export canvas ${i + 1}:`, canvasError);
                } finally {
                    // Always restore original state for this canvas
                    Object.assign(this.state, originalState);
                }
            }

            // Restore original canvas
            this.renderPreview();

            console.log(`✅ Batch export completed: ${exportedCount} images exported`);

        } catch (error) {
            console.error('Batch export failed:', error);
        } finally {
            // Always restore button states, even if there was an error
            setTimeout(() => {
                if (exportBtn) {
                    exportBtn.disabled = false;
                    exportBtn.innerHTML = originalExportHTML;
                }
                if (exportAllBtn) {
                    exportAllBtn.disabled = false;
                    exportAllBtn.innerHTML = originalExportAllHTML;
                }
            }, 100); // Small delay to ensure all processes are complete
        }
    },

    // Set watermark image
    setWatermarkImage(image, filename) {
        this.saveStateForUndo();
        this.state.watermarkImage = image;
        this.state.watermarkFilename = filename;

        // Store in current canvas settings for persistence
        this.addCurrentCanvasToGallery();

        this.renderPreview();
        this.saveSettings();
        console.log('✅ Watermark image set:', filename);
    },

    // Set watermark opacity
    setWatermarkOpacity(opacity) {
        this.state.watermarkOpacity = Number(opacity);
        this.renderPreview();
        this.saveSettings();
    },

    // Set watermark scale
    setWatermarkScale(scale) {
        this.state.watermarkScale = Number(scale);
        this.renderPreview();
        this.saveSettings();
    },

    // Set watermark position
    setWatermarkPosition(position) {
        this.saveStateForUndo();
        this.state.watermarkPosition = position;
        this.renderPreview();
        this.saveSettings();
    },

    // Clear watermark
    clearWatermark() {
        this.saveStateForUndo();
        this.state.watermarkText = '';
        this.state.watermarkImage = null;
        this.state.watermarkFilename = null;
        this.renderPreview();
        this.saveSettings();
        console.log('✅ Watermark cleared');
    },


    // Apply a template configuration
    applyTemplate(templateId) {
        console.log('Applying template:', templateId);

        // Find the template in the config
        const template = Config.templates.find(t => t.id === templateId);
        if (!template || !template.settings) {
            console.error('Template not found or has no settings:', templateId);
            UI.showError('Template not found');
            return;
        }

        // Save current state for undo
        this.saveStateForUndo();

        // Only apply background and noise settings from templates
        const templateSettings = template.settings;

        // Background settings
        if (templateSettings.backgroundColor) {
            this.state.backgroundColor = templateSettings.backgroundColor;
            this.state.backgroundGradientId = null; // Clear gradient when setting color
        }

        if (templateSettings.backgroundGradientId) {
            this.state.backgroundGradientId = templateSettings.backgroundGradientId;
            this.state.backgroundColor = null; // Clear color when setting gradient
        }

        // Noise/texture settings
        if (templateSettings.noiseOverlayId !== undefined) {
            this.state.noiseOverlayId = templateSettings.noiseOverlayId;
        }

        if (templateSettings.noiseOpacity !== undefined) {
            this.state.noiseOpacity = templateSettings.noiseOpacity;
        }

        if (templateSettings.noiseBlendMode !== undefined) {
            this.state.noiseBlendMode = templateSettings.noiseBlendMode;
        }

        if (templateSettings.noiseOverlayIntensity !== undefined) {
            this.state.noiseOverlayIntensity = templateSettings.noiseOverlayIntensity;
        }

        if (templateSettings.noiseScale !== undefined) {
            this.state.noiseScale = templateSettings.noiseScale;
        }

        if (templateSettings.noiseInvert !== undefined) {
            this.state.noiseInvert = templateSettings.noiseInvert;
        }

        // Update template selection in UI
        UI.updateTemplateSelection(templateId);

        // Update background UI
        UI.updateBackgroundSelection(this.state.backgroundColor, this.state.backgroundGradientId);

        // Update noise UI elements
        if (document.getElementById('noise-overlay-select')) {
            document.getElementById('noise-overlay-select').value = this.state.noiseOverlayId || 'none';
        }

        if (document.getElementById('noise-opacity-slider')) {
            document.getElementById('noise-opacity-slider').value = this.state.noiseOpacity;
            document.getElementById('noise-opacity-value').textContent = `${Math.round(this.state.noiseOpacity * 100)}%`;
        }

        if (document.getElementById('noise-blend-mode')) {
            document.getElementById('noise-blend-mode').value = this.state.noiseBlendMode;
        }

        if (document.getElementById('noise-intensity-slider')) {
            document.getElementById('noise-intensity-slider').value = this.state.noiseOverlayIntensity;
            document.getElementById('noise-intensity-value').textContent = `${Math.round(this.state.noiseOverlayIntensity * 100)}%`;
        }

        if (document.getElementById('noise-scale-slider')) {
            document.getElementById('noise-scale-slider').value = this.state.noiseScale;
            document.getElementById('noise-scale-value').textContent = `${Math.round(this.state.noiseScale * 100)}%`;
        }

        if (document.getElementById('noise-invert-toggle')) {
            document.getElementById('noise-invert-toggle').checked = this.state.noiseInvert;
        }

        // Show/hide noise options based on selection
        const noiseOptions = document.getElementById('noise-options');
        if (noiseOptions) {
            if (this.state.noiseOverlayId && this.state.noiseOverlayId !== 'none') {
                noiseOptions.style.display = 'block';
            } else {
                noiseOptions.style.display = 'none';
            }
        }

        // Re-render the preview with new background/noise settings only
        this.renderPreview();

        // Save the updated settings
        this.saveSettings();

        // Show success notification
        UI.showSuccess(`Template "${template.name}" applied to background`);

        console.log('Template applied successfully - background and noise only');
    },

    // Save app state to localStorage
    saveToLocalStorage() {
        try {

            const dataToSave = {
                canvases: this.state.canvases,
                currentCanvasId: this.state.currentCanvasId,
                selectedCanvasId: this.state.selectedCanvasId,
                textLayers: this.state.textLayers,
                selectedTextLayerId: this.state.selectedTextLayerId,
                settings: this.getCurrentSettings(),
                lastSaved: new Date().toISOString()
            };

            localStorage.setItem('frameit_persistent_data', JSON.stringify(dataToSave));
            console.log('💾 Data saved to localStorage');
        } catch (error) {
            console.error('Failed to save to localStorage:', error);
        }
    },

    // Load app state from localStorage
    loadFromLocalStorage() {
        try {
            const savedData = localStorage.getItem('frameit_persistent_data');
            if (!savedData) {
                console.log('No saved data found, using defaults');
                this.initializeDefaultState();
                return;
            }

            const data = JSON.parse(savedData);
            console.log('Loading saved data from:', data.lastSaved);

            // Restore canvases
            if (data.canvases && Array.isArray(data.canvases)) {
                this.state.canvases = data.canvases;
            }

            // Restore current canvas ID
            if (data.currentCanvasId) {
                this.state.currentCanvasId = data.currentCanvasId;
            }

            // Restore selected canvas ID
            if (data.selectedCanvasId) {
                this.state.selectedCanvasId = data.selectedCanvasId;
            }

            // Restore text layers
            if (data.textLayers && Array.isArray(data.textLayers)) {
                this.state.textLayers = data.textLayers;
            }

            // Restore selected text layer ID
            if (data.selectedTextLayerId) {
                this.state.selectedTextLayerId = data.selectedTextLayerId;
            }

            // Restore settings
            if (data.settings) {
                this.applySettings(data.settings);
            }

            console.log('Successfully loaded persistent data');
        } catch (error) {
            console.error('Failed to load from localStorage:', error);
            this.initializeDefaultState();
        }
    },

    // Initialize default state when no saved data exists
    initializeDefaultState() {
        // Set initial values from Config
        this.state.cornerRadius = Config.defaultCornerRadius;
        this.state.padding = Config.defaultPadding;

        // Initialize empty canvases array
        this.state.canvases = [];

        // Create a default canvas ID
        this.state.currentCanvasId = `canvas_${Date.now()}`;
        this.state.selectedCanvasId = this.state.currentCanvasId;

        // Initialize Analytics
        if (window.Analytics) {
            window.Analytics.init();
        }

        // Load background images
        this.loadBackgroundImages();

        // Force render backgrounds after a short delay to ensure DOM is ready
        setTimeout(() => {
            console.log('🎨 Force rendering backgrounds...');
            if (UI && UI.renderBackgroundImages) {
                UI.renderBackgroundImages();
            }
        }, 100);

        // Load saved settings
        this.loadSettings();

        // Set initial resolution
        this.updateCanvasSize();

        // Load uploaded images for gallery
        this.loadGalleryImages();

        console.log('✅ Default state initialized with empty canvas ready for content');

        // Add help button click handler
        const helpBtn = document.getElementById('help-btn');
        if (helpBtn) {
            helpBtn.addEventListener('click', () => UI.showHelpModal());
        }

        // Add Dev Analytics button for dev users (called by Analytics module when profile loads)
        this.createDevAnalyticsButton();

        console.log('✅ FrameIt initialized with defaults');

        // Initialize zoom controls after UI is ready
        UI.initZoomControls();

        // Update UI with initial state
        UI.updateButtonStates();

        // Set initial resolution selection in UI
        const { width, height } = this.state.resolution;
        if (UI && UI.updateResolutionSelection) {
            UI.updateResolutionSelection(`${width}x${height}`);
        }

        // Final check to ensure backgrounds are rendered
        setTimeout(() => {
            const colorContainer = document.getElementById('color-swatches');
            const gradientContainer = document.getElementById('gradient-swatches');

            if (colorContainer && colorContainer.children.length === 0) {
                console.log('🎨 Color swatches missing, forcing render...');
                if (UI && UI.renderColorSwatches) {
                    UI.renderColorSwatches();
                }
            }

            if (gradientContainer && gradientContainer.children.length === 0) {
                console.log('🎨 Gradient swatches missing, forcing render...');
                if (UI && UI.renderGradientSections) {
                    UI._gradientSectionsRendered = false; // Reset flag
                    UI.renderGradientSections();
                }
            }
        }, 500);

        // Show dev features based on user level
        if (this.state.userLevel === 'developer') {
            console.log('👤 Dev user');
            this.showDevAnalyticsButton();
        } else {
            console.log('👤 Non-dev user');
            this.hideDevFeatures();
        }
    },

    // Clear localStorage data
    clearPersistentData() {
        try {
            localStorage.removeItem('frameit_persistent_data');
            console.log('Persistent data cleared');
        } catch (error) {
            console.error('Failed to clear persistent data:', error);
        }
    },

    // Clear text layer cache when layers change
    _clearTextLayerCache() {
        if (this._textLayerCache) {
            this._textLayerCache.clear();
        }
    },

    // Remove a text layer
    removeTextLayer(id) {
        const index = this.state.textLayers.findIndex(layer => layer.id === id);
        if (index === -1) return;

        // Save state for undo before removal
        this.saveStateForUndo();

        // Remove the layer
        this.state.textLayers.splice(index, 1);

        // Clear cache since layers changed
        this._clearTextLayerCache();

        // Clear selection if this layer was selected
        if (this.state.selectedTextLayerId === id) {
            this.state.selectedTextLayerId = null;
            UI.hideTextEditor();
        }

        // Update UI
        UI.renderTextLayers(this.state.textLayers, this.state.selectedTextLayerId);

        // Re-render canvas
        this.renderPreview();

        // Save settings
        this.saveSettings();
    },

    // Generate unique text layer ID
    generateTextLayerId() {
        return `text_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    },

    // Get next z-index for text layers
    getNextTextLayerZIndex() {
        if (!this.state.textLayers || this.state.textLayers.length === 0) {
            return 0;
        }
        const maxZ = Math.max(...this.state.textLayers.map(layer => layer.zIndex || 0));
        return maxZ + 1;
    },

    // Get default settings for new canvases
    getDefaultSettings() {
        return {
            cornerRadius: 25,
            padding: 75,
            shadowOpacity: 0.15,
            shadowRadius: 8,
            shadowOffsetX: 0,
            shadowOffsetY: 4,
            shadowColor: '#000000',
            backgroundColor: '#FFFFFF',
            backgroundGradientId: null,
            backgroundImageId: null,
            backgroundBlurRadius: 0,
            backgroundTwirlAmount: 0,
            backgroundSaturation: 100,
            backgroundHueRotation: 0,
            backgroundContrast: 100,
            backgroundBrightness: 100,
            backgroundWaveAmount: 0,
            backgroundRippleAmount: 0,
            backgroundZoomAmount: 100,
            backgroundShakeAmount: 0,
            backgroundLensAmount: 0,
            noiseOverlayId: 'none',
            noiseOverlayIntensity: 1.0,
            noiseOpacity: 0.7,
            noiseBlendMode: 'multiply',
            noiseScale: 1.0,
            noiseInvert: false,
            rotation: 0,
            isFlippedHorizontally: false,
            isFlippedVertically: false,
            smartFillEnabled: false,
            panX: 0,
            panY: 0,
            resolution: { width: 1080, height: 1080, name: 'Square (1:1)', id: 'square' },
            watermarkImage: null,
            watermarkFilename: null,
            watermarkOpacity: 1.0,
            watermarkScale: 1.0,
            watermarkPosition: 'bottom-right',
            watermarkText: '',
            watermarkType: 'text',
            watermarkTextFont: "'Inter', sans-serif",
            watermarkTextSize: 32,
            watermarkTextColor: '#FFFFFF',
            watermarkTextBold: false,
            watermarkTextItalic: false,
            watermarkTextShadow: false,
            watermarkTextShadowColor: '#000000',
            watermarkTextShadowBlur: 3
        };
    },

    // Set watermark text
    setWatermarkText(text) {
        this.saveStateForUndo();
        this.state.watermarkText = text;

        // Store in current canvas settings for persistence
        this.addCurrentCanvasToGallery();

        this.renderPreview();
        this.saveSettings();
    },

    // Set watermark opacity
    setWatermarkOpacity(opacity) {
        this.state.watermarkOpacity = Number(opacity);
        this.renderPreview();
        this.saveSettings();
    },

    // Set watermark font size
    setWatermarkFontSize(fontSize) {
        this.state.watermarkTextSize = Number(fontSize);
        this.renderPreview();
        this.saveSettings();
    },

    // Set watermark color
    setWatermarkColor(color) {
        this.state.watermarkTextColor = color;
        this.renderPreview();
        this.saveSettings();
    },

    // Set watermark position
    setWatermarkPosition(position) {
        this.saveStateForUndo();
        this.state.watermarkPosition = position;
        this.renderPreview();
        this.saveSettings();
    },

    // Check if we should show the What's New modal
    checkAndShowWhatsNew() {
        const currentVersion = '1.2.0'; // Update this when you add new features
        const lastSeenVersion = localStorage.getItem('frameit_last_seen_version');
        const isFirstVisit = !localStorage.getItem('frameit_first_visit_complete');

        // Show modal for first-time visitors or when version has been updated
        if (isFirstVisit || lastSeenVersion !== currentVersion) {
            // Delay showing modal slightly to ensure DOM is ready
            setTimeout(() => {
                if (UI && UI.showWhatsNewModal) {
                    UI.showWhatsNewModal();
                }

                // Mark first visit as complete and update version
                localStorage.setItem('frameit_first_visit_complete', 'true');
                localStorage.setItem('frameit_last_seen_version', currentVersion);

                // Track analytics
                if (window.Analytics) {
                    window.Analytics.trackEvent('whats_new_modal_shown', {
                        version: currentVersion,
                        is_first_visit: isFirstVisit,
                        previous_version: lastSeenVersion || 'none'
                    });
                }
            }, 1000); // 1 second delay
        }
    }
};

// Initialize the application when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.App.init();
});

console.log('✅ FrameIt app.js loaded successfully'); 
