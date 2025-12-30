/**
 * Marketing & App Store Integration
 */

window.Marketing = {
    // Initialize Marketing UI and Events
    init() {
        console.log('🚀 Marketing Module Initialized');

        // Add listeners for search
        const searchInput = document.getElementById('app-search-input');
        const searchBtn = document.getElementById('app-search-btn');

        if (searchBtn) {
            searchBtn.addEventListener('click', () => this.searchApp());
        }

        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.searchApp();
            });
        }
    },

    // Search App Store
    async searchApp() {
        const input = document.getElementById('app-search-input');
        const resultsContainer = document.getElementById('app-search-results');
        const term = input.value.trim();

        if (!term) return;

        // Clear previous results
        resultsContainer.innerHTML = '<div class="loading-spinner"><i class="fas fa-spinner fa-spin"></i> Searching...</div>';
        resultsContainer.classList.remove('hidden');

        try {
            // Call our server proxy
            const response = await fetch(`/api/search-app?term=${encodeURIComponent(term)}`);
            const data = await response.json();

            this.renderResults(data.results);
        } catch (error) {
            console.error('Search failed:', error);
            resultsContainer.innerHTML = '<div class="error-msg">Search failed. Please try again.</div>';
        }
    },

    // Render Search Results
    renderResults(results) {
        const container = document.getElementById('app-search-results');
        container.innerHTML = '';

        if (!results || results.length === 0) {
            container.innerHTML = '<div class="no-results">No apps found.</div>';
            return;
        }

        results.forEach(app => {
            const el = document.createElement('div');
            el.className = 'app-result-item';
            el.innerHTML = `
                <img src="${app.artworkUrl100}" alt="${app.trackName}" class="app-icon">
                <div class="app-info">
                    <div class="app-name">${app.trackName}</div>
                    <div class="app-dev">${app.artistName}</div>
                </div>
            `;

            el.addEventListener('click', () => this.selectApp(app));
            container.appendChild(el);
        });
    },

    // Select App and Apply Template
    async selectApp(app) {
        try {
            UI.showLoading('Downloading assets...');

            // Get high res icon (try to upgrade 100x100 to 1024x1024 or 512x512)
            const highResUrl = app.artworkUrl512 || app.artworkUrl100.replace('100x100bb', '1024x1024bb');

            const image = await Utils.loadImage(highResUrl);

            // Set image
            App.state.selectedImage = image;
            App.state.images[0] = image;
            App.state.selectedImageIndex = 0;

            // Extract colors (simple simple heuristic: center pixel or average)
            const dominatColor = this.extractColor(image);

            // Apply a "Marketing" Template
            this.applyMarketingTemplate(app, dominatColor);

            // Hide results
            document.getElementById('app-search-results').classList.add('hidden');

            App.renderPreview();
            UI.hideLoading();
            UI.showNotification(`Loaded ${app.trackName}`, 'success');

        } catch (error) {
            console.error('Failed to load app:', error);
            UI.hideLoading();
            UI.showError('Failed to load app assets.');
        }
    },

    // Extract a dominant color (simplified)
    extractColor(img) {
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, 1, 1);
        const data = ctx.getImageData(0, 0, 1, 1).data;
        return `rgb(${data[0]}, ${data[1]}, ${data[2]})`;
    },

    // Apply template settings
    applyMarketingTemplate(app, primaryColor) {
        // Set background to primary color
        App.state.backgroundColor = primaryColor;

        // Add "New Update" text
        const titleLayer = new Models.TextLayer({
            text: "New Update Available",
            fontSize: 60,
            fontFamily: "'Inter', sans-serif",
            color: '#ffffff',
            x: App.state.canvasWidth / 2,
            y: 150,
            align: 'center',
            opacity: 1,
            isBold: true
        });

        const appNameLayer = new Models.TextLayer({
            text: app.trackName,
            fontSize: 40,
            fontFamily: "'Inter', sans-serif",
            color: 'rgba(255,255,255,0.8)',
            x: App.state.canvasWidth / 2,
            y: 220,
            align: 'center',
            opacity: 0.8
        });

        App.state.textLayers = [titleLayer, appNameLayer];

        // Reset effects
        App.state.cornerRadius = 40;
        App.state.padding = 100;
        App.state.shadowOpacity = 0.4;
        App.state.shadowRadius = 30;
        App.state.shadowOffsetY = 20;
    }
};
