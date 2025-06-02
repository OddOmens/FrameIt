/**
 * Main Application for the Screenshot Mockup Tool
 */

window.App = {
    // Application state
    state: {
        selectedImage: null,
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
        canvasHeight: 1350
    },
    
    // Initialize the application
    init() {
        // Set initial values from Config
        this.state.cornerRadius = Config.defaultCornerRadius;
        this.state.padding = Config.defaultPadding;
        
        // Initialize UI
        UI.init();
        
        // Initialize Canvas Renderer
        CanvasRenderer.init(document.getElementById('preview-canvas'));
        
        // Initialize Analytics
        if (window.Analytics) {
            window.Analytics.init();
        }
        
        // Load background images
        this.loadBackgroundImages();
        
        // Load saved settings
        this.loadSettings();
        
        // Set initial resolution
        this.updateCanvasSize();
        
        // Load uploaded images for gallery
        this.loadGalleryImages();
        
        // Enable export from start (can create designs without images)
        document.getElementById('export-btn').disabled = false;
        
        // Hide upload prompt initially to show canvas
        document.getElementById('image-drop-zone').classList.add('hidden');
        
        // Initialize with background and render initial preview
        this.renderPreview();
        
        // Add current canvas to gallery
        this.addCurrentCanvasToGallery();
        
        // Add help button click handler
        const helpBtn = document.getElementById('help-btn');
        if (helpBtn) {
            helpBtn.addEventListener('click', () => UI.showHelpModal());
        }
        
        // Add Dev Analytics button for dev users (called by Analytics module when profile loads)
        this.createDevAnalyticsButton();
        
        console.log('✅ FrameIt initialized successfully');
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
            noiseInvert: this.state.noiseInvert
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
                'resolution'
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
            resolution: this.state.resolution
        };
        
        Utils.saveToStorage(Config.storageKeys.settings, settingsToSave);
    },
    
    // Update the canvas size based on selected resolution
    updateCanvasSize() {
        const { width, height } = this.state.resolution;
        CanvasRenderer.resizeCanvas(width, height);
    },
    
    // Handle file selection
    handleFileSelect(files) {
        if (!files || files.length === 0) return;
        
        // Show loading state
        UI.showLoading('Processing image...');
        
        const promises = Array.from(files).map(file => Utils.loadImageFromFile(file));
        
        Promise.all(promises)
            .then(async images => {
                // Track image upload analytics for each file
                console.log(`📊 Processing ${files.length} uploaded files for analytics`);
                console.log('📊 Current user check:', window.Auth?.getCurrentUser());
                console.log('📊 Analytics module check:', window.Analytics);
                
                // Use a proper async loop instead of forEach
                for (let index = 0; index < files.length; index++) {
                    try {
                        if (window.Analytics && window.Analytics.trackImageUpload) {
                            console.log(`📊 Tracking upload ${index + 1} of ${files.length}`);
                            console.log(`📊 About to call trackImageUpload for file ${index + 1}`);
                            
                            const result = await window.Analytics.trackImageUpload();
                            console.log(`📊 Upload ${index + 1} tracked successfully:`, result);
                        } else {
                            console.log(`📊 Analytics or trackImageUpload not available:`, {
                                analyticsExists: !!window.Analytics,
                                trackImageUploadExists: !!(window.Analytics && window.Analytics.trackImageUpload)
                            });
                        }
                    } catch (analyticsError) {
                        console.error(`📊 Failed to track upload ${index + 1}:`, analyticsError);
                        console.error(`📊 Upload tracking error details:`, {
                            message: analyticsError.message,
                            stack: analyticsError.stack
                        });
                    }
                }
                
                // Set the first image as the selected image for current canvas
                this.state.selectedImage = images[0];
                
                // If we have multiple files, create new canvases for each additional image
                if (images.length > 1) {
                    // Save current canvas with first image
                    this.addCurrentCanvasToGallery();
                    
                    // Create new canvases for additional images
                    for (let i = 1; i < images.length; i++) {
                        const newCanvasId = `canvas_${Date.now()}_${i}`;
                        const newCanvas = {
                            id: newCanvasId,
                            date: new Date().toISOString(),
                            image: images[i],
                            settings: this.getCurrentSettings(),
                            textLayers: [...this.state.textLayers],
                            isCurrentCanvas: false
                        };
                        this.state.canvases.unshift(newCanvas);
                        
                        // Track canvas creation for each new canvas - use proper async/await
                        try {
                            if (window.Analytics && window.Analytics.trackCanvasCreated) {
                                console.log(`📊 Tracking canvas ${i + 1} creation`);
                                await window.Analytics.trackCanvasCreated();
                                console.log(`📊 New canvas ${i + 1} creation tracked successfully`);
                            }
                        } catch (analyticsError) {
                            console.error(`📊 Failed to track canvas ${i + 1} creation:`, analyticsError);
                        }
                    }
                }
                
                // Show clear button and hide upload prompt
                document.getElementById('image-drop-zone').classList.add('hidden');
                
                // Render the first image preview
                this.renderPreview();
                
                // Update current canvas in gallery
                this.addCurrentCanvasToGallery();
                
                // Hide loading state
                UI.hideLoading();
                
                // Reset file input to allow re-uploading the same file
                const fileInput = document.getElementById('file-input');
                if (fileInput) {
                    fileInput.value = '';
                }
            })
            .catch(error => {
                console.error('Failed to load image:', error);
                UI.showError('Failed to load image. Please try another file.');
                UI.hideLoading();
                
                // Reset file input even on error
                const fileInput = document.getElementById('file-input');
                if (fileInput) {
                    fileInput.value = '';
                }
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
        
        // Load canvas data
        this.state.selectedImage = canvas.image;
        this.state.textLayers = canvas.textLayers || [];
        this.state.selectedTextLayerId = null;
        
        // Apply saved settings if available
        if (canvas.settings) {
            this.applySettings(canvas.settings);
        }
        
        // Show/hide clear button based on whether there's an image
        if (this.state.selectedImage) {
            // Show upload button since image exists
        } else {
            // No image, clear button is not shown
        }
        
        // Hide upload prompt
        document.getElementById('image-drop-zone').classList.add('hidden');
        
        // Render the canvas
        this.renderPreview();
        
        // Update gallery selection
        UI.renderGallery(this.state.canvases, this.state.selectedCanvasId);
        
        // Update UI button states
        UI.updateButtonStates();
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
            resolution: this.state.resolution
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
        
        // Apply resolution if saved in settings
        if (settings.resolution) {
            this.state.resolution = settings.resolution;
            this.state.canvasWidth = settings.resolution.width;
            this.state.canvasHeight = settings.resolution.height;
            this.updateCanvasSize();
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
        
        this.renderPreview();
        this.saveSettings();
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
    
    // Set canvas resolution
    setResolution(width, height, id) {
        this.saveStateForUndo();
        
        this.state.resolution = { id: id || 'custom', width, height };
        this.state.canvasWidth = width;
        this.state.canvasHeight = height;
        
        // Update canvas size
        this.updateCanvasSize();
        
        // Re-render with new dimensions
        this.renderPreview();
        
        // Track resolution change
        if (window.Analytics && window.Analytics.trackExport) {
            // Use trackExport as a general activity tracker since we don't have specific resolution tracking
            console.log('📊 Resolution changed to:', width, 'x', height);
        }
        
        // Update UI to reflect the new resolution
        UI.updateResolutionSelection(width);
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
        console.log('Adding text layer...');
        
        const id = `text_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const textLayer = {
            id: id,
            text: text,
            position: { x: 50, y: 50 },
            fontSize: options.fontSize || 24,
            fontFamily: options.fontFamily || 'Arial',
            color: options.color || '#000000',
            bold: options.bold || false,
            italic: options.italic || false,
            underline: options.underline || false,
            strokeColor: options.strokeColor || '#FFFFFF',
            strokeWidth: options.strokeWidth || 0,
            opacity: options.opacity || 1.0,
            rotation: options.rotation || 0,
            alignment: options.alignment || 'left',
            letterSpacing: options.letterSpacing || 0,
            lineHeight: options.lineHeight || 1.2,
            background: options.background || null,
            shadow: options.shadow || null
        };
        
        this.state.textLayers.push(textLayer);
        this.state.selectedTextLayerId = id;
        
        // Show text editor for the new layer
        if (UI.showTextEditor) {
            UI.showTextEditor(textLayer);
        }
        
        // Auto-expand Text Layers section
        const textLayersSection = document.querySelector('.panel-section[data-section="text-layers"]');
        if (textLayersSection) {
            textLayersSection.classList.add('expanded');
            const collapseBtn = textLayersSection.querySelector('.collapse-btn i');
            if (collapseBtn) {
                collapseBtn.className = 'fas fa-chevron-down';
            }
        }
        
        // Render the text on canvas
        this.renderPreview();
        
        // Track text layer addition
        if (window.Analytics && window.Analytics.trackExport) {
            console.log('📊 Text layer added');
        }
        
        return textLayer;
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
        return this.state.textLayers.find(layer => layer.id === id);
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
        if (!textLayer) return;
        
        // Get font size to calculate padding
        const fontSize = textLayer.fontSize || 36;
        // Padding based on font size (larger fonts need more space from edges)
        const edgePadding = Math.min(0.1, fontSize / 1000); // Scale with font size, max 10% of canvas
        
        // Constrain to canvas with padding (0-1 normalized values)
        const normalizedX = Math.max(edgePadding, Math.min(1 - edgePadding, x));
        const normalizedY = Math.max(edgePadding, Math.min(1 - edgePadding, y));
        
        this.updateTextLayer(id, {
            position: { x: normalizedX, y: normalizedY }
        });
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
        
        // Update gallery
        UI.renderGallery(this.state.canvases, this.state.selectedCanvasId);
    },
    
    // Create a new canvas
    createNewCanvas() {
        // Save current canvas first
        this.addCurrentCanvasToGallery();
        
        // Reset to default state
        this.state.selectedImage = null;
        this.state.textLayers = [];
        this.state.selectedTextLayerId = null;
        this.state.currentCanvasId = `canvas_${Date.now()}`;
        this.state.selectedCanvasId = this.state.currentCanvasId;
        
        // Reset all settings to defaults
        this.resetUIToDefaults();
        
        // Show upload prompt
        document.getElementById('image-drop-zone').classList.remove('hidden');
        
        // Render empty canvas
        this.renderPreview();
        
        // Update gallery
        UI.renderGallery(this.state.canvases, this.state.selectedCanvasId);
        
        // Track canvas creation analytics
        setTimeout(async () => {
            try {
                if (window.Analytics && window.Analytics.trackCanvasCreated) {
                    await window.Analytics.trackCanvasCreated();
                    console.log('📊 Manual canvas creation tracked successfully');
                }
            } catch (analyticsError) {
                console.error('📊 Failed to track manual canvas creation:', analyticsError);
            }
        }, 100);
        
        console.log('New canvas created');
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
        
        // Update background selection
        UI.updateBackgroundSelection('#FFFFFF', null, null);
        
        // Clear text editor
        UI.hideTextEditor();
        UI.renderTextLayers([], null);
        
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
            // Show loading state
            const exportBtn = document.getElementById('export-btn');
            if (exportBtn) {
                exportBtn.disabled = true;
                exportBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Exporting...';
            }
            
            // Skip server verification completely when running locally OR on frameit.social without proper backend
            if (isRunningLocally) {
                console.log('📝 Skipping server verification - running locally or no backend available');
            } else {
                // Check if user is authenticated
                const currentUser = window.Auth?.getCurrentUser();
                const currentSession = window.Auth?.getCurrentSession();
                
                if (!currentUser || !currentSession) {
                    window.Auth?.showAuthModal('login');
                    return;
                }
                
                // Update loading message
                if (exportBtn) {
                    exportBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verifying...';
                }
                
                // Only do server verification if we have a proper backend setup
                try {
                    const verificationResponse = await fetch('/api/verify-export-permission', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${currentSession.access_token}`
                        }
                    });
                    
                    // If the endpoint doesn't exist (404) or server error (500), just proceed with export
                    if (verificationResponse.status === 404 || verificationResponse.status === 500) {
                        console.log('📝 Backend verification unavailable - proceeding with export');
                    } else {
                        // Handle the response normally
                        const contentType = verificationResponse.headers.get('content-type');
                        let verificationResult;
                        
                        if (contentType && contentType.includes('application/json')) {
                            verificationResult = await verificationResponse.json();
                        } else {
                            // Server returned HTML or plain text (likely an error page)
                            console.log('📝 Server returned non-JSON response - proceeding with export');
                        }
                        
                        if (!verificationResponse.ok && verificationResult) {
                            if (verificationResult.subscription_required) {
                                this.showUpgradePrompt(verificationResult.usage);
                                return;
                            } else {
                                throw new Error(verificationResult.error || 'Export verification failed');
                            }
                        }
                    }
                } catch (fetchError) {
                    // If fetch fails (no server), just proceed with export
                    console.log('📝 Server not available - proceeding with export:', fetchError.message);
                }
            }
            
            // Export is approved (or running locally), proceed with actual export
            if (exportBtn) {
                exportBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Exporting...';
            }
            
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
            
            // Scale and draw the original canvas
            ctx.drawImage(canvas, 0, 0, exportWidth, exportHeight);
            
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
            a.download = `frameit-export-${Date.now()}.${exportFormat}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            // Track export analytics - ensure this always runs with detailed logging
            try {
                console.log('📊 Attempting to track export...');
                if (window.Analytics && window.Analytics.trackExport) {
                    console.log('📊 Analytics module found, calling trackExport...');
                    const result = await window.Analytics.trackExport();
                    console.log('📊 Export tracked successfully:', result);
                } else {
                    console.log('📊 Analytics not available:', {
                        analyticsExists: !!window.Analytics,
                        trackExportExists: !!(window.Analytics && window.Analytics.trackExport)
                    });
                }
            } catch (analyticsError) {
                console.error('📊 Failed to track export:', analyticsError);
                console.error('📊 Analytics error details:', {
                    message: analyticsError.message,
                    stack: analyticsError.stack,
                    analyticsState: window.Analytics?.state
                });
            }
            
            console.log('✅ Export completed successfully');
            
        } catch (error) {
            console.error('Export failed:', error);
            this.showNotification('Export failed. Please try again.', 'error');
        } finally {
            // Reset export button
            const exportBtn = document.getElementById('export-btn');
            if (exportBtn) {
                exportBtn.disabled = false;
                exportBtn.innerHTML = '<i class="fas fa-download"></i> Export';
            }
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
        
        // Track background change
        if (window.Analytics && window.Analytics.trackExport) {
            console.log('📊 Background changed');
        }
        
        this.renderPreview();
        this.saveSettings();
        
        // Update UI selection
        UI.updateBackgroundSelection(null, gradientId, null);
    },

    // Set background blur
    setBackgroundBlur(value) {
        this.state.backgroundBlurRadius = Number(value);
        document.getElementById('bg-blur-value').textContent = `${value}px`;
        this.renderPreview();
        this.saveSettings();
    },

    // Set corner radius
    setCornerRadius(value) {
        this.saveStateForUndo();
        this.state.cornerRadius = Number(value);
        document.getElementById('corner-radius-value').textContent = `${value}px`;
        this.renderPreview();
        this.saveSettings();
    },

    // Set padding
    setPadding(value) {
        this.saveStateForUndo();
        this.state.padding = Number(value);
        document.getElementById('padding-value').textContent = `${value}px`;
        this.renderPreview();
        this.saveSettings();
    },

    // Set shadow opacity
    setShadowOpacity(value) {
        this.saveStateForUndo();
        this.state.shadowOpacity = Number(value);
        document.getElementById('shadow-opacity-value').textContent = `${Math.round(value * 100)}%`;
        this.renderPreview();
        this.saveSettings();
    },

    // Set shadow radius
    setShadowRadius(value) {
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

    // Render preview (main rendering function)
    renderPreview() {
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
            noiseOverlay: noiseOverlay,
            noiseOverlayIntensity: this.state.noiseOverlayIntensity,
            noiseOpacity: this.state.noiseOpacity,
            noiseBlendMode: this.state.noiseBlendMode,
            noiseScale: this.state.noiseScale,
            noiseInvert: this.state.noiseInvert,
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
            textLayers: this.state.textLayers,
            watermarkImage: this.state.watermarkImage,
            watermarkOpacity: this.state.watermarkOpacity,
            watermarkScale: this.state.watermarkScale,
            watermarkPosition: this.state.watermarkPosition
        });
    },

    // Capture a screenshot
    captureScreenshot() {
        UI.showError('Screenshot capture is only available in desktop applications');
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
        UI.updateButtonStates();
    },

    // Apply current settings to all canvases
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
    }
};

// Initialize the application when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.App.init();
});

console.log('✅ FrameIt app.js loaded successfully'); 
