# FrameIt - Professional Screenshot Mockup Tool

Transform your screenshots and images into stunning professional mockups with custom frames, shadows, backgrounds, and effects. Perfect for portfolios, presentations, app stores, and marketing materials.

## 🌟 Features

### Image Management
- **Multi-Image Layouts**: Create mockups with 1-4 images using 8 different layout templates
  - Single Image
  - Side by Side (2 images)
  - Top & Bottom (2 images)
  - Main + Sidebar (2 images)
  - Three Columns (3 images)
  - 2×2 Grid (4 images)
  - Hero + Thumbnails (4 images)
  - L-Shape (3 images)
- **Drag & Drop Upload**: Simply drag images onto the canvas or use the upload button
- **Multiple Format Support**: PNG, JPEG, WebP, and other major image formats
- **Image Size Limits**: Up to 10MB per image, dimensions between 50x50 and 8000x8000 pixels
- **Gallery Management**: Save and manage multiple canvas designs
- **Image Manipulation**: Flip horizontally/vertically, rotate, and pan images

### Background Customization
- **Solid Colors**: Choose from 120+ carefully curated color presets organized by category:
  - Neutrals & Grays (24 colors)
  - Vibrant Colors (60 colors across reds, oranges, yellows, greens, blues, purples)
  - Earth Tones (8 browns & tans)
  - Modern Colors (16 tech & neon colors)
- **Gradient Backgrounds**: 100+ professional gradient presets in 6 categories:
  - Light to Dark Gradients (20 options)
  - Color Spectrum Gradients (38 options across all colors)
  - Metallic & Industrial (8 options)
  - Gemstone & Precious Materials (8 options)
  - Atmospheric & Weather (continuing collection)
- **Random Background**: One-click random background selection
- **Background Effects**:
  - Blur (0-50px)
  - Saturation (0-200%)
  - Hue Rotation (0-360°)
  - Contrast (0-200%)
  - Brightness (0-200%)
  - Twirl distortion
  - Wave distortion
  - Ripple effect
  - Zoom/Scale (50-150%)
  - Shake/Vibration effect
  - Lens distortion

### Noise & Texture Overlays
- **Texture Types**: Paper, Canvas, Grain, Fabric, and more
- **Customizable Properties**:
  - Intensity (0-100%)
  - Opacity (0-100%)
  - Scale (50-200%)
  - Blend modes (multiply, overlay, screen, etc.)
  - Invert option
- **Random Noise**: One-click random texture selection

### Frame & Shadow Controls
- **Corner Radius**: 0-100px rounded corners
- **Padding**: 0-200px spacing around images
- **Shadow Customization**:
  - Opacity (0-100%)
  - Blur radius (0-50px)
  - X/Y offset (-50 to +50px)
  - Color picker
  - Visual position grid for quick shadow placement
- **Quick Reset**: Individual reset buttons for each property

### Text Overlays
- **Multiple Text Layers**: Add unlimited text layers to your mockups
- **Font Options**: 20+ Google Fonts including:
  - Sans-serif: Inter, Lato, Source Sans Pro, Nunito, Poppins, Raleway, Fira Sans, Ubuntu, Work Sans, Quicksand, Barlow, DM Sans, Space Grotesk
  - Serif: Merriweather, Lora, PT Serif, Crimson Text
  - Monospace: JetBrains Mono, Fira Code, Source Code Pro
- **Text Styling**:
  - Font size (12-200px)
  - Color picker
  - Opacity (0-100%)
  - Bold, Italic, Underline
  - Text alignment (left, center, right)
- **Advanced Text Features**:
  - Text shadows with color and blur control
  - Background boxes with padding
  - Z-index control (bring to front/send to back)
  - Layer visibility toggle
  - Duplicate and delete layers
- **Positioning**: 9-point grid for quick positioning or manual X/Y coordinates

### Watermarks
- **Image Watermarks**: Upload your logo or brand image
- **Text Watermarks**: Add custom text watermarks
- **Watermark Controls**:
  - Opacity (0-100%)
  - Scale/Size adjustment
  - Position presets (top-left, top-right, bottom-left, bottom-right, center)
- **Apply to All**: Apply watermark settings to all canvases at once

### Export Options
- **Resolution Presets**: 6 optimized presets for different platforms
  - 1080×1080 (Square - Instagram, Facebook, LinkedIn, Pinterest)
  - 1080×1350 (Portrait - Instagram, Facebook, LinkedIn, Pinterest)
  - 1080×1920 (Story - Instagram, Facebook, Snapchat, TikTok)
  - 1200×627 (LinkedIn Post)
  - 1200×800 (Substack)
  - 1920×1080 (Landscape HD - Facebook, LinkedIn)
- **Export Formats**: PNG, JPEG, WebP
- **Size Options**:
  - Original size (1x)
  - Double size (2x) for high-DPI displays
  - Half size (0.5x) for web optimization
  - Custom dimensions with aspect ratio lock
- **Quality Settings**: Low, Medium, High compression
- **Batch Export**: Export all canvases at once with sequential numbering

