// Image-specific models

// ImageSettings class to store image formatting settings
class ImageSettings {
    constructor({
        cornerRadius = 16,
        padding = 0,
        shadowOpacity = 0.15,
        shadowRadius = 8,
        shadowOffsetX = 0,
        shadowOffsetY = 4,
        background = null,
        backgroundColor = '#FFFFFF',
        backgroundImageUrl = null,
        rotation = 0,
        isFlippedHorizontally = false,
        isFlippedVertically = false,
        resolution = null
    } = {}) {
        this.cornerRadius = cornerRadius;
        this.padding = padding;
        this.shadowOpacity = shadowOpacity;
        this.shadowRadius = shadowRadius;
        this.shadowOffsetX = shadowOffsetX;
        this.shadowOffsetY = shadowOffsetY;
        this.background = background; // Can be a gradient name
        this.backgroundColor = backgroundColor;
        this.backgroundImageUrl = backgroundImageUrl;
        this.rotation = rotation;
        this.isFlippedHorizontally = isFlippedHorizontally;
        this.isFlippedVertically = isFlippedVertically;
        this.resolution = resolution;
    }

    // Clone the settings
    clone() {
        return new ImageSettings({
            cornerRadius: this.cornerRadius,
            padding: this.padding,
            shadowOpacity: this.shadowOpacity,
            shadowRadius: this.shadowRadius,
            shadowOffsetX: this.shadowOffsetX,
            shadowOffsetY: this.shadowOffsetY,
            background: this.background,
            backgroundColor: this.backgroundColor,
            backgroundImageUrl: this.backgroundImageUrl,
            rotation: this.rotation,
            isFlippedHorizontally: this.isFlippedHorizontally,
            isFlippedVertically: this.isFlippedVertically,
            resolution: this.resolution ? {...this.resolution} : null
        });
    }
}

// ImageEntry class to represent an image with its settings
class ImageEntry {
    constructor(image, settings = new ImageSettings()) {
        this.id = generateUUID();
        this.image = image;
        this.settings = settings;
        this.thumbnail = null; // Will be generated later
    }

    // Clone the entry
    clone() {
        const newEntry = new ImageEntry(this.image);
        newEntry.settings = this.settings.clone();
        newEntry.thumbnail = this.thumbnail;
        return newEntry;
    }
}

// Resolution class to represent available resolutions
class Resolution {
    constructor(id, name, width, height, platforms = []) {
        this.id = id;
        this.name = name;
        this.width = width;
        this.height = height;
        this.platforms = platforms;
    }

    // Clone the resolution
    clone() {
        return new Resolution(this.id, this.name, this.width, this.height, [...this.platforms]);
    }
}

// Export the models
window.ImageModels = {
    ImageSettings,
    ImageEntry,
    Resolution
}; 