/**
 * Gallery Manager
 * Handles rendering and interactions for the gallery sidebar
 */
window.GalleryManager = {
    // Renders gallery items
    render(canvases, selectedId) {
        const galleryContent = document.getElementById('gallery-content');
        if (!galleryContent) return;

        galleryContent.innerHTML = '';

        // Always show gallery container even when empty
        const galleryContainer = document.getElementById('gallery-container');
        if (galleryContainer) {
            galleryContainer.classList.remove('hidden');
        }

        if (!canvases || canvases.length === 0) {
            this.renderEmptyState(galleryContent);
            return;
        }

        canvases.forEach(canvas => {
            const galleryItem = this.createGalleryItem(canvas, selectedId);
            galleryContent.appendChild(galleryItem);
        });
    },

    renderEmptyState(container) {
        const emptyState = document.createElement('div');
        emptyState.className = 'empty-gallery';
        emptyState.innerHTML = `
            <div class="empty-gallery-content">
                <i class="fas fa-paint-brush"></i>
                <p>No canvases yet</p>
                <p class="hint">Click "New Canvas" to start creating</p>
            </div>
        `;
        container.appendChild(emptyState);
    },

    createGalleryItem(canvas, selectedId) {
        const galleryItem = document.createElement('div');
        galleryItem.className = 'gallery-item';
        if (canvas.id === selectedId) {
            galleryItem.classList.add('selected');
        }

        const imageContainer = document.createElement('div');
        imageContainer.className = 'gallery-item-image';

        // Create thumbnail
        const img = document.createElement('img');
        if (canvas.image && canvas.image instanceof HTMLImageElement && canvas.image.complete && canvas.image.naturalWidth > 0) {
            // Canvas has a valid, loaded image
            const thumbnailData = CanvasRenderer.createThumbnail(canvas.image, 200, 200, 0);
            if (thumbnailData) {
                img.src = thumbnailData;
            } else {
                img.src = this.createCanvasThumbnail(canvas);
            }
            img.alt = 'Canvas';
        } else {
            // Canvas without image
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
            if (window.App && window.App.selectCanvasFromGallery) {
                window.App.selectCanvasFromGallery(canvas.id);
            }
        });

        return galleryItem;
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
            const allGradients = window.Config ? window.Config.getAllGradients() : [];
            const gradient = allGradients.find(g => g.id === settings.backgroundGradientId);
            if (gradient && gradient.colors && gradient.colors.length >= 2) {
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

        // Add text indicators if there are text layers
        if (canvas.textLayers && canvas.textLayers.length > 0) {
            canvas.textLayers.forEach((layer, index) => {
                if (!layer.visible) return;

                ctx.save();
                ctx.font = 'bold 14px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = layer.color || '#ffffff';

                // Position text layers in thumbnail
                const x = (layer.position?.x || 0.5) * 200;
                const y = (layer.position?.y || 0.5) * 200;

                // Add slight shadow for readability
                ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
                ctx.shadowBlur = 2;
                ctx.shadowOffsetX = 1;
                ctx.shadowOffsetY = 1;

                // Draw abbreviated text
                const text = (layer.text || 'Text').substring(0, 10);
                ctx.fillText(text, x, y);
                ctx.restore();
            });
        }

        return tempCanvas.toDataURL();
    }
};
