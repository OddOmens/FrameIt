/**
 * Marketing Templates & Tools
 */

window.Marketing = {
    // Initialize Marketing UI and Events
    init() {
        console.log('🚀 Marketing Module Initialized');
        this.setupEventListeners();
    },

    setupEventListeners() {
        // Icon Upload
        const uploadBtn = document.getElementById('mkt-icon-upload-btn');
        const fileInput = document.getElementById('mkt-icon-upload');

        if (uploadBtn && fileInput) {
            uploadBtn.addEventListener('click', () => fileInput.click());
            fileInput.addEventListener('change', (e) => this.handleIconUpload(e));
        }

        // Templates
        document.getElementById('mkt-template-modern')?.addEventListener('click', () => this.applyTemplate('modern'));
        document.getElementById('mkt-template-bold')?.addEventListener('click', () => this.applyTemplate('bold'));
        document.getElementById('mkt-template-clean')?.addEventListener('click', () => this.applyTemplate('clean'));

        // Text Inputs
        this.bindInput('mkt-app-name', (val) => this.updateTextLayer(0, val));
        this.bindInput('mkt-subtitle', (val) => this.updateTextLayer(1, val));

        // CTA Controls
        this.bindInput('mkt-cta-text', (val) => {
            App.state.marketingCtaText = val;
            App.renderPreview();
            App.saveStateForUndo();
        });

        this.bindInput('mkt-cta-color', (val) => {
            App.state.marketingCtaColor = val;
            App.renderPreview();
            App.saveStateForUndo();
        }, 'input');

        this.bindInput('mkt-cta-text-color', (val) => {
            App.state.marketingCtaTextColor = val;
            App.renderPreview();
            App.saveStateForUndo();
        }, 'input');

        const ctaEnabled = document.getElementById('mkt-cta-enabled');
        if (ctaEnabled) {
            ctaEnabled.addEventListener('change', (e) => {
                App.state.marketingShowCta = e.target.checked;
                App.renderPreview();
                App.saveStateForUndo();
            });
        }
    },

    bindInput(id, callback, event = 'input') {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener(event, (e) => callback(e.target.value));
        }
    },

    async handleIconUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        try {
            UI.showLoading('Loading Icon...');
            const image = await Utils.loadImageFromFile(file);

            // Set as main image
            App.state.images[0] = image;
            App.state.selectedImage = image;
            App.state.selectedImageIndex = 0;

            // Default icon styling
            App.state.cornerRadius = 40; // Approx standard rounded corner
            App.state.padding = 100;
            App.state.shadowRadius = 20;
            App.state.shadowOpacity = 0.3;

            App.renderPreview();
            UI.updateImageSlots(App.state.images, 0);
            UI.hideLoading();
            UI.showNotification('App Icon Loaded', 'success');
        } catch (error) {
            console.error('Icon load failed:', error);
            UI.hideLoading();
            UI.showError('Failed to load icon');
        }
    },

    updateTextLayer(index, text) {
        // Ensure text layers exist
        if (!App.state.textLayers || App.state.textLayers.length <= index) {
            // Create layer if it doesn't exist
            this.createDefaultTextLayers();
        }

        if (App.state.textLayers[index]) {
            App.state.textLayers[index].text = text;
            App.renderPreview();
            // Debounce save? relying on App.saveStateForUndo called elsewhere or manual triggers
            // Ideally we save on blur or debounced input, but for now direct render is fine
        }
    },

    createDefaultTextLayers() {
        // Clear existing if wildly different? No, just ensure we have 2 layers
        if (!App.state.textLayers) App.state.textLayers = [];

        const width = App.state.canvasWidth;
        const height = App.state.canvasHeight;

        // Title Layer (Index 0)
        if (!App.state.textLayers[0]) {
            App.state.textLayers[0] = new Models.TextLayer({
                text: "App Name",
                fontSize: 60,
                fontFamily: "'Inter', sans-serif",
                color: '#ffffff',
                x: width / 2,
                y: height * 0.15,
                align: 'center',
                isBold: true
            });
        }

        // Subtitle Layer (Index 1)
        if (!App.state.textLayers[1]) {
            App.state.textLayers[1] = new Models.TextLayer({
                text: "Subtitle",
                fontSize: 40,
                fontFamily: "'Inter', sans-serif",
                color: 'rgba(255,255,255,0.8)',
                x: width / 2,
                y: height * 0.22,
                align: 'center'
            });
        }

        UI.renderTextLayers(App.state.textLayers);
    },

    applyTemplate(type) {
        console.log(`Applying template: ${type}`);
        App.saveStateForUndo();

        const width = App.state.canvasWidth;
        const height = App.state.canvasHeight;

        // Reset Layers
        App.state.textLayers = [];
        this.createDefaultTextLayers();

        // Enable CTA
        App.state.marketingShowCta = true;
        document.getElementById('mkt-cta-enabled').checked = true;

        if (type === 'modern') {
            // Modern: Gradient BG, Clean Text
            // Title
            App.state.textLayers[0].y = height * 0.55;
            App.state.textLayers[0].fontSize = 50;
            App.state.textLayers[0].color = '#FFFFFF';

            // Subtitle
            App.state.textLayers[1].y = height * 0.62;
            App.state.textLayers[1].fontSize = 30;
            App.state.textLayers[1].color = 'rgba(255,255,255,0.7)';

            // Styling
            App.state.padding = 120;
            App.state.cornerRadius = 45;
            App.state.shadowRadius = 40;
            App.state.shadowOpacity = 0.25;
            App.state.shadowOffsetY = 20;

            // Set CTA Color
            App.state.marketingCtaColor = '#FFFFFF';
            App.state.marketingCtaTextColor = '#000000';

            // Random Gradient
            App.state.backgroundColor = '#4F46E5'; // Indigo default

        } else if (type === 'bold') {
            // Bold: Solid High Contrast
            App.state.textLayers[0].y = height * 0.2;
            App.state.textLayers[0].fontSize = 80;
            App.state.textLayers[0].isBold = true;

            App.state.textLayers[1].y = height * 0.28;
            App.state.textLayers[1].fontSize = 40;

            App.state.marketingCtaColor = '#000000';
            App.state.marketingCtaTextColor = '#FFFFFF';

            App.state.padding = 80;
            App.state.shadowRadius = 0; // Flat
            App.state.shadowOpacity = 0;

        } else if (type === 'clean') {
            // Clean: Minimal
            App.state.textLayers[0].y = height * 0.6;
            App.state.textLayers[0].color = '#333333';

            App.state.textLayers[1].y = height * 0.65;
            App.state.textLayers[1].color = '#666666';

            App.state.backgroundColor = '#F3F4F6';
            App.state.marketingCtaColor = '#333333';
            App.state.marketingCtaTextColor = '#FFFFFF';

            App.state.padding = 150;
            App.state.shadowOpacity = 0.1;
        }

        // Update Inputs
        this.syncInputs();

        App.renderPreview();
        UI.renderTextLayers(App.state.textLayers);
        UI.updateButtonStates();
        UI.showNotification(`${type.charAt(0).toUpperCase() + type.slice(1)} Template Applied`);
    },

    syncInputs() {
        const updateVal = (id, val) => {
            const el = document.getElementById(id);
            if (el) el.value = val;
        };

        if (App.state.textLayers[0]) updateVal('mkt-app-name', App.state.textLayers[0].text);
        if (App.state.textLayers[1]) updateVal('mkt-subtitle', App.state.textLayers[1].text);

        updateVal('mkt-cta-text', App.state.marketingCtaText);
        updateVal('mkt-cta-color', App.state.marketingCtaColor);
        updateVal('mkt-cta-text-color', App.state.marketingCtaTextColor);

        const ctaCheck = document.getElementById('mkt-cta-enabled');
        if (ctaCheck) ctaCheck.checked = App.state.marketingShowCta;
    }
};
