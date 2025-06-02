// Export-specific models

// ExportSettings class to handle export-specific configurations
class ExportSettings {
    constructor({
        format = 'png',
        quality = 'high',
        dimensionOption = 'original',
        customWidth = null,
        customHeight = null,
        maintainAspectRatio = true,
        batchExport = false,
        batchTimestamp = null
    } = {}) {
        this.format = format;
        this.quality = quality;
        this.dimensionOption = dimensionOption;
        this.customWidth = customWidth;
        this.customHeight = customHeight;
        this.maintainAspectRatio = maintainAspectRatio;
        this.batchExport = batchExport;
        this.batchTimestamp = batchTimestamp;
    }

    // Get the final dimensions based on the current settings and original dimensions
    getFinalDimensions(originalWidth, originalHeight) {
        if (this.dimensionOption === 'custom' && this.customWidth && this.customHeight) {
            return {
                width: this.customWidth,
                height: this.customHeight
            };
        }

        // Find preset if using one
        const preset = Config.exportDimensionPresets.find(p => p.id === this.dimensionOption);
        if (preset) {
            return {
                width: Math.round(originalWidth * preset.scale),
                height: Math.round(originalHeight * preset.scale)
            };
        }

        // Default to original dimensions
        return {
            width: originalWidth,
            height: originalHeight
        };
    }

    // Clone the settings
    clone() {
        return new ExportSettings({
            format: this.format,
            quality: this.quality,
            dimensionOption: this.dimensionOption,
            customWidth: this.customWidth,
            customHeight: this.customHeight,
            maintainAspectRatio: this.maintainAspectRatio,
            batchExport: this.batchExport,
            batchTimestamp: this.batchTimestamp
        });
    }
}

// Export history item
class ExportHistoryItem {
    constructor(image, name) {
        this.id = generateUUID();
        this.image = image;
        this.name = name || `Mockup_${new Date().toISOString().replace(/:/g, '-')}`;
        this.date = new Date();
    }

    // Format the date for display
    get formattedDate() {
        return this.date.toLocaleString();
    }
}

// Export the models
window.ExportModels = {
    ExportSettings,
    ExportHistoryItem
}; 