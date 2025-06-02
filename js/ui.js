/**
 * UI Manager for the Screenshot Mockup Tool
 */

window.UI = {
    // State
    state: {
        expandedCategories: new Set(['standard']),
        isHistoryModalVisible: false,
        isDraggingOver: false
    },
    
    // DOM Elements
    elements: {},
    
    // Initialize the UI
    init() {
        // Reset rendering flags
        this._gradientSectionsRendered = false;
        
        this.cacheElements();
        this.setupEventListeners();
        this.renderTemplates(); // Render templates in their own section
        this.renderBackgroundImages(); // This will render colors and gradients
        this.updateButtonStates();
        
        // Initialize zoom state
        this.zoomLevel = 1;
        this.isDragging = false;
        this.lastMouseX = 0;
        this.lastMouseY = 0;
        
        // Initialize collapsible panels
        this.initCollapsiblePanels();
        
        // Initialize collapsible sections
        this.initCollapsibleSections();
        
        // Initialize subsections (new)
        this.initCollapsibleSubsections();
        
        // Initialize resolutions
        this.initializeResolutions();
        
        // Initial resize to set proper canvas dimensions
        setTimeout(() => this.handleWindowResize(), 100);
        
        // Initialize canvas drag/pan functionality
        this.setupCanvasDrag();
        
        // Reset gradient sections flag to ensure proper rendering
        this._gradientSectionsRendered = false;
    },
    
    // Cache DOM elements for better performance
    cacheElements() {
        // Main elements
        this.elements.canvasPreview = document.getElementById('canvas-preview');
        this.elements.previewCanvas = document.getElementById('preview-canvas');
        this.elements.imageDropZone = document.getElementById('image-drop-zone');
        this.elements.fileInput = document.getElementById('file-input');
        
        // Buttons
        this.elements.uploadBtn = document.getElementById('upload-btn');
        this.elements.exportBtn = document.getElementById('export-btn');
        this.elements.randomBgBtn = document.getElementById('random-bg-btn');
        this.elements.flipHBtn = document.getElementById('flip-h-btn');
        this.elements.flipVBtn = document.getElementById('flip-v-btn');
        
        // Reset buttons
        this.elements.resetBlurBtn = document.getElementById('reset-blur-btn');
        this.elements.resetCornerBtn = document.getElementById('reset-corner-btn');
        this.elements.resetPaddingBtn = document.getElementById('reset-padding-btn');
        this.elements.resetShadowOpacityBtn = document.getElementById('reset-shadow-opacity-btn');
        this.elements.resetShadowRadiusBtn = document.getElementById('reset-shadow-radius-btn');
        this.elements.resetShadowOffsetXBtn = document.getElementById('reset-shadow-offset-x-btn');
        this.elements.resetShadowOffsetYBtn = document.getElementById('reset-shadow-offset-y-btn');
        this.elements.resetShadowColorBtn = document.getElementById('reset-shadow-color-btn');
        this.elements.resetRotationBtn = document.getElementById('reset-rotation-btn');
        
        // Sliders
        this.elements.bgBlurSlider = document.getElementById('bg-blur-slider');
        this.elements.cornerRadiusSlider = document.getElementById('corner-radius-slider');
        this.elements.paddingSlider = document.getElementById('padding-slider');
        this.elements.shadowOpacitySlider = document.getElementById('shadow-opacity-slider');
        this.elements.shadowRadiusSlider = document.getElementById('shadow-radius-slider');
        this.elements.shadowOffsetXSlider = document.getElementById('shadow-offset-x-slider');
        this.elements.shadowOffsetYSlider = document.getElementById('shadow-offset-y-slider');
        this.elements.shadowColorInput = document.getElementById('shadow-color-input');
        this.elements.rotationSlider = document.getElementById('rotation-slider');
        
        // Value displays
        this.elements.blurValue = document.getElementById('blur-value');
        this.elements.cornerRadiusValue = document.getElementById('corner-radius-value');
        this.elements.paddingValue = document.getElementById('padding-value');
        this.elements.shadowOpacityValue = document.getElementById('shadow-opacity-value');
        this.elements.shadowRadiusValue = document.getElementById('shadow-radius-value');
        this.elements.shadowOffsetXValue = document.getElementById('shadow-offset-x-value');
        this.elements.shadowOffsetYValue = document.getElementById('shadow-offset-y-value');
        this.elements.shadowColorValue = document.getElementById('shadow-color-value');
        this.elements.rotationValue = document.getElementById('rotation-value');
        
        // Shadow position control
        this.elements.shadowPositionGrid = document.querySelector('.shadow-position-grid');
        this.elements.shadowPositionHandle = document.getElementById('shadow-position-handle');
        
        // Containers
        this.elements.colorSwatches = document.getElementById('color-swatches');
        this.elements.gradientSwatches = document.getElementById('gradient-swatches');
        this.elements.abstractGradients = document.getElementById('abstract-gradients');
        this.elements.refractions = document.getElementById('refractions');
        this.elements.blackLiquid = document.getElementById('black-liquid');
        this.elements.categoryHeaders = document.querySelectorAll('.category-header');
        this.elements.galleryContainer = document.getElementById('gallery-container');
        this.elements.galleryContent = document.getElementById('gallery-content');
        
        // Modal elements
        this.elements.historyModal = document.getElementById('history-modal');
        this.elements.modalCloseBtn = document.querySelector('.modal-close-btn');
        this.elements.historyItems = document.getElementById('history-items');
        this.elements.emptyHistory = document.getElementById('empty-history');
        this.elements.clearHistoryBtn = document.getElementById('clear-history-btn');
        
        // Export settings modal elements
        this.elements.exportSettingsModal = document.getElementById('export-settings-modal');
        this.elements.exportSettingsCloseBtn = document.getElementById('export-settings-close-btn');
        this.elements.exportDimensionSelect = document.getElementById('export-dimension-select');
        this.elements.customSizeControls = document.getElementById('custom-size-controls');
        this.elements.customWidthInput = document.getElementById('custom-width');
        this.elements.customHeightInput = document.getElementById('custom-height');
        this.elements.maintainAspectRatio = document.getElementById('maintain-aspect-ratio');
        this.elements.exportFormatSelect = document.getElementById('export-format-select');
        this.elements.exportQualitySelect = document.getElementById('export-quality-select');
        this.elements.qualityContainer = document.getElementById('quality-container');
        this.elements.cancelExportBtn = document.getElementById('cancel-export-btn');
        this.elements.confirmExportBtn = document.getElementById('confirm-export-btn');
        
        // Sidebar panels
        this.elements.galleryPanel = document.querySelector('.gallery-bar');
        this.elements.controlPanels = document.querySelector('.control-panels');
        
        // Zoom controls
        this.elements.zoomInBtn = document.getElementById('zoom-in-btn');
        this.elements.zoomOutBtn = document.getElementById('zoom-out-btn');
        this.elements.zoomResetBtn = document.getElementById('zoom-reset-btn');
        
        // Text layers elements
        this.elements.textLayersList = document.getElementById('text-layers-list');
        this.elements.addTextBtn = document.getElementById('add-text-btn');
        this.elements.textEditor = document.getElementById('text-editor');
        this.elements.textContent = document.getElementById('text-content');
        this.elements.fontSizeSlider = document.getElementById('font-size-slider');
        this.elements.fontSizeValue = document.getElementById('font-size-value');
        this.elements.fontFamilySelect = document.getElementById('font-family-select');
        this.elements.textColorInput = document.getElementById('text-color-input');
        this.elements.textOpacitySlider = document.getElementById('text-opacity-slider');
        this.elements.textOpacityValue = document.getElementById('text-opacity-value');
        this.elements.alignLeftBtn = document.getElementById('align-left-btn');
        this.elements.alignCenterBtn = document.getElementById('align-center-btn');
        this.elements.alignRightBtn = document.getElementById('align-right-btn');
        this.elements.boldBtn = document.getElementById('bold-btn');
        this.elements.italicBtn = document.getElementById('italic-btn');
        this.elements.underlineBtn = document.getElementById('underline-btn');
        this.elements.deleteTextBtn = document.getElementById('delete-text-btn');
        this.elements.duplicateTextBtn = document.getElementById('duplicate-text-btn');
        
        // New text layer controls
        this.elements.bringToFrontBtn = document.getElementById('bring-to-front-btn');
        this.elements.sendToBackBtn = document.getElementById('send-to-back-btn');
        this.elements.textShadowToggle = document.getElementById('text-shadow-toggle');
        this.elements.textShadowOptions = document.getElementById('text-shadow-options');
        this.elements.textShadowColor = document.getElementById('text-shadow-color');
        this.elements.textShadowBlurSlider = document.getElementById('text-shadow-blur-slider');
        this.elements.textShadowBlurValue = document.getElementById('text-shadow-blur-value');
        this.elements.textBgToggle = document.getElementById('text-bg-toggle');
        this.elements.textBgOptions = document.getElementById('text-bg-options');
        this.elements.textBgColor = document.getElementById('text-bg-color');
        this.elements.textPaddingSlider = document.getElementById('text-padding-slider');
        this.elements.textPaddingValue = document.getElementById('text-padding-value');
    },
    
    // Setup event listeners
    setupEventListeners() {
        // Button events
        this.elements.uploadBtn.addEventListener('click', () => window.App.createNewCanvas());
        this.elements.exportBtn.addEventListener('click', () => this.showExportSettingsModal());
        this.elements.randomBgBtn.addEventListener('click', () => window.App.selectRandomBackground());
        this.elements.flipHBtn.addEventListener('click', () => window.App.toggleFlipHorizontal());
        this.elements.flipVBtn.addEventListener('click', () => window.App.toggleFlipVertical());
        
        // Help button
        const helpBtn = document.getElementById('help-btn');
        if (helpBtn) {
            helpBtn.addEventListener('click', () => this.showHelpModal());
        }
        
        // Gallery buttons
        const applyToAllBtn = document.getElementById('apply-to-all-btn');
        if (applyToAllBtn) {
            applyToAllBtn.addEventListener('click', () => window.App.applySettingsToAll());
        }
        
        const exportAllBtn = document.getElementById('export-all-btn');
        if (exportAllBtn) {
            exportAllBtn.addEventListener('click', () => window.App.exportAllImages());
        }
        
        // Reset button events
        this.elements.resetBlurBtn.addEventListener('click', () => window.App.resetBlur());
        this.elements.resetCornerBtn.addEventListener('click', () => window.App.resetCornerRadius());
        this.elements.resetPaddingBtn.addEventListener('click', () => window.App.resetPadding());
        this.elements.resetShadowOpacityBtn.addEventListener('click', () => window.App.resetShadowOpacity());
        this.elements.resetShadowRadiusBtn.addEventListener('click', () => window.App.resetShadowRadius());
        this.elements.resetShadowOffsetXBtn.addEventListener('click', () => window.App.resetShadowOffsetX());
        this.elements.resetShadowOffsetYBtn.addEventListener('click', () => window.App.resetShadowOffsetY());
        this.elements.resetShadowColorBtn.addEventListener('click', () => window.App.resetShadowColor());
        this.elements.resetRotationBtn.addEventListener('click', () => window.App.resetRotation());
        
        // Slider events
        this.elements.bgBlurSlider.addEventListener('input', (e) => window.App.setBackgroundBlur(e.target.value));
        this.elements.cornerRadiusSlider.addEventListener('input', (e) => window.App.setCornerRadius(e.target.value));
        this.elements.paddingSlider.addEventListener('input', (e) => window.App.setPadding(e.target.value));
        this.elements.shadowOpacitySlider.addEventListener('input', (e) => window.App.setShadowOpacity(e.target.value));
        this.elements.shadowRadiusSlider.addEventListener('input', (e) => window.App.setShadowRadius(e.target.value));
        this.elements.shadowOffsetXSlider.addEventListener('input', (e) => window.App.setShadowOffsetX(e.target.value));
        this.elements.shadowOffsetYSlider.addEventListener('input', (e) => window.App.setShadowOffsetY(e.target.value));
        this.elements.shadowColorInput.addEventListener('input', (e) => {
            // Real-time update during color selection
            window.App.setShadowColor(e.target.value);
        });
        this.elements.rotationSlider.addEventListener('input', (e) => window.App.setRotation(e.target.value));
        
        // Shadow position control
        this.setupShadowPositionControl();
        
        // File input change
        this.elements.fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                window.App.handleFileSelect(e.target.files);
                // Reset the file input value to allow uploading the same file again
                e.target.value = '';
            }
        });
        
        // Category header clicks
        this.elements.categoryHeaders.forEach(header => {
            header.addEventListener('click', () => this.toggleCategory(header.dataset.category));
        });
        
        // Modal events
        this.elements.modalCloseBtn.addEventListener('click', () => this.hideHistoryModal());
        this.elements.clearHistoryBtn.addEventListener('click', () => window.App.clearHistory());
        
        // Help modal close button
        const helpCloseBtn = document.getElementById('help-close-btn');
        if (helpCloseBtn) {
            helpCloseBtn.addEventListener('click', () => this.hideHelpModal());
        }
        
        // Drag and drop events
        this.elements.imageDropZone.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.elements.imageDropZone.addEventListener('dragleave', () => this.handleDragLeave());
        this.elements.imageDropZone.addEventListener('drop', (e) => this.handleDrop(e));
        
        // Click to browse files
        this.elements.imageDropZone.addEventListener('click', () => this.elements.fileInput.click());
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        
        // Window resize event
        window.addEventListener('resize', () => this.handleWindowResize());
        
        // Setup resolution option clicks
        this.setupResolutionOptions();
        
        // Export settings modal
        this.elements.exportSettingsCloseBtn.addEventListener('click', () => this.hideExportSettingsModal());
        this.elements.cancelExportBtn.addEventListener('click', () => this.hideExportSettingsModal());
        this.elements.confirmExportBtn.addEventListener('click', () => this.handleExportConfirm());
        
        // Export dimension change
        this.elements.exportDimensionSelect.addEventListener('change', () => this.handleExportDimensionChange());
        
        // Export format change
        this.elements.exportFormatSelect.addEventListener('change', () => this.handleExportFormatChange());
        
        // Custom size with aspect ratio
        this.elements.customWidthInput.addEventListener('input', () => this.handleCustomWidthChange());
        this.elements.customHeightInput.addEventListener('input', () => this.handleCustomHeightChange());
        
        // Shadow color input needs extra handling for proper updates
        this.elements.shadowColorInput.addEventListener('change', (e) => {
            // On change event (when color picker is closed) we force update the preview
            window.App.setShadowColor(e.target.value);
        });
        
        // Throttle the input event for better performance
        let shadowColorTimeout;
        this.elements.shadowColorInput.addEventListener('input', (e) => {
            // Update color display immediately for visual feedback
            document.getElementById('shadow-color-value').textContent = e.target.value;
            
            // Throttle the expensive renderPreview call
            clearTimeout(shadowColorTimeout);
            shadowColorTimeout = setTimeout(() => {
                window.App.setShadowColor(e.target.value);
            }, 50); // 50ms throttle
        });
        
        // Zoom controls
        this.elements.zoomInBtn.addEventListener('click', () => this.zoomIn());
        this.elements.zoomOutBtn.addEventListener('click', () => this.zoomOut());
        this.elements.zoomResetBtn.addEventListener('click', () => this.resetZoom());
        
        // Zoom with mousewheel when hovering over canvas
        const canvasWrapper = document.querySelector('.canvas-wrapper');
        if (canvasWrapper) {
            canvasWrapper.addEventListener('wheel', (e) => {
                if (e.ctrlKey || e.metaKey) {
                    this.handleWheelZoom(e);
                }
            }, { passive: false });
        }
        
        // Setup drag functionality for canvas
        this.setupCanvasDrag();

        // Text layer controls
        if (this.elements.addTextBtn) {
            this.elements.addTextBtn.addEventListener('click', () => {
                window.App.addTextLayer();
            });
        }

        // Text editor controls
        if (this.elements.textContent) {
            this.elements.textContent.addEventListener('input', (e) => {
                if (!window.App.state.selectedTextLayerId) return;
                window.App.updateTextLayer(window.App.state.selectedTextLayerId, { text: e.target.value });
            });
        }

        if (this.elements.fontSizeSlider) {
            this.elements.fontSizeSlider.addEventListener('input', (e) => {
                if (!window.App.state.selectedTextLayerId) return;
                const fontSize = parseInt(e.target.value);
                this.elements.fontSizeValue.textContent = `${fontSize}px`;
                window.App.updateTextLayer(window.App.state.selectedTextLayerId, { fontSize });
            });
        }

        if (this.elements.fontFamilySelect) {
            this.elements.fontFamilySelect.addEventListener('change', (e) => {
                if (!window.App.state.selectedTextLayerId) return;
                const fontFamily = e.target.value;
                window.App.updateTextLayer(window.App.state.selectedTextLayerId, { fontFamily });
            });
        }

        if (this.elements.textColorInput) {
            this.elements.textColorInput.addEventListener('input', (e) => {
                if (!window.App.state.selectedTextLayerId) return;
                const color = e.target.value;
                window.App.updateTextLayer(window.App.state.selectedTextLayerId, { color });
            });
        }

        if (this.elements.textOpacitySlider) {
            this.elements.textOpacitySlider.addEventListener('input', (e) => {
                if (!window.App.state.selectedTextLayerId) return;
                const opacity = parseFloat(e.target.value);
                this.elements.textOpacityValue.textContent = `${Math.round(opacity * 100)}%`;
                window.App.updateTextLayer(window.App.state.selectedTextLayerId, { opacity });
            });
        }

        // Text alignment buttons
        if (this.elements.alignLeftBtn) {
            this.elements.alignLeftBtn.addEventListener('click', () => {
                if (!window.App.state.selectedTextLayerId) return;
                this.updateTextAlignment('left');
                window.App.updateTextLayer(window.App.state.selectedTextLayerId, { align: 'left' });
            });
        }

        if (this.elements.alignCenterBtn) {
            this.elements.alignCenterBtn.addEventListener('click', () => {
                if (!window.App.state.selectedTextLayerId) return;
                this.updateTextAlignment('center');
                window.App.updateTextLayer(window.App.state.selectedTextLayerId, { align: 'center' });
            });
        }

        if (this.elements.alignRightBtn) {
            this.elements.alignRightBtn.addEventListener('click', () => {
                if (!window.App.state.selectedTextLayerId) return;
                this.updateTextAlignment('right');
                window.App.updateTextLayer(window.App.state.selectedTextLayerId, { align: 'right' });
            });
        }

        // Text style buttons
        if (this.elements.boldBtn) {
            this.elements.boldBtn.addEventListener('click', () => {
                if (!window.App.state.selectedTextLayerId) return;
                const textLayer = window.App.getTextLayerById(window.App.state.selectedTextLayerId);
                const bold = !(textLayer && textLayer.bold);
                this.elements.boldBtn.classList.toggle('active', bold);
                window.App.updateTextLayer(window.App.state.selectedTextLayerId, { bold });
            });
        }

        if (this.elements.italicBtn) {
            this.elements.italicBtn.addEventListener('click', () => {
                if (!window.App.state.selectedTextLayerId) return;
                const textLayer = window.App.getTextLayerById(window.App.state.selectedTextLayerId);
                const italic = !(textLayer && textLayer.italic);
                this.elements.italicBtn.classList.toggle('active', italic);
                window.App.updateTextLayer(window.App.state.selectedTextLayerId, { italic });
            });
        }

        if (this.elements.underlineBtn) {
            this.elements.underlineBtn.addEventListener('click', () => {
                if (!window.App.state.selectedTextLayerId) return;
                const textLayer = window.App.getTextLayerById(window.App.state.selectedTextLayerId);
                const underline = !(textLayer && textLayer.underline);
                this.elements.underlineBtn.classList.toggle('active', underline);
                window.App.updateTextLayer(window.App.state.selectedTextLayerId, { underline });
            });
        }

        // Text action buttons
        if (this.elements.deleteTextBtn) {
            this.elements.deleteTextBtn.addEventListener('click', () => {
                if (!window.App.state.selectedTextLayerId) return;
                window.App.deleteTextLayer(window.App.state.selectedTextLayerId);
            });
        }

        if (this.elements.duplicateTextBtn) {
            this.elements.duplicateTextBtn.addEventListener('click', () => {
                if (!window.App.state.selectedTextLayerId) return;
                window.App.duplicateTextLayer(window.App.state.selectedTextLayerId);
            });
        }

        // --- New Text Layer Controls ---
        
        // Bring to front button
        if (this.elements.bringToFrontBtn) {
            this.elements.bringToFrontBtn.addEventListener('click', () => {
                if (!window.App.state.selectedTextLayerId) return;
                window.App.bringTextLayerToFront(window.App.state.selectedTextLayerId);
            });
        }
        
        // Send to back button
        if (this.elements.sendToBackBtn) {
            this.elements.sendToBackBtn.addEventListener('click', () => {
                if (!window.App.state.selectedTextLayerId) return;
                window.App.sendTextLayerToBack(window.App.state.selectedTextLayerId);
            });
        }
        
        // Text shadow toggle
        if (this.elements.textShadowToggle) {
            this.elements.textShadowToggle.addEventListener('change', (e) => {
                if (!window.App.state.selectedTextLayerId) return;
                const shadow = e.target.checked;
                window.App.updateTextLayer(window.App.state.selectedTextLayerId, { shadow });
                
                // Show/hide shadow options
                if (this.elements.textShadowOptions) {
                    this.elements.textShadowOptions.style.display = shadow ? 'block' : 'none';
                }
            });
            
            // Initialize shadow options display
            if (this.elements.textShadowOptions) {
                this.elements.textShadowOptions.style.display = 'none';
            }
        }
        
        // Text shadow color
        if (this.elements.textShadowColor) {
            this.elements.textShadowColor.addEventListener('input', (e) => {
                if (!window.App.state.selectedTextLayerId) return;
                const shadowColor = e.target.value;
                window.App.updateTextLayer(window.App.state.selectedTextLayerId, { shadowColor });
            });
        }
        
        // Text shadow blur
        if (this.elements.textShadowBlurSlider) {
            this.elements.textShadowBlurSlider.addEventListener('input', (e) => {
                if (!window.App.state.selectedTextLayerId) return;
                const shadowBlur = parseInt(e.target.value);
                this.elements.textShadowBlurValue.textContent = `${shadowBlur}px`;
                window.App.updateTextLayer(window.App.state.selectedTextLayerId, { shadowBlur });
            });
        }
        
        // Text background toggle
        if (this.elements.textBgToggle) {
            this.elements.textBgToggle.addEventListener('change', (e) => {
                if (!window.App.state.selectedTextLayerId) return;
                
                if (e.target.checked) {
                    // Get current background color from input
                    const backgroundColor = this.elements.textBgColor.value || '#333333';
                    window.App.updateTextLayer(window.App.state.selectedTextLayerId, { backgroundColor });
                } else {
                    window.App.updateTextLayer(window.App.state.selectedTextLayerId, { backgroundColor: null });
                }
                
                // Show/hide background options
                if (this.elements.textBgOptions) {
                    this.elements.textBgOptions.style.display = e.target.checked ? 'block' : 'none';
                }
            });
            
            // Initialize background options display
            if (this.elements.textBgOptions) {
                this.elements.textBgOptions.style.display = 'none';
            }
        }
        
        // Text background color
        if (this.elements.textBgColor) {
            this.elements.textBgColor.addEventListener('input', (e) => {
                if (!window.App.state.selectedTextLayerId) return;
                const backgroundColor = e.target.value;
                window.App.updateTextLayer(window.App.state.selectedTextLayerId, { backgroundColor });
            });
        }
        
        // Text padding slider
        if (this.elements.textPaddingSlider) {
            this.elements.textPaddingSlider.addEventListener('input', (e) => {
                if (!window.App.state.selectedTextLayerId) return;
                const padding = parseInt(e.target.value);
                this.elements.textPaddingValue.textContent = `${padding}px`;
                window.App.updateTextLayer(window.App.state.selectedTextLayerId, { padding });
            });
        }
        
        // Quick position buttons
        document.querySelectorAll('.quick-pos-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (!window.App.state.selectedTextLayerId) return;
                
                const positions = {
                    'pos-top-left': { x: 0.1, y: 0.1 },
                    'pos-top': { x: 0.5, y: 0.1 },
                    'pos-top-right': { x: 0.9, y: 0.1 },
                    'pos-left': { x: 0.1, y: 0.5 },
                    'pos-center': { x: 0.5, y: 0.5 },
                    'pos-right': { x: 0.9, y: 0.5 },
                    'pos-bottom-left': { x: 0.1, y: 0.9 },
                    'pos-bottom': { x: 0.5, y: 0.9 },
                    'pos-bottom-right': { x: 0.9, y: 0.9 }
                };
                
                const id = e.currentTarget.id;
                if (positions[id]) {
                    window.App.updateTextLayerPosition(
                        window.App.state.selectedTextLayerId, 
                        positions[id].x, 
                        positions[id].y
                    );
                }
            });
        });
        
        // Background blur
        document.getElementById('bg-blur-slider')?.addEventListener('input', (e) => {
            const value = e.target.value;
            document.getElementById('blur-value').textContent = `${value}%`;
            App.setBackgroundBlur(value);
        });
        
        document.getElementById('reset-blur-btn')?.addEventListener('click', () => {
            App.resetBlur();
        });

        // Background twirl
        document.getElementById('bg-twirl-slider')?.addEventListener('input', (e) => {
            const value = e.target.value;
            document.getElementById('twirl-value').textContent = `${value}%`;
            App.setBackgroundTwirl(value);
        });

        // Background saturation
        document.getElementById('bg-saturation-slider')?.addEventListener('input', (e) => {
            const value = e.target.value;
            document.getElementById('saturation-value').textContent = `${value}%`;
            App.setBackgroundSaturation(value);
        });

        // Background hue rotation
        document.getElementById('bg-hue-slider')?.addEventListener('input', (e) => {
            const value = e.target.value;
            document.getElementById('hue-value').textContent = `${value}°`;
            App.setBackgroundHueRotation(value);
        });

        // Background contrast
        document.getElementById('bg-contrast-slider')?.addEventListener('input', (e) => {
            const value = e.target.value;
            document.getElementById('contrast-value').textContent = `${value}%`;
            App.setBackgroundContrast(value);
        });

        // Background brightness
        document.getElementById('bg-brightness-slider')?.addEventListener('input', (e) => {
            const value = e.target.value;
            document.getElementById('brightness-value').textContent = `${value}%`;
            App.setBackgroundBrightness(value);
        });

        // Background wave effect
        document.getElementById('bg-wave-slider')?.addEventListener('input', (e) => {
            const value = e.target.value;
            document.getElementById('wave-value').textContent = `${value}%`;
            App.setBackgroundWaveAmount(value);
        });

        // Background ripple effect
        document.getElementById('bg-ripple-slider')?.addEventListener('input', (e) => {
            const value = e.target.value;
            document.getElementById('ripple-value').textContent = `${value}%`;
            App.setBackgroundRippleAmount(value);
        });

        // Background zoom effect
        document.getElementById('bg-zoom-slider')?.addEventListener('input', (e) => {
            const value = e.target.value;
            document.getElementById('zoom-value').textContent = `${value}%`;
            App.setBackgroundZoomAmount(value);
        });

        // Background shake effect
        document.getElementById('bg-shake-slider')?.addEventListener('input', (e) => {
            const value = e.target.value;
            document.getElementById('shake-value').textContent = `${value}%`;
            App.setBackgroundShakeAmount(value);
        });

        // Background lens distortion
        document.getElementById('bg-lens-slider')?.addEventListener('input', (e) => {
            const value = e.target.value;
            document.getElementById('lens-value').textContent = `${value}%`;
            App.setBackgroundLensAmount(value);
        });

        // Reset all background effects
        document.getElementById('reset-bg-effects-btn')?.addEventListener('click', () => {
            App.resetBackgroundEffects();
        });
        
        // Noise overlay controls
        document.getElementById('noise-overlay-select')?.addEventListener('change', (e) => {
            const overlayId = e.target.value;
            if (overlayId === 'none') {
                App.setNoiseOverlay(null);
                // Hide intensity controls
                document.getElementById('noise-options').style.display = 'none';
            } else {
                App.setNoiseOverlay(overlayId);
                // Show intensity controls
                document.getElementById('noise-options').style.display = 'block';
            }
        });
        
        document.getElementById('noise-intensity-slider')?.addEventListener('input', (e) => {
            const value = e.target.value;
            document.getElementById('noise-intensity-value').textContent = `${Math.round(value * 100)}%`;
            App.setNoiseOverlayIntensity(value);
        });
        
        document.getElementById('reset-noise-intensity-btn')?.addEventListener('click', () => {
            document.getElementById('noise-intensity-slider').value = 1;
            document.getElementById('noise-intensity-value').textContent = '100%';
            App.setNoiseOverlayIntensity(1);
        });
        
        document.getElementById('noise-opacity-slider')?.addEventListener('input', (e) => {
            const value = e.target.value;
            document.getElementById('noise-opacity-value').textContent = `${Math.round(value * 100)}%`;
            App.setNoiseOpacity(value);
        });
        
        document.getElementById('reset-noise-opacity-btn')?.addEventListener('click', () => {
            const defaultOpacity = Config.defaultNoiseOpacity;
            document.getElementById('noise-opacity-slider').value = defaultOpacity;
            document.getElementById('noise-opacity-value').textContent = `${Math.round(defaultOpacity * 100)}%`;
            App.setNoiseOpacity(defaultOpacity);
        });
        
        document.getElementById('noise-blend-mode')?.addEventListener('change', (e) => {
            App.setNoiseBlendMode(e.target.value);
        });
        
        document.getElementById('noise-scale-slider')?.addEventListener('input', (e) => {
            const value = e.target.value;
            document.getElementById('noise-scale-value').textContent = `${Math.round(value * 100)}%`;
            App.setNoiseScale(value);
        });
        
        document.getElementById('reset-noise-scale-btn')?.addEventListener('click', () => {
            document.getElementById('noise-scale-slider').value = 1;
            document.getElementById('noise-scale-value').textContent = '100%';
            App.setNoiseScale(1);
        });
        
        document.getElementById('noise-invert-toggle')?.addEventListener('change', () => {
            App.toggleNoiseInvert();
        });
        
        document.getElementById('random-noise-btn')?.addEventListener('click', () => {
            App.selectRandomNoise();
        });
        
        document.getElementById('clear-noise-btn')?.addEventListener('click', () => {
            App.resetAllNoise();
            document.getElementById('noise-overlay-select').value = 'none';
            document.getElementById('noise-options').style.display = 'none';
        });
        
        // Gallery upload button
        document.getElementById('gallery-upload-btn')?.addEventListener('click', () => {
            // Create new canvas
            window.App.createNewCanvas();
        });
        
        // Close upload zone button
        document.getElementById('close-upload-zone')?.addEventListener('click', (e) => {
            e.stopPropagation();
            document.getElementById('image-drop-zone').classList.add('hidden');
        });
        
        // Add Image button
        document.getElementById('add-image-btn')?.addEventListener('click', () => {
            document.getElementById('file-input').click();
        });
    },
    
    // Setup shadow position control
    setupShadowPositionControl() {
        if (!this.elements.shadowPositionGrid || !this.elements.shadowPositionHandle) {
            console.warn('Shadow position elements not found!');
            return;
        }

        // Handle click on grid
        this.elements.shadowPositionGrid.addEventListener('mousedown', (e) => {
            // Get position relative to grid
            const rect = this.elements.shadowPositionGrid.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Convert to percentage and then to offset values (-50 to 50)
            const xPercent = x / rect.width;
            const yPercent = y / rect.height;
            const offsetX = Math.round((xPercent - 0.5) * 100);
            const offsetY = Math.round((yPercent - 0.5) * 100);

            // Update handle position
            this.updateShadowHandlePosition(xPercent, yPercent);

            // Update the application state
            window.App.setShadowOffset(offsetX, offsetY);

            // Start dragging
            this.startShadowHandleDrag();
        });

        // Initialize handle position
        this.updateShadowHandleFromState();
    },
    
    // Update shadow handle position based on current app state
    updateShadowHandleFromState() {
        const appState = window.App.state;
        const xPercent = (appState.shadowOffsetX + 50) / 100;
        const yPercent = (appState.shadowOffsetY + 50) / 100;
        this.updateShadowHandlePosition(xPercent, yPercent);
    },
    
    // Update shadow handle position with percentage values (0-1)
    updateShadowHandlePosition(xPercent, yPercent) {
        if (!this.elements.shadowPositionHandle) return;
        
        // Clamp values between 0 and 1
        xPercent = Math.max(0, Math.min(1, xPercent));
        yPercent = Math.max(0, Math.min(1, yPercent));
        
        // Convert percent to pixels
        const grid = this.elements.shadowPositionGrid;
        const left = xPercent * grid.clientWidth;
        const top = yPercent * grid.clientHeight;
        
        // Update handle position
        this.elements.shadowPositionHandle.style.left = `${left}px`;
        this.elements.shadowPositionHandle.style.top = `${top}px`;
        
        // Update sliders to match
        const offsetX = Math.round((xPercent - 0.5) * 100);
        const offsetY = Math.round((yPercent - 0.5) * 100);
        
        if (this.elements.shadowOffsetXSlider && this.elements.shadowOffsetYSlider) {
            this.elements.shadowOffsetXSlider.value = offsetX;
            this.elements.shadowOffsetYSlider.value = offsetY;
        }
    },
    
    // Start dragging the shadow handle
    startShadowHandleDrag() {
        const onMouseMove = (e) => {
            const rect = this.elements.shadowPositionGrid.getBoundingClientRect();
            const xPercent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
            const yPercent = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
            
            // Update handle position
            this.updateShadowHandlePosition(xPercent, yPercent);
            
            // Calculate and set shadow offsets
            const offsetX = Math.round((xPercent - 0.5) * 100);
            const offsetY = Math.round((yPercent - 0.5) * 100);
            window.App.setShadowOffset(offsetX, offsetY);
        };
        
        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            
            // Save state for undo when finished dragging
            window.App.saveStateForUndo();
        };
        
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    },
    
    // Handle keyboard shortcuts
    handleKeyDown(e) {
        // Use Ctrl+Z/Cmd+Z for undo
        if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
            if (!e.shiftKey) {
                window.App.undo();
            } else {
                window.App.redo();
            }
            e.preventDefault();
        }
        
        // Use Ctrl+Y/Cmd+Y for redo
        if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
            window.App.redo();
            e.preventDefault();
        }
        
        // Zoom controls with keyboard
        if ((e.ctrlKey || e.metaKey) && e.key === '=') {
            // Zoom in with Ctrl/Cmd + Plus
            this.zoomIn();
            e.preventDefault();
        }
        
        if ((e.ctrlKey || e.metaKey) && e.key === '-') {
            // Zoom out with Ctrl/Cmd + Minus
            this.zoomOut();
            e.preventDefault();
        }
        
        if ((e.ctrlKey || e.metaKey) && e.key === '0') {
            // Reset zoom with Ctrl/Cmd + 0
            this.resetZoom();
            e.preventDefault();
        }
    },
    
    // Handle drag over event for file dropping
    handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        
        if (!this.state.isDraggingOver) {
            this.state.isDraggingOver = true;
            this.elements.imageDropZone.classList.add('drag-over');
        }
    },
    
    // Handle drag leave event
    handleDragLeave() {
        this.state.isDraggingOver = false;
        this.elements.imageDropZone.classList.remove('drag-over');
    },
    
    // Handle drop event for files
    handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        
        this.state.isDraggingOver = false;
        this.elements.imageDropZone.classList.remove('drag-over');
        
        if (e.dataTransfer.files.length > 0) {
            window.App.handleFileSelect(e.dataTransfer.files);
        }
    },
    
    // Toggle category expansion
    toggleCategory(categoryId) {
        const content = document.querySelector(`.category-content[data-category="${categoryId}"]`);
        const header = document.querySelector(`.category-header[data-category="${categoryId}"]`);
        const icon = header.querySelector('i');
        
        if (content.classList.contains('hidden')) {
            // Expand
            content.classList.remove('hidden');
            icon.classList.remove('fa-chevron-right');
            icon.classList.add('fa-chevron-down');
            this.state.expandedCategories.add(categoryId);
        } else {
            // Collapse
            content.classList.add('hidden');
            icon.classList.remove('fa-chevron-down');
            icon.classList.add('fa-chevron-right');
            this.state.expandedCategories.delete(categoryId);
        }
    },
    
    // Show or hide the history modal
    toggleHistoryModal() {
        if (this.state.isHistoryModalVisible) {
            this.hideHistoryModal();
        } else {
            this.showHistoryModal();
        }
    },
    
    // Show the history modal
    showHistoryModal() {
        this.elements.historyModal.classList.add('visible');
        this.state.isHistoryModalVisible = true;
        window.App.loadHistory();
    },
    
    // Hide the history modal
    hideHistoryModal() {
        this.elements.historyModal.classList.remove('visible');
        this.state.isHistoryModalVisible = false;
    },
    
    // Show the image drop zone
    showDropZone() {
        this.elements.imageDropZone.classList.remove('hidden');
    },
    
    // Hide the image drop zone
    hideDropZone() {
        this.elements.imageDropZone.classList.add('hidden');
    },
    
    // Update UI button states based on application state
    updateButtonStates() {
        const appState = window.App.state;
        
        // Enable/disable buttons
        this.elements.exportBtn.disabled = false; // Always allow export - supports text/background-only designs
        
        // Update export button text based on content
        const exportBtnText = this.elements.exportBtn.querySelector('span');
        if (exportBtnText) {
            exportBtnText.textContent = appState.selectedImage ? 'Export Mockup' : 'Export Design';
        }
        
        // Update reset buttons
        this.elements.resetBlurBtn.disabled = appState.backgroundBlurRadius === 0;
        this.elements.resetCornerBtn.disabled = appState.cornerRadius === Config.defaultCornerRadius;
        this.elements.resetPaddingBtn.disabled = appState.padding === Config.defaultPadding;
        this.elements.resetShadowOpacityBtn.disabled = appState.shadowOpacity === Config.defaultShadowOpacity;
        this.elements.resetShadowRadiusBtn.disabled = appState.shadowRadius === Config.defaultShadowRadius;
        this.elements.resetShadowOffsetXBtn.disabled = appState.shadowOffsetX === Config.defaultShadowOffsetX;
        this.elements.resetShadowOffsetYBtn.disabled = appState.shadowOffsetY === Config.defaultShadowOffsetY;
        this.elements.resetShadowColorBtn.disabled = appState.shadowColor === Config.defaultShadowColor;
        this.elements.resetRotationBtn.disabled = appState.rotation === Config.defaultRotation;
        
        // Update value displays
        this.elements.blurValue.textContent = `${Math.round(appState.backgroundBlurRadius * 5)}%`;
        this.elements.cornerRadiusValue.textContent = `${appState.cornerRadius}px`;
        this.elements.paddingValue.textContent = `${appState.padding}px`;
        this.elements.shadowOpacityValue.textContent = `${Math.round(appState.shadowOpacity * 100)}%`;
        this.elements.shadowRadiusValue.textContent = `${appState.shadowRadius}px`;
        this.elements.shadowOffsetXValue.textContent = `${appState.shadowOffsetX}px`;
        this.elements.shadowOffsetYValue.textContent = `${appState.shadowOffsetY}px`;
        this.elements.shadowColorValue.textContent = appState.shadowColor;
        this.elements.rotationValue.textContent = `${appState.rotation}°`;
        
        // Also ensure all slider values match current state
        if (this.elements.cornerRadiusSlider) this.elements.cornerRadiusSlider.value = appState.cornerRadius;
        if (this.elements.paddingSlider) this.elements.paddingSlider.value = appState.padding;
        if (this.elements.shadowOpacitySlider) this.elements.shadowOpacitySlider.value = appState.shadowOpacity;
        if (this.elements.shadowRadiusSlider) this.elements.shadowRadiusSlider.value = appState.shadowRadius;
        if (this.elements.shadowOffsetXSlider) this.elements.shadowOffsetXSlider.value = appState.shadowOffsetX;
        if (this.elements.shadowOffsetYSlider) this.elements.shadowOffsetYSlider.value = appState.shadowOffsetY;
        if (this.elements.shadowColorInput) this.elements.shadowColorInput.value = appState.shadowColor;
        if (this.elements.rotationSlider) this.elements.rotationSlider.value = appState.rotation;
        if (this.elements.bgBlurSlider) this.elements.bgBlurSlider.value = appState.backgroundBlurRadius;
        
        // Update shadow position handle
        this.updateShadowHandleFromState();
        
        // Update toggle buttons
        this.elements.flipHBtn.classList.toggle('active', appState.isFlippedHorizontally);
        this.elements.flipVBtn.classList.toggle('active', appState.isFlippedVertically);
        
        // Don't automatically show/hide drop zone here - let other functions control it
        // if (appState.selectedImage) {
        //     this.hideDropZone();
        // } else {
        //     this.showDropZone();
        // }
    },
    
    // Renders color swatches
    renderColorSwatches() {
        const container = document.getElementById('color-swatches');
        if (!container) {
            console.warn('Color swatches container not found');
            return;
        }
        
        container.innerHTML = '';
        
        Config.colorPresets.forEach(color => {
            const swatch = document.createElement('div');
            swatch.className = 'color-swatch';
            swatch.style.backgroundColor = color;
            swatch.dataset.color = color;
            
            swatch.addEventListener('click', () => window.App.setBackgroundColor(color));
            
            container.appendChild(swatch);
        });
        
        console.log('Rendered', Config.colorPresets.length, 'color swatches');
    },
    
    // Renders gradient swatches as separate sections
    renderGradientSwatches() {
        // This function is now handled by renderBackgroundImages which renders separate sections
        // We'll keep this for compatibility but it won't be called directly
        return;
    },
    
    // Renders background images in the sidebar
    renderBackgroundImages() {
        // Render colors in the existing background section
        this.renderColorSwatches();
        
        // Create separate gradient sections
        this.renderGradientSections();
        
        // Populate noise overlay options
        this.populateNoiseOverlayOptions();
    },
    
    // Render gradient sections as subsections within the background section
    renderGradientSections() {
        // Prevent multiple calls during initialization
        if (this._gradientSectionsRendered) {
            console.log('Gradient sections already rendered, skipping...');
            return;
        }
        
        console.log('Starting renderGradientSections');
        
        // Find the gradient container in the Color Options subsection
        const gradientContainer = document.getElementById('gradient-swatches');
        if (!gradientContainer) {
            console.error('Gradient container not found');
            return;
        }
        
        // Clear any existing gradients
        gradientContainer.innerHTML = '';
        
        // Define all gradients from all sections
        const allGradients = [
            ...Config.lightToDarkGradients,
            ...Config.colorSpectrumGradients,
            ...Config.natureEarthGradients,
            ...Config.creativeFusionGradients,
            ...Config.luxuryVibesGradients,
            ...Config.cosmicEnergyGradients,
            ...Config.retroVibesGradients
        ];
        
        console.log(`Rendering ${allGradients.length} gradients`);
        
        // Add all gradients to the single container
        allGradients.forEach(gradient => {
            const swatch = document.createElement('div');
            swatch.className = 'gradient-swatch';
            swatch.title = gradient.name;
            
            // Create gradient CSS - handle multiple colors and directions
            let gradientCSS;
            if (gradient.direction && (gradient.direction.includes('radial-gradient') || gradient.direction.includes('conic-gradient'))) {
                // For radial and conic gradients, use the full direction syntax
                gradientCSS = `${gradient.direction}, ${gradient.colors.join(', ')})`;
            } else {
                // For linear gradients
                const direction = gradient.direction || '45deg';
                gradientCSS = `linear-gradient(${direction}, ${gradient.colors.join(', ')})`;
            }
            swatch.style.background = gradientCSS;
            swatch.dataset.gradientId = gradient.id;
            
            swatch.addEventListener('click', () => window.App.setBackgroundGradient(gradient.id));
            
            gradientContainer.appendChild(swatch);
        });
        
        console.log('Finished rendering gradient swatches');
        
        // Mark as rendered to prevent duplicate calls
        this._gradientSectionsRendered = true;
    },
    
    // Renders templates
    renderTemplates() {
        const container = document.getElementById('templates-grid');
        if (!container) return;
        
        container.innerHTML = '';
        
        Config.templates.forEach(template => {
            const templateItem = document.createElement('div');
            templateItem.className = 'template-item';
            templateItem.dataset.templateId = template.id;
            
            // Create image element with thumbnail
            const img = document.createElement('img');
            img.src = template.thumbnail;
            img.alt = template.name;
            img.loading = 'lazy';
            
            // Create name overlay
            const nameOverlay = document.createElement('div');
            nameOverlay.className = 'template-item-name';
            nameOverlay.textContent = template.name;
            
            // Add click handler
            templateItem.addEventListener('click', () => window.App.applyTemplate(template.id));
            
            templateItem.appendChild(img);
            templateItem.appendChild(nameOverlay);
            container.appendChild(templateItem);
        });
    },
    
    // Populate noise overlay dropdown
    populateNoiseOverlayOptions() {
        const select = document.getElementById('noise-overlay-select');
        if (!select) return;
        
        // Clear existing options
        select.innerHTML = '';
        
        // Add noise overlay options
        Config.noiseOverlayTypes.forEach(overlay => {
            const option = document.createElement('option');
            option.value = overlay.id;
            option.textContent = overlay.name;
            select.appendChild(option);
        });
        
        // Set default to "No Noise"
        select.value = 'none';
    },
    
    // Renders history items
    renderHistory(historyItems) {
        const container = this.elements.historyItems;
        container.innerHTML = '';
        
        if (historyItems.length === 0) {
            this.elements.emptyHistory.style.display = 'flex';
            this.elements.historyItems.style.display = 'none';
            this.elements.clearHistoryBtn.disabled = true;
            return;
        }
        
        this.elements.emptyHistory.style.display = 'none';
        this.elements.historyItems.style.display = 'block';
        this.elements.clearHistoryBtn.disabled = false;
        
        historyItems.forEach(item => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            historyItem.dataset.id = item.id;
            
            // Create image container
            const imageContainer = document.createElement('div');
            imageContainer.className = 'history-item-image';
            
            // Create image
            const img = document.createElement('img');
            img.src = item.image;
            img.alt = item.name;
            
            imageContainer.appendChild(img);
            
            // Create info div
            const infoDiv = document.createElement('div');
            infoDiv.className = 'history-item-info';
            
            // Add name
            const nameSpan = document.createElement('div');
            nameSpan.className = 'history-item-name';
            nameSpan.textContent = item.name;
            
            // Add date
            const dateSpan = document.createElement('div');
            dateSpan.className = 'history-item-date';
            dateSpan.textContent = Utils.formatDate(item.date);
            
            infoDiv.appendChild(nameSpan);
            infoDiv.appendChild(dateSpan);
            
            // Create actions
            const actionsDiv = document.createElement('div');
            actionsDiv.className = 'history-item-actions';
            
            // Download button
            const downloadBtn = document.createElement('button');
            downloadBtn.className = 'history-item-btn download';
            downloadBtn.innerHTML = '<i class="fas fa-download"></i>';
            downloadBtn.title = 'Download';
            downloadBtn.addEventListener('click', () => window.App.downloadHistoryItem(item.id));
            
            // Delete button
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'history-item-btn delete';
            deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
            deleteBtn.title = 'Delete';
            deleteBtn.addEventListener('click', () => window.App.deleteHistoryItem(item.id));
            
            actionsDiv.appendChild(downloadBtn);
            actionsDiv.appendChild(deleteBtn);
            
            // Add elements to history item
            historyItem.appendChild(imageContainer);
            historyItem.appendChild(infoDiv);
            historyItem.appendChild(actionsDiv);
            
            container.appendChild(historyItem);
        });
    },
    
    // Renders gallery items
    renderGallery(canvases, selectedId) {
        const galleryContent = document.getElementById('gallery-content');
        galleryContent.innerHTML = '';
        
        // Always show gallery container even when empty
        document.getElementById('gallery-container').classList.remove('hidden');
        
        if (!canvases || canvases.length === 0) {
            // Show empty state message
            const emptyState = document.createElement('div');
            emptyState.className = 'empty-gallery';
            emptyState.innerHTML = `
                <div class="empty-gallery-content">
                    <i class="fas fa-paint-brush"></i>
                    <p>No canvases yet</p>
                    <p class="hint">Click "New Canvas" to start creating</p>
                </div>
            `;
            galleryContent.appendChild(emptyState);
            return;
        }
        
        canvases.forEach(canvas => {
            const galleryItem = document.createElement('div');
            galleryItem.className = 'gallery-item';
            if (canvas.id === selectedId) {
                galleryItem.classList.add('selected');
            }
            
            const imageContainer = document.createElement('div');
            imageContainer.className = 'gallery-item-image';
            
            // Create thumbnail - either from image or from canvas state
            const img = document.createElement('img');
            if (canvas.image) {
                // Canvas has an image
                const cornerRadius = canvas.settings?.cornerRadius || 8;
                img.src = CanvasRenderer.createThumbnail(canvas.image, 200, 200, cornerRadius);
                img.alt = 'Canvas';
            } else {
                // Canvas without image - create a thumbnail of the background/text
                img.src = this.createCanvasThumbnail(canvas);
                img.alt = 'Canvas';
            }
            imageContainer.appendChild(img);
            
            // Add remove button
            const removeBtn = document.createElement('div');
            removeBtn.className = 'gallery-item-remove';
            removeBtn.innerHTML = '<i class="fas fa-times"></i>';
            removeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                
                // Immediate visual feedback
                removeBtn.style.opacity = '0.5';
                removeBtn.style.pointerEvents = 'none';
                
                // Call remove function
                const success = window.App.removeCanvas(canvas.id);
                
                // Reset button state if removal failed
                if (!success) {
                    setTimeout(() => {
                        removeBtn.style.opacity = '';
                        removeBtn.style.pointerEvents = '';
                    }, 100);
                }
            });
            imageContainer.appendChild(removeBtn);
            
            galleryItem.appendChild(imageContainer);
            
            // Make item clickable
            galleryItem.addEventListener('click', () => {
                App.selectCanvasFromGallery(canvas.id);
            });
            
            galleryContent.appendChild(galleryItem);
        });
    },
    
    // Create thumbnail for canvas without image
    createCanvasThumbnail(canvas) {
        // Create a small canvas to render the background/text
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = 200;
        tempCanvas.height = 200;
        const ctx = tempCanvas.getContext('2d');
        
        // Draw background
        const settings = canvas.settings || {};
        if (settings.backgroundGradientId) {
            // Draw gradient background
            const gradient = Utils.getGradientById(settings.backgroundGradientId);
            if (gradient) {
                const canvasGradient = ctx.createLinearGradient(0, 0, 200, 200);
                canvasGradient.addColorStop(0, gradient.colors[0]);
                canvasGradient.addColorStop(1, gradient.colors[1]);
                ctx.fillStyle = canvasGradient;
                ctx.fillRect(0, 0, 200, 200);
            } else {
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, 200, 200);
            }
        } else if (settings.backgroundColor) {
            ctx.fillStyle = settings.backgroundColor;
            ctx.fillRect(0, 0, 200, 200);
        } else {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, 200, 200);
        }
        
        // Add indicators
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.lineWidth = 1;
        
        // Add text indicator if there are text layers
        if (canvas.textLayers && canvas.textLayers.length > 0) {
            ctx.font = 'bold 20px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('T', 100, 100);
            ctx.strokeText('T', 100, 100);
        }
        
        return tempCanvas.toDataURL();
    },
    
    // Updates selection states for background options
    updateBackgroundSelection(backgroundColor, gradientId, backgroundImageId) {
        // Remove all selected states
        document.querySelectorAll('.color-swatch.selected').forEach(el => el.classList.remove('selected'));
        document.querySelectorAll('.gradient-swatch.selected').forEach(el => el.classList.remove('selected'));
        document.querySelectorAll('.bg-image-item.selected').forEach(el => el.classList.remove('selected'));
        document.querySelectorAll('.template-item.selected').forEach(el => el.classList.remove('selected'));
        
        // Add selected state to the appropriate element
        if (backgroundImageId) {
            const imageElement = document.querySelector(`.bg-image-item[data-image-id="${backgroundImageId}"]`);
            if (imageElement) {
                imageElement.classList.add('selected');
            }
        } else if (gradientId) {
            const gradientElement = document.querySelector(`.gradient-swatch[data-gradient-id="${gradientId}"]`);
            if (gradientElement) {
                gradientElement.classList.add('selected');
            }
        } else if (backgroundColor) {
            const colorElement = document.querySelector(`.color-swatch[data-color="${backgroundColor}"]`);
            if (colorElement) {
                colorElement.classList.add('selected');
            }
        }
    },
    
    // Updates template selection
    updateTemplateSelection(templateId) {
        // Remove all template selections
        document.querySelectorAll('.template-item.selected').forEach(el => el.classList.remove('selected'));
        
        // Add selected state to the chosen template
        if (templateId) {
            const templateElement = document.querySelector(`.template-item[data-template-id="${templateId}"]`);
            if (templateElement) {
                templateElement.classList.add('selected');
            }
        }
    },
    
    // Get platform icon class
    getPlatformIconClass(platform) {
        const platformIcons = {
            'instagram': 'fab fa-instagram',
            'facebook': 'fab fa-facebook',
            'twitter': 'fab fa-twitter',
            'linkedin': 'fab fa-linkedin',
            'pinterest': 'fab fa-pinterest',
            'youtube': 'fab fa-youtube',
            'ios': 'fab fa-apple',
            'android': 'fab fa-android',
            'windows': 'fab fa-windows',
            'macos': 'fab fa-apple'
        };
        return platformIcons[platform] || 'fas fa-globe';
    },

    // Generate platform icons HTML
    generatePlatformIcons(platforms) {
        if (!platforms || platforms.length === 0) return '';
        
        const icons = platforms.map(platform => {
            const iconClass = this.getPlatformIconClass(platform);
            return `<span class="platform-icon"><i class="${iconClass}"></i></span>`;
        }).join('');
        
        return `<div class="platform-icons">${icons}</div>`;
    },

    // Updates selected resolution option
    updateResolutionSelection(resolutionId) {
        // Remove all selected states
        document.querySelectorAll('.resolution-option').forEach(el => {
            el.classList.remove('selected');
            el.querySelector('.check-icon i').className = 'far fa-circle';
        });
        
        // Add selected state to the chosen resolution
        const resOption = document.querySelector(`.resolution-option[data-width="${resolutionId}"]`);
        if (resOption) {
            resOption.classList.add('selected');
            resOption.querySelector('.check-icon i').className = 'fas fa-check-circle';
            
            // Make sure the category is expanded
            const category = resOption.closest('.category-content');
            if (category && category.classList.contains('hidden')) {
                const categoryId = category.dataset.category;
                this.toggleCategory(categoryId);
            }
        }
    },

    // Setup resolution option clicks
    setupResolutionOptions() {
        const resolutionOptions = document.querySelectorAll('.resolution-option');
        
        resolutionOptions.forEach(option => {
            option.addEventListener('click', () => {
                const width = parseInt(option.dataset.width, 10);
                const height = parseInt(option.dataset.height, 10);
                
                if (width && height) {
                    // Update the app state with new dimensions
                    App.setResolution(width, height);
                    
                    // Update UI to show selected resolution
                    this.updateSelectedResolution(option);
                }
            });
        });
    },

    // Update the UI to show selected resolution
    updateSelectedResolution(selectedOption) {
        // Remove selection from all options
        const allOptions = document.querySelectorAll('.resolution-option');
        allOptions.forEach(option => {
            option.classList.remove('selected');
            const checkIcon = option.querySelector('.check-icon i');
            if (checkIcon) {
                checkIcon.className = 'far fa-circle';
            }
        });
        
        // Add selection to the clicked option
        selectedOption.classList.add('selected');
        const checkIcon = selectedOption.querySelector('.check-icon i');
        if (checkIcon) {
            checkIcon.className = 'fas fa-check-circle';
        }
    },
    
    // Shows a loading indicator over the canvas
    showLoading() {
        const loader = document.createElement('div');
        loader.className = 'canvas-loader';
        loader.innerHTML = '<div class="spinner"></div><span>Loading...</span>';
        
        this.elements.canvasPreview.appendChild(loader);
    },
    
    // Hides the loading indicator
    hideLoading() {
        const loader = document.querySelector('.canvas-loader');
        if (loader) {
            loader.remove();
        }
    },
    
    // Handle window resize to maintain aspect ratio
    handleWindowResize() {
        // Only proceed if we have a canvas renderer with aspect ratio
        if (!CanvasRenderer.aspectRatio) return;
        
        // Get the preview dimensions
        const previewCanvas = document.getElementById('preview-canvas');
        const container = document.querySelector('.canvas-container');
        
        // Apply scale while maintaining aspect ratio
        const maxWidth = container.clientWidth * 0.5;
        const maxHeight = container.clientHeight * 0.5;
        
        let displayWidth, displayHeight;
        
        if (CanvasRenderer.aspectRatio > maxWidth / maxHeight) {
            // Width limited
            displayWidth = maxWidth;
            displayHeight = maxWidth / CanvasRenderer.aspectRatio;
        } else {
            // Height limited
            displayHeight = maxHeight;
            displayWidth = maxHeight * CanvasRenderer.aspectRatio;
        }
        
        // Apply base scale to canvas
        this.baseDisplayWidth = displayWidth;
        this.baseDisplayHeight = displayHeight;
        
        // Apply zoom if exists
        if (this.zoomLevel) {
            displayWidth *= this.zoomLevel;
            displayHeight *= this.zoomLevel;
        }
        
        // Update the canvas scale
        previewCanvas.style.width = `${displayWidth}px`;
        previewCanvas.style.height = `${displayHeight}px`;
    },
    
    // Show the export settings modal
    showExportSettingsModal(isBatchExport = false) {
        // Populate the options if needed
        this.populateExportOptions();
        
        // Store batch export flag in an element attribute
        this.elements.exportSettingsModal.dataset.batchExport = isBatchExport;
        
        // Update modal title based on mode
        const modalTitle = this.elements.exportSettingsModal.querySelector('.modal-header h3');
        if (modalTitle) {
            modalTitle.textContent = isBatchExport ? 'Batch Export Settings' : 'Export Settings';
        }
        
        // Update custom size inputs with current dimensions
        const { width, height } = App.state.resolution;
        this.elements.customWidthInput.value = width;
        this.elements.customHeightInput.value = height;
        
        // Show the modal
        this.elements.exportSettingsModal.classList.add('visible');
    },
    
    // Hide the export settings modal
    hideExportSettingsModal() {
        this.elements.exportSettingsModal.classList.remove('visible');
    },
    
    // Populate export options
    populateExportOptions() {
        // Populate dimension options
        if (this.elements.exportDimensionSelect && this.elements.exportDimensionSelect.options.length === 0) {
            if (Config.exportDimensionPresets) {
                Config.exportDimensionPresets.forEach(preset => {
                    const option = document.createElement('option');
                    option.value = preset.id;
                    option.textContent = preset.name;
                    this.elements.exportDimensionSelect.appendChild(option);
                });
            } else {
                // Add fallback options if Config is missing
                const fallbackDimensions = [
                    { id: 'original', name: 'Original Size' },
                    { id: 'double', name: 'Double Size (2x)' },
                    { id: 'custom', name: 'Custom Size...' }
                ];
                fallbackDimensions.forEach(preset => {
                    const option = document.createElement('option');
                    option.value = preset.id;
                    option.textContent = preset.name;
                    this.elements.exportDimensionSelect.appendChild(option);
                });
            }
        }
        
        // Populate format options
        if (this.elements.exportFormatSelect && this.elements.exportFormatSelect.options.length === 0) {
            if (Config.exportFormats) {
                Config.exportFormats.forEach(format => {
                    const option = document.createElement('option');
                    option.value = format.id;
                    option.textContent = format.name;
                    this.elements.exportFormatSelect.appendChild(option);
                });
            } else {
                // Add fallback options if Config is missing
                const fallbackFormats = [
                    { id: 'png', name: 'PNG' },
                    { id: 'jpeg', name: 'JPEG' }
                ];
                fallbackFormats.forEach(format => {
                    const option = document.createElement('option');
                    option.value = format.id;
                    option.textContent = format.name;
                    this.elements.exportFormatSelect.appendChild(option);
                });
            }
        }
        
        // Populate quality options
        if (this.elements.exportQualitySelect && this.elements.exportQualitySelect.options.length === 0) {
            if (Config.imageQualityOptions) {
                Config.imageQualityOptions.forEach(quality => {
                    const option = document.createElement('option');
                    option.value = quality.id;
                    option.textContent = quality.name;
                    this.elements.exportQualitySelect.appendChild(option);
                });
            } else {
                // Add fallback options if Config is missing
                const fallbackQualities = [
                    { id: 'high', name: 'High' },
                    { id: 'medium', name: 'Medium' },
                    { id: 'low', name: 'Low' }
                ];
                fallbackQualities.forEach(quality => {
                    const option = document.createElement('option');
                    option.value = quality.id;
                    option.textContent = quality.name;
                    this.elements.exportQualitySelect.appendChild(option);
                });
            }
        }
        
        // Set initial values from app state or defaults
        if (this.elements.exportDimensionSelect) {
            this.elements.exportDimensionSelect.value = (App.state.exportSettings && App.state.exportSettings.dimensionOption) || 'original';
        }
        if (this.elements.exportFormatSelect) {
            this.elements.exportFormatSelect.value = (App.state.exportSettings && App.state.exportSettings.format) || 'png';
        }
        if (this.elements.exportQualitySelect) {
            this.elements.exportQualitySelect.value = (App.state.exportSettings && App.state.exportSettings.quality) || 'high';
        }
        
        // Update visibility of quality selector based on format
        this.handleExportFormatChange();
        
        // Update custom size controls visibility
        this.handleExportDimensionChange();
    },
    
    // Handle export dimension change
    handleExportDimensionChange() {
        const selectedDimension = this.elements.exportDimensionSelect.value;
        
        // Show/hide custom size controls
        if (selectedDimension === 'custom') {
            this.elements.customSizeControls.classList.remove('hidden');
        } else {
            this.elements.customSizeControls.classList.add('hidden');
        }
    },
    
    // Handle export format change
    handleExportFormatChange() {
        const selectedFormat = this.elements.exportFormatSelect.value;
        
        // Show quality selector only for formats that support it (JPEG, WebP)
        if (selectedFormat === 'jpeg' || selectedFormat === 'webp') {
            this.elements.qualityContainer.classList.remove('hidden');
        } else {
            this.elements.qualityContainer.classList.add('hidden');
        }
    },
    
    // Handle custom width change
    handleCustomWidthChange() {
        if (this.elements.maintainAspectRatio.checked) {
            const width = parseInt(this.elements.customWidthInput.value, 10);
            if (!isNaN(width) && width > 0) {
                const aspectRatio = App.state.resolution.width / App.state.resolution.height;
                const newHeight = Math.round(width / aspectRatio);
                this.elements.customHeightInput.value = newHeight;
            }
        }
    },
    
    // Handle custom height change
    handleCustomHeightChange() {
        if (this.elements.maintainAspectRatio.checked) {
            const height = parseInt(this.elements.customHeightInput.value, 10);
            if (!isNaN(height) && height > 0) {
                const aspectRatio = App.state.resolution.width / App.state.resolution.height;
                const newWidth = Math.round(height * aspectRatio);
                this.elements.customWidthInput.value = newWidth;
            }
        }
    },
    
    // Handle export confirmation
    handleExportConfirm() {
        // Get export settings
        const format = this.elements.exportFormatSelect.value;
        
        // Get quality - handle case where Config.imageQualityOptions might be undefined
        let quality = 0.9; // default quality
        if (Config.imageQualityOptions) {
            const qualityOption = Config.imageQualityOptions.find(q => 
                q.id === this.elements.exportQualitySelect.value
            );
            if (qualityOption) {
                quality = qualityOption.value;
            }
        }
        
        // Get dimensions
        const dimensionOption = this.elements.exportDimensionSelect.value;
        let customWidth = null;
        let customHeight = null;
        
        if (dimensionOption === 'custom') {
            customWidth = parseInt(this.elements.customWidthInput.value, 10);
            customHeight = parseInt(this.elements.customHeightInput.value, 10);
            
            // Validate custom dimensions
            if (isNaN(customWidth) || customWidth <= 0 || isNaN(customHeight) || customHeight <= 0) {
                this.showError('Please enter valid dimensions');
                return;
            }
        }
        
        // Create new export settings - use a simple object instead of ExportModels.ExportSettings
        const exportSettings = {
            format: format,
            quality: quality,
            dimensionOption: dimensionOption,
            customWidth: customWidth,
            customHeight: customHeight,
            maintainAspectRatio: this.elements.maintainAspectRatio ? this.elements.maintainAspectRatio.checked : false
        };
        
        // Update app state
        App.state.exportSettings = exportSettings;
        
        // Hide the modal
        this.hideExportSettingsModal();
        
        const isBatchExport = this.elements.exportSettingsModal.dataset.batchExport === 'true';
        
        if (isBatchExport) {
            // Execute batch export with the selected settings
            App.performBatchExport();
        } else {
            // Execute the single export with the selected settings
            App.exportImage();
        }
    },
    
    // Zoom functionality
    zoomIn() {
        if (this.zoomLevel < 1) {
            // Smaller increments when below 1x zoom
            this.zoomLevel = Math.min(5, this.zoomLevel + 0.1);
        } else {
            // Larger increments when above 1x zoom
            this.zoomLevel = Math.min(5, this.zoomLevel + 0.25);
        }
        this.applyZoom();
    },
    
    zoomOut() {
        if (this.zoomLevel <= 1) {
            // Smaller increments when below 1x zoom
            this.zoomLevel = Math.max(0.1, this.zoomLevel - 0.1);
        } else {
            // Larger increments when above 1x zoom
            this.zoomLevel = Math.max(0.1, this.zoomLevel - 0.25);
        }
        this.applyZoom();
    },
    
    resetZoom() {
        this.zoomLevel = 1;
        this.applyZoom();
    },
    
    zoomTo(level) {
        this.zoomLevel = Math.max(0.1, Math.min(5, level));
        this.applyZoom();
    },
    
    // Handle wheel zoom with smoother transitions
    handleWheelZoom(e) {
        e.preventDefault();
        
        // Get zoom direction from wheel delta
        const delta = -Math.sign(e.deltaY);
        
        // Calculate the zoom increment based on current zoom level
        let increment = 0.1;
        if (this.zoomLevel >= 1) {
            increment = 0.1;
        }
        
        // Apply the zoom change
        this.zoomLevel = Math.max(0.1, Math.min(5, this.zoomLevel + (delta * increment)));
        this.applyZoom();
    },
    
    applyZoom() {
        const previewCanvas = document.getElementById('preview-canvas');
        if (!previewCanvas || !this.baseDisplayWidth) return;
        
        // Use base size (calculated in handleWindowResize) and apply zoom
        const newWidth = this.baseDisplayWidth * this.zoomLevel;
        const newHeight = this.baseDisplayHeight * this.zoomLevel;
        
        // Apply zoom with smooth transition
        previewCanvas.style.transition = 'width 0.2s ease, height 0.2s ease';
        previewCanvas.style.width = `${newWidth}px`;
        previewCanvas.style.height = `${newHeight}px`;
        
        // Update button states
        this.elements.zoomInBtn.disabled = this.zoomLevel >= 5;
        this.elements.zoomOutBtn.disabled = this.zoomLevel <= 0.1;
        
        // Show zoom level indicator
        this.showZoomLevel();
    },
    
    // Display current zoom level as a temporary overlay
    showZoomLevel() {
        // Create or get the zoom indicator
        let zoomIndicator = document.getElementById('zoom-level-indicator');
        if (!zoomIndicator) {
            zoomIndicator = document.createElement('div');
            zoomIndicator.id = 'zoom-level-indicator';
            zoomIndicator.style.position = 'fixed';
            zoomIndicator.style.bottom = '80px';
            zoomIndicator.style.right = '20px';
            zoomIndicator.style.backgroundColor = 'rgba(0, 0, 0, 0.6)';
            zoomIndicator.style.color = 'white';
            zoomIndicator.style.padding = '8px 12px';
            zoomIndicator.style.borderRadius = '4px';
            zoomIndicator.style.fontSize = '14px';
            zoomIndicator.style.fontWeight = '500';
            zoomIndicator.style.opacity = '0';
            zoomIndicator.style.transition = 'opacity 0.2s ease';
            zoomIndicator.style.zIndex = '1000';
            document.body.appendChild(zoomIndicator);
        }
        
        // Update and show zoom level
        zoomIndicator.textContent = `${Math.round(this.zoomLevel * 100)}%`;
        zoomIndicator.style.opacity = '1';
        
        // Hide after a delay
        clearTimeout(this.zoomIndicatorTimeout);
        this.zoomIndicatorTimeout = setTimeout(() => {
            zoomIndicator.style.opacity = '0';
        }, 1500);
    },
    
    // Shows a success message
    showSuccess(message, duration = 3000) {
        this.showNotification(message, 'success', duration);
    },
    
    // Shows an error message
    showError(message, duration = 5000) {
        this.showNotification(message, 'error', duration);
    },
    
    // Shows a notification
    showNotification(message, type = 'info', duration = 3000) {
        // Create notification element if it doesn't exist
        let notification = document.querySelector('.notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.className = 'notification';
            document.body.appendChild(notification);
            
            // Add styles if they don't exist
            if (!document.getElementById('notification-styles')) {
                const style = document.createElement('style');
                style.id = 'notification-styles';
                style.textContent = `
                    .notification {
                        position: fixed;
                        top: 20px;
                        right: 20px;
                        padding: 12px 20px;
                        border-radius: 6px;
                        background-color: #333;
                        color: white;
                        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                        z-index: 9999;
                        transition: transform 0.3s ease, opacity 0.3s ease;
                        transform: translateY(-20px);
                        opacity: 0;
                        font-size: 14px;
                        max-width: 300px;
                    }
                    .notification.visible {
                        transform: translateY(0);
                        opacity: 1;
                    }
                    .notification.success {
                        background-color: var(--success-color);
                    }
                    .notification.error {
                        background-color: var(--danger-color);
                    }
                `;
                document.head.appendChild(style);
            }
        }
        
        // Set notification content and type
        notification.textContent = message;
        notification.className = 'notification';
        if (type) {
            notification.classList.add(type);
        }
        
        // Show the notification
        setTimeout(() => {
            notification.classList.add('visible');
        }, 10);
        
        // Hide after duration
        clearTimeout(this.notificationTimeout);
        this.notificationTimeout = setTimeout(() => {
            notification.classList.remove('visible');
        }, duration);
    },
    
    // Initialize zoom controls after canvas is ready
    initZoomControls() {
        if (!this.baseDisplayWidth) {
            this.handleWindowResize();
        }
        
        // Make sure zoom controls are enabled
        if (this.elements.zoomInBtn) {
            this.elements.zoomInBtn.disabled = this.zoomLevel >= 5;
        }
        if (this.elements.zoomOutBtn) {
            this.elements.zoomOutBtn.disabled = this.zoomLevel <= 0.1;
        }
    },
    
    // Setup drag functionality for canvas
    setupCanvasDrag() {
        const canvasWrapper = document.querySelector('.canvas-wrapper');
        if (!canvasWrapper) return;
        
        // Mouse events for desktop
        canvasWrapper.addEventListener('mousedown', (e) => {
            // Allow dragging with any mouse button
            // Left button (0), middle button (1), or when zoomed in
            this.startDragging(e.clientX, e.clientY);
            e.preventDefault();
        });
        
        document.addEventListener('mousemove', (e) => {
            if (this.isDragging) {
                this.doDrag(e.clientX, e.clientY);
                e.preventDefault();
            }
        });
        
        document.addEventListener('mouseup', () => {
            this.stopDragging();
        });
        
        // Touch events for mobile
        canvasWrapper.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                this.startDragging(e.touches[0].clientX, e.touches[0].clientY);
                e.preventDefault();
            }
        }, { passive: false });
        
        document.addEventListener('touchmove', (e) => {
            if (this.isDragging && e.touches.length === 1) {
                this.doDrag(e.touches[0].clientX, e.touches[0].clientY);
                e.preventDefault();
            }
        }, { passive: false });
        
        document.addEventListener('touchend', () => {
            this.stopDragging();
        });
        
        // Add cursor styles
        canvasWrapper.style.cursor = 'grab';
        
        // Setup dragging for text layers
        this.setupTextLayerDragging();
    },
    
    // Start dragging the canvas
    startDragging(x, y) {
        this.isDragging = true;
        this.lastMouseX = x;
        this.lastMouseY = y;
        
        const canvasWrapper = document.querySelector('.canvas-wrapper');
        if (canvasWrapper) {
            canvasWrapper.style.cursor = 'grabbing';
        }
    },
    
    // Perform the dragging
    doDrag(x, y) {
        if (!this.isDragging) return;
        
        const canvasWrapper = document.querySelector('.canvas-wrapper');
        if (!canvasWrapper) return;
        
        // Calculate how much to scroll based on mouse movement
        const dx = x - this.lastMouseX;
        const dy = y - this.lastMouseY;
        
        // Apply the scroll
        canvasWrapper.scrollLeft -= dx;
        canvasWrapper.scrollTop -= dy;
        
        // Update last position
        this.lastMouseX = x;
        this.lastMouseY = y;
    },
    
    // Stop dragging
    stopDragging() {
        this.isDragging = false;
        
        const canvasWrapper = document.querySelector('.canvas-wrapper');
        if (canvasWrapper) {
            canvasWrapper.style.cursor = 'grab';
        }
    },
    
    // Setup text layers dragging functionality
    setupTextLayerDragging() {
        const canvas = document.getElementById('preview-canvas');
        if (!canvas) return;
        
        // Function to get normalized canvas coordinates
        const getNormalizedCoordinates = (clientX, clientY) => {
            const rect = canvas.getBoundingClientRect();
            // Convert screen coordinates to canvas coordinates
            const canvasX = clientX - rect.left;
            const canvasY = clientY - rect.top;
            // Normalize to 0-1 range
            return {
                x: canvasX / rect.width,
                y: canvasY / rect.height
            };
        };
        
        // Mouse events for text layer dragging
        let isDraggingText = false;
        let currentTextLayerId = null;
        let dragUpdateTimeout;
        
        canvas.addEventListener('mousedown', (e) => {
            // Only proceed if we have a selected text layer
            if (!window.App.state.selectedTextLayerId) return;
            
            // Get the normalized coordinates
            const coords = getNormalizedCoordinates(e.clientX, e.clientY);
            
            // Get the selected text layer
            const textLayer = window.App.getTextLayerById(window.App.state.selectedTextLayerId);
            if (!textLayer) return;
            
            // Check if click is near the text layer's position (within a reasonable area)
            const clickRadius = 0.1; // 10% of canvas size
            const distX = Math.abs(coords.x - textLayer.position.x);
            const distY = Math.abs(coords.y - textLayer.position.y);
            
            if (distX <= clickRadius && distY <= clickRadius) {
                // Start dragging this text layer
                isDraggingText = true;
                currentTextLayerId = textLayer.id;
                e.stopPropagation(); // Prevent canvas dragging
            }
        });
        
        document.addEventListener('mousemove', (e) => {
            if (isDraggingText && currentTextLayerId) {
                // Get the normalized coordinates
                const coords = getNormalizedCoordinates(e.clientX, e.clientY);
                
                // Throttle position updates for better performance
                clearTimeout(dragUpdateTimeout);
                dragUpdateTimeout = setTimeout(() => {
                    window.App.updateTextLayerPosition(currentTextLayerId, coords.x, coords.y);
                }, 16); // ~60fps throttle
                e.preventDefault();
            }
        });
        
        document.addEventListener('mouseup', () => {
            if (isDraggingText) {
                // Ensure final position update
                clearTimeout(dragUpdateTimeout);
            }
            isDraggingText = false;
            currentTextLayerId = null;
        });
        
        // Touch events for mobile
        canvas.addEventListener('touchstart', (e) => {
            // Only proceed if we have a selected text layer
            if (!window.App.state.selectedTextLayerId || e.touches.length !== 1) return;
            
            // Get the normalized coordinates
            const coords = getNormalizedCoordinates(e.touches[0].clientX, e.touches[0].clientY);
            
            // Get the selected text layer
            const textLayer = window.App.getTextLayerById(window.App.state.selectedTextLayerId);
            if (!textLayer) return;
            
            // Check if touch is near the text layer's position
            const touchRadius = 0.15; // 15% of canvas size (larger for touch)
            const distX = Math.abs(coords.x - textLayer.position.x);
            const distY = Math.abs(coords.y - textLayer.position.y);
            
            if (distX <= touchRadius && distY <= touchRadius) {
                // Start dragging this text layer
                isDraggingText = true;
                currentTextLayerId = textLayer.id;
                e.stopPropagation(); // Prevent canvas dragging
            }
        }, { passive: false });
        
        document.addEventListener('touchmove', (e) => {
            if (isDraggingText && currentTextLayerId && e.touches.length === 1) {
                // Get the normalized coordinates
                const coords = getNormalizedCoordinates(e.touches[0].clientX, e.touches[0].clientY);
                
                // Throttle position updates for better performance
                clearTimeout(dragUpdateTimeout);
                dragUpdateTimeout = setTimeout(() => {
                    window.App.updateTextLayerPosition(currentTextLayerId, coords.x, coords.y);
                }, 16); // ~60fps throttle
                e.preventDefault();
            }
        }, { passive: false });
        
        document.addEventListener('touchend', () => {
            if (isDraggingText) {
                // Ensure final position update
                clearTimeout(dragUpdateTimeout);
            }
            isDraggingText = false;
            currentTextLayerId = null;
        });
    },
    
    // Render text layers list
    renderTextLayers(textLayers, selectedId) {
        if (!this.elements.textLayersList) return;
        
        // Clear existing content
        const emptyTextLayers = this.elements.textLayersList.querySelector('.empty-text-layers');
        
        // Remove all items except the empty state message
        Array.from(this.elements.textLayersList.children).forEach(child => {
            if (!child.classList.contains('empty-text-layers')) {
                child.remove();
            }
        });
        
        // Show empty state if no layers
        if (!textLayers || textLayers.length === 0) {
            if (emptyTextLayers) {
                emptyTextLayers.style.display = 'block';
            }
            return;
        }
        
        // Hide empty state
        if (emptyTextLayers) {
            emptyTextLayers.style.display = 'none';
        }
        
        // Add each text layer
        textLayers.forEach(layer => {
            const item = document.createElement('div');
            item.className = 'text-layer-item';
            item.dataset.id = layer.id;
            
            if (layer.id === selectedId) {
                item.classList.add('selected');
            }
            
            const layerInfo = document.createElement('div');
            layerInfo.className = 'text-layer-info';
            
            const visibilityIcon = document.createElement('span');
            visibilityIcon.className = 'text-layer-visibility';
            if (!layer.visible) {
                visibilityIcon.classList.add('hidden');
            }
            visibilityIcon.innerHTML = layer.visible ? 
                '<i class="fas fa-eye"></i>' : 
                '<i class="fas fa-eye-slash"></i>';
            visibilityIcon.addEventListener('click', (e) => {
                e.stopPropagation();
                window.App.toggleTextLayerVisibility(layer.id);
            });
            
            const preview = document.createElement('span');
            preview.className = 'text-layer-preview';
            preview.textContent = layer.text || 'Text Layer';
            
            layerInfo.appendChild(visibilityIcon);
            layerInfo.appendChild(preview);
            
            const actions = document.createElement('div');
            actions.className = 'text-layer-actions';
            
            const duplicateBtn = document.createElement('button');
            duplicateBtn.innerHTML = '<i class="fas fa-copy"></i>';
            duplicateBtn.title = 'Duplicate';
            duplicateBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                window.App.duplicateTextLayer(layer.id);
            });
            
            const deleteBtn = document.createElement('button');
            deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
            deleteBtn.title = 'Delete';
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                window.App.deleteTextLayer(layer.id);
            });
            
            actions.appendChild(duplicateBtn);
            actions.appendChild(deleteBtn);
            
            item.appendChild(layerInfo);
            item.appendChild(actions);
            
            // Make item selectable
            item.addEventListener('click', () => {
                window.App.selectTextLayer(layer.id);
            });
            
            this.elements.textLayersList.appendChild(item);
        });
    },
    
    // Show text editor for a layer
    showTextEditor(textLayer) {
        if (!this.elements.textEditor || !textLayer) return;
        
        // Ensure the Text Layers section is expanded
        const textLayersSection = document.querySelector('.settings-section:has(.text-layers-list)');
        if (textLayersSection && textLayersSection.classList.contains('collapsed')) {
            this.toggleSettingsSection(textLayersSection);
        }
        
        // Show the editor
        this.elements.textEditor.classList.remove('hidden');
        
        // Set the values
        if (this.elements.textContent) {
            this.elements.textContent.value = textLayer.text || '';
        }
        
        if (this.elements.fontSizeSlider) {
            this.elements.fontSizeSlider.value = textLayer.fontSize || 36;
            this.elements.fontSizeValue.textContent = `${textLayer.fontSize || 36}px`;
        }
        
        if (this.elements.fontFamilySelect) {
            this.elements.fontFamilySelect.value = textLayer.fontFamily || 'Arial, sans-serif';
        }
        
        if (this.elements.textColorInput) {
            this.elements.textColorInput.value = textLayer.color || '#FFFFFF';
        }
        
        if (this.elements.textOpacitySlider) {
            this.elements.textOpacitySlider.value = textLayer.opacity !== undefined ? textLayer.opacity : 1;
            this.elements.textOpacityValue.textContent = `${Math.round((textLayer.opacity !== undefined ? textLayer.opacity : 1) * 100)}%`;
        }
        
        // Set alignment buttons
        this.updateAlignmentButtons(textLayer.align || 'center');
        
        // Set style buttons
        if (this.elements.boldBtn) {
            this.elements.boldBtn.classList.toggle('active', textLayer.bold || false);
        }
        
        if (this.elements.italicBtn) {
            this.elements.italicBtn.classList.toggle('active', textLayer.italic || false);
        }
        
        if (this.elements.underlineBtn) {
            this.elements.underlineBtn.classList.toggle('active', textLayer.underline || false);
        }
        
        // Initialize shadow controls
        if (this.elements.textShadowToggle) {
            this.elements.textShadowToggle.checked = textLayer.shadow || false;
            
            if (this.elements.textShadowOptions) {
                this.elements.textShadowOptions.style.display = textLayer.shadow ? 'block' : 'none';
            }
            
            if (this.elements.textShadowColor) {
                this.elements.textShadowColor.value = textLayer.shadowColor || '#000000';
            }
            
            if (this.elements.textShadowBlurSlider) {
                this.elements.textShadowBlurSlider.value = textLayer.shadowBlur || 3;
                this.elements.textShadowBlurValue.textContent = `${textLayer.shadowBlur || 3}px`;
            }
        }
        
        // Initialize background controls
        if (this.elements.textBgToggle) {
            this.elements.textBgToggle.checked = !!textLayer.backgroundColor;
            
            if (this.elements.textBgOptions) {
                this.elements.textBgOptions.style.display = textLayer.backgroundColor ? 'block' : 'none';
            }
            
            if (this.elements.textBgColor) {
                this.elements.textBgColor.value = textLayer.backgroundColor || '#333333';
            }
            
            if (this.elements.textPaddingSlider) {
                this.elements.textPaddingSlider.value = textLayer.padding || 10;
                this.elements.textPaddingValue.textContent = `${textLayer.padding || 10}px`;
            }
        }
    },
    
    // Hide the text editor
    hideTextEditor() {
        if (!this.elements.textEditor) return;
        this.elements.textEditor.classList.add('hidden');
    },
    
    // Update text editor with layer properties
    updateTextEditor(textLayer) {
        this.showTextEditor(textLayer);
    },
    
    // Update text alignment buttons
    updateTextAlignment(alignment) {
        if (!window.App.state.selectedTextLayerId) return;
        
        // Update all alignment buttons
        if (this.elements.alignLeftBtn) {
            this.elements.alignLeftBtn.classList.toggle('active', alignment === 'left');
        }
        
        if (this.elements.alignCenterBtn) {
            this.elements.alignCenterBtn.classList.toggle('active', alignment === 'center');
        }
        
        if (this.elements.alignRightBtn) {
            this.elements.alignRightBtn.classList.toggle('active', alignment === 'right');
        }
        
        // Update the text layer
        window.App.updateTextLayer(window.App.state.selectedTextLayerId, {
            align: alignment
        });
    },
    
    // Update alignment buttons to match a specific alignment
    updateAlignmentButtons(alignment) {
        if (this.elements.alignLeftBtn) {
            this.elements.alignLeftBtn.classList.toggle('active', alignment === 'left');
        }
        
        if (this.elements.alignCenterBtn) {
            this.elements.alignCenterBtn.classList.toggle('active', alignment === 'center');
        }
        
        if (this.elements.alignRightBtn) {
            this.elements.alignRightBtn.classList.toggle('active', alignment === 'right');
        }
    },
    
    // Initialize collapsible panels
    initCollapsiblePanels() {
        // Select all panel titles
        const panelTitles = document.querySelectorAll('.panel-title');
        
        // Add click event to toggle panels
        panelTitles.forEach(title => {
            title.addEventListener('click', () => {
                this.togglePanel(title);
            });
        });
        
        // Initially collapse some panels for a cleaner interface
        // We leave the first panel open (Resolution) and collapse others
        const panels = document.querySelectorAll('.control-panel');
        panels.forEach((panel, index) => {
            if (index > 0) {
                const title = panel.querySelector('.panel-title');
                this.togglePanel(title);
            }
        });
    },
    
    // Toggle panel visibility
    togglePanel(titleElement) {
        const panel = titleElement.closest('.control-panel');
        const content = panel.querySelector('.panel-content');
        const isCollapsed = titleElement.classList.contains('collapsed');
        
        // If we're expanding this panel, collapse all other panels first
        if (isCollapsed) {
            // Collapse all other panels
            const allPanels = document.querySelectorAll('.control-panel');
            allPanels.forEach(otherPanel => {
                if (otherPanel !== panel) {
                    const otherTitle = otherPanel.querySelector('.panel-title');
                    const otherContent = otherPanel.querySelector('.panel-content');
                    
                    if (!otherTitle.classList.contains('collapsed')) {
                        otherTitle.classList.add('collapsed');
                        otherContent.classList.add('collapsed');
                        otherContent.style.maxHeight = '0px';
                    }
                }
            });
        }
        
        // Toggle classes
        titleElement.classList.toggle('collapsed');
        content.classList.toggle('collapsed');
        
        // If collapsing, immediately set height to 0
        if (titleElement.classList.contains('collapsed')) {
            content.style.maxHeight = '0px';
        } else {
            // If expanding, set height to auto
            content.style.maxHeight = content.scrollHeight + 'px';
            
            // After transition, set to none to allow content to grow if needed
            setTimeout(() => {
                if (!titleElement.classList.contains('collapsed')) {
                    content.style.maxHeight = 'none';
                }
            }, 300);
        }
    },
    
    // Initialize collapsible settings sections
    initCollapsibleSections() {
        // Select all section headers
        const sectionHeaders = document.querySelectorAll('.settings-section .section-header');
        
        // Add click event to toggle sections
        sectionHeaders.forEach(header => {
            header.addEventListener('click', (e) => {
                // Don't toggle if clicking on a button inside the header
                if (e.target.closest('button')) return;
                
                const section = header.closest('.settings-section');
                this.toggleSettingsSection(section);
            });
        });
        
        // Initially collapse all sections except the first one (Background) for a cleaner interface
        const sections = document.querySelectorAll('.settings-section');
        sections.forEach((section, index) => {
            // Keep the first section (Background) open, collapse others
            if (index > 0) {
                section.classList.add('collapsed');
                
                // Ensure section content is properly initialized
                const content = section.querySelector('.section-content');
                if (content) {
                    content.style.maxHeight = '0px';
                }
            }
        });
    },
    
    // Toggle settings section visibility
    toggleSettingsSection(section) {
        const isCollapsed = section.classList.contains('collapsed');
        const content = section.querySelector('.section-content');
        
        if (isCollapsed) {
            // Expanding
            section.classList.remove('collapsed');
            if (content) {
                content.style.maxHeight = content.scrollHeight + 'px';
            }
        } else {
            // Collapsing
            section.classList.add('collapsed');
            if (content) {
                content.style.maxHeight = '0px';
            }
        }
    },

    // Create resolution option element
    createResolutionOption(resolution) {
        const option = document.createElement('div');
        option.className = 'resolution-option';
        option.dataset.width = resolution.width;
        option.dataset.height = resolution.height;
        
        option.innerHTML = `
            <span class="check-icon"><i class="far fa-circle"></i></span>
            <span class="resolution-name">${resolution.name}</span>
            ${this.generatePlatformIcons(resolution.platforms)}
        `;
        
        return option;
    },

    // Initialize resolution categories
    initializeResolutions() {
        const resolutionCategories = document.querySelector('.resolution-categories');
        if (!resolutionCategories) return;
        
        // Clear existing content
        resolutionCategories.innerHTML = '';
        
        // Create categories
        Config.resolutionCategories.forEach(category => {
            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'resolution-category';
            
            // Create category content
            const contentDiv = document.createElement('div');
            contentDiv.className = 'category-content';
            contentDiv.dataset.category = category.id;
            
            // Add resolution options
            category.resolutions.forEach(resolution => {
                contentDiv.appendChild(this.createResolutionOption(resolution));
            });
            
            categoryDiv.appendChild(contentDiv);
            resolutionCategories.appendChild(categoryDiv);
        });
        
        // Setup event listeners
        this.setupResolutionOptions();
    },
    
    // Show help modal
    showHelpModal() {
        const helpModal = document.getElementById('help-modal');
        if (helpModal) {
            helpModal.classList.add('visible');
        }
    },
    
    // Hide help modal
    hideHelpModal() {
        const helpModal = document.getElementById('help-modal');
        if (helpModal) {
            helpModal.classList.remove('visible');
        }
    },
    
    // Initialize collapsible subsections
    initCollapsibleSubsections() {
        const subsectionHeaders = document.querySelectorAll('.subsection-header');
        
        subsectionHeaders.forEach(header => {
            header.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const subsection = header.closest('.settings-subsection');
                this.toggleSubsection(subsection);
            });
        });
    },
    
    // Toggle a subsection
    toggleSubsection(subsection) {
        if (!subsection) return;
        
        const isCollapsed = subsection.classList.contains('collapsed');
        
        if (isCollapsed) {
            // Expand
            subsection.classList.remove('collapsed');
        } else {
            // Collapse
            subsection.classList.add('collapsed');
        }
        
        // Store the state in localStorage
        const subsectionTitle = subsection.querySelector('.subsection-header h6')?.textContent;
        if (subsectionTitle) {
            const storageKey = `subsection_${subsectionTitle.replace(/\s+/g, '_').toLowerCase()}`;
            localStorage.setItem(storageKey, isCollapsed ? 'expanded' : 'collapsed');
        }
    }
}; 