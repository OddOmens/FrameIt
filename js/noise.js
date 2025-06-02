/**
 * Noise Generation Utilities for Background Patterns
 */

window.NoiseGenerator = {
    // Cache for generated patterns
    cache: new Map(),
    
    // Maximum cache size
    maxCacheSize: 50,
    
    // Simple hash function for seeded random
    hash(x, y, seed = 0) {
        let h = seed + x * 374761393 + y * 668265263;
        h = (h ^ (h >> 13)) * 1274126177;
        return (h ^ (h >> 16)) / 2147483648.0;
    },

    // Linear interpolation
    lerp(a, b, t) {
        return a + t * (b - a);
    },

    // Smooth interpolation
    smoothstep(t) {
        return t * t * (3 - 2 * t);
    },

    // Generate cache key for pattern
    getCacheKey(width, height, pattern) {
        return `${width}x${height}_${pattern.type}_${pattern.scale}_${pattern.intensity}_${pattern.color}`;
    },

    // Clear old cache entries when limit is reached
    manageCacheSize() {
        if (this.cache.size >= this.maxCacheSize) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
    },

    // Generate Perlin-like noise
    perlinNoise(x, y, scale = 0.01, seed = 0) {
        const scaledX = x * scale;
        const scaledY = y * scale;
        
        const x0 = Math.floor(scaledX);
        const y0 = Math.floor(scaledY);
        const x1 = x0 + 1;
        const y1 = y0 + 1;
        
        const sx = this.smoothstep(scaledX - x0);
        const sy = this.smoothstep(scaledY - y0);
        
        const n0 = this.hash(x0, y0, seed);
        const n1 = this.hash(x1, y0, seed);
        const n2 = this.hash(x0, y1, seed);
        const n3 = this.hash(x1, y1, seed);
        
        const nx0 = this.lerp(n0, n1, sx);
        const nx1 = this.lerp(n2, n3, sx);
        
        return this.lerp(nx0, nx1, sy);
    },

    // Generate grain noise
    grainNoise(x, y, scale = 2, seed = 0) {
        const scaledX = Math.floor(x / scale);
        const scaledY = Math.floor(y / scale);
        return this.hash(scaledX, scaledY, seed);
    },

    // Generate dot pattern
    dotPattern(x, y, scale = 10, seed = 0) {
        const gridX = Math.floor(x / scale);
        const gridY = Math.floor(y / scale);
        
        const centerX = gridX * scale + scale / 2;
        const centerY = gridY * scale + scale / 2;
        
        const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
        const radius = scale * 0.2 * (0.5 + 0.5 * this.hash(gridX, gridY, seed));
        
        return distance < radius ? 1 : 0;
    },

    // Generate static noise
    staticNoise(x, y, seed = 0) {
        return this.hash(x, y, seed);
    },

    // Generate paper texture
    paperTexture(x, y, scale = 1, seed = 0) {
        const noise1 = this.perlinNoise(x, y, 0.02 * scale, seed);
        const noise2 = this.perlinNoise(x, y, 0.05 * scale, seed + 1);
        const noise3 = this.grainNoise(x, y, 3 * scale, seed + 2);
        
        return (noise1 * 0.6 + noise2 * 0.3 + noise3 * 0.1);
    },

    // Generate canvas texture
    canvasTexture(x, y, scale = 1, seed = 0) {
        const warpX = x + 10 * this.perlinNoise(x, y, 0.01 * scale, seed);
        const warpY = y + 10 * this.perlinNoise(x, y, 0.01 * scale, seed + 1);
        
        const noise1 = this.perlinNoise(warpX, warpY, 0.03 * scale, seed + 2);
        const noise2 = this.grainNoise(x, y, 2 * scale, seed + 3);
        
        return (noise1 * 0.7 + noise2 * 0.3);
    },

    // Generate fabric texture
    fabricTexture(x, y, scale = 1, seed = 0) {
        const waveX = Math.sin(x * 0.1 * scale) * 2;
        const waveY = Math.sin(y * 0.1 * scale) * 2;
        
        const noise1 = this.perlinNoise(x + waveX, y + waveY, 0.02 * scale, seed);
        const noise2 = this.perlinNoise(x, y, 0.08 * scale, seed + 1);
        
        return (noise1 * 0.6 + noise2 * 0.4);
    },

    // Generate noise pattern based on type
    generateNoise(x, y, pattern) {
        const { type, scale, intensity, color } = pattern;
        let noiseValue = 0;

        switch (type) {
            case 'perlin':
                noiseValue = this.perlinNoise(x, y, scale);
                break;
            case 'grain':
                noiseValue = this.grainNoise(x, y, scale);
                break;
            case 'dots':
                noiseValue = this.dotPattern(x, y, scale);
                break;
            case 'static':
                noiseValue = this.staticNoise(x, y);
                break;
            case 'paper':
                noiseValue = this.paperTexture(x, y, scale);
                break;
            case 'canvas':
                noiseValue = this.canvasTexture(x, y, scale);
                break;
            case 'fabric':
                noiseValue = this.fabricTexture(x, y, scale);
                break;
            
            // New pattern types
            case 'grid':
                noiseValue = this.gridPattern(x, y, scale);
                break;
            case 'lines':
                noiseValue = this.linesPattern(x, y, scale);
                break;
            case 'crosshatch':
                noiseValue = this.crosshatchPattern(x, y, scale);
                break;
            case 'hexagon':
                noiseValue = this.hexagonPattern(x, y, scale);
                break;
            case 'waves':
                noiseValue = this.wavesPattern(x, y, scale);
                break;
            case 'marble':
                noiseValue = this.marblePattern(x, y, scale);
                break;
            case 'concrete':
                noiseValue = this.concretePattern(x, y, scale);
                break;
            case 'wood':
                noiseValue = this.woodPattern(x, y, scale);
                break;
            case 'metal':
                noiseValue = this.metalPattern(x, y, scale);
                break;
            case 'leather':
                noiseValue = this.leatherPattern(x, y, scale);
                break;
            case 'frost':
                noiseValue = this.frostPattern(x, y, scale);
                break;
            case 'crystal':
                noiseValue = this.crystalPattern(x, y, scale);
                break;
            case 'smoke':
                noiseValue = this.smokePattern(x, y, scale);
                break;
            case 'clouds':
                noiseValue = this.cloudsPattern(x, y, scale);
                break;
            case 'lightning':
                noiseValue = this.lightningPattern(x, y, scale);
                break;
            case 'tribal':
                noiseValue = this.tribalPattern(x, y, scale);
                break;
            case 'circuit':
                noiseValue = this.circuitPattern(x, y, scale);
                break;
            case 'galaxy':
                noiseValue = this.galaxyPattern(x, y, scale);
                break;
            case 'diamond':
                noiseValue = this.diamondPattern(x, y, scale);
                break;
            case 'chain':
                noiseValue = this.chainPattern(x, y, scale);
                break;
            case 'spiral':
                noiseValue = this.spiralPattern(x, y, scale);
                break;
            case 'fluid':
                noiseValue = this.fluidPattern(x, y, scale);
                break;
            case 'energy':
                noiseValue = this.energyPattern(x, y, scale);
                break;
            case 'aurora':
                noiseValue = this.auroraPattern(x, y, scale);
                break;
            case 'plasma':
                noiseValue = this.plasmaPattern(x, y, scale);
                break;
                
            // Add support for remaining pattern types with fallbacks
            case 'interference':
                noiseValue = this.perlinNoise(x, y, scale * 0.5) * Math.sin(x * 0.1) * Math.sin(y * 0.1);
                break;
            case 'cells':
                noiseValue = this.grainNoise(x, y, scale) * this.perlinNoise(x, y, scale * 0.02);
                break;
            case 'turbulence':
                noiseValue = Math.abs(this.perlinNoise(x, y, scale) + this.perlinNoise(x * 2, y * 2, scale * 2) * 0.5);
                break;
            case 'web':
                noiseValue = this.perlinNoise(x, y, scale * 0.005) * this.grainNoise(x, y, scale * 0.1);
                break;
            case 'fiber':
                noiseValue = Math.sin(x * 0.05 * scale) * this.perlinNoise(x, y, scale * 0.02);
                break;
            case 'ripples':
                noiseValue = Math.sin(Math.sqrt(x*x + y*y) * 0.02 * scale) * this.perlinNoise(x, y, scale * 0.01);
                break;
            case 'neural':
                noiseValue = this.grainNoise(x, y, scale) * (Math.sin(x * 0.03) + Math.cos(y * 0.03));
                break;
                
            default:
                noiseValue = 0;
        }

        return Math.max(0, Math.min(1, noiseValue * intensity));
    },

    // Create a noise canvas with caching
    createNoiseCanvas(width, height, pattern) {
        const cacheKey = this.getCacheKey(width, height, pattern);
        
        // Check cache first
        if (this.cache.has(cacheKey)) {
            const cachedCanvas = this.cache.get(cacheKey);
            // Return a copy of the cached canvas
            const newCanvas = document.createElement('canvas');
            newCanvas.width = width;
            newCanvas.height = height;
            const newCtx = newCanvas.getContext('2d');
            newCtx.drawImage(cachedCanvas, 0, 0);
            return newCanvas;
        }
        
        // Manage cache size
        this.manageCacheSize();
        
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        try {
            const imageData = ctx.createImageData(width, height);
            const data = imageData.data;
            
            // Parse base color
            const baseColor = this.hexToRgb(pattern.color);
            
            // Generate noise in chunks for better performance
            const chunkSize = 32;
            for (let chunkY = 0; chunkY < height; chunkY += chunkSize) {
                for (let chunkX = 0; chunkX < width; chunkX += chunkSize) {
                    const endX = Math.min(chunkX + chunkSize, width);
                    const endY = Math.min(chunkY + chunkSize, height);
                    
                    for (let y = chunkY; y < endY; y++) {
                        for (let x = chunkX; x < endX; x++) {
                            const noise = this.generateNoise(x, y, pattern);
                            const index = (y * width + x) * 4;
                            
                            // Apply noise as brightness variation
                            const brightness = 1 - noise;
                            data[index] = Math.floor(baseColor.r * brightness);     // R
                            data[index + 1] = Math.floor(baseColor.g * brightness); // G
                            data[index + 2] = Math.floor(baseColor.b * brightness); // B
                            data[index + 3] = 255; // A
                        }
                    }
                }
            }
            
            ctx.putImageData(imageData, 0, 0);
            
            // Cache the result
            this.cache.set(cacheKey, canvas);
            
        } catch (error) {
            console.error('Error generating noise pattern:', error);
            // Return a fallback solid color canvas
            ctx.fillStyle = pattern.color || '#f8f9fa';
            ctx.fillRect(0, 0, width, height);
        }
        
        return canvas;
    },

    // Convert hex color to RGB
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 255, g: 255, b: 255 };
    },

    // Generate optimized noise texture (smaller size, tiled) with caching
    createTiledNoiseCanvas(tileSize, pattern) {
        return this.createNoiseCanvas(tileSize, tileSize, pattern);
    },
    
    // Clear cache (useful for memory management)
    clearCache() {
        this.cache.clear();
    },

    // Create a noise overlay canvas with transparency
    createNoiseOverlay(width, height, pattern) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        try {
            const imageData = ctx.createImageData(width, height);
            const data = imageData.data;
            
            // Generate noise in chunks for better performance
            const chunkSize = 32;
            for (let chunkY = 0; chunkY < height; chunkY += chunkSize) {
                for (let chunkX = 0; chunkX < width; chunkX += chunkSize) {
                    const endX = Math.min(chunkX + chunkSize, width);
                    const endY = Math.min(chunkY + chunkSize, height);
                    
                    for (let y = chunkY; y < endY; y++) {
                        for (let x = chunkX; x < endX; x++) {
                            const noise = this.generateNoise(x, y, pattern);
                            const index = (y * width + x) * 4;
                            
                            // Create grayscale noise with alpha
                            const intensity = Math.floor(noise * 255);
                            data[index] = intensity;     // R
                            data[index + 1] = intensity; // G
                            data[index + 2] = intensity; // B
                            data[index + 3] = Math.floor(noise * 255); // A (use noise for alpha)
                        }
                    }
                }
            }
            
            ctx.putImageData(imageData, 0, 0);
            
        } catch (error) {
            console.error('Error generating noise overlay:', error);
            // Return empty transparent canvas on error
            ctx.clearRect(0, 0, width, height);
        }
        
        return canvas;
    },

    // Generate grid pattern
    gridPattern(x, y, scale = 4, seed = 0) {
        const gridSize = scale * 8;
        const lineWidth = Math.max(1, scale * 0.5);
        const xMod = x % gridSize;
        const yMod = y % gridSize;
        
        if (xMod < lineWidth || yMod < lineWidth) {
            return 0.8 + this.grainNoise(x, y, 1, seed) * 0.2;
        }
        return 0.1 + this.grainNoise(x, y, 2, seed) * 0.1;
    },

    // Generate diagonal lines pattern
    linesPattern(x, y, scale = 3, seed = 0) {
        const lineSpacing = scale * 6;
        const diagonal = (x + y) % lineSpacing;
        const lineWidth = Math.max(1, scale);
        
        if (diagonal < lineWidth) {
            return 0.7 + this.grainNoise(x, y, 1, seed) * 0.3;
        }
        return 0.2 + this.grainNoise(x, y, 2, seed) * 0.2;
    },

    // Generate crosshatch pattern
    crosshatchPattern(x, y, scale = 2, seed = 0) {
        const spacing = scale * 8;
        const lineWidth = Math.max(1, scale);
        
        const diag1 = (x + y) % spacing < lineWidth;
        const diag2 = (x - y) % spacing < lineWidth;
        
        if (diag1 || diag2) {
            return 0.6 + this.grainNoise(x, y, 1, seed) * 0.4;
        }
        return 0.1 + this.grainNoise(x, y, 2, seed) * 0.1;
    },

    // Generate hexagon pattern
    hexagonPattern(x, y, scale = 8, seed = 0) {
        const hexSize = scale * 3;
        const hexX = x / hexSize;
        const hexY = y / hexSize;
        
        // Simplified hexagon approximation using distance
        const centerX = Math.floor(hexX) + 0.5;
        const centerY = Math.floor(hexY) + 0.5;
        const distance = Math.sqrt((hexX - centerX) ** 2 + (hexY - centerY) ** 2);
        
        if (distance > 0.4) {
            return 0.8 + this.grainNoise(x, y, 1, seed) * 0.2;
        }
        return 0.2 + this.grainNoise(x, y, 2, seed) * 0.2;
    },

    // Generate wave pattern
    wavesPattern(x, y, scale = 1.5, seed = 0) {
        const waveX = Math.sin(y * 0.02 * scale + seed) * 10;
        const waveY = Math.sin(x * 0.02 * scale + seed + 1) * 10;
        
        const noise1 = this.perlinNoise(x + waveX, y + waveY, 0.01 * scale, seed);
        const noise2 = Math.sin(y * 0.05 * scale + seed) * 0.3;
        
        return Math.abs(noise1 + noise2);
    },

    // Generate marble pattern
    marblePattern(x, y, scale = 1.2, seed = 0) {
        const turbulence = this.perlinNoise(x, y, 0.01 * scale, seed) * 50;
        const marble = Math.sin((x + turbulence) * 0.02 * scale + seed);
        const noise = this.perlinNoise(x, y, 0.05 * scale, seed + 1);
        
        return Math.abs(marble * 0.7 + noise * 0.3);
    },

    // Generate concrete pattern
    concretePattern(x, y, scale = 1.0, seed = 0) {
        const noise1 = this.perlinNoise(x, y, 0.02 * scale, seed);
        const noise2 = this.perlinNoise(x, y, 0.08 * scale, seed + 1);
        const spots = this.grainNoise(x, y, 3 * scale, seed + 2);
        
        return (noise1 * 0.5 + noise2 * 0.3 + spots * 0.2);
    },

    // Generate wood grain pattern
    woodPattern(x, y, scale = 1.2, seed = 0) {
        const rings = Math.sin(x * 0.03 * scale + this.perlinNoise(x, y, 0.01, seed) * 20);
        const grain = this.perlinNoise(x, y, 0.05 * scale, seed + 1);
        
        return Math.abs(rings * 0.8 + grain * 0.2);
    },

    // Generate brushed metal pattern
    metalPattern(x, y, scale = 0.8, seed = 0) {
        const brush = Math.sin(y * 0.1 * scale + seed) * 0.2;
        const noise = this.grainNoise(x, y, 1 * scale, seed + 1);
        const scratches = this.perlinNoise(x, y, 0.05 * scale, seed + 2);
        
        return Math.abs(brush + noise * 0.5 + scratches * 0.3);
    },

    // Generate leather pattern
    leatherPattern(x, y, scale = 0.9, seed = 0) {
        const wrinkles = this.perlinNoise(x, y, 0.02 * scale, seed);
        const texture = this.perlinNoise(x, y, 0.1 * scale, seed + 1);
        const grain = this.grainNoise(x, y, 2 * scale, seed + 2);
        
        return (wrinkles * 0.4 + texture * 0.4 + grain * 0.2);
    },

    // Generate frosted glass pattern
    frostPattern(x, y, scale = 0.6, seed = 0) {
        const ice = this.perlinNoise(x, y, 0.03 * scale, seed);
        const crystals = this.grainNoise(x, y, 1 * scale, seed + 1);
        
        return Math.abs(ice * 0.7 + crystals * 0.3);
    },

    // Generate crystal pattern
    crystalPattern(x, y, scale = 1.6, seed = 0) {
        const facets = Math.sin(x * 0.1 * scale + seed) * Math.cos(y * 0.1 * scale + seed);
        const noise = this.perlinNoise(x, y, 0.03 * scale, seed + 1);
        
        return Math.abs(facets * 0.6 + noise * 0.4);
    },

    // Generate smoke effect
    smokePattern(x, y, scale = 2.0, seed = 0) {
        const swirl1 = this.perlinNoise(x, y, 0.01 * scale, seed);
        const swirl2 = this.perlinNoise(x + 100, y + 100, 0.02 * scale, seed + 1);
        const turbulence = this.perlinNoise(x, y, 0.05 * scale, seed + 2);
        
        return Math.abs(swirl1 * 0.5 + swirl2 * 0.3 + turbulence * 0.2);
    },

    // Generate clouds pattern
    cloudsPattern(x, y, scale = 1.8, seed = 0) {
        const cloud1 = this.perlinNoise(x, y, 0.008 * scale, seed);
        const cloud2 = this.perlinNoise(x, y, 0.02 * scale, seed + 1);
        const wispy = this.perlinNoise(x, y, 0.05 * scale, seed + 2);
        
        return Math.abs(cloud1 * 0.6 + cloud2 * 0.3 + wispy * 0.1);
    },

    // Generate lightning pattern
    lightningPattern(x, y, scale = 1.2, seed = 0) {
        const electric = this.perlinNoise(x, y, 0.02 * scale, seed);
        const branches = Math.abs(Math.sin(x * 0.1 * scale + electric * 50)) * 0.3;
        const noise = this.grainNoise(x, y, 2 * scale, seed + 1);
        
        return (electric * 0.6 + branches + noise * 0.1);
    },

    // Generate tribal pattern
    tribalPattern(x, y, scale = 1.5, seed = 0) {
        const pattern1 = Math.sin(x * 0.05 * scale + seed) * Math.cos(y * 0.05 * scale + seed);
        const pattern2 = Math.sin(x * 0.1 * scale + y * 0.1 * scale + seed);
        
        return Math.abs(pattern1 * 0.7 + pattern2 * 0.3);
    },

    // Generate circuit board pattern
    circuitPattern(x, y, scale = 1.0, seed = 0) {
        const gridX = Math.floor(x / (10 * scale));
        const gridY = Math.floor(y / (10 * scale));
        const hash = this.hash(gridX, gridY, seed);
        
        const lineX = x % (10 * scale) < 2;
        const lineY = y % (10 * scale) < 2;
        
        if ((lineX || lineY) && hash > 0.3) {
            return 0.8;
        }
        return 0.1 + this.grainNoise(x, y, 1, seed) * 0.1;
    },

    // Generate galaxy/stars pattern
    galaxyPattern(x, y, scale = 2.2, seed = 0) {
        const star = this.grainNoise(x, y, 0.5 * scale, seed);
        const nebula = this.perlinNoise(x, y, 0.01 * scale, seed + 1);
        const dust = this.perlinNoise(x, y, 0.05 * scale, seed + 2);
        
        // Create occasional bright stars
        if (star > 0.95) {
            return 1.0;
        }
        
        return Math.abs(nebula * 0.6 + dust * 0.4);
    },

    // Generate diamond plate pattern
    diamondPattern(x, y, scale = 1.3, seed = 0) {
        const diamondSize = scale * 12;
        const modX = x % diamondSize;
        const modY = y % diamondSize;
        
        const diamond = Math.abs(modX - diamondSize/2) + Math.abs(modY - diamondSize/2);
        const raised = diamond < diamondSize * 0.3 ? 0.8 : 0.3;
        
        return raised + this.grainNoise(x, y, 1, seed) * 0.2;
    },

    // Generate chain link pattern
    chainPattern(x, y, scale = 1.1, seed = 0) {
        const chainSize = scale * 20;
        const modX = (x % chainSize) / chainSize;
        const modY = (y % chainSize) / chainSize;
        
        const link = Math.sin(modX * Math.PI * 2) * Math.sin(modY * Math.PI * 2);
        
        return Math.abs(link * 0.6) + this.grainNoise(x, y, 1, seed) * 0.4;
    },

    // Generate spiral vortex pattern
    spiralPattern(x, y, scale = 1.8, seed = 0) {
        const centerX = 200, centerY = 200; // Relative center
        const dx = x - centerX;
        const dy = y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);
        
        const spiral = Math.sin(angle * 3 + distance * 0.02 * scale + seed);
        const noise = this.perlinNoise(x, y, 0.01 * scale, seed + 1);
        
        return Math.abs(spiral * 0.7 + noise * 0.3);
    },

    // Generate fluid swirl pattern
    fluidPattern(x, y, scale = 2.0, seed = 0) {
        const swirl1 = this.perlinNoise(x, y, 0.008 * scale, seed);
        const swirl2 = this.perlinNoise(x + swirl1 * 50, y + swirl1 * 50, 0.02 * scale, seed + 1);
        
        return Math.abs(swirl1 * 0.6 + swirl2 * 0.4);
    },

    // Generate energy waves pattern
    energyPattern(x, y, scale = 1.5, seed = 0) {
        const wave1 = Math.sin(x * 0.02 * scale + seed) * Math.sin(y * 0.02 * scale + seed);
        const wave2 = Math.sin(x * 0.05 * scale + y * 0.05 * scale + seed);
        const electric = this.perlinNoise(x, y, 0.03 * scale, seed + 1);
        
        return Math.abs(wave1 * 0.4 + wave2 * 0.3 + electric * 0.3);
    },

    // Generate aurora flow pattern
    auroraPattern(x, y, scale = 2.2, seed = 0) {
        const flow1 = Math.sin(y * 0.01 * scale + this.perlinNoise(x, y, 0.005, seed) * 20);
        const flow2 = Math.sin(x * 0.01 * scale + this.perlinNoise(x, y, 0.008, seed + 1) * 15);
        const shimmer = this.perlinNoise(x, y, 0.02 * scale, seed + 2);
        
        return Math.abs(flow1 * 0.5 + flow2 * 0.3 + shimmer * 0.2);
    },

    // Generate plasma field pattern
    plasmaPattern(x, y, scale = 1.6, seed = 0) {
        const plasma1 = Math.sin(x * 0.03 * scale + seed);
        const plasma2 = Math.sin(y * 0.03 * scale + seed + 1);
        const plasma3 = Math.sin((x + y) * 0.02 * scale + seed + 2);
        const noise = this.perlinNoise(x, y, 0.02 * scale, seed + 3);
        
        return Math.abs((plasma1 + plasma2 + plasma3) / 3 * 0.7 + noise * 0.3);
    }
}; 