/**
 * Configuration settings and constants for the Screenshot Mockup Tool
 */

window.Config = {
    // Default values
    defaultCornerRadius: 25,
    defaultPadding: 75,
    defaultShadowOpacity: 0.15,
    defaultShadowRadius: 8,
    defaultShadowOffsetX: 0,
    defaultShadowOffsetY: 4,
    defaultShadowColor: '#000000',
    defaultRotation: 0,
    
    // Resolution categories and presets
    resolutionCategories: [
        {
            id: 'resolutions',
            name: 'Resolutions',
            resolutions: [
                { 
                    id: 'square', 
                    name: '1080×1080', 
                    width: 1080, 
                    height: 1080, 
                    platforms: ['instagram', 'facebook', 'linkedin', 'pinterest']
                },
                { 
                    id: 'portrait', 
                    name: '1080×1350', 
                    width: 1080, 
                    height: 1350, 
                    platforms: ['instagram', 'facebook', 'linkedin', 'pinterest']
                },
                { 
                    id: 'story-vertical', 
                    name: '1080×1920', 
                    width: 1080, 
                    height: 1920, 
                    platforms: ['instagram', 'facebook', 'snapchat', 'tiktok']
                },
                { 
                    id: 'linkedin-post', 
                    name: '1200×627', 
                    width: 1200, 
                    height: 627, 
                    platforms: ['linkedin']
                },
                { 
                    id: 'substack', 
                    name: '1200×800', 
                    width: 1200, 
                    height: 800, 
                    platforms: ['substack']
                }
            ]
        }
    ],
    
    // Export formats
    exportFormats: [
        { id: 'png', name: 'PNG', mimeType: 'image/png' },
        { id: 'jpeg', name: 'JPEG', mimeType: 'image/jpeg' },
        { id: 'webp', name: 'WebP', mimeType: 'image/webp' }
    ],
    
    // Export dimension presets
    exportDimensionPresets: [
        { id: 'original', name: 'Original Size (1x)', scale: 1 },
        { id: 'double', name: 'Double Size (2x)', scale: 2 },
        { id: 'half', name: 'Half Size (0.5x)', scale: 0.5 },
        { id: 'custom', name: 'Custom Size...', scale: null }
    ],
    
    // Image quality options
    imageQualityOptions: [
        { id: 'low', name: 'Low', value: 0.5 },
        { id: 'medium', name: 'Medium', value: 0.8 },
        { id: 'high', name: 'High', value: 1.0 }
    ],
    
    // Color presets
    colorPresets: [
        // Whites & Light Grays (5)
        '#FFFFFF',                                   // White
        '#FAFAFA',                                   // Off White
        '#F2F2F2',                                   // Lightest Gray
        '#E6E6E6',                                   // Pale Gray
        '#D9D9D9',                                   // Light Gray
        
        // Dark Grays & Blacks (5)
        '#999999',                                   // Medium Gray
        '#666666',                                   // Gray
        '#404040',                                   // Dark Gray
        '#1A1A1A',                                   // Charcoal
        '#000000',                                   // Black
        
        // Blues (5)
        '#CCE6FF',                                   // Baby Blue
        '#66B2FF',                                   // Sky Blue
        '#0080E6',                                   // Royal Blue
        '#004DB3',                                   // Navy Blue
        '#001A66',                                   // Midnight Blue
        
        // Reds (5)
        '#FFCCCC',                                   // Light Red
        '#FF8080',                                   // Salmon Red
        '#FF3333',                                   // Bright Red
        '#CC0000',                                   // Red
        '#800000',                                   // Dark Red
        
        // Yellows (5)
        '#FFFACC',                                   // Cream
        '#FFF299',                                   // Light Yellow
        '#FFE64D',                                   // Yellow
        '#F2CD19',                                   // Golden Yellow
        '#CC9900',                                   // Amber
        
        // Oranges (5)
        '#FFE6B3',                                   // Peach
        '#FFB366',                                   // Light Orange
        '#FF9933',                                   // Orange
        '#E66600',                                   // Dark Orange
        '#B34D00',                                   // Burnt Orange
        
        // Purples (5)
        '#E6CCFF',                                   // Lavender
        '#B380E6',                                   // Light Purple
        '#804DCC',                                   // Purple
        '#661A99',                                   // Deep Purple
        '#330066',                                   // Dark Purple
        
        // Greens (5)
        '#CCFFCC',                                   // Mint
        '#80E699',                                   // Light Green
        '#33CC66',                                   // Green
        '#00994D',                                   // Forest Green
        '#006633',                                   // Dark Green
        
        // Browns (5)
        '#E6CCB3',                                   // Tan
        '#CC9966',                                   // Light Brown
        '#996633',                                   // Brown
        '#663300',                                   // Dark Brown
        '#40200D',                                   // Chocolate
        
        // Pinks (5)
        '#FFE6F2',                                   // Pale Pink
        '#FFB3CC',                                   // Light Pink
        '#FF80B2',                                   // Pink
        '#E64D99',                                   // Hot Pink
        '#B31966'                                    // Deep Pink
    ],
    
    // Multi-image layout templates
    multiImageLayouts: [
        {
            id: 'single',
            name: 'Single Image',
            maxImages: 1,
            thumbnail: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="10" y="10" width="80" height="80" fill="%23ddd" stroke="%23999" stroke-width="2" rx="8"/></svg>',
            positions: [
                { x: 0, y: 0, width: 1, height: 1 }
            ]
        },
        {
            id: 'side-by-side',
            name: 'Side by Side',
            maxImages: 2,
            thumbnail: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="5" y="15" width="40" height="70" fill="%23ddd" stroke="%23999" stroke-width="2" rx="4"/><rect x="55" y="15" width="40" height="70" fill="%23ddd" stroke="%23999" stroke-width="2" rx="4"/></svg>',
            positions: [
                { x: 0, y: 0, width: 0.48, height: 1 },
                { x: 0.52, y: 0, width: 0.48, height: 1 }
            ]
        },
        {
            id: 'top-bottom',
            name: 'Top & Bottom',
            maxImages: 2,
            thumbnail: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="15" y="5" width="70" height="40" fill="%23ddd" stroke="%23999" stroke-width="2" rx="4"/><rect x="15" y="55" width="70" height="40" fill="%23ddd" stroke="%23999" stroke-width="2" rx="4"/></svg>',
            positions: [
                { x: 0, y: 0, width: 1, height: 0.48 },
                { x: 0, y: 0.52, width: 1, height: 0.48 }
            ]
        },
        {
            id: 'main-with-sidebar',
            name: 'Main + Sidebar',
            maxImages: 2,
            thumbnail: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="5" y="10" width="60" height="80" fill="%23ddd" stroke="%23999" stroke-width="2" rx="4"/><rect x="72" y="10" width="23" height="80" fill="%23ddd" stroke="%23999" stroke-width="2" rx="4"/></svg>',
            positions: [
                { x: 0, y: 0, width: 0.68, height: 1 },
                { x: 0.72, y: 0, width: 0.28, height: 1 }
            ]
        },
        {
            id: 'three-column',
            name: 'Three Columns',
            maxImages: 3,
            thumbnail: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="2" y="15" width="28" height="70" fill="%23ddd" stroke="%23999" stroke-width="1.5" rx="3"/><rect x="36" y="15" width="28" height="70" fill="%23ddd" stroke="%23999" stroke-width="1.5" rx="3"/><rect x="70" y="15" width="28" height="70" fill="%23ddd" stroke="%23999" stroke-width="1.5" rx="3"/></svg>',
            positions: [
                { x: 0, y: 0, width: 0.32, height: 1 },
                { x: 0.34, y: 0, width: 0.32, height: 1 },
                { x: 0.68, y: 0, width: 0.32, height: 1 }
            ]
        },
        {
            id: 'grid-2x2',
            name: '2×2 Grid',
            maxImages: 4,
            thumbnail: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="5" y="5" width="40" height="40" fill="%23ddd" stroke="%23999" stroke-width="2" rx="4"/><rect x="55" y="5" width="40" height="40" fill="%23ddd" stroke="%23999" stroke-width="2" rx="4"/><rect x="5" y="55" width="40" height="40" fill="%23ddd" stroke="%23999" stroke-width="2" rx="4"/><rect x="55" y="55" width="40" height="40" fill="%23ddd" stroke="%23999" stroke-width="2" rx="4"/></svg>',
            positions: [
                { x: 0, y: 0, width: 0.48, height: 0.48 },
                { x: 0.52, y: 0, width: 0.48, height: 0.48 },
                { x: 0, y: 0.52, width: 0.48, height: 0.48 },
                { x: 0.52, y: 0.52, width: 0.48, height: 0.48 }
            ]
        },
        {
            id: 'hero-with-thumbs',
            name: 'Hero + Thumbnails',
            maxImages: 4,
            thumbnail: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="5" y="5" width="90" height="60" fill="%23ddd" stroke="%23999" stroke-width="2" rx="4"/><rect x="5" y="72" width="27" height="23" fill="%23ddd" stroke="%23999" stroke-width="1.5" rx="2"/><rect x="37" y="72" width="27" height="23" fill="%23ddd" stroke="%23999" stroke-width="1.5" rx="2"/><rect x="69" y="72" width="27" height="23" fill="%23ddd" stroke="%23999" stroke-width="1.5" rx="2"/></svg>',
            positions: [
                { x: 0, y: 0, width: 1, height: 0.65 },
                { x: 0, y: 0.72, width: 0.32, height: 0.28 },
                { x: 0.34, y: 0.72, width: 0.32, height: 0.28 },
                { x: 0.68, y: 0.72, width: 0.32, height: 0.28 }
            ]
        },
        {
            id: 'l-shape',
            name: 'L-Shape',
            maxImages: 3,
            thumbnail: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="5" y="5" width="60" height="60" fill="%23ddd" stroke="%23999" stroke-width="2" rx="4"/><rect x="72" y="5" width="23" height="28" fill="%23ddd" stroke="%23999" stroke-width="2" rx="4"/><rect x="72" y="40" width="23" height="25" fill="%23ddd" stroke="%23999" stroke-width="2" rx="4"/></svg>',
            positions: [
                { x: 0, y: 0, width: 0.68, height: 0.68 },
                { x: 0.72, y: 0, width: 0.28, height: 0.32 },
                { x: 0.72, y: 0.36, width: 0.28, height: 0.32 }
            ]
        }
    ],
    
    // Gradient presets - organized as separate sections
    lightToDarkGradients: [
        // Light Gradients First
        {
            id: 'frost',
            name: 'Frost',
            colors: ['#F2F4FF', '#E6E6E6'],
            direction: 'to bottom'
        },
        {
            id: 'midnight',
            name: 'Midnight',
            colors: ['#333340', '#0D0D1A'],
            direction: 'to bottom'
        },
        {
            id: 'smoke',
            name: 'Smoke',
            colors: ['#FFFFFF', '#9E9E9E'],
            direction: 'to bottom'
        },
        {
            id: 'charcoal',
            name: 'Charcoal',
            colors: ['#4A4A4A', '#1C1C1C'],
            direction: 'to bottom'
        },
        {
            id: 'pearl',
            name: 'Pearl',
            colors: ['#FEFEFE', '#E8E8E8'],
            direction: 'to bottom'
        },
        {
            id: 'graphite',
            name: 'Graphite',
            colors: ['#6B6B6B', '#2C2C2C'],
            direction: 'to bottom'
        },
        // New cool additions
        {
            id: 'arctic-mist',
            name: 'Arctic Mist',
            colors: ['#f7f9fc', '#d4e6f1', '#a6b8d1'],
            direction: 'to bottom'
        },
        {
            id: 'shadow-dance',
            name: 'Shadow Dance',
            colors: ['#e8eaf2', '#9ca5b4', '#4a4e5c'],
            direction: 'to bottom right'
        },
        {
            id: 'moonbeam',
            name: 'Moonbeam',
            colors: ['#ffffff', '#f0f2f5', '#c7cdd6'],
            direction: 'radial-gradient(circle at 30% 20%'
        },
        {
            id: 'storm-cloud',
            name: 'Storm Cloud',
            colors: ['#5a6169', '#3c424a', '#1e2124'],
            direction: 'to bottom'
        },
        {
            id: 'silver-lining',
            name: 'Silver Lining',
            colors: ['#fafbfc', '#e1e5e9', '#b8bcc2'],
            direction: 'to bottom left'
        },
        {
            id: 'obsidian',
            name: 'Obsidian',
            colors: ['#434343', '#2d2d30', '#0f0f0f'],
            direction: 'to bottom'
        },
        {
            id: 'mist-valley',
            name: 'Mist Valley',
            colors: ['#ffffff', '#f5f7fa', '#dde3ea'],
            direction: 'radial-gradient(ellipse at center'
        },
        {
            id: 'volcanic-ash',
            name: 'Volcanic Ash',
            colors: ['#7d7d7d', '#5a5a5a', '#2e2e2e'],
            direction: 'to bottom right'
        },
        {
            id: 'cloud-nine',
            name: 'Cloud Nine',
            colors: ['#ffffff', '#f8fafc', '#e2e8f0'],
            direction: 'to bottom'
        },
        {
            id: 'deep-space',
            name: 'Deep Space',
            colors: ['#2c3e50', '#1a252f', '#0d1421'],
            direction: 'to bottom'
        }
    ],
    
    colorSpectrumGradients: [
        // Blue Gradients (5)
        {
            id: 'sky',
            name: 'Sky',
            colors: ['#CCE6FF', '#99CCFF'],
            direction: 'to bottom'
        },
        {
            id: 'azure',
            name: 'Azure',
            colors: ['#80CCFF', '#4D99E6'],
            direction: 'to bottom'
        },
        {
            id: 'ocean',
            name: 'Ocean',
            colors: ['#0080E6', '#00B3B3'],
            direction: 'to bottom'
        },
        {
            id: 'sapphire',
            name: 'Sapphire',
            colors: ['#1A4DCC', '#001A80'],
            direction: 'to bottom'
        },
        {
            id: 'navy',
            name: 'Navy',
            colors: ['#003380', '#00084D'],
            direction: 'to bottom'
        },
        
        // Red Gradients (5)
        {
            id: 'rose',
            name: 'Rose',
            colors: ['#FFCCCC', '#FF9999'],
            direction: 'to bottom'
        },
        {
            id: 'coral',
            name: 'Coral',
            colors: ['#FF9980', '#E6664D'],
            direction: 'to bottom'
        },
        {
            id: 'crimson',
            name: 'Crimson',
            colors: ['#FF3333', '#CC0000'],
            direction: 'to bottom'
        },
        {
            id: 'ruby',
            name: 'Ruby',
            colors: ['#CC0000', '#990000'],
            direction: 'to bottom'
        },
        {
            id: 'wine',
            name: 'Wine',
            colors: ['#990000', '#660019'],
            direction: 'to bottom'
        },
        
        // Yellow Gradients (5)
        {
            id: 'cream',
            name: 'Cream',
            colors: ['#FFFAE6', '#FFF5CC'],
            direction: 'to bottom'
        },
        {
            id: 'sunrise',
            name: 'Sunrise',
            colors: ['#FFF2B3', '#FFEB80'],
            direction: 'to bottom'
        },
        {
            id: 'golden',
            name: 'Golden',
            colors: ['#FFE64D', '#F2CC33'],
            direction: 'to bottom'
        },
        {
            id: 'amber',
            name: 'Amber',
            colors: ['#F2CC33', '#E69900'],
            direction: 'to bottom'
        },
        {
            id: 'honey',
            name: 'Honey',
            colors: ['#E6B300', '#CC8800'],
            direction: 'to bottom'
        }
    ],
        
    natureEarthGradients: [
        // Light & Bright Nature Tones
        {
            id: 'mint',
            name: 'Mint',
            colors: ['#CCFFCC', '#99E699'],
            id: 'peach',
            name: 'Peach',
            colors: ['#FFE6CC', '#FFCC99'],
            direction: 'to bottom'
        },
        {
            id: 'sunset',
            name: 'Sunset',
            colors: ['#FFB366', '#FF8033'],
            direction: 'to bottom'
        },
        {
            id: 'autumn',
            name: 'Autumn',
            colors: ['#FF8019', '#CC4C00'],
            direction: 'to bottom'
        },
        {
            id: 'copper',
            name: 'Copper',
            colors: ['#CC6633', '#994C19'],
            direction: 'to bottom'
        },
        {
            id: 'rust',
            name: 'Rust',
            colors: ['#B34D00', '#803300'],
            direction: 'to bottom'
        },
        
        // Green Gradients (5)
        {
            id: 'mint',
            name: 'Mint',
            colors: ['#CCFFCC', '#99E699'],
            direction: 'to bottom'
        },
        {
            id: 'spring',
            name: 'Spring',
            colors: ['#99E699', '#66CC80'],
            direction: 'to bottom'
        },
        {
            id: 'emerald',
            name: 'Emerald',
            colors: ['#4DCC80', '#00994D'],
            direction: 'to bottom'
        },
        {
            id: 'forest',
            name: 'Forest',
            colors: ['#00994D', '#006633'],
            direction: 'to bottom'
        },
        {
            id: 'olive',
            name: 'Olive',
            colors: ['#4D6600', '#334D00'],
            direction: 'to bottom'
        },
        
        // Brown Gradients (5)
        {
            id: 'sand',
            name: 'Sand',
            colors: ['#F2E6CC', '#E6CCB3'],
            direction: 'to bottom'
        },
        {
            id: 'desert',
            name: 'Desert',
            colors: ['#E6CCB3', '#CCB380'],
            direction: 'to bottom'
        },
        {
            id: 'caramel',
            name: 'Caramel',
            colors: ['#CC9966', '#B3804D'],
            direction: 'to bottom'
        },
        {
            id: 'chocolate',
            name: 'Chocolate',
            colors: ['#996633', '#664D1A'],
            direction: 'to bottom'
        },
        {
            id: 'coffee',
            name: 'Coffee',
            colors: ['#66331A', '#40200D'],
            direction: 'to bottom'
        },
        // New nature additions
        {
            id: 'ocean-depths',
            name: 'Ocean Depths',
            colors: ['#87ceeb', '#4682b4', '#191970'],
            direction: 'to bottom'
        },
        {
            id: 'forest-canopy',
            name: 'Forest Canopy',
            colors: ['#98fb98', '#228b22', '#006400', '#2f4f2f'],
            direction: 'to bottom'
        },
        {
            id: 'mountain-mist',
            name: 'Mountain Mist',
            colors: ['#f0f8ff', '#b0c4de', '#708090'],
            direction: 'to bottom'
        },
        {
            id: 'autumn-leaves',
            name: 'Autumn Leaves',
            colors: ['#ffd700', '#ff8c00', '#ff4500', '#8b4513'],
            direction: 'radial-gradient(circle at center'
        },
        {
            id: 'tropical-waters',
            name: 'Tropical Waters',
            colors: ['#e0ffff', '#40e0d0', '#008b8b'],
            direction: 'to bottom'
        },
        {
            id: 'prairie-sunrise',
            name: 'Prairie Sunrise',
            colors: ['#fff8dc', '#f0e68c', '#daa520', '#8b4513'],
            direction: 'to bottom right'
        },
        {
            id: 'bamboo-grove',
            name: 'Bamboo Grove',
            colors: ['#f0fff0', '#90ee90', '#32cd32', '#228b22'],
            direction: 'to bottom'
        },
        {
            id: 'canyon-rocks',
            name: 'Canyon Rocks',
            colors: ['#faebd7', '#deb887', '#cd853f', '#a0522d'],
            direction: 'to bottom'
        },
        {
            id: 'moss-stone',
            name: 'Moss Stone',
            colors: ['#f5f5dc', '#9acd32', '#556b2f', '#2f4f2f'],
            direction: 'radial-gradient(ellipse at 40% 30%'
        },
        {
            id: 'river-pebbles',
            name: 'River Pebbles',
            colors: ['#f0f8ff', '#d3d3d3', '#a9a9a9', '#696969'],
            direction: 'to bottom'
        },
        {
            id: 'wildflower-meadow',
            name: 'Wildflower Meadow',
            colors: ['#fffacd', '#98fb98', '#90ee90', '#32cd32'],
            direction: 'to bottom right'
        },
        {
            id: 'coral-reef',
            name: 'Coral Reef',
            colors: ['#ffd1dc', '#ff7f50', '#ff6347', '#20b2aa'],
            direction: 'radial-gradient(circle at 60% 40%'
        },
        {
            id: 'redwood-bark',
            name: 'Redwood Bark',
            colors: ['#deb887', '#a0522d', '#8b4513', '#654321'],
            direction: 'to bottom'
        },
        {
            id: 'alpine-snow',
            name: 'Alpine Snow',
            colors: ['#ffffff', '#f8f8ff', '#e6e6fa', '#d3d3d3'],
            direction: 'radial-gradient(ellipse at 50% 20%'
        },
        {
            id: 'volcanic-earth',
            name: 'Volcanic Earth',
            colors: ['#2f4f4f', '#8b4513', '#a0522d', '#cd853f'],
            direction: 'to bottom'
        }
    ],
    
    creativeFusionGradients: [
        // Multi-Color & Creative Gradients
        {
            id: 'rainbow',
            name: 'Rainbow',
            colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'],
            direction: 'to right'
        },
        {
            id: 'sunset-vibes',
            name: 'Sunset Vibes',
            colors: ['#FF9A8B', '#FF6A88', '#A8E6CF'],
            direction: 'to bottom right'
        },
        {
            id: 'ocean-breeze',
            name: 'Ocean Breeze',
            colors: ['#667eea', '#764ba2', '#f093fb'],
            direction: 'to bottom'
        },
        {
            id: 'cosmic-fusion',
            name: 'Cosmic Fusion',
            colors: ['#fa709a', '#fee140', '#764ba2'],
            direction: 'to bottom right'
        },
        {
            id: 'northern-lights',
            name: 'Northern Lights',
            colors: ['#00c6ff', '#0072ff', '#00ff72', '#7cf7ff'],
            direction: 'to right'
        },
        {
            id: 'fire-ice',
            name: 'Fire & Ice',
            colors: ['#ff9a9e', '#fecfef', '#fecfef', '#a8edea'],
            direction: 'to bottom'
        },
        {
            id: 'tropical-paradise',
            name: 'Tropical Paradise',
            colors: ['#a8edea', '#fed6e3', '#ffd89b', '#19547b'],
            direction: 'to bottom right'
        },
        {
            id: 'galaxy-dream',
            name: 'Galaxy Dream',
            colors: ['#667eea', '#764ba2', '#f093fb', '#f5576c'],
            direction: 'to bottom'
        },
        {
            id: 'citrus-burst',
            name: 'Citrus Burst',
            colors: ['#fa709a', '#fee140', '#f093fb'],
            direction: 'to right'
        },
        {
            id: 'mystical-forest',
            name: 'Mystical Forest',
            colors: ['#134e5e', '#71b280', '#a8e6cf'],
            direction: 'to bottom'
        },
        {
            id: 'electric-dreams',
            name: 'Electric Dreams',
            colors: ['#667eea', '#764ba2', '#f093fb', '#667eea'],
            direction: 'to bottom right'
        },
        {
            id: 'golden-hour',
            name: 'Golden Hour',
            colors: ['#f093fb', '#f5576c', '#4facfe', '#00f2fe'],
            direction: 'to bottom'
        },
        {
            id: 'purple-haze',
            name: 'Purple Haze',
            colors: ['#a8edea', '#fed6e3', '#d299c2', '#fef9d7'],
            direction: 'to right'
        },
        {
            id: 'neon-nights',
            name: 'Neon Nights',
            colors: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#fdcb6e'],
            direction: 'to bottom right'
        },
        {
            id: 'candy-crush',
            name: 'Candy Crush',
            colors: ['#ffecd2', '#fcb69f', '#ff9a9e', '#fad0c4'],
            direction: 'to bottom'
        },
        
        // New Swirl and Dynamic Gradients
        {
            id: 'aurora-swirl',
            name: 'Aurora Swirl',
            colors: ['#00ff87', '#60efff', '#a8ff78', '#78ffd6'],
            direction: 'radial-gradient(circle at 20% 50%'
        },
        {
            id: 'liquid-metal',
            name: 'Liquid Metal',
            colors: ['#c0c0aa', '#1cefff', '#4facfe', '#43e97b'],
            direction: 'radial-gradient(ellipse at center'
        },
        {
            id: 'plasma-storm',
            name: 'Plasma Storm',
            colors: ['#ff0844', '#ffb199', '#ff6ec7', '#36d1dc'],
            direction: 'radial-gradient(circle at 70% 20%'
        },
        {
            id: 'crystal-cavern',
            name: 'Crystal Cavern',
            colors: ['#667db6', '#0082c8', '#0052d4', '#667db6'],
            direction: 'radial-gradient(ellipse at 30% 70%'
        },
        {
            id: 'fire-vortex',
            name: 'Fire Vortex',
            colors: ['#ff9068', '#fd746c', '#ff4757', '#ffa726'],
            direction: 'radial-gradient(circle at 80% 30%'
        },
        {
            id: 'ice-spiral',
            name: 'Ice Spiral',
            colors: ['#74b9ff', '#0984e3', '#00cec9', '#81ecec'],
            direction: 'radial-gradient(ellipse at 60% 80%'
        },
        {
            id: 'rainbow-vortex',
            name: 'Rainbow Vortex',
            colors: ['#ff7675', '#74b9ff', '#55a3ff', '#fd79a8', '#fdcb6e'],
            direction: 'radial-gradient(circle at center'
        },
        {
            id: 'energy-pulse',
            name: 'Energy Pulse',
            colors: ['#6c5ce7', '#a29bfe', '#fd79a8', '#fdcb6e'],
            direction: 'radial-gradient(ellipse at 50% 30%'
        },
        {
            id: 'cosmic-waves',
            name: 'Cosmic Waves',
            colors: ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#667eea'],
            direction: 'conic-gradient(from 45deg'
        },
        {
            id: 'neon-whirlpool',
            name: 'Neon Whirlpool',
            colors: ['#ff006e', '#8338ec', '#3a86ff', '#06ffa5'],
            direction: 'conic-gradient(from 180deg'
        },
        {
            id: 'sunset-spiral',
            name: 'Sunset Spiral',
            colors: ['#ff9500', '#ff5722', '#ff1744', '#e91e63'],
            direction: 'conic-gradient(from 270deg'
        },
        {
            id: 'ocean-whirl',
            name: 'Ocean Whirl',
            colors: ['#0099f7', '#00d4aa', '#5f27cd', '#341f97'],
            direction: 'conic-gradient(from 90deg'
        },
        {
            id: 'prismatic-burst',
            name: 'Prismatic Burst',
            colors: ['#ff0080', '#ff8c00', '#ffd700', '#00ff00', '#0080ff', '#8000ff'],
            direction: 'conic-gradient(from 0deg'
        },
        {
            id: 'aurora-dance',
            name: 'Aurora Dance',
            colors: ['#00f260', '#0575e6', '#009ffd', '#2a2a72'],
            direction: 'conic-gradient(from 135deg'
        },
        {
            id: 'molten-lava',
            name: 'Molten Lava',
            colors: ['#ff512f', '#dd2476', '#f953c6', '#b91d73'],
            direction: 'radial-gradient(circle at 40% 60%'
        }
    ],
    
    luxuryVibesGradients: [
        // Light Luxury Tones
        {
            id: 'blush',
            name: 'Blush',
            colors: ['#FFE6F2', '#FFCCE6'],
            direction: 'to bottom'
        },
        {
            id: 'lavender',
            name: 'Lavender',
            colors: ['#E6CCFF', '#CCB3FF'],
            direction: 'to bottom'
        },
        {
            id: 'pearl-essence',
            name: 'Pearl Essence',
            colors: ['#ffffff', '#f8f8ff', '#e6e6fa', '#d3d3d3'],
            direction: 'to bottom right'
        },
        {
            id: 'champagne',
            name: 'Champagne',
            colors: ['#fff8dc', '#f5deb3', '#daa520'],
            direction: 'to bottom'
        },
        {
            id: 'golden-silk',
            name: 'Golden Silk',
            colors: ['#fff8dc', '#ffd700', '#daa520', '#b8860b'],
            direction: 'to bottom'
        },
        {
            id: 'emerald-luxury',
            name: 'Emerald Luxury',
            colors: ['#f0fff0', '#98fb98', '#00ff7f', '#00fa9a'],
            direction: 'radial-gradient(circle at center'
        },
        {
            id: 'sapphire-dreams',
            name: 'Sapphire Dreams',
            colors: ['#e6f3ff', '#87ceeb', '#4169e1', '#0000cd'],
            direction: 'to bottom'
        },
        {
            id: 'platinum-shine',
            name: 'Platinum Shine',
            colors: ['#f5f5f5', '#e5e4e2', '#c0c0c0', '#a9a9a9'],
            direction: 'radial-gradient(ellipse at 30% 50%'
        },
        {
            id: 'diamond-sparkle',
            name: 'Diamond Sparkle',
            colors: ['#ffffff', '#f0f8ff', '#e6e6fa', '#dda0dd'],
            direction: 'conic-gradient(from 45deg'
        },
        {
            id: 'marble-luxury',
            name: 'Marble Luxury',
            colors: ['#ffffff', '#f5f5f5', '#e0e0e0', '#d3d3d3'],
            direction: 'radial-gradient(ellipse at 40% 60%'
        },
        {
            id: 'ivory-tower',
            name: 'Ivory Tower',
            colors: ['#fffff0', '#fdf5e6', '#f5deb3', '#deb887'],
            direction: 'to bottom'
        },
        {
            id: 'opal-shimmer',
            name: 'Opal Shimmer',
            colors: ['#ffffff', '#ffd1dc', '#da70d6', '#9370db'],
            direction: 'conic-gradient(from 90deg'
        },
        {
            id: 'titanium-finish',
            name: 'Titanium Finish',
            colors: ['#f5f5f5', '#dcdcdc', '#c0c0c0', '#808080'],
            direction: 'to bottom'
        },
        
        // Medium Luxury Tones
        {
            id: 'lilac',
            name: 'Lilac',
            colors: ['#CCB3E6', '#B380CC'],
            direction: 'to bottom'
        },
        {
            id: 'candy',
            name: 'Candy',
            colors: ['#FFCCE6', '#FF99CC'],
            direction: 'to bottom'
        },
        {
            id: 'rose-gold',
            name: 'Rose Gold',
            colors: ['#ffecd2', '#fcb69f', '#ff8a80'],
            direction: 'to bottom right'
        },
        {
            id: 'bronze-elegance',
            name: 'Bronze Elegance',
            colors: ['#faebd7', '#daa520', '#cd853f', '#8b4513'],
            direction: 'to bottom'
        },
        {
            id: 'ruby-velvet',
            name: 'Ruby Velvet',
            colors: ['#ffe4e1', '#dc143c', '#b22222', '#8b0000'],
            direction: 'to bottom right'
        },
        {
            id: 'copper-patina',
            name: 'Copper Patina',
            colors: ['#faebd7', '#b87333', '#cd853f', '#2e8b57'],
            direction: 'to bottom'
        },
        {
            id: 'amethyst-glow',
            name: 'Amethyst Glow',
            colors: ['#f8f8ff', '#dda0dd', '#9370db', '#8b008b'],
            direction: 'to bottom right'
        },
        
        // Medium-Dark Luxury Tones
        {
            id: 'violet',
            name: 'Violet',
            colors: ['#9966CC', '#8033B3'],
            direction: 'to bottom'
        },
        {
            id: 'berry',
            name: 'Berry',
            colors: ['#FF80B3', '#E6499A'],
            direction: 'to bottom'
        },
        {
            id: 'fuchsia',
            name: 'Fuchsia',
            colors: ['#E6499A', '#CC1980'],
            direction: 'to bottom'
        },
        {
            id: 'platinum-dreams',
            name: 'Platinum Dreams',
            colors: ['#f2f2f2', '#d4d4d4', '#a8a8a8', '#7d7d7d'],
            direction: 'to bottom'
        },
        
        // Dark Luxury Tones
        {
            id: 'amethyst',
            name: 'Amethyst',
            colors: ['#8033B3', '#4D0080'],
            direction: 'to bottom'
        },
        {
            id: 'royal',
            name: 'Royal',
            colors: ['#4D0080', '#33004D'],
            direction: 'to bottom'
        },
        {
            id: 'magenta',
            name: 'Magenta',
            colors: ['#CC1980', '#991466'],
            direction: 'to bottom'
        },
        {
            id: 'velvet-night',
            name: 'Velvet Night',
            colors: ['#2c1810', '#8b4513', '#cd853f', '#f4a460'],
            direction: 'to bottom'
        },
        {
            id: 'midnight-luxury',
            name: 'Midnight Luxury',
            colors: ['#191970', '#483d8b', '#6a5acd', '#9370db'],
            direction: 'radial-gradient(circle at 60% 20%'
        }
    ],
    
    cosmicEnergyGradients: [
        {
            id: 'interstellar',
            name: 'Interstellar',
            colors: ['#000428', '#004e92', '#009ffd', '#00d2ff'],
            direction: 'to bottom'
        },
        {
            id: 'nebula-storm',
            name: 'Nebula Storm',
            colors: ['#8360c3', '#2ebf91', '#f093fb', '#f5576c'],
            direction: 'to bottom right'
        },
        {
            id: 'solar-flare',
            name: 'Solar Flare',
            colors: ['#ff9a9e', '#fad0c4', '#fad0c4', '#ffd1ff'],
            direction: 'to right'
        },
        {
            id: 'black-hole',
            name: 'Black Hole',
            colors: ['#434343', '#000000', '#434343', '#000000'],
            direction: 'radial-gradient(circle'
        },
        {
            id: 'asteroid-belt',
            name: 'Asteroid Belt',
            colors: ['#606c88', '#3f4c6b', '#2c3e50'],
            direction: 'to bottom'
        },
        {
            id: 'supernova',
            name: 'Supernova',
            colors: ['#ff6b6b', '#ffa500', '#ffff00', '#ffffff'],
            direction: 'radial-gradient(circle'
        },
        {
            id: 'cosmic-dust',
            name: 'Cosmic Dust',
            colors: ['#667eea', '#764ba2', '#f093fb', '#667eea'],
            direction: 'to right'
        },
        {
            id: 'starlight',
            name: 'Starlight',
            colors: ['#ffffff', '#e0e0e0', '#c0c0c0', '#a0a0a0'],
            direction: 'radial-gradient(circle'
        },
        
        // New Cosmic Swirl Gradients
        {
            id: 'galaxy-spiral',
            name: 'Galaxy Spiral',
            colors: ['#1a0033', '#330066', '#6600cc', '#9933ff', '#cc66ff'],
            direction: 'conic-gradient(from 0deg'
        },
        {
            id: 'neutron-star',
            name: 'Neutron Star',
            colors: ['#001122', '#0066cc', '#00ccff', '#ffffff'],
            direction: 'radial-gradient(circle at 30% 40%'
        },
        {
            id: 'wormhole',
            name: 'Wormhole',
            colors: ['#000000', '#1a1a2e', '#16213e', '#0f3460', '#533483'],
            direction: 'radial-gradient(ellipse at center'
        },
        {
            id: 'cosmic-radiation',
            name: 'Cosmic Radiation',
            colors: ['#ff0080', '#8000ff', '#0080ff', '#00ff80', '#ff8000'],
            direction: 'conic-gradient(from 90deg'
        },
        {
            id: 'quasar-beam',
            name: 'Quasar Beam',
            colors: ['#001a4d', '#0066cc', '#00ccff', '#66ffff'],
            direction: 'radial-gradient(ellipse at 20% 80%'
        },
        {
            id: 'dark-matter',
            name: 'Dark Matter',
            colors: ['#0d1421', '#1a252f', '#2c3e50', '#34495e'],
            direction: 'radial-gradient(circle at 60% 30%'
        },
        {
            id: 'time-vortex',
            name: 'Time Vortex',
            colors: ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe'],
            direction: 'conic-gradient(from 180deg'
        },
        {
            id: 'stellar-birth',
            name: 'Stellar Birth',
            colors: ['#ff4d6d', '#ffb74d', '#fff176', '#ffffff'],
            direction: 'radial-gradient(circle at 70% 50%'
        },
        {
            id: 'space-anomaly',
            name: 'Space Anomaly',
            colors: ['#1e3c72', '#2a5298', '#764ba2', '#f093fb'],
            direction: 'radial-gradient(ellipse at 40% 20%'
        },
        {
            id: 'cosmic-storm',
            name: 'Cosmic Storm',
            colors: ['#8b5cf6', '#a855f7', '#c084fc', '#e879f9', '#fbbf24'],
            direction: 'conic-gradient(from 45deg'
        },
        // New cosmic additions
        {
            id: 'pulsar-beam',
            name: 'Pulsar Beam',
            colors: ['#000428', '#004e92', '#009ffd', '#00d2ff', '#ffffff'],
            direction: 'radial-gradient(circle at 20% 30%'
        },
        {
            id: 'andromeda-spiral',
            name: 'Andromeda Spiral',
            colors: ['#1a0033', '#330066', '#6600cc', '#9933ff', '#cc66ff'],
            direction: 'conic-gradient(from 180deg'
        },
        {
            id: 'solar-corona',
            name: 'Solar Corona',
            colors: ['#fff700', '#ff8c00', '#ff4500', '#dc143c'],
            direction: 'radial-gradient(circle at center'
        },
        {
            id: 'meteor-shower',
            name: 'Meteor Shower',
            colors: ['#000000', '#1a1a2e', '#16213e', '#ffff00', '#ffffff'],
            direction: 'to bottom right'
        },
        {
            id: 'magnetosphere',
            name: 'Magnetosphere',
            colors: ['#000051', '#0066cc', '#00ccff', '#66ffff', '#ffffff'],
            direction: 'conic-gradient(from 270deg'
        },
        {
            id: 'cosmic-web',
            name: 'Cosmic Web',
            colors: ['#0d1421', '#1a252f', '#2c3e50', '#34495e', '#7f8c8d'],
            direction: 'radial-gradient(ellipse at 40% 80%'
        },
        {
            id: 'gamma-burst',
            name: 'Gamma Burst',
            colors: ['#000000', '#4b0082', '#8a2be2', '#da70d6', '#ffffff'],
            direction: 'radial-gradient(circle at 60% 20%'
        },
        {
            id: 'dark-energy',
            name: 'Dark Energy',
            colors: ['#000000', '#191970', '#483d8b', '#6a5acd'],
            direction: 'to bottom'
        },
        {
            id: 'red-giant',
            name: 'Red Giant',
            colors: ['#ff4500', '#ff6347', '#ff7f50', '#ffa07a', '#ffe4e1'],
            direction: 'radial-gradient(circle at 40% 40%'
        },
        {
            id: 'white-dwarf',
            name: 'White Dwarf',
            colors: ['#ffffff', '#f0f8ff', '#e6e6fa', '#d3d3d3'],
            direction: 'radial-gradient(circle at center'
        },
        {
            id: 'event-horizon',
            name: 'Event Horizon',
            colors: ['#000000', '#000000', '#1a1a1a', '#333333'],
            direction: 'radial-gradient(circle at 50% 50%'
        },
        {
            id: 'cosmic-microwave',
            name: 'Cosmic Microwave',
            colors: ['#ff0000', '#ff4500', '#ffa500', '#ffff00', '#ffffff'],
            direction: 'conic-gradient(from 0deg'
        },
        {
            id: 'exoplanet-aurora',
            name: 'Exoplanet Aurora',
            colors: ['#000051', '#006600', '#00ff00', '#66ff66', '#ccffcc'],
            direction: 'conic-gradient(from 120deg'
        },
        {
            id: 'ion-trail',
            name: 'Ion Trail',
            colors: ['#000428', '#004e92', '#009ffd', '#00d2ff'],
            direction: 'to right'
        }
    ],
    
    retroVibesGradients: [
        {
            id: 'synthwave-80s',
            name: 'Synthwave 80s',
            colors: ['#ff00ff', '#00ffff', '#ff0080', '#8000ff'],
            direction: 'to bottom right'
        },
        {
            id: 'neon-grid',
            name: 'Neon Grid',
            colors: ['#ff6ec7', '#36d1dc', '#5b73ff'],
            direction: 'to bottom'
        },
        {
            id: 'miami-vice',
            name: 'Miami Vice',
            colors: ['#ff0080', '#00ffff', '#ff8c00'],
            direction: 'to right'
        },
        {
            id: 'vaporwave',
            name: 'Vaporwave',
            colors: ['#ff71ce', '#01cdfe', '#05ffa1', '#b967db'],
            direction: 'to bottom right'
        },
        {
            id: 'arcade-dreams',
            name: 'Arcade Dreams',
            colors: ['#ff0066', '#ff9900', '#00ff99', '#0099ff'],
            direction: 'to bottom'
        },
        {
            id: 'cyber-punk',
            name: 'Cyber Punk',
            colors: ['#0f0f23', '#ff00ff', '#00ffff', '#ff0066'],
            direction: 'to bottom right'
        },
        {
            id: 'retro-sunset',
            name: 'Retro Sunset',
            colors: ['#ff8a00', '#e52e71', '#9b59b6', '#3498db'],
            direction: 'to bottom'
        },
        {
            id: 'neon-tokyo',
            name: 'Neon Tokyo',
            colors: ['#ff0080', '#8000ff', '#0080ff', '#00ff80'],
            direction: 'to right'
        },
        {
            id: 'laser-grid',
            name: 'Laser Grid',
            colors: ['#ff0040', '#ff4080', '#8040ff', '#4080ff'],
            direction: 'to bottom'
        },
        {
            id: 'hologram-shift',
            name: 'Hologram Shift',
            colors: ['#ff6b9d', '#c44569', '#f8b500', '#786fa6'],
            direction: 'to bottom right'
        },
        // New retro additions
        {
            id: 'outrun-highway',
            name: 'Outrun Highway',
            colors: ['#ff0084', '#ff0084', '#ff8c00', '#ffff00'],
            direction: 'to bottom'
        },
        {
            id: 'neon-nights-80s',
            name: 'Neon Nights 80s',
            colors: ['#ff006e', '#fb5607', '#ffbe0b', '#8338ec'],
            direction: 'conic-gradient(from 45deg'
        },
        {
            id: 'retrowave-sun',
            name: 'Retrowave Sun',
            colors: ['#ff006e', '#ff8500', '#ffed4e', '#ff006e'],
            direction: 'radial-gradient(circle at center'
        },
        {
            id: 'synthpop',
            name: 'Synthpop',
            colors: ['#e0aaff', '#c77dff', '#a663cc', '#560bad'],
            direction: 'to bottom right'
        },
        {
            id: 'digital-horizon',
            name: 'Digital Horizon',
            colors: ['#00f5ff', '#ff00d4', '#ff7b00', '#ff00d4'],
            direction: 'to right'
        },
        {
            id: 'cyberdelic',
            name: 'Cyberdelic',
            colors: ['#ff0080', '#00ff80', '#8000ff', '#ff8000', '#00ffff'],
            direction: 'conic-gradient(from 90deg'
        },
        {
            id: 'neo-chrome',
            name: 'Neo Chrome',
            colors: ['#7209b7', '#a663cc', '#4cc9f0', '#7209b7'],
            direction: 'conic-gradient(from 180deg'
        },
        {
            id: 'electric-avenue',
            name: 'Electric Avenue',
            colors: ['#ff006e', '#8338ec', '#3a86ff', '#06ffa5', '#ffff3f'],
            direction: 'to bottom right'
        },
        {
            id: 'neon-city',
            name: 'Neon City',
            colors: ['#ff0080', '#ff4080', '#8040ff', '#4080ff', '#00ff80'],
            direction: 'radial-gradient(ellipse at 40% 60%'
        },
        {
            id: 'retro-future',
            name: 'Retro Future',
            colors: ['#ff006e', '#fb5607', '#ffbe0b', '#8338ec', '#3a86ff'],
            direction: 'conic-gradient(from 270deg'
        },
        {
            id: 'pixel-dream',
            name: 'Pixel Dream',
            colors: ['#ff9ff3', '#f368e0', '#ff3838', '#ff9500'],
            direction: 'to bottom'
        },
        {
            id: 'synthwave-sunset',
            name: 'Synthwave Sunset',
            colors: ['#ff0080', '#ff8c00', '#ffff00', '#ff0080'],
            direction: 'radial-gradient(circle at 50% 80%'
        },
        {
            id: 'laser-show',
            name: 'Laser Show',
            colors: ['#00ff00', '#ff0000', '#0000ff', '#ffff00', '#ff00ff'],
            direction: 'conic-gradient(from 0deg'
        },
        {
            id: 'vaporwave-grid',
            name: 'Vaporwave Grid',
            colors: ['#ff71ce', '#01cdfe', '#05ffa1', '#b967db', '#ff71ce'],
            direction: 'conic-gradient(from 135deg'
        },
        {
            id: 'retro-chrome',
            name: 'Retro Chrome',
            colors: ['#c0c0c0', '#ff00ff', '#00ffff', '#c0c0c0'],
            direction: 'radial-gradient(ellipse at center'
        }
    ],
    
    // Legacy gradientPresets for backward compatibility - flattened from all sections
    gradientPresets: [],
    
    // Function to get all gradients flattened from all sections
    getAllGradients() {
        if (this.gradientPresets.length === 0) {
            // Flatten gradients from all sections for backward compatibility
            this.gradientPresets = [
                ...this.lightToDarkGradients,
                ...this.colorSpectrumGradients,
                ...this.natureEarthGradients,
                ...this.creativeFusionGradients,
                ...this.luxuryVibesGradients,
                ...this.cosmicEnergyGradients,
                ...this.retroVibesGradients
            ];
        }
        return this.gradientPresets;
    },
    
    // Templates - Pre-designed mockup styles
    templates: [
        {
            id: 'minimal-paper',
            name: 'Minimal Paper',
            category: 'minimal',
            thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI0ZGRkZGRiIvPjwvc3ZnPg==',
            settings: {
                backgroundColor: '#FFFFFF',
                noiseOverlayId: 'paper-smooth',
                noiseOpacity: 0.15,
                noiseBlendMode: 'multiply',
                cornerRadius: 8,
                padding: 40,
                shadowOpacity: 0.1,
                shadowRadius: 20,
                shadowOffsetX: 0,
                shadowOffsetY: 8,
                shadowColor: '#000000'
            }
        },
        {
            id: 'modern-grain',
            name: 'Modern Grain',
            category: 'modern',
            thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwIiB5MT0iMCIgeDI9IjEiIHkyPSIxIj48c3RvcCBvZmZzZXQ9IjAiIHN0b3AtY29sb3I9IiNGMkY0RkYiLz48c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiNFNkU2RTYiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0idXJsKCNnKSIvPjwvc3ZnPg==',
            settings: {
                backgroundGradientId: 'frost',
                noiseOverlayId: 'grain-fine',
                noiseOpacity: 0.25,
                noiseBlendMode: 'overlay',
                cornerRadius: 12,
                padding: 30,
                shadowOpacity: 0.15,
                shadowRadius: 24,
                shadowOffsetX: 2,
                shadowOffsetY: 8,
                shadowColor: '#000000'
            }
        },
        {
            id: 'dark-texture',
            name: 'Dark Texture',
            category: 'dark',
            thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImQiIHgxPSIwIiB5MT0iMCIgeDI9IjEiIHkyPSIxIj48c3RvcCBvZmZzZXQ9IjAiIHN0b3AtY29sb3I9IiMzMzMzNDAiLz48c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiMwRDBEMUEiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0idXJsKCNkKSIvPjwvc3ZnPg==',
            settings: {
                backgroundGradientId: 'midnight',
                noiseOverlayId: 'canvas-heavy',
                noiseOpacity: 0.4,
                noiseBlendMode: 'soft-light',
                cornerRadius: 16,
                padding: 35,
                shadowOpacity: 0.3,
                shadowRadius: 32,
                shadowOffsetX: 0,
                shadowOffsetY: 12,
                shadowColor: '#000000'
            }
        },
        {
            id: 'vintage-paper',
            name: 'Vintage Paper',
            category: 'vintage',
            thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI0ZGRjVDQyIvPjwvc3ZnPg==',
            settings: {
                backgroundColor: '#FFF5CC',
                noiseOverlayId: 'paper-vintage',
                noiseOpacity: 0.35,
                noiseBlendMode: 'multiply',
                cornerRadius: 10,
                padding: 40,
                shadowOpacity: 0.2,
                shadowRadius: 18,
                shadowOffsetX: 0,
                shadowOffsetY: 6,
                shadowColor: '#8B4513'
            }
        },
        {
            id: 'soft-fabric',
            name: 'Soft Fabric',
            category: 'soft',
            thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9InBoIiB4MT0iMCIgeTE9IjAiIHgyPSIxIiB5Mj0iMSI+PHN0b3Agb2Zmc2V0PSIwIiBzdG9wLWNvbG9yPSIjYThlZGVhIi8+PHN0b3Agb2Zmc2V0PSIwLjMzIiBzdG9wLWNvbG9yPSIjZmVkNmUzIi8+PHN0b3Agb2Zmc2V0PSIwLjY2IiBzdG9wLWNvbG9yPSIjZDI5OWMyIi8+PHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjZmVmOWQ3Ii8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9InVybCgjcGgpIi8+PC9zdmc+',
            settings: {
                backgroundGradientId: 'purple-haze',
                noiseOverlayId: 'fabric-fine',
                noiseOpacity: 0.3,
                noiseBlendMode: 'overlay',
                cornerRadius: 14,
                padding: 45,
                shadowOpacity: 0.2,
                shadowRadius: 14,
                shadowOffsetX: 0,
                shadowOffsetY: 4,
                shadowColor: '#4DCCFF'
            }
        },
        {
            id: 'warm-canvas',
            name: 'Warm Canvas',
            category: 'warm',
            thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwIiB5MT0iMCIgeDI9IjEiIHkyPSIxIj48c3RvcCBvZmZzZXQ9IjAiIHN0b3AtY29sb3I9IiNmMDkzZmIiLz48c3RvcCBvZmZzZXQ9IjAuMzMiIHN0b3AtY29sb3I9IiNmNTU3NmMiLz48c3RvcCBvZmZzZXQ9IjAuNjYiIHN0b3AtY29sb3I9IiM0ZmFjZmUiLz48c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiMwMGYyZmUiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0idXJsKCNnKSIvPjwvc3ZnPg==',
            settings: {
                backgroundGradientId: 'golden-hour',
                noiseOverlayId: 'canvas-light',
                noiseOpacity: 0.25,
                noiseBlendMode: 'multiply',
                cornerRadius: 12,
                padding: 38,
                shadowOpacity: 0.3,
                shadowRadius: 16,
                shadowOffsetX: 0,
                shadowOffsetY: 8,
                shadowColor: '#FFCC4D'
            }
        },
        {
            id: 'arctic-breeze',
            name: 'Arctic Breeze',
            category: 'minimal',
            thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImFiIiB4MT0iMCIgeTE9IjAiIHgyPSIxIiB5Mj0iMSI+PHN0b3Agb2Zmc2V0PSIwIiBzdG9wLWNvbG9yPSIjZjdmOWZjIi8+PHN0b3Agb2Zmc2V0PSIwLjMzIiBzdG9wLWNvbG9yPSIjZDRlNmYxIi8+PHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjYTZiOGQxIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9InVybCgjYWIpIi8+PC9zdmc+',
            settings: {
                backgroundGradientId: 'arctic-mist',
                noiseOverlayId: 'paper-smooth',
                noiseOpacity: 0.12,
                noiseBlendMode: 'multiply',
                cornerRadius: 6,
                padding: 45,
                shadowOpacity: 0.08,
                shadowRadius: 25,
                shadowOffsetX: 0,
                shadowOffsetY: 12,
                shadowColor: '#a6b8d1'
            }
        },
        {
            id: 'electric-storm',
            name: 'Electric Storm',
            category: 'colorful',
            thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImVzIiB4MT0iMCIgeTE9IjAiIHgyPSIxIiB5Mj0iMSI+PHN0b3Agb2Zmc2V0PSIwIiBzdG9wLWNvbG9yPSIjNjY3ZWVhIi8+PHN0b3Agb2Zmc2V0PSIwLjI1IiBzdG9wLWNvbG9yPSIjNzY0YmEyIi8+PHN0b3Agb2Zmc2V0PSIwLjUiIHN0b3AtY29sb3I9IiNmMDkzZmIiLz48c3RvcCBvZmZzZXQ9IjAuNzUiIHN0b3AtY29sb3I9IiNmNTU3NmMiLz48c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiM0ZmFjZmUiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0idXJsKCNlcykiLz48L3N2Zz4=',
            settings: {
                backgroundGradientId: 'electric-dreams',
                noiseOverlayId: 'static-medium',
                noiseOpacity: 0.18,
                noiseBlendMode: 'screen',
                cornerRadius: 22,
                padding: 28,
                shadowOpacity: 0.35,
                shadowRadius: 32,
                shadowOffsetX: 0,
                shadowOffsetY: 14,
                shadowColor: '#667eea'
            }
        },
        {
            id: 'emerald-depths',
            name: 'Emerald Depths',
            category: 'luxury',
            thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImVkIiB4MT0iMCIgeTE9IjAiIHgyPSIxIiB5Mj0iMSI+PHN0b3Agb2Zmc2V0PSIwIiBzdG9wLWNvbG9yPSIjZjBmZmYwIi8+PHN0b3Agb2Zmc2V0PSIwLjMzIiBzdG9wLWNvbG9yPSIjOThmYjk4Ii8+PHN0b3Agb2Zmc2V0PSIwLjY2IiBzdG9wLWNvbG9yPSIjMDBmZjdmIi8+PHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjMDBmYTlhIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9InVybCgjZWQpIi8+PC9zdmc+',
            settings: {
                backgroundGradientId: 'emerald-luxury',
                noiseOverlayId: 'marble-light',
                noiseOpacity: 0.3,
                noiseBlendMode: 'multiply',
                cornerRadius: 18,
                padding: 42,
                shadowOpacity: 0.22,
                shadowRadius: 28,
                shadowOffsetX: 0,
                shadowOffsetY: 10,
                shadowColor: '#00fa9a'
            }
        },
        {
            id: 'holographic-dream',
            name: 'Holographic Dream',
            category: 'retro',
            thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImhkIiB4MT0iMCIgeTE9IjAiIHgyPSIxIiB5Mj0iMSI+PHN0b3Agb2Zmc2V0PSIwIiBzdG9wLWNvbG9yPSIjZjBmOGZmIi8+PHN0b3Agb2Zmc2V0PSIwLjMzIiBzdG9wLWNvbG9yPSIjZGRhMGRkIi8+PHN0b3Agb2Zmc2V0PSIwLjY2IiBzdG9wLWNvbG9yPSIjZTZlNmZhIi8+PHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjZDNkM2QzIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9InVybCgjdGQpIi8+PC9zdmc+',
            settings: {
                backgroundGradientId: 'diamond-sparkle',
                noiseOverlayId: 'static-light',
                noiseOpacity: 0.2,
                noiseBlendMode: 'screen',
                cornerRadius: 15,
                padding: 35,
                shadowOpacity: 0.4,
                shadowRadius: 22,
                shadowOffsetX: 0,
                shadowOffsetY: 8,
                shadowColor: '#dda0dd'
            }
        },
        {
            id: 'volcanic-power',
            name: 'Volcanic Power',
            category: 'dark',
            thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9InZwIiB4MT0iMCIgeTE9IjAiIHgyPSIxIiB5Mj0iMSI+PHN0b3Agb2Zmc2V0PSIwIiBzdG9wLWNvbG9yPSIjMmY0ZjRmIi8+PHN0b3Agb2Zmc2V0PSIwLjMzIiBzdG9wLWNvbG9yPSIjOGI0NTEzIi8+PHN0b3Agb2Zmc2V0PSIwLjY2IiBzdG9wLWNvbG9yPSIjYTA1MjJkIi8+PHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjY2Q4NTNmIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9InVybCgjdnApIi8+PC9zdmc+',
            settings: {
                backgroundGradientId: 'volcanic-earth',
                noiseOverlayId: 'canvas-heavy',
                noiseOpacity: 0.45,
                noiseBlendMode: 'overlay',
                cornerRadius: 20,
                padding: 30,
                shadowOpacity: 0.5,
                shadowRadius: 40,
                shadowOffsetX: 0,
                shadowOffsetY: 16,
                shadowColor: '#8b4513'
            }
        },
        {
            id: 'crystal-prism',
            name: 'Crystal Prism',
            category: 'cosmic',
            thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImNwIiB4MT0iMCIgeTE9IjAiIHgyPSIxIiB5Mj0iMSI+PHN0b3Agb2Zmc2V0PSIwIiBzdG9wLWNvbG9yPSIjZmYwMDgwIi8+PHN0b3Agb2Zmc2V0PSIwLjE2IiBzdG9wLWNvbG9yPSIjZmY4YzAwIi8+PHN0b3Agb2Zmc2V0PSIwLjMzIiBzdG9wLWNvbG9yPSIjZmZkNzAwIi8+PHN0b3Agb2Zmc2V0PSIwLjUiIHN0b3AtY29sb3I9IiMwMGZmMDAiLz48c3RvcCBvZmZzZXQ9IjAuNjYiIHN0b3AtY29sb3I9IiMwMDgwZmYiLz48c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiM4MDAwZmYiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0idXJsKCNjcCkiLz48L3N2Zz4=',
            settings: {
                backgroundGradientId: 'prismatic-burst',
                noiseOverlayId: 'perlin-subtle',
                noiseOpacity: 0.15,
                noiseBlendMode: 'overlay',
                cornerRadius: 25,
                padding: 35,
                shadowOpacity: 0.3,
                shadowRadius: 30,
                shadowOffsetX: 0,
                shadowOffsetY: 12,
                shadowColor: '#ff0080'
            }
        },
        {
            id: 'twilight-serenity',
            name: 'Twilight Serenity',
            category: 'soft',
            thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9InRzIiB4MT0iMCIgeTE9IjAiIHgyPSIxIiB5Mj0iMSI+PHN0b3Agb2Zmc2V0PSIwIiBzdG9wLWNvbG9yPSIjZTBhYWZmIi8+PHN0b3Agb2Zmc2V0PSIwLjMzIiBzdG9wLWNvbG9yPSIjYzc3ZGZmIi8+PHN0b3Agb2Zmc2V0PSIwLjY2IiBzdG9wLWNvbG9yPSIjYTY2M2NjIi8+PHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjNTYwYmFkIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9InVybCgjdHMpIi8+PC9zdmc+',
            settings: {
                backgroundGradientId: 'synthpop',
                noiseOverlayId: 'fabric-fine',
                noiseOpacity: 0.2,
                noiseBlendMode: 'soft-light',
                cornerRadius: 16,
                padding: 50,
                shadowOpacity: 0.18,
                shadowRadius: 20,
                shadowOffsetX: 0,
                shadowOffsetY: 6,
                shadowColor: '#c77dff'
            }
        },
        {
            id: 'industrial-chrome',
            name: 'Industrial Chrome',
            category: 'industrial',
            thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImljIiB4MT0iMCIgeTE9IjAiIHgyPSIxIiB5Mj0iMSI+PHN0b3Agb2Zmc2V0PSIwIiBzdG9wLWNvbG9yPSIjZjVmNWY1Ii8+PHN0b3Agb2Zmc2V0PSIwLjMzIiBzdG9wLWNvbG9yPSIjZGNkY2RjIi8+PHN0b3Agb2Zmc2V0PSIwLjY2IiBzdG9wLWNvbG9yPSIjYzBjMGMwIi8+PHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjODA4MDgwIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9InVybCgjaWMpIi8+PC9zdmc+',
            settings: {
                backgroundGradientId: 'titanium-finish',
                noiseOverlayId: 'metal-brushed',
                noiseOpacity: 0.4,
                noiseBlendMode: 'overlay',
                cornerRadius: 2,
                padding: 15,
                shadowOpacity: 0.35,
                shadowRadius: 12,
                shadowOffsetX: 3,
                shadowOffsetY: 3,
                shadowColor: '#808080'
            }
        },
        {
            id: 'aurora-magic',
            name: 'Aurora Magic',
            category: 'cosmic',
            thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImFtIiB4MT0iMCIgeTE9IjAiIHgyPSIxIiB5Mj0iMSI+PHN0b3Agb2Zmc2V0PSIwIiBzdG9wLWNvbG9yPSIjMDBmZjg3Ii8+PHN0b3Agb2Zmc2V0PSIwLjMzIiBzdG9wLWNvbG9yPSIjNjBlZmZmIi8+PHN0b3Agb2Zmc2V0PSIwLjY2IiBzdG9wLWNvbG9yPSIjYThmZjc4Ii8+PHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjNzhmZmQ2Ii8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9InVybCgjYW0pIi8+PC9zdmc+',
            settings: {
                backgroundGradientId: 'aurora-swirl',
                noiseOverlayId: 'perlin-medium',
                noiseOpacity: 0.22,
                noiseBlendMode: 'screen',
                cornerRadius: 28,
                padding: 38,
                shadowOpacity: 0.25,
                shadowRadius: 35,
                shadowOffsetX: 0,
                shadowOffsetY: 15,
                shadowColor: '#00ff87'
            }
        },
        {
            id: 'golden-luxury',
            name: 'Golden Luxury',
            category: 'luxury',
            thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImdsIiB4MT0iMCIgeTE9IjAiIHgyPSIxIiB5Mj0iMSI+PHN0b3Agb2Zmc2V0PSIwIiBzdG9wLWNvbG9yPSIjZmZmOGRjIi8+PHN0b3Agb2Zmc2V0PSIwLjMzIiBzdG9wLWNvbG9yPSIjZmZkNzAwIi8+PHN0b3Agb2Zmc2V0PSIwLjY2IiBzdG9wLWNvbG9yPSIjZGFhNTIwIi8+PHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjYjg4NjBiIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9InVybCgjZ2wpIi8+PC9zdmc+',
            settings: {
                backgroundGradientId: 'golden-silk',
                noiseOverlayId: 'fabric-coarse',
                noiseOpacity: 0.25,
                noiseBlendMode: 'multiply',
                cornerRadius: 14,
                padding: 45,
                shadowOpacity: 0.3,
                shadowRadius: 26,
                shadowOffsetX: 0,
                shadowOffsetY: 10,
                shadowColor: '#daa520'
            }
        },
        {
            id: 'cosmic-vibes',
            name: 'Cosmic Vibes',
            category: 'colorful',
            thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImNmIiB4MT0iMCIgeTE9IjAiIHgyPSIxIiB5Mj0iMSI+PHN0b3Agb2Zmc2V0PSIwIiBzdG9wLWNvbG9yPSIjZmE3MDlhIi8+PHN0b3Agb2Zmc2V0PSIwLjUiIHN0b3AtY29sb3I9IiNmZWUxNDAiLz48c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiM3NjRiYTIiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0idXJsKCNjZikiLz48L3N2Zz4=',
            settings: {
                backgroundGradientId: 'cosmic-fusion',
                noiseOverlayId: 'grain-fine',
                noiseOpacity: 0.2,
                noiseBlendMode: 'overlay',
                cornerRadius: 18,
                padding: 30,
                shadowOpacity: 0.25,
                shadowRadius: 28,
                shadowOffsetX: 0,
                shadowOffsetY: 10,
                shadowColor: '#764ba2'
            }
        },
        {
            id: 'neon-electric',
            name: 'Neon Electric',
            category: 'colorful',
            thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9Im5uIiB4MT0iMCIgeTE9IjAiIHgyPSIxIiB5Mj0iMSI+PHN0b3Agb2Zmc2V0PSIwIiBzdG9wLWNvbG9yPSIjZmY2YjZiIi8+PHN0b3Agb2Zmc2V0PSIwLjMzIiBzdG9wLWNvbG9yPSIjNGVjZGM0Ii8+PHN0b3Agb2Zmc2V0PSIwLjY2IiBzdG9wLWNvbG9yPSIjNDViN2QxIi8+PHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjZmRjYjZlIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9InVybCgjbm4pIi8+PC9zdmc+',
            settings: {
                backgroundGradientId: 'neon-nights',
                noiseOverlayId: 'static-medium',
                noiseOpacity: 0.15,
                noiseBlendMode: 'screen',
                cornerRadius: 20,
                padding: 35,
                shadowOpacity: 0.4,
                shadowRadius: 24,
                shadowOffsetX: 0,
                shadowOffsetY: 6,
                shadowColor: '#ff6b6b'
            }
        },
        {
            id: 'retro-synthwave',
            name: 'Retro Synthwave',
            category: 'retro',
            thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9InN3IiB4MT0iMCIgeTE9IjAiIHgyPSIxIiB5Mj0iMSI+PHN0b3Agb2Zmc2V0PSIwIiBzdG9wLWNvbG9yPSIjZmYwMGZmIi8+PHN0b3Agb2Zmc2V0PSIwLjMzIiBzdG9wLWNvbG9yPSIjMDBmZmZmIi8+PHN0b3Agb2Zmc2V0PSIwLjY2IiBzdG9wLWNvbG9yPSIjZmYwMDgwIi8+PHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjODAwMGZmIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9InVybCgjc3cpIi8+PC9zdmc+',
            settings: {
                backgroundGradientId: 'synthwave-80s',
                noiseOverlayId: 'grid-fine',
                noiseOpacity: 0.3,
                noiseBlendMode: 'screen',
                cornerRadius: 8,
                padding: 25,
                shadowOpacity: 0.5,
                shadowRadius: 20,
                shadowOffsetX: 0,
                shadowOffsetY: 8,
                shadowColor: '#ff00ff'
            }
        },
        {
            id: 'luxury-marble',
            name: 'Luxury Marble',
            category: 'luxury',
            thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9Im1yIiB4MT0iMCIgeTE9IjAiIHgyPSIxIiB5Mj0iMSI+PHN0b3Agb2Zmc2V0PSIwIiBzdG9wLWNvbG9yPSIjZmZlY2QyIi8+PHN0b3Agb2Zmc2V0PSIwLjUiIHN0b3AtY29sb3I9IiNmY2I2OWYiLz48c3RvcCBvZmZzZXQ9IjEiIHN0b3AtY29sb3I9IiNmZjhhODAiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0idXJsKCNtcikiLz48L3N2Zz4=',
            settings: {
                backgroundGradientId: 'rose-gold',
                noiseOverlayId: 'marble-light',
                noiseOpacity: 0.4,
                noiseBlendMode: 'multiply',
                cornerRadius: 16,
                padding: 40,
                shadowOpacity: 0.25,
                shadowRadius: 30,
                shadowOffsetX: 0,
                shadowOffsetY: 12,
                shadowColor: '#d4a574'
            }
        },
        {
            id: 'industrial-metal',
            name: 'Industrial Metal',
            category: 'industrial',
            thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9Im10IiB4MT0iMCIgeTE9IjAiIHgyPSIxIiB5Mj0iMSI+PHN0b3Agb2Zmc2V0PSIwIiBzdG9wLWNvbG9yPSIjZjJmMmYyIi8+PHN0b3Agb2Zmc2V0PSIwLjMzIiBzdG9wLWNvbG9yPSIjZDRkNGQ0Ii8+PHN0b3Agb2Zmc2V0PSIwLjY2IiBzdG9wLWNvbG9yPSIjYThhOGE4Ii8+PHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjN2Q3ZDdkIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9InVybCgjbXQpIi8+PC9zdmc+',
            settings: {
                backgroundGradientId: 'platinum-dreams',
                noiseOverlayId: 'metal-brushed',
                noiseOpacity: 0.35,
                noiseBlendMode: 'overlay',
                cornerRadius: 4,
                padding: 20,
                shadowOpacity: 0.3,
                shadowRadius: 18,
                shadowOffsetX: 2,
                shadowOffsetY: 4,
                shadowColor: '#404040'
            }
        },
        {
            id: 'galactic-storm',
            name: 'Galactic Storm',
            category: 'cosmic',
            thumbnail: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImdzIiB4MT0iMCIgeTE9IjAiIHgyPSIxIiB5Mj0iMSI+PHN0b3Agb2Zmc2V0PSIwIiBzdG9wLWNvbG9yPSIjODM2MGMzIi8+PHN0b3Agb2Zmc2V0PSIwLjMzIiBzdG9wLWNvbG9yPSIjMmViZjkxIi8+PHN0b3Agb2Zmc2V0PSIwLjY2IiBzdG9wLWNvbG9yPSIjZjA5M2ZiIi8+PHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjZjU1NzZjIi8+PC9saW5lYXJHcmFkaWVudD48L2RlZnM+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9InVybCgjZ3MpIi8+PC9zdmc+',
            settings: {
                backgroundGradientId: 'nebula-storm',
                noiseOverlayId: 'galaxy-stars',
                noiseOpacity: 0.25,
                noiseBlendMode: 'screen',
                cornerRadius: 24,
                padding: 32,
                shadowOpacity: 0.4,
                shadowRadius: 36,
                shadowOffsetX: 0,
                shadowOffsetY: 16,
                shadowColor: '#2ebf91'
            }
        }
    ],
    
    // Template categories
    templateCategories: [
        { id: 'minimal', name: 'Minimal', icon: 'fas fa-minus' },
        { id: 'modern', name: 'Modern', icon: 'fas fa-magic' },
        { id: 'dark', name: 'Dark', icon: 'fas fa-moon' },
        { id: 'colorful', name: 'Colorful', icon: 'fas fa-palette' },
        { id: 'soft', name: 'Soft', icon: 'fas fa-cloud' },
        { id: 'warm', name: 'Warm', icon: 'fas fa-sun' },
        { id: 'retro', name: 'Retro', icon: 'fas fa-gamepad' },
        { id: 'luxury', name: 'Luxury', icon: 'fas fa-gem' },
        { id: 'industrial', name: 'Industrial', icon: 'fas fa-cogs' },
        { id: 'cosmic', name: 'Cosmic', icon: 'fas fa-rocket' }
    ],
    
    // Default noise settings
    defaultNoiseOpacity: 0.7,
    defaultNoiseBlendMode: 'multiply',
    defaultNoiseScale: 1.0,
    defaultNoiseInvert: false,
    
    // Noise overlay options
    noiseOverlayTypes: [
        {
            id: 'none',
            name: 'No Noise',
            type: null
        },
        {
            id: 'perlin-subtle',
            name: 'Subtle Texture',
            type: 'perlin',
            intensity: 0.1,
            scale: 0.01
        },
        {
            id: 'perlin-medium',
            name: 'Medium Texture',
            type: 'perlin',
            intensity: 0.2,
            scale: 0.005
        },
        {
            id: 'perlin-strong',
            name: 'Strong Texture',
            type: 'perlin',
            intensity: 0.3,
            scale: 0.003
        },
        {
            id: 'grain-fine',
            name: 'Fine Grain',
            type: 'grain',
            intensity: 0.15,
            scale: 2
        },
        {
            id: 'grain-medium',
            name: 'Medium Grain',
            type: 'grain',
            intensity: 0.25,
            scale: 4
        },
        {
            id: 'grain-coarse',
            name: 'Coarse Grain',
            type: 'grain',
            intensity: 0.35,
            scale: 6
        },
        {
            id: 'paper-smooth',
            name: 'Smooth Paper',
            type: 'paper',
            intensity: 0.15,
            scale: 0.8
        },
        {
            id: 'paper-rough',
            name: 'Rough Paper',
            type: 'paper',
            intensity: 0.25,
            scale: 1.2
        },
        {
            id: 'paper-vintage',
            name: 'Vintage Paper',
            type: 'paper',
            intensity: 0.35,
            scale: 1.5
        },
        {
            id: 'canvas-light',
            name: 'Light Canvas',
            type: 'canvas',
            intensity: 0.2,
            scale: 1.0
        },
        {
            id: 'canvas-heavy',
            name: 'Heavy Canvas',
            type: 'canvas',
            intensity: 0.3,
            scale: 1.5
        },
        {
            id: 'fabric-fine',
            name: 'Fine Fabric',
            type: 'fabric',
            intensity: 0.18,
            scale: 0.5
        },
        {
            id: 'fabric-coarse',
            name: 'Coarse Fabric',
            type: 'fabric',
            intensity: 0.28,
            scale: 1.0
        },
        {
            id: 'static-light',
            name: 'Light Static',
            type: 'static',
            intensity: 0.1,
            scale: 1
        },
        {
            id: 'static-medium',
            name: 'Medium Static',
            type: 'static',
            intensity: 0.2,
            scale: 1
        },
        {
            id: 'static-heavy',
            name: 'Heavy Static',
            type: 'static',
            intensity: 0.3,
            scale: 1
        },
        {
            id: 'dots-small',
            name: 'Small Dots',
            type: 'dots',
            intensity: 0.2,
            scale: 8
        },
        {
            id: 'dots-medium',
            name: 'Medium Dots',
            type: 'dots',
            intensity: 0.3,
            scale: 12
        },
        {
            id: 'dots-large',
            name: 'Large Dots',
            type: 'dots',
            intensity: 0.4,
            scale: 20
        },
        
        // New Exciting Textures
        {
            id: 'grid-fine',
            name: 'Fine Grid',
            type: 'grid',
            intensity: 0.15,
            scale: 2
        },
        {
            id: 'grid-bold',
            name: 'Bold Grid',
            type: 'grid',
            intensity: 0.25,
            scale: 4
        },
        {
            id: 'lines-diagonal',
            name: 'Diagonal Lines',
            type: 'lines',
            intensity: 0.2,
            scale: 3
        },
        {
            id: 'lines-crosshatch',
            name: 'Crosshatch',
            type: 'crosshatch',
            intensity: 0.18,
            scale: 2
        },
        {
            id: 'metal-brushed',
            name: 'Brushed Metal',
            type: 'metal',
            intensity: 0.3,
            scale: 0.8
        },
        {
            id: 'marble-light',
            name: 'Light Marble',
            type: 'marble',
            intensity: 0.25,
            scale: 1.2
        },
        {
            id: 'galaxy-stars',
            name: 'Galaxy Stars',
            type: 'static',
            intensity: 0.4,
            scale: 0.5
        },
        {
            id: 'hexagon-pattern',
            name: 'Hexagon Pattern',
            type: 'hexagon',
            intensity: 0.2,
            scale: 8
        },
        {
            id: 'waves-subtle',
            name: 'Subtle Waves',
            type: 'waves',
            intensity: 0.15,
            scale: 1.5
        },
        {
            id: 'waves-bold',
            name: 'Bold Waves',
            type: 'waves',
            intensity: 0.3,
            scale: 2.5
        },
        {
            id: 'marble-heavy',
            name: 'Heavy Marble',
            type: 'marble',
            intensity: 0.35,
            scale: 1.8
        },
        {
            id: 'concrete-smooth',
            name: 'Smooth Concrete',
            type: 'concrete',
            intensity: 0.18,
            scale: 1.0
        },
        {
            id: 'concrete-rough',
            name: 'Rough Concrete',
            type: 'concrete',
            intensity: 0.28,
            scale: 1.5
        },
        {
            id: 'wood-grain',
            name: 'Wood Grain',
            type: 'wood',
            intensity: 0.22,
            scale: 1.2
        },
        {
            id: 'leather-fine',
            name: 'Fine Leather',
            type: 'leather',
            intensity: 0.2,
            scale: 0.9
        },
        {
            id: 'leather-textured',
            name: 'Textured Leather',
            type: 'leather',
            intensity: 0.3,
            scale: 1.4
        },
        {
            id: 'frost-glass',
            name: 'Frosted Glass',
            type: 'frost',
            intensity: 0.15,
            scale: 0.6
        },
        {
            id: 'crystal-pattern',
            name: 'Crystal Pattern',
            type: 'crystal',
            intensity: 0.22,
            scale: 1.6
        },
        {
            id: 'smoke-effect',
            name: 'Smoke Effect',
            type: 'smoke',
            intensity: 0.18,
            scale: 2.0
        },
        {
            id: 'clouds-soft',
            name: 'Soft Clouds',
            type: 'clouds',
            intensity: 0.16,
            scale: 1.8
        },
        {
            id: 'lightning-electric',
            name: 'Electric Lightning',
            type: 'lightning',
            intensity: 0.25,
            scale: 1.2
        },
        {
            id: 'tribal-pattern',
            name: 'Tribal Pattern',
            type: 'tribal',
            intensity: 0.2,
            scale: 1.5
        },
        {
            id: 'circuit-board',
            name: 'Circuit Board',
            type: 'circuit',
            intensity: 0.2,
            scale: 1.0
        },
        {
            id: 'tropical-waters',
            name: 'Tropical Waters',
            type: 'tropical',
            intensity: 0.16,
            scale: 1.8
        },
        {
            id: 'prairie-sunrise',
            name: 'Prairie Sunrise',
            type: 'prairie',
            intensity: 0.18,
            scale: 1.5
        },
        {
            id: 'bamboo-grove',
            name: 'Bamboo Grove',
            type: 'bamboo',
            intensity: 0.16,
            scale: 1.4
        },
        {
            id: 'canyon-rocks',
            name: 'Canyon Rocks',
            type: 'canyon',
            intensity: 0.18,
            scale: 1.2
        },
        {
            id: 'moss-stone',
            name: 'Moss Stone',
            type: 'moss',
            intensity: 0.16,
            scale: 1.0
        },
        {
            id: 'river-pebbles',
            name: 'River Pebbles',
            type: 'river',
            intensity: 0.16,
            scale: 1.2
        },
        {
            id: 'wildflower-meadow',
            name: 'Wildflower Meadow',
            type: 'meadow',
            intensity: 0.16,
            scale: 1.4
        },
        {
            id: 'coral-reef',
            name: 'Coral Reef',
            type: 'reef',
            intensity: 0.18,
            scale: 1.2
        },
        {
            id: 'redwood-bark',
            name: 'Redwood Bark',
            type: 'bark',
            intensity: 0.18,
            scale: 1.2
        },
        {
            id: 'alpine-snow',
            name: 'Alpine Snow',
            type: 'snow',
            intensity: 0.16,
            scale: 1.0
        },
        {
            id: 'volcanic-earth',
            name: 'Volcanic Earth',
            type: 'earth',
            intensity: 0.18,
            scale: 1.2
        }
    ],
    
    // Background image categories - restored original structure
    backgroundCategories: [
        // We can add actual background images here if needed
        // For now, keeping it empty as we focus on colors/gradients with noise overlay
    ],
    
    // Watermark position options
    watermarkPositions: [
        { id: 'top-left', name: 'Top Left' },
        { id: 'top-right', name: 'Top Right' },
        { id: 'bottom-left', name: 'Bottom Left' },
        { id: 'bottom-right', name: 'Bottom Right' },
        { id: 'center', name: 'Center' }
    ],

    // Storage keys
    storageKeys: {
        settings: 'screenshot-mockup-settings',
        history: 'screenshot-mockup-history'
    },
    
    // History options
    maxHistoryItems: 50,
    
    // Find a resolution by ID
    getResolutionById(id) {
        for (const category of this.resolutionCategories) {
            const resolution = category.resolutions.find(r => r.id === id);
            if (resolution) {
                return resolution;
            }
        }
        return null;
    },
    
    // Get all resolutions
    getAllResolutions() {
        return this.resolutionCategories.flatMap(category => category.resolutions);
    },
    
    // Get all background patterns flattened (keeping for compatibility)
    getAllBackgroundPatterns() {
        return this.noiseOverlayTypes.filter(type => type.type !== null);
    },
    
    // Get noise overlay by ID
    getNoiseOverlayById(id) {
        return this.noiseOverlayTypes.find(type => type.id === id);
    },
    
    // Legacy function for compatibility - returns patterns as if they were images
    getAllBackgroundImages() {
        return this.backgroundCategories.flatMap(category => category.images || []);
    }
};

// Stripe Configuration
// Live Stripe keys and price IDs
window.STRIPE_CONFIG = {
    // Live publishable key
    publishableKey: 'pk_live_51RUuRmDPf1P0vqteljEmZO11snOf6NwOeWf4q2A9pKusGkJXwQ94R8zzcRAI619piYbSUUBORmKb7DVY4Pbf8NOJ00XDT4adYq',
    
    // Price IDs from Stripe Dashboard
    prices: {
        proMonthly: 'price_1RUunYDPf1P0vqteAOYtil8e',   // Monthly $5
        proYearly: 'price_1RUunYDPf1P0vqte5ltuJRYL'     // Yearly $29.99
    },
    
    // Subscription tiers and limits
    subscriptionPlans: {
        free: {
            name: 'Free',
            exportsPerMonth: 10,
            premiumTemplates: false,
            priority_support: false
        },
        pro: {
            name: 'Pro',
            exportsPerMonth: 'unlimited',
            premiumTemplates: true,
            priority_support: true
        }
    }
}; 