### Smart Features
- **Smart Fill**: Intelligent image scaling to fill the canvas
- **Pan Controls**: Fine-tune image position with X/Y panning
- **Undo/Redo**: Full history management for all changes
- **Auto-Save**: Your work is automatically saved to browser storage
- **Templates**: Quick-start templates for common use cases
- **Collapsible Panels**: Organized UI with expandable/collapsible sections

### User Interface
- **Modern Design**: Clean, professional interface with dark theme
- **Responsive Layout**: Works on desktop, tablet, and mobile
- **Zoom Controls**: Zoom in/out on canvas preview
- **Keyboard Shortcuts**: Undo (Ctrl/Cmd+Z), Redo (Ctrl/Cmd+Shift+Z)
- **Visual Feedback**: Real-time preview of all changes
- **Tooltips & Help**: Contextual help throughout the interface

## 🚀 Getting Started

### Online Version
Visit [frameit.social](https://frameit.social) to use FrameIt instantly in your browser - no installation required!

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/frameit.git
   cd frameit
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to `http://localhost:3000`

### Production Build

```bash
npm run build
npm start
```

## 📖 Usage Guide

### Basic Workflow

1. **Upload Images**: Click "Start Creating" or drag images onto the canvas
2. **Choose Layout**: Select from 8 multi-image layout options
3. **Customize Background**: Pick a color, gradient, or apply effects
4. **Add Texture**: Apply noise overlays for depth and character
5. **Adjust Frame**: Set corner radius, padding, and shadows
6. **Add Text** (optional): Create text overlays with custom styling
7. **Add Watermark** (optional): Brand your mockups
8. **Export**: Choose your format and resolution, then download

### Tips & Tricks

- **Random Styling**: Use the random background and noise buttons for instant professional looks
- **Apply to All**: Use "Apply to All" to apply your current settings to all canvases
- **Keyboard Shortcuts**: Use Ctrl/Cmd+Z to undo, Ctrl/Cmd+Shift+Z to redo
- **Text Layers**: Layer text behind or in front of images using z-index controls
- **Batch Export**: Export all your designs at once with the "Export All" button
- **Smart Fill**: Enable Smart Fill for images that don't quite fit the canvas
- **Shadow Grid**: Click the shadow position grid for quick shadow placement

## 🎨 Use Cases

- **App Store Screenshots**: Create professional app store listings
- **Portfolio Presentations**: Showcase your work beautifully
- **Social Media Posts**: Design eye-catching social media graphics
- **Client Presentations**: Impress clients with polished mockups
- **Marketing Materials**: Create promotional images and banners
- **Product Showcases**: Display products in professional settings
- **Tutorial Content**: Create clear, branded tutorial images
- **Blog Headers**: Design custom blog post headers

## 🛠️ Technical Stack

- **Frontend**: Vanilla JavaScript (ES6+)
- **Canvas API**: HTML5 Canvas for image rendering
- **Storage**: LocalStorage for auto-save functionality
- **Fonts**: Google Fonts API
- **Icons**: Font Awesome 6
- **Server**: Express.js (Node.js)
- **Deployment**: Vercel-ready

## 📁 Project Structure

```
frameit/
├── index.html              # Landing page
├── app.html                # Main application
├── css/
│   ├── landing.css         # Landing page styles
│   └── styles.css          # Application styles
├── js/
│   ├── app.js              # Main application logic
│   ├── canvas.js           # Canvas rendering engine
│   ├── ui.js               # UI management
│   ├── config.js           # Configuration & presets
│   ├── utils.js            # Utility functions
│   ├── noise.js            # Noise/texture generation
│   ├── analytics.js        # Analytics tracking
│   └── models/
│       ├── export.js       # Export functionality
│       ├── image.js        # Image model
│       └── text.js         # Text layer model
├── api/                    # API endpoints
├── img/                    # Images and assets
└── server.js               # Express server
```

## 🔧 Configuration

### Resolution Presets
Edit `js/config.js` to add custom resolution presets:

```javascript
resolutionCategories: [
  {
    id: 'custom',
    name: 'Custom',
    resolutions: [
      { 
        id: 'my-preset', 
        name: '1200×1200', 
        width: 1200, 
        height: 1200, 
        platforms: ['custom']
      }
    ]
  }
]
```

### Color Presets
Add custom colors to `Config.colorPresets` array in `js/config.js`.

### Gradient Presets
Add custom gradients to gradient categories in `js/config.js`:

```javascript
{
  id: 'my-gradient',
  name: 'My Gradient',
  colors: ['#FF0000', '#0000FF'],
  direction: 'to bottom'
}
```

## 🌐 Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Opera 76+

**Note**: Some features like WebP export may not be available in older browsers.

## 📝 License

MIT License - see LICENSE file for details

## 👥 Credits

Created by Odd Omens

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For support, email hello@frameit.social or open an issue on GitHub.

## 🔄 Version History

### v1.0.0 (Current)
- Multi-image layouts (1-4 images)
- 120+ color presets
- 100+ gradient presets
- Advanced background effects
- Noise/texture overlays
- Text layers with full styling
- Image and text watermarks
- Multiple export formats and resolutions
- Undo/redo functionality
- Auto-save to browser storage
- Batch export functionality

---

**Made with ❤️ by the FrameIt team**
