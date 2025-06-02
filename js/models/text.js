// Text-specific models

// TextOverlay class for text annotations
class TextOverlay {
    constructor({
        text = 'Text Overlay',
        position = { x: 0.5, y: 0.5 },
        fontSize = 24,
        fontFamily = 'Arial, sans-serif',
        color = '#FFFFFF',
        align = 'center',
        bold = false,
        italic = false,
        underline = false,
        opacity = 1,
        zIndex = 10,
        visible = true,
        shadow = false,
        shadowColor = '#000000',
        shadowBlur = 3,
        shadowOffsetX = 2,
        shadowOffsetY = 2,
        backgroundColor = null,
        padding = 0
    } = {}) {
        this.id = generateUUID();
        this.text = text;
        this.position = position;
        this.fontSize = fontSize;
        this.fontFamily = fontFamily;
        this.color = color;
        this.align = align;
        this.bold = bold;
        this.italic = italic;
        this.underline = underline;
        this.opacity = opacity;
        this.zIndex = zIndex;
        this.visible = visible;
        this.shadow = shadow;
        this.shadowColor = shadowColor;
        this.shadowBlur = shadowBlur;
        this.shadowOffsetX = shadowOffsetX;
        this.shadowOffsetY = shadowOffsetY;
        this.backgroundColor = backgroundColor;
        this.padding = padding;
    }

    // Clone the text overlay
    clone() {
        return new TextOverlay({
            text: this.text,
            position: {...this.position},
            fontSize: this.fontSize,
            fontFamily: this.fontFamily,
            color: this.color,
            align: this.align,
            bold: this.bold,
            italic: this.italic,
            underline: this.underline,
            opacity: this.opacity,
            zIndex: this.zIndex,
            visible: this.visible,
            shadow: this.shadow,
            shadowColor: this.shadowColor,
            shadowBlur: this.shadowBlur,
            shadowOffsetX: this.shadowOffsetX,
            shadowOffsetY: this.shadowOffsetY,
            backgroundColor: this.backgroundColor,
            padding: this.padding
        });
    }

    // Get the font string for canvas context
    getFontString() {
        const style = [];
        if (this.bold) style.push('bold');
        if (this.italic) style.push('italic');
        style.push(`${this.fontSize}px`);
        style.push(this.fontFamily);
        return style.join(' ');
    }
}

// Export the models
window.TextModels = {
    TextOverlay
}; 