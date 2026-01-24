/**
 * FrameIt 4.5 - Drag Fixes & Shortcuts
 */

const state = {
    images: [],
    layout: 'single',
    smartCrop: false,
    resolution: { width: 1080, height: 1920, id: 'story' },
    scale: 1.0,
    radius: 20,
    shadow: { blur: 40, opacity: 0.4, offsetY: 20, color: '#000000' },
    texture: { type: 'none', opacity: 0.3, pattern: null },
    background: { type: 'color', value: '#1a1a1a' },

    textLayers: [],
    selectedTextId: null,

    // Snap State
    snappedX: false,
    snappedY: false,

    // Frame Style
    frameStyle: { type: 'none', theme: 'light' },

    // Animation State
    animation: {
        enabled: true, // Always enabled
        style: 'gentle',
        duration: 5,
        speed: 1,
        offset: 0,
        easing: 'ease-out',
        intensity: 1,
        direction: 'up',
        loopMode: 'loop',
        isPlaying: false,
        isPaused: false,
        startTime: 0,
        fps: 30 // Export FPS
    },

    // Animation Library
    savedAnimations: JSON.parse(localStorage.getItem('frameit_animations') || '[]')
};

// Utils
const generateId = () => Math.random().toString(36).substr(2, 9);
const GRADIENTS = [
    // Pastels & Soft
    'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
    'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
    'linear-gradient(120deg, #e0c3fc 0%, #8ec5fc 100%)',
    'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    'linear-gradient(to top, #fbc2eb 0%, #a6c1ee 100%)',

    // Vibrant & Bold
    'linear-gradient(120deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #6B73FF 0%, #000DFF 100%)',
    'linear-gradient(to right, #f83600 0%, #f9d423 100%)',
    'linear-gradient(to top, #ff0844 0%, #ffb199 100%)',

    // Blues & Aqua
    'linear-gradient(to right, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(120deg, #89f7fe 0%, #66a6ff 100%)',
    'linear-gradient(to top, #30cfd0 0%, #330867 100%)',
    'linear-gradient(to top, #1e3c72 0%, #2a5298 100%)',
    'linear-gradient(to right, #243949 0%, #517fa4 100%)',
    'linear-gradient(to top, #accbee 0%, #e7f0fd 100%)',
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(to top, #09203f 0%, #537895 100%)',

    // Greens & Nature
    'linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%)',
    'linear-gradient(to top, #0ba360 0%, #3cba92 100%)',
    'linear-gradient(to right, #00b09b, #96c93d)',
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(to top, #37ecba 0%, #72afd3 100%)',

    // Warm & Sunset
    'linear-gradient(120deg, #f6d365 0%, #fda085 100%)',
    'linear-gradient(to right, #fa709a 0%, #fee140 100%)',
    'linear-gradient(to top, #ff9a56 0%, #ff6a88 100%)',
    'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    'linear-gradient(to right, #ff6e7f 0%, #bfe9ff 100%)',
    'linear-gradient(to top, #fad0c4 0%, #ffd1ff 100%)',

    // Purple & Pink
    'linear-gradient(to right, #c471f5 0%, #fa71cd 100%)',
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(to top, #ee9ca7 0%, #ffdde1 100%)',
    'linear-gradient(to right, #a8edea 0%, #fed6e3 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',

    // Dark & Moody
    'linear-gradient(to right, #434343 0%, black 100%)',
    'linear-gradient(to top, #0f2027 0%, #203a43 0%, #2c5364 100%)',
    'linear-gradient(to right, #232526, #414345)',
    'linear-gradient(135deg, #1f4037 0%, #99f2c8 100%)',
    'linear-gradient(to top, #141e30 0%, #243b55 100%)',

    // Reds & Fire
    'linear-gradient(to right, #b92b27, #152999 100%)',
    'linear-gradient(to top, #eb3349 0%, #f45c43 100%)',
    'linear-gradient(to right, #ff512f 0%, #dd2476 100%)',
    'linear-gradient(135deg, #f857a6 0%, #ff5858 100%)',

    // Ocean & Deep
    'linear-gradient(to top, #4481eb 0%, #04befe 100%)',
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(to right, #2193b0, #6dd5ed)',
    'linear-gradient(to top, #5f72bd 0%, #9b23ea 100%)',

    // Gold & Luxury
    'linear-gradient(to right, #f7971e 0%, #ffd200 100%)',
    'linear-gradient(135deg, #ffd89b 0%, #19547b 100%)',
    'linear-gradient(to top, #d299c2 0%, #fef9d7 100%)',

    // Cool Tones
    'linear-gradient(to right, #00d2ff 0%, #3a47d5 100%)',
    'linear-gradient(135deg, #2af598 0%, #009efd 100%)',
    'linear-gradient(to top, #a8edea 0%, #fed6e3 100%)',

    // Neon & Electric
    'linear-gradient(to right, #f953c6, #b91d73)',
    'linear-gradient(135deg, #13547a 0%, #80d0c7 100%)',
    'linear-gradient(to right, #00f260, #0575e6)',

    // Earth Tones
    'linear-gradient(to top, #d38312 0%, #a83279 100%)',
    'linear-gradient(135deg, #8e9eab 0%, #eef2f3 100%)',
    'linear-gradient(to right, #bdc3c7, #2c3e50)',

    // Candy & Sweet
    'linear-gradient(to right, #ff9a9e 0%, #fecfef 100%)',
    'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    'linear-gradient(to top, #fbc2eb 0%, #a18cd1 100%)'
];

let globalZ = 100;

const ELEMENTS = {
    canvas: document.getElementById('main-canvas'),
    viewport: document.getElementById('canvas-viewport'),
    uploadOverlay: document.getElementById('upload-overlay'),
    fileInput: document.getElementById('file-input'),
    gradientGrid: document.getElementById('gradient-grid'),

    // Panels
    panel: document.getElementById('prop-panel'),
    layersPanel: document.getElementById('layers-panel'),
    textPanel: document.getElementById('text-panel'),
    animPanel: document.getElementById('animation-panel'),

    // UI Sections
    // textEditControls: document.getElementById('text-edit-controls'), // This is now a panel

    // Page Sections
    landingPage: document.getElementById('landing-page'),
    appContainer: document.querySelector('.app-container'),
    startBtns: document.querySelectorAll('#get-started-btn, #hero-cta, #final-cta'),
    btnCloseLayers: document.getElementById('btn-close-layers'),

    // Handles
    dragHandle: document.getElementById('panel-drag-handle'),
    layersDragHandle: document.getElementById('layers-drag-handle'),
    textDragHandle: document.getElementById('text-drag-handle'),
    animDragHandle: document.getElementById('anim-drag-handle'),

    layerList: document.getElementById('layer-list'),
    textLayerList: document.getElementById('text-layer-list'),

    // Controls
    sliderScale: document.getElementById('slider-scale'), valScale: document.getElementById('val-scale'),
    sliderRadius: document.getElementById('slider-radius'), valRadius: document.getElementById('val-radius'),
    sliderBlur: document.getElementById('slider-blur'), valBlur: document.getElementById('val-blur'),
    sliderOffset: document.getElementById('slider-offset'), valOffset: document.getElementById('val-offset'),
    sliderOpacity: document.getElementById('slider-opacity'), valOpacity: document.getElementById('val-opacity'),
    sliderTexture: document.getElementById('slider-texture'), valTexture: document.getElementById('val-texture'),
    inputBgColor: document.getElementById('input-bg-color'), hexInput: document.getElementById('hex-input'),

    // Frame Controls
    frameStyleBtns: document.querySelectorAll('#frame-style-control .segment'),
    frameThemeBtns: document.querySelectorAll('#frame-theme-control .segment'),
    browserThemeRow: document.getElementById('browser-theme-row'),

    // Text Controls
    textContent: document.getElementById('text-content'),
    fontFamily: document.getElementById('font-family'),
    sliderFontSize: document.getElementById('slider-font-size'), valFontSize: document.getElementById('val-font-size'),
    textInputColor: document.getElementById('input-text-color'), textHexInput: document.getElementById('text-hex-input'),
    btnDeleteText: document.getElementById('btn-delete-text'),
    btnCloseText: document.getElementById('btn-close-text'),
    btnToggleLayersSmall: document.getElementById('btn-toggle-layers-small'),

    // Selectors & Buttons
    resBtns: document.querySelectorAll('[data-res]'),
    layoutBtns: document.querySelectorAll('[data-layout]'),
    checkSmartCrop: document.getElementById('check-smart-crop'),
    get textureBtns() { return document.querySelectorAll('.effect-btn'); },

    // Actions
    downloadBtn: document.getElementById('btn-download'),
    addTextBtn: document.getElementById('btn-add-text-shortcut'), // Updated ID
    addTextPanelBtn: document.getElementById('btn-add-text-panel'),
    addLayerBtn: document.getElementById('btn-add-layer'),
    btnToggleAnim: document.getElementById('btn-toggle-anim'),
    btnCloseAnim: document.getElementById('btn-close-anim'),

    // Animation Controls
    animControls: document.getElementById('anim-controls'),
    animStyleBtns: document.querySelectorAll('#anim-style-control .anim-btn'),
    animDurationBtns: document.querySelectorAll('#anim-duration-control .segment'),
    sliderAnimSpeed: document.getElementById('slider-anim-speed'),
    valAnimSpeed: document.getElementById('val-anim-speed'),
    sliderAnimOffset: document.getElementById('slider-anim-offset'),
    valAnimOffset: document.getElementById('val-anim-offset'),
    sliderAnimIntensity: document.getElementById('slider-anim-intensity'),
    valAnimIntensity: document.getElementById('val-anim-intensity')
};

const ctx = ELEMENTS.canvas.getContext('2d');
const pReviewCanvas = document.createElement('canvas'); pReviewCanvas.width = 60; pReviewCanvas.height = 60;
const pReviewCtx = pReviewCanvas.getContext('2d');

function init() {
    setupGradientGrid();
    setupEventListeners();
    setupCanvasInteractions();
    setupKeyboardShortcuts();

    setupLandingPageInteraction();

    makePanelDraggable(ELEMENTS.panel, ELEMENTS.dragHandle);
    makePanelDraggable(ELEMENTS.layersPanel, ELEMENTS.layersDragHandle);
    makePanelDraggable(ELEMENTS.textPanel, ELEMENTS.textDragHandle);
    makePanelDraggable(ELEMENTS.animPanel, ELEMENTS.animDragHandle);

    setResolution('story');
    generateTexturePattern();
    updateEffectPreviews();
    renderLayerList();
    renderTextLayerList();
    checkLimits();
    draw();

    window.addEventListener('resize', updateCanvasVisualSize);
}

function setupLandingPageInteraction() {
    if (ELEMENTS.startBtns) {
        ELEMENTS.startBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                ELEMENTS.landingPage.style.display = 'none';
                ELEMENTS.appContainer.style.display = 'flex';
                // Trigger resize to ensure canvas fits
                updateCanvasVisualSize();
            });
        });
    }
}

function togglePanel(panel) {
    if (panel.classList.contains('active')) {
        panel.classList.remove('active');
        return false;
    } else {
        panel.classList.add('active');
        panel.style.zIndex = ++globalZ;
        return true;
    }
}

function makePanelDraggable(panel, handle) {
    let isDragging = false;
    let startX, startY, startLeft, startTop;

    handle.addEventListener('mousedown', (e) => {
        if (e.target.closest('button')) return;
        e.preventDefault(); // Prevent text selection

        isDragging = true;
        globalZ++; panel.style.zIndex = globalZ;

        startX = e.clientX;
        startY = e.clientY;
        startLeft = panel.offsetLeft;
        startTop = panel.offsetTop;

        document.body.style.cursor = 'grabbing';
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;

        const dx = e.clientX - startX;
        const dy = e.clientY - startY;

        panel.style.left = `${startLeft + dx}px`;
        panel.style.top = `${startTop + dy}px`;
        panel.style.right = 'auto'; // Ensure right doesn't interfere
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
        document.body.style.cursor = 'default';
    });

    panel.addEventListener('mousedown', () => { panel.style.zIndex = ++globalZ; });
}


function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // If typing in input/textarea, ignore shortcuts
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        if (state.selectedTextId) {
            const layer = state.textLayers.find(l => l.id === state.selectedTextId);
            if (!layer) return;

            // Delete
            if (e.key === 'Delete' || e.key === 'Backspace') {
                e.preventDefault();
                state.textLayers = state.textLayers.filter(l => l.id !== layer.id);
                state.selectedTextId = null;
                // ELEMENTS.textEditControls.style.display = 'none'; // Kept visible in separate panel
                renderTextLayerList();
                checkLimits();
                draw();
            }

            // Escape (Deselect)
            if (e.key === 'Escape') {
                state.selectedTextId = null;
                // ELEMENTS.textEditControls.style.display = 'none';
                renderTextLayerList();
                draw();
            }

            // Arrows (Nudge)
            const step = e.shiftKey ? 10 : 1;
            if (e.key === 'ArrowUp') { e.preventDefault(); layer.y -= step; draw(); }
            if (e.key === 'ArrowDown') { e.preventDefault(); layer.y += step; draw(); }
            if (e.key === 'ArrowLeft') { e.preventDefault(); layer.x -= step; draw(); }
            if (e.key === 'ArrowRight') { e.preventDefault(); layer.x += step; draw(); }
        }
    });
}

function checkLimits() {
    if (state.images.length >= 4) ELEMENTS.addLayerBtn.style.display = 'none';
    else ELEMENTS.addLayerBtn.style.display = 'block';

    if (state.textLayers.length >= 5) {
        ELEMENTS.addTextBtn.style.display = 'none';
        ELEMENTS.addTextPanelBtn.style.display = 'none';
    } else {
        ELEMENTS.addTextBtn.style.display = 'flex';
        ELEMENTS.addTextPanelBtn.style.display = 'block';
    }
}

function setupCanvasInteractions() {
    let isDraggingText = false;
    let dragStartX, dragStartY;
    let initialTx, initialTy;

    ELEMENTS.canvas.addEventListener('mousedown', (e) => {
        const rect = ELEMENTS.canvas.getBoundingClientRect();
        const scaleX = ELEMENTS.canvas.width / rect.width;
        const scaleY = ELEMENTS.canvas.height / rect.height;
        const mouseX = (e.clientX - rect.left) * scaleX;
        const mouseY = (e.clientY - rect.top) * scaleY;

        let hit = null;
        for (let i = state.textLayers.length - 1; i >= 0; i--) {
            const layer = state.textLayers[i];
            ctx.font = `${layer.fontSize}px "${layer.fontFamily}", sans-serif`;
            const metrics = ctx.measureText(layer.content);
            const w = metrics.width; const h = layer.fontSize;
            if (mouseX >= layer.x - w / 2 && mouseX <= layer.x + w / 2 &&
                mouseY >= layer.y - h / 2 && mouseY <= layer.y + h / 2) {
                hit = layer; break;
            }
        }

        if (hit) {
            selectTextLayer(hit.id); isDraggingText = true;
            dragStartX = mouseX; dragStartY = mouseY; initialTx = hit.x; initialTy = hit.y;
            document.body.style.cursor = 'move';
        } else {
            state.selectedTextId = null;
            // ELEMENTS.textEditControls.style.display = 'none';
            if (ELEMENTS.addTextBtn) ELEMENTS.addTextBtn.classList.remove('active');
            renderTextLayerList();
            draw();
        }
    });

    ELEMENTS.canvas.addEventListener('mousemove', (e) => {
        if (!isDraggingText || !state.selectedTextId) return;
        const rect = ELEMENTS.canvas.getBoundingClientRect();
        const scaleX = ELEMENTS.canvas.width / rect.width;
        const scaleY = ELEMENTS.canvas.height / rect.height;
        const mouseX = (e.clientX - rect.left) * scaleX;
        const mouseY = (e.clientY - rect.top) * scaleY;
        const layer = state.textLayers.find(l => l.id === state.selectedTextId);
        if (layer) {
            let newX = initialTx + (mouseX - dragStartX);
            let newY = initialTy + (mouseY - dragStartY);

            // Snap Logic
            const cx = ELEMENTS.canvas.width / 2;
            const cy = ELEMENTS.canvas.height / 2;
            const threshold = 15;

            state.snappedX = false;
            state.snappedY = false;

            if (Math.abs(newX - cx) < threshold) { newX = cx; state.snappedX = true; }
            if (Math.abs(newY - cy) < threshold) { newY = cy; state.snappedY = true; }

            layer.x = newX;
            layer.y = newY;
            draw();
        }
    });

    ELEMENTS.canvas.addEventListener('mouseup', () => {
        isDraggingText = false; document.body.style.cursor = 'default';
        state.snappedX = false; state.snappedY = false;
        draw();
    });
}

function selectTextLayer(id) {
    state.selectedTextId = id;
    const layer = state.textLayers.find(l => l.id === id);
    if (!layer) return;

    ELEMENTS.textPanel.classList.add('active'); // Ensure panel is active

    // Scroll to controls
    // ELEMENTS.textEditControls.scrollIntoView({ behavior: 'smooth', block: 'center' });

    ELEMENTS.textContent.value = layer.content;
    ELEMENTS.fontFamily.value = layer.fontFamily;
    ELEMENTS.sliderFontSize.value = layer.fontSize;
    ELEMENTS.valFontSize.textContent = layer.fontSize;
    ELEMENTS.textInputColor.value = layer.color;
    ELEMENTS.textHexInput.value = layer.color.substring(1).toUpperCase();

    renderTextLayerList();
    draw();
}

function addTextLayer() {
    if (state.textLayers.length >= 5) return;
    const newId = generateId();
    state.textLayers.push({ id: newId, content: 'New Text', x: ELEMENTS.canvas.width / 2, y: ELEMENTS.canvas.height / 2, fontSize: 80, fontFamily: 'Inter', color: '#ffffff' });
    selectTextLayer(newId);
    checkLimits();
}

function setupEventListeners() {
    ELEMENTS.fileInput.addEventListener('change', handleFileUpload);
    ELEMENTS.uploadOverlay.addEventListener('click', () => ELEMENTS.fileInput.click());
    ELEMENTS.addLayerBtn.addEventListener('click', () => ELEMENTS.fileInput.click());

    ELEMENTS.downloadBtn.addEventListener('click', () => {
        // Export PNG for static, MP4 for animated styles
        if (state.animation.style === 'static') {
            exportImage();
        } else {
            exportVideo();
        }
    });

    if (ELEMENTS.addTextBtn) {
        ELEMENTS.addTextBtn.addEventListener('click', () => {
            const isOpen = togglePanel(ELEMENTS.textPanel);
            if (isOpen) ELEMENTS.addTextBtn.classList.add('active');
            else ELEMENTS.addTextBtn.classList.remove('active');
        });
    }

    ELEMENTS.addTextPanelBtn.addEventListener('click', addTextLayer);

    if (ELEMENTS.btnCloseText) {
        ELEMENTS.btnCloseText.addEventListener('click', () => {
            state.selectedTextId = null;
            ELEMENTS.textPanel.classList.remove('active');
            if (ELEMENTS.addTextBtn) ELEMENTS.addTextBtn.classList.remove('active');
            draw();
            renderTextLayerList();
        });
    }

    // ELEMENTS.btnCloseLayers.addEventListener('click', () => {
    //     ELEMENTS.layersPanel.classList.remove('active');
    //     ELEMENTS.btnToggleLayersSmall.classList.remove('active');
    // });

    if (ELEMENTS.btnCloseLayers) {
        ELEMENTS.btnCloseLayers.addEventListener('click', () => {
            ELEMENTS.layersPanel.classList.remove('active');
            ELEMENTS.btnToggleLayersSmall.classList.remove('active');
        });
    }

    ELEMENTS.btnToggleLayersSmall.addEventListener('click', () => {
        const isOpen = togglePanel(ELEMENTS.layersPanel);
        if (isOpen) ELEMENTS.btnToggleLayersSmall.classList.add('active');
        else ELEMENTS.btnToggleLayersSmall.classList.remove('active');
    });

    ELEMENTS.resBtns.forEach(btn => { btn.addEventListener('click', (e) => { ELEMENTS.resBtns.forEach(b => b.classList.remove('active')); e.target.classList.add('active'); setResolution(e.target.dataset.res); }); });

    // Frame Style Listeners
    ELEMENTS.frameStyleBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            ELEMENTS.frameStyleBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            state.frameStyle.type = e.target.dataset.frame;

            // Show/Hide Theme control
            if (state.frameStyle.type === 'browser') ELEMENTS.browserThemeRow.style.display = 'flex';
            else ELEMENTS.browserThemeRow.style.display = 'none';

            draw();
        });
    });

    ELEMENTS.frameThemeBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            ELEMENTS.frameThemeBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            state.frameStyle.theme = e.target.dataset.theme;
            draw();
        });
    });

    ELEMENTS.layoutBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const target = e.target.closest('.layout-btn');
            ELEMENTS.layoutBtns.forEach(b => b.classList.remove('active'));
            target.classList.add('active');
            state.layout = target.dataset.layout;
            draw();
        });
    });

    ELEMENTS.checkSmartCrop.addEventListener('change', (e) => {
        state.smartCrop = e.target.checked;
        draw();
    });

    ELEMENTS.textureBtns.forEach(btn => { btn.addEventListener('click', (e) => { ELEMENTS.textureBtns.forEach(b => b.classList.remove('active')); e.target.classList.add('active'); state.texture.type = e.target.dataset.texture; generateTexturePattern(); draw(); }); });

    const bindSlider = (slider, display, key) => {
        slider.addEventListener('input', (e) => {
            let val = parseInt(e.target.value);
            if (key === 'scale') { state.scale = val / 100; display.textContent = val + '%'; }
            if (key === 'radius') { state.radius = val; display.textContent = val + 'px'; }
            if (key === 'blur') { state.shadow.blur = val; display.textContent = val; }
            if (key === 'offset') { state.shadow.offsetY = val; display.textContent = val; }
            if (key === 'opacity') { state.shadow.opacity = val / 100; display.textContent = val + '%'; }
            if (key === 'texture') { state.texture.opacity = val / 100; display.textContent = val + '%'; }
            if (state.selectedTextId) {
                const layer = state.textLayers.find(l => l.id === state.selectedTextId);
                if (key === 'fontsize') { layer.fontSize = val; display.textContent = val; }
            }
            draw();
        });
    };
    bindSlider(ELEMENTS.sliderScale, ELEMENTS.valScale, 'scale'); bindSlider(ELEMENTS.sliderRadius, ELEMENTS.valRadius, 'radius');
    bindSlider(ELEMENTS.sliderBlur, ELEMENTS.valBlur, 'blur'); bindSlider(ELEMENTS.sliderOffset, ELEMENTS.valOffset, 'offset');
    bindSlider(ELEMENTS.sliderOpacity, ELEMENTS.valOpacity, 'opacity'); bindSlider(ELEMENTS.sliderTexture, ELEMENTS.valTexture, 'texture');
    bindSlider(ELEMENTS.sliderFontSize, ELEMENTS.valFontSize, 'fontsize');

    ELEMENTS.textContent.addEventListener('input', e => { if (state.selectedTextId) { state.textLayers.find(l => l.id === state.selectedTextId).content = e.target.value; draw(); renderTextLayerList(); } });
    ELEMENTS.fontFamily.addEventListener('change', e => { if (state.selectedTextId) { state.textLayers.find(l => l.id === state.selectedTextId).fontFamily = e.target.value; draw(); } });
    ELEMENTS.textInputColor.addEventListener('input', e => { if (state.selectedTextId) { state.textLayers.find(l => l.id === state.selectedTextId).color = e.target.value; ELEMENTS.textHexInput.value = e.target.value.substring(1).toUpperCase(); draw(); } });
    ELEMENTS.inputBgColor.addEventListener('input', e => { state.background.type = 'color'; state.background.value = e.target.value; ELEMENTS.hexInput.value = e.target.value.substring(1).toUpperCase(); draw(); updateEffectPreviews(); });

    // Animation Listeners
    ELEMENTS.btnToggleAnim.addEventListener('click', () => {
        const isOpen = togglePanel(ELEMENTS.animPanel);
        if (isOpen) ELEMENTS.btnToggleAnim.classList.add('active');
        else ELEMENTS.btnToggleAnim.classList.remove('active');
    });

    ELEMENTS.btnCloseAnim.addEventListener('click', () => {
        ELEMENTS.animPanel.classList.remove('active');
        ELEMENTS.btnToggleAnim.classList.remove('active');
    });


    // Auto-start animation
    startPreviewAnimation();

    ELEMENTS.animStyleBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            ELEMENTS.animStyleBtns.forEach(b => b.classList.remove('active'));
            const button = e.currentTarget; // Use currentTarget to get the button, not the clicked child
            button.classList.add('active');
            state.animation.style = button.dataset.anim;
        });
    });

    ELEMENTS.animDurationBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            ELEMENTS.animDurationBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            state.animation.duration = parseInt(e.target.dataset.duration);
        });
    });

    ELEMENTS.sliderAnimSpeed.addEventListener('input', (e) => {
        state.animation.speed = parseFloat(e.target.value);
        ELEMENTS.valAnimSpeed.textContent = state.animation.speed.toFixed(1) + 'x';
    });

    ELEMENTS.sliderAnimOffset.addEventListener('input', (e) => {
        state.animation.offset = parseInt(e.target.value);
        ELEMENTS.valAnimOffset.textContent = state.animation.offset + 'ms';
    });

    ELEMENTS.sliderAnimIntensity.addEventListener('input', (e) => {
        state.animation.intensity = parseFloat(e.target.value);
        ELEMENTS.valAnimIntensity.textContent = state.animation.intensity.toFixed(1) + 'x';
    });
}

function handleFileUpload(e) {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    let loaded = 0;
    files.forEach(file => {
        if (state.images.length >= 4) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                if (state.images.length < 4) {
                    state.images.push(img);
                    loaded++;
                    checkLimits();
                }
                if (loaded === files.length || state.images.length === 4) {
                    if (state.images.length > 1 && state.layout === 'single') updateLayoutUI('row');
                    if (state.images.length > 2 && state.layout === 'row') updateLayoutUI('row-3');
                    if (state.images.length > 3) updateLayoutUI('grid');
                    ELEMENTS.uploadOverlay.classList.add('hidden');
                    renderLayerList(); draw();
                }
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(file);
    });
}

function updateLayoutUI(layout) {
    state.layout = layout;
    ELEMENTS.layoutBtns.forEach(b => {
        b.classList.remove('active');
        if (b.dataset.layout === layout) b.classList.add('active');
    });
}

function moveLayer(index, direction) {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= state.images.length) return;
    const temp = state.images[newIndex];
    state.images[newIndex] = state.images[index];
    state.images[index] = temp;
    renderLayerList(); draw();
}

function renderLayerList() {
    ELEMENTS.layerList.innerHTML = '';
    state.images.forEach((img, index) => {
        const item = document.createElement('div');
        item.className = 'layer-item';

        const thumb = document.createElement('img');
        thumb.className = 'layer-thumb'; thumb.src = img.src;

        const name = document.createElement('span');
        name.className = 'layer-name';
        name.textContent = `Image ${index + 1}`;

        const controls = document.createElement('div');
        controls.className = 'layer-controls';

        if (state.images.length > 1) {
            const upBtn = document.createElement('button');
            upBtn.className = 'layer-btn';
            upBtn.innerHTML = '↑';
            upBtn.onclick = (e) => { e.stopPropagation(); moveLayer(index, -1); };
            if (index === 0) upBtn.style.opacity = 0;
            controls.appendChild(upBtn);

            const downBtn = document.createElement('button');
            downBtn.className = 'layer-btn';
            downBtn.innerHTML = '↓';
            downBtn.onclick = (e) => { e.stopPropagation(); moveLayer(index, 1); };
            if (index === state.images.length - 1) downBtn.style.opacity = 0;
            controls.appendChild(downBtn);
        }

        const delBtn = document.createElement('button');
        delBtn.className = 'layer-btn trash';
        delBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>';
        delBtn.onclick = (e) => {
            e.stopPropagation();
            state.images.splice(index, 1);
            checkLimits();
            if (state.images.length === 0) ELEMENTS.uploadOverlay.classList.remove('hidden');
            renderLayerList(); draw();
        };
        controls.appendChild(delBtn);

        item.appendChild(thumb);
        item.appendChild(name);
        item.appendChild(controls);
        ELEMENTS.layerList.appendChild(item);
    });
}

function renderTextLayerList() {
    ELEMENTS.textLayerList.innerHTML = '';
    state.textLayers.forEach((layer) => {
        const item = document.createElement('div');
        item.className = `layer-item ${state.selectedTextId === layer.id ? 'active' : ''}`;

        const thumb = document.createElement('div');
        thumb.className = 'layer-thumb'; thumb.textContent = 'T'; thumb.style.color = '#ccc';

        const name = document.createElement('span');
        name.className = 'layer-name';
        name.textContent = layer.content.substring(0, 15) || 'Empty Text';

        const controls = document.createElement('div');
        controls.className = 'layer-controls';

        const delBtn = document.createElement('button');
        delBtn.className = 'layer-btn trash';
        delBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>';
        delBtn.onclick = (e) => {
            e.stopPropagation();
            state.textLayers = state.textLayers.filter(l => l.id !== layer.id);
            checkLimits();
            if (state.selectedTextId === layer.id) {
                state.selectedTextId = null;
                // ELEMENTS.textEditControls.style.display = 'none'; // Keep panel open, just deselect
            }
            renderTextLayerList(); draw();
        };
        controls.appendChild(delBtn);

        item.onclick = () => selectTextLayer(layer.id);

        item.appendChild(thumb);
        item.appendChild(name);
        item.appendChild(controls);
        ELEMENTS.textLayerList.appendChild(item);
    });
}

// ... updateEffectPreviews, generateTexturePattern, setResolution ...

function updateEffectPreviews() {
    if (state.background.type === 'gradient') {
        const grad = pReviewCtx.createLinearGradient(0, 0, 60, 60);
        const colors = state.background.value.match(/#[a-fA-F0-9]{3,6}/g) || ['#fff', '#000'];
        if (colors.length >= 2) { grad.addColorStop(0, colors[0]); grad.addColorStop(1, colors[colors.length - 1]); }
        pReviewCtx.fillStyle = grad;
    } else { pReviewCtx.fillStyle = state.background.value; }
    pReviewCtx.fillRect(0, 0, 60, 60);

    // Updated Effect Previews
    const effects = ['none', 'noise', 'grain', 'scanlines', 'halftone', 'grid', 'fabric', 'vignette'];
    effects.forEach(eff => {
        pReviewCtx.clearRect(0, 0, 60, 60);
        // Draw Background
        if (state.background.type === 'gradient') {
            const grad = pReviewCtx.createLinearGradient(0, 0, 60, 60);
            const colors = state.background.value.match(/#[a-fA-F0-9]{3,6}/g);
            if (colors) { grad.addColorStop(0, colors[0]); grad.addColorStop(1, colors[colors.length - 1]); }
            pReviewCtx.fillStyle = grad;
        } else { pReviewCtx.fillStyle = state.background.value; }
        pReviewCtx.fillRect(0, 0, 60, 60);

        // Draw Preview Texture
        pReviewCtx.save();
        pReviewCtx.globalAlpha = 0.5; pReviewCtx.globalCompositeOperation = 'overlay';

        if (eff === 'noise') {
            const id = pReviewCtx.createImageData(60, 60);
            for (let i = 0; i < id.data.length; i += 4) { const v = Math.random() * 255; id.data[i] = v; id.data[i + 1] = v; id.data[i + 2] = v; id.data[i + 3] = 255; }
            const tCan = document.createElement('canvas'); tCan.width = 60; tCan.height = 60; tCan.getContext('2d').putImageData(id, 0, 0);
            pReviewCtx.drawImage(tCan, 0, 0);
        } else if (eff === 'grain') {
            const id = pReviewCtx.createImageData(60, 60);
            for (let i = 0; i < id.data.length; i += 4) { if (Math.random() > 0.5) { const v = Math.random() * 200 + 55; id.data[i] = v; id.data[i + 1] = v; id.data[i + 2] = v; id.data[i + 3] = 255; } }
            const tCan = document.createElement('canvas'); tCan.width = 60; tCan.height = 60; tCan.getContext('2d').putImageData(id, 0, 0);
            pReviewCtx.drawImage(tCan, 0, 0);
        } else if (eff === 'scanlines') {
            pReviewCtx.fillStyle = 'rgba(0,0,0,0.5)'; for (let i = 0; i < 60; i += 2) pReviewCtx.fillRect(0, i, 60, 1);
        } else if (eff === 'halftone') {
            pReviewCtx.fillStyle = 'rgba(0,0,0,0.5)';
            for (let y = 0; y < 60; y += 4) for (let x = 0; x < 60; x += 4) { pReviewCtx.beginPath(); pReviewCtx.arc(x, y, 1, 0, Math.PI * 2); pReviewCtx.fill(); }
        } else if (eff === 'grid') {
            pReviewCtx.strokeStyle = 'rgba(255,255,255,0.3)'; pReviewCtx.beginPath();
            for (let i = 0; i < 60; i += 10) { pReviewCtx.moveTo(i, 0); pReviewCtx.lineTo(i, 60); pReviewCtx.moveTo(0, i); pReviewCtx.lineTo(60, i); }
            pReviewCtx.stroke();
        } else if (eff === 'fabric') {
            // Simple crosshatch for fabric
            pReviewCtx.strokeStyle = 'rgba(255,255,255,0.2)'; pReviewCtx.beginPath();
            for (let i = 0; i < 60; i += 3) { pReviewCtx.moveTo(i, 0); pReviewCtx.lineTo(i + 20, 60); }
            pReviewCtx.stroke();
        } else if (eff === 'vignette') {
            const g = pReviewCtx.createRadialGradient(30, 30, 10, 30, 30, 40); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,1)');
            pReviewCtx.fillStyle = g; pReviewCtx.fillRect(0, 0, 60, 60);
        }

        pReviewCtx.restore();
        const btn = document.querySelector(`button[data-texture="${eff}"]`);
        if (btn) { if (eff === 'none') btn.style.background = 'transparent'; else btn.style.backgroundImage = `url(${pReviewCanvas.toDataURL()})`; }
    });
}

function generateTexturePattern() {
    state.texture.pattern = null; const type = state.texture.type;
    if (type === 'none' || type === 'vignette') return;

    const size = 256;
    const pCanvas = document.createElement('canvas'); pCanvas.width = size; pCanvas.height = size;
    const pCtx = pCanvas.getContext('2d');

    if (['noise', 'grain', 'scanlines'].includes(type)) {
        const imgData = pCtx.createImageData(size, size); const data = imgData.data;
        for (let i = 0; i < data.length; i += 4) {
            if (type === 'noise') { const v = Math.random() * 255; data[i] = v; data[i + 1] = v; data[i + 2] = v; data[i + 3] = 255; }
            else if (type === 'grain') { const v = Math.random() * 200 + 55; data[i] = v; data[i + 1] = v; data[i + 2] = v; data[i + 3] = (Math.random() > 0.5) ? 255 : 0; }
            else if (type === 'scanlines') { if (Math.floor(i / 4 / size) % 2 === 0) { data[i] = 0; data[i + 1] = 0; data[i + 2] = 0; data[i + 3] = 200; } else data[i + 3] = 0; }
        }
        pCtx.putImageData(imgData, 0, 0);
    } else {
        // Geometric Patterns
        pCtx.fillStyle = 'rgba(0,0,0,0)'; pCtx.fillRect(0, 0, size, size);
        pCtx.fillStyle = '#000'; pCtx.strokeStyle = '#000';

        if (type === 'halftone') {
            for (let y = 0; y < size; y += 4) for (let x = 0; x < size; x += 4) { pCtx.beginPath(); pCtx.arc(x, y, 1, 0, Math.PI * 2); pCtx.fill(); }
        } else if (type === 'grid') {
            pCtx.beginPath();
            for (let i = 0; i < size; i += 20) { pCtx.moveTo(i, 0); pCtx.lineTo(i, size); pCtx.moveTo(0, i); pCtx.lineTo(size, i); }
            pCtx.stroke();
        } else if (type === 'fabric') {
            pCtx.beginPath();
            for (let i = 0; i < size; i += 4) { pCtx.moveTo(i, 0); pCtx.lineTo(i + 10, size); }
            pCtx.stroke();
        }
    }

    state.texture.pattern = ctx.createPattern(pCanvas, 'repeat');
}

function setResolution(type) {
    state.resolution.id = type;
    if (type === 'story') { state.resolution.width = 1080; state.resolution.height = 1920; }
    else if (type === 'portrait') { state.resolution.width = 1080; state.resolution.height = 1350; }
    else { state.resolution.width = 1080; state.resolution.height = 1080; }
    ELEMENTS.canvas.width = state.resolution.width; ELEMENTS.canvas.height = state.resolution.height;
    updateCanvasVisualSize(); draw();
}

function updateCanvasVisualSize() {
    const scaleFactor = (ELEMENTS.viewport.clientHeight - 60) / 1920;
    ELEMENTS.canvas.style.width = `${state.resolution.width * scaleFactor}px`;
    ELEMENTS.canvas.style.height = `${state.resolution.height * scaleFactor}px`;
}



let animFrameId;
function startPreviewAnimation() {
    if (animFrameId) cancelAnimationFrame(animFrameId);
    state.animation.startTime = performance.now();
    state.animation.isPlaying = true;

    function loop(now) {
        draw(now);
        animFrameId = requestAnimationFrame(loop);
    }
    animFrameId = requestAnimationFrame(loop);
}

function stopPreviewAnimation() {
    if (animFrameId) cancelAnimationFrame(animFrameId);
    state.animation.isPlaying = false;
    animFrameId = null;
}

function getAnimationProgress(now) {
    if (!state.animation.isPlaying) return 1;
    const elapsed = (now - state.animation.startTime) / 1000;
    const totalDuration = state.animation.duration;

    // Apply speed multiplier to make animation faster/slower
    const adjustedElapsed = elapsed * state.animation.speed;

    // Loop the animation
    const progress = (adjustedElapsed % totalDuration) / totalDuration;
    return progress;
}

function easeOutCubic(x) {
    return 1 - Math.pow(1 - x, 3);
}

function easeInOutSine(x) {
    return -(Math.cos(Math.PI * x) - 1) / 2;
}

// Comprehensive easing functions
function applyEasing(x, easingType) {
    switch (easingType) {
        case 'linear': return x;
        case 'ease-in': return x * x * x;
        case 'ease-out': return 1 - Math.pow(1 - x, 3);
        case 'ease-in-out': return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
        case 'elastic': {
            const c4 = (2 * Math.PI) / 3;
            return x === 0 ? 0 : x === 1 ? 1 : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;
        }
        case 'bounce': {
            const n1 = 7.5625;
            const d1 = 2.75;
            if (x < 1 / d1) return n1 * x * x;
            else if (x < 2 / d1) return n1 * (x -= 1.5 / d1) * x + 0.75;
            else if (x < 2.5 / d1) return n1 * (x -= 2.25 / d1) * x + 0.9375;
            else return n1 * (x -= 2.625 / d1) * x + 0.984375;
        }
        default: return 1 - Math.pow(1 - x, 3); // default to ease-out
    }
}

function calculateAnimationValues(now, elementIndex = 0) {
    let animScale = 1;
    let animY = 0;
    let animOpacity = 1;
    let animRot = 0;

    if (!state.animation.enabled || !state.animation.isPlaying || state.animation.isPaused) {
        return { animScale, animY, animOpacity, animRot };
    }

    // Calculate progress with offset
    const elapsed = (now - state.animation.startTime) / 1000;
    const adjustedElapsed = elapsed * state.animation.speed;
    const offsetSeconds = (state.animation.offset / 1000) * elementIndex;
    const offsetElapsed = Math.max(0, adjustedElapsed - offsetSeconds);

    // Handle loop modes
    let rawProgress = offsetElapsed / state.animation.duration;
    let p;

    if (state.animation.loopMode === 'once') {
        p = Math.min(rawProgress, 1);
    } else if (state.animation.loopMode === 'alternate') {
        const cycle = Math.floor(rawProgress);
        const cycleProgress = rawProgress - cycle;
        p = cycle % 2 === 0 ? cycleProgress : 1 - cycleProgress;
    } else { // loop
        p = rawProgress % 1;
    }

    // Apply easing
    p = applyEasing(p, state.animation.easing);

    const intensity = state.animation.intensity;
    const direction = state.animation.direction;

    // Apply animation based on style
    if (state.animation.style === 'static') {
        // No animation - return defaults
        return { animScale, animY, animOpacity, animRot };
    } else if (state.animation.style === 'gentle') {
        const scaleP = easeInOutSine(p < 0.5 ? p * 2 : (1 - p) * 2);
        animScale = 1 + (scaleP * 0.05 * intensity);
    } else if (state.animation.style === 'pop') {
        const popP = Math.min(p * 3, 1);
        const e = easeOutCubic(popP);
        animScale = 0.8 + (e * 0.2);
        animOpacity = e;
    } else if (state.animation.style === 'slide') {
        const slideP = easeOutCubic(Math.min(p * 1.5, 1));
        const slideAmount = 100 * intensity;
        if (direction === 'up') animY = (1 - slideP) * slideAmount;
        else if (direction === 'down') animY = -(1 - slideP) * slideAmount;
        else if (direction === 'left') animY = 0; // Would need animX
        else if (direction === 'right') animY = 0; // Would need animX
        animOpacity = slideP;
    } else if (state.animation.style === 'pulse') {
        const pulseP = (Math.sin(p * Math.PI * 2 * 2) + 1) / 2;
        animScale = 0.95 + (pulseP * 0.05 * intensity);
    } else if (state.animation.style === 'float') {
        const floatAmount = 20 * intensity;
        if (direction === 'up' || direction === 'down') {
            animY = Math.sin(p * Math.PI * 2) * floatAmount * (direction === 'down' ? -1 : 1);
        }
    } else if (state.animation.style === 'spin') {
        animRot = p * 360 * intensity;
    } else if (state.animation.style === 'glitch') {
        if (Math.random() > 0.85) {
            animY = (Math.random() - 0.5) * 60 * intensity;
            animScale = 1 + (Math.random() - 0.5) * 0.15 * intensity;
        }
    } else if (state.animation.style === 'zoom') {
        const zoomP = easeOutCubic(p);
        const zoomRange = 0.5 * intensity;
        animScale = (1 - zoomRange) + (zoomP * zoomRange);
        animOpacity = zoomP;
    } else if (state.animation.style === 'bounce') {
        const bounceP = p < 0.5 ? p * 2 : 1;
        const bounce = Math.abs(Math.sin(bounceP * Math.PI * 3)) * (1 - bounceP);
        animY = -bounce * 50 * intensity;
    } else if (state.animation.style === 'fade') {
        animOpacity = Math.sin(p * Math.PI);
    } else if (state.animation.style === 'swing') {
        const swingP = Math.sin(p * Math.PI * 2);
        animRot = swingP * 15 * intensity;
    }

    return { animScale, animY, animOpacity, animRot };
}

function draw(now = performance.now()) {
    const w = ELEMENTS.canvas.width; const h = ELEMENTS.canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Animation Factors
    let animScale = 1;
    let animY = 0;
    let animOpacity = 1;
    let animRot = 0; // Degrees

    if (state.animation.enabled && state.animation.isPlaying) {
        const p = getAnimationProgress(now);

        if (state.animation.style === 'gentle') {
            // Slow zoom in/out
            const scaleP = easeInOutSine(p < 0.5 ? p * 2 : (1 - p) * 2);
            animScale = 1 + (scaleP * 0.05); // 0 to 5% zoom
        } else if (state.animation.style === 'pop') {
            // Initial pop in
            const popP = Math.min(p * 3, 1); // Fast start
            const e = easeOutCubic(popP);
            animScale = 0.8 + (e * 0.2);
            animOpacity = e;
        } else if (state.animation.style === 'slide') {
            // Slide Up
            const slideP = easeOutCubic(Math.min(p * 1.5, 1));
            animY = (1 - slideP) * 100; // Slide up 100px
            animOpacity = slideP;
        } else if (state.animation.style === 'pulse') {
            // Rhythmic Pulse
            const pulseP = (Math.sin(p * Math.PI * 2 * 2) + 1) / 2; // 2 beats
            animScale = 0.95 + (pulseP * 0.05);
        } else if (state.animation.style === 'float') {
            // Gentle Y-float
            animY = Math.sin(p * Math.PI * 2) * 20;
        } else if (state.animation.style === 'spin') {
            animRot = p * 360; // Full spin
            if (state.animation.duration > 5) animRot = p * 360 * 2;
        } else if (state.animation.style === 'glitch') {
            // Random Jumps
            if (Math.random() > 0.85) {
                animY = (Math.random() - 0.5) * 60;
                animScale = 1 + (Math.random() - 0.5) * 0.15;
            }
        } else if (state.animation.style === 'zoom') {
            // Dramatic zoom in
            const zoomP = easeOutCubic(p);
            animScale = 0.5 + (zoomP * 0.5); // Scale from 0.5 to 1
            animOpacity = zoomP;
        } else if (state.animation.style === 'bounce') {
            // Elastic bounce
            const bounceP = p < 0.5 ? p * 2 : 1;
            const bounce = Math.abs(Math.sin(bounceP * Math.PI * 3)) * (1 - bounceP);
            animY = -bounce * 50;
        } else if (state.animation.style === 'fade') {
            // Simple fade in/out
            animOpacity = Math.sin(p * Math.PI);
        } else if (state.animation.style === 'swing') {
            // Pendulum swing
            const swingP = Math.sin(p * Math.PI * 2);
            animRot = swingP * 15; // Swing ±15 degrees
        }
    }

    // Draw Background (Static)
    if (state.background.type === 'gradient') {
        const grad = ctx.createLinearGradient(0, 0, w, h);
        const colors = state.background.value.match(/#[a-fA-F0-9]{3,6}/g) || ['#fff', '#000'];
        if (colors.length >= 2) { grad.addColorStop(0, colors[0]); grad.addColorStop(1, colors[colors.length - 1]); }
        ctx.fillStyle = grad;
    } else { ctx.fillStyle = state.background.value; }
    ctx.fillRect(0, 0, w, h);

    // Apply Animation Transform Globally for Content
    ctx.save();

    // Center for scaling
    ctx.translate(w / 2, h / 2);
    ctx.scale(animScale, animScale);
    ctx.rotate(animRot * Math.PI / 180);
    ctx.translate(-w / 2, -h / 2);

    // Apply Y offset
    ctx.translate(0, animY);
    ctx.globalAlpha = animOpacity;




    if (state.images.length > 0) {
        const regions = []; const padding = w * 0.15; const availableW = w - (padding * 2); const availableH = h - (padding * 2);

        if (state.layout === 'single' || state.images.length === 0) {
            regions.push({ x: padding, y: padding, w: availableW, h: availableH });
        }
        else if (state.layout === 'row') {
            const gap = 20; const regionW = (availableW - gap) / 2;
            regions.push({ x: padding, y: padding, w: regionW, h: availableH });
            regions.push({ x: padding + regionW + gap, y: padding, w: regionW, h: availableH });
        }
        else if (state.layout === 'row-3') {
            const gap = 20; const regionW = (availableW - (gap * 2)) / 3;
            regions.push({ x: padding, y: padding, w: regionW, h: availableH });
            regions.push({ x: padding + regionW + gap, y: padding, w: regionW, h: availableH });
            regions.push({ x: padding + (regionW + gap) * 2, y: padding, w: regionW, h: availableH });
        }
        else if (state.layout === 'col') {
            const gap = 20; const regionH = (availableH - gap) / 2;
            regions.push({ x: padding, y: padding, w: availableW, h: regionH });
            regions.push({ x: padding, y: padding + regionH + gap, w: availableW, h: regionH });
        }
        else if (state.layout === 'grid') {
            const gap = 20;
            const regionW = (availableW - gap) / 2;
            const regionH = (availableH - gap) / 2;
            regions.push({ x: padding, y: padding, w: regionW, h: regionH });
            regions.push({ x: padding + regionW + gap, y: padding, w: regionW, h: regionH });
            regions.push({ x: padding, y: padding + regionH + gap, w: regionW, h: regionH });
            regions.push({ x: padding + regionW + gap, y: padding + regionH + gap, w: regionW, h: regionH });
        }

        regions.forEach((rect, i) => {
            if (i >= state.images.length) return;
            const img = state.images[i];

            // Get animation values for this specific image
            const anim = calculateAnimationValues(now, i);

            let fitW, fitH, drawX, drawY;
            const imgAspect = img.width / img.height;
            const rectAspect = rect.w / rect.h;

            if (state.smartCrop) {
                // Cover mode: fill the entire rect, crop overflow
                if (imgAspect > rectAspect) {
                    // Image is wider - fit height, crop width
                    fitH = rect.h;
                    fitW = rect.h * imgAspect;
                } else {
                    // Image is taller - fit width, crop height
                    fitW = rect.w;
                    fitH = rect.w / imgAspect;
                }
                fitW *= state.scale; fitH *= state.scale;
                drawX = rect.x + (rect.w - fitW) / 2;
                drawY = rect.y + (rect.h - fitH) / 2;
            } else {
                // Contain mode: fit inside rect
                if (imgAspect > rectAspect) { fitW = rect.w; fitH = rect.w / imgAspect; } else { fitH = rect.h; fitW = rect.h * imgAspect; }
                fitW *= state.scale; fitH *= state.scale;
                drawX = rect.x + (rect.w - fitW) / 2;
                drawY = rect.y + (rect.h - fitH) / 2;
            }
            const finalX = drawX; const finalY = drawY;

            ctx.save();

            // Apply per-element animation
            const centerX = finalX + fitW / 2;
            const centerY = finalY + fitH / 2;
            ctx.translate(centerX, centerY);
            ctx.scale(anim.animScale, anim.animScale);
            ctx.rotate(anim.animRot * Math.PI / 180);
            ctx.translate(-centerX, -centerY + anim.animY);
            ctx.globalAlpha = anim.animOpacity;

            const sc = state.shadow.color; const r = parseInt(sc.substr(1, 2), 16), g = parseInt(sc.substr(3, 2), 16), b = parseInt(sc.substr(5, 2), 16);
            ctx.shadowColor = `rgba(${r},${g},${b},${state.shadow.opacity})`; ctx.shadowBlur = state.shadow.blur; ctx.shadowOffsetY = state.shadow.offsetY;

            if (state.frameStyle.type === 'browser') {
                drawBrowserFrame(ctx, finalX, finalY, fitW, fitH, img, state.smartCrop ? rect : null);
            } else if (state.frameStyle.type === 'phone') {
                drawPhoneFrame(ctx, finalX, finalY, fitW, fitH, img, state.smartCrop ? rect : null);
            } else {
                if (state.smartCrop) {
                    // Smart crop: clip to region bounds, draw image to fill
                    const clipX = rect.x; const clipY = rect.y; const clipW = rect.w; const clipH = rect.h;
                    ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
                    ctx.save(); roundRect(ctx, clipX, clipY, clipW, clipH, state.radius); ctx.clip(); ctx.drawImage(img, finalX, finalY, fitW, fitH); ctx.restore();
                } else {
                    ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
                    ctx.save(); roundRect(ctx, finalX, finalY, fitW, fitH, state.radius); ctx.clip(); ctx.drawImage(img, finalX, finalY, fitW, fitH); ctx.restore();
                }
            }
            ctx.restore();
        });
    }

    state.textLayers.forEach((layer, index) => {
        // Get animation values for this specific text layer
        const anim = calculateAnimationValues(now, state.images.length + index);

        ctx.save();

        // Apply per-element animation
        ctx.translate(layer.x, layer.y);
        ctx.scale(anim.animScale, anim.animScale);
        ctx.rotate(anim.animRot * Math.PI / 180);
        ctx.translate(-layer.x, -layer.y + anim.animY);
        ctx.globalAlpha = anim.animOpacity;

        ctx.font = `${layer.fontSize}px "${layer.fontFamily}", sans-serif`;
        ctx.fillStyle = layer.color;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(layer.content, layer.x, layer.y);

        if (state.selectedTextId === layer.id) {
            const metrics = ctx.measureText(layer.content); const mw = metrics.width; const mh = layer.fontSize;
            ctx.strokeStyle = '#0C8CE9'; ctx.lineWidth = 2; ctx.setLineDash([5, 5]); ctx.strokeRect(layer.x - mw / 2 - 10, layer.y - mh / 2 - 10, mw + 20, mh + 20);
        }
        ctx.restore();
    });

    // Draw Guides
    if (state.snappedX) {
        ctx.save(); ctx.strokeStyle = '#00ffff'; ctx.lineWidth = 1; ctx.setLineDash([4, 4]);
        ctx.beginPath(); ctx.moveTo(w / 2, 0); ctx.lineTo(w / 2, h); ctx.stroke(); ctx.restore();
    }
    if (state.snappedY) {
        ctx.save(); ctx.strokeStyle = '#00ffff'; ctx.lineWidth = 1; ctx.setLineDash([4, 4]);
        ctx.beginPath(); ctx.moveTo(0, h / 2); ctx.lineTo(w, h / 2); ctx.stroke(); ctx.restore();
    }
    ctx.restore();

    // Draw Texture (Static Overlay)
    if (state.texture.type !== 'none') {
        ctx.save();
        ctx.globalAlpha = state.texture.opacity;
        ctx.globalCompositeOperation = 'overlay';

        if (state.texture.type === 'vignette') {
            const cx = w / 2; const cy = h / 2;
            const grad = ctx.createRadialGradient(cx, cy, w * 0.3, cx, cy, w * 0.9);
            grad.addColorStop(0, 'rgba(0,0,0,0)'); grad.addColorStop(1, 'rgba(0,0,0,1)');
            ctx.fillStyle = grad; ctx.fillRect(0, 0, w, h);
        } else if (state.texture.pattern) {
            ctx.fillStyle = state.texture.pattern;
            ctx.fillRect(0, 0, w, h);
        }
        ctx.restore();
    }
}

function drawBrowserFrame(ctx, x, y, w, h, img, cropRect = null) {
    const isDark = state.frameStyle.theme === 'dark';
    const barHeight = 40;
    const r = 12;

    // Main Container Background (includes Bar)
    ctx.fillStyle = isDark ? '#1F1F1F' : '#F0F0F0';

    // Draw Header + Body Container
    const frameY = y - barHeight;
    const frameH = h + barHeight;

    // 1. Draw Container (Shadow applies here)
    roundRect(ctx, x, frameY, w, frameH, r);
    ctx.fill();

    // 2. Kill Shadow for details
    ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;

    // 3. Draw content area background
    ctx.fillStyle = isDark ? '#000' : '#fff';
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + w, y);
    ctx.lineTo(x + w, y + h - r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.lineTo(x, y);
    ctx.closePath();
    ctx.fill();

    // 4. Draw Header Dots
    const dotY = frameY + barHeight / 2;
    const dotStart = x + 20;
    const dotGap = 20;
    const dotSize = 6;

    ctx.fillStyle = '#FF5F56'; ctx.beginPath(); ctx.arc(dotStart, dotY, dotSize, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#FFBD2E'; ctx.beginPath(); ctx.arc(dotStart + dotGap, dotY, dotSize, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#27C93F'; ctx.beginPath(); ctx.arc(dotStart + dotGap * 2, dotY, dotSize, 0, Math.PI * 2); ctx.fill();

    // 5. Clip and Draw Image
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + w, y);
    ctx.lineTo(x + w, y + h - r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.lineTo(x, y);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(img, x, y, w, h);
    ctx.restore();
}

function drawPhoneFrame(ctx, x, y, w, h, img, cropRect = null) {
    // Phone Bezel
    const bezel = 16;
    const r = 40;

    // Outer Frame (Shadow applies here)
    const frameX = x - bezel;
    const frameY = y - bezel;
    const frameW = w + bezel * 2;
    const frameH = h + bezel * 2;

    ctx.fillStyle = '#111';
    roundRect(ctx, frameX, frameY, frameW, frameH, r);
    ctx.fill();

    // Kill Shadow
    ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;

    // Inner Screen (Clip Image)
    const screenR = r - 4;

    ctx.save();
    roundRect(ctx, x, y, w, h, screenR);
    ctx.clip();
    ctx.drawImage(img, x, y, w, h);
    ctx.restore();

    // Notch / Dynamic Island
    const notchW = w * 0.35;
    const notchH = 30;
    const notchX = x + (w - notchW) / 2;
    const notchY = y + 10;
    const notchR = notchH / 2;

    ctx.fillStyle = '#000';
    roundRect(ctx, notchX, notchY, notchW, notchH, notchR);
    ctx.fill();
}

function roundRect(ctx, x, y, width, height, radius) {
    if (width < 2 * radius) radius = width / 2; if (height < 2 * radius) radius = height / 2;
    ctx.beginPath(); ctx.moveTo(x + radius, y); ctx.arcTo(x + width, y, x + width, y + height, radius); ctx.arcTo(x + width, y + height, x, y + height, radius);
    ctx.arcTo(x, y + height, x, y, radius); ctx.arcTo(x, y, x + width, y, radius); ctx.closePath();
}



function downloadCanvas() {
    if (state.animation.enabled) {
        exportVideo();
    } else {
        const prevSel = state.selectedTextId; state.selectedTextId = null;
        state.snappedX = false; state.snappedY = false;
        draw();
        setTimeout(() => {
            const link = document.createElement('a'); link.download = `frameit-${state.resolution.id}.png`;
            link.href = ELEMENTS.canvas.toDataURL('image/png', 1.0); link.click();
            state.selectedTextId = prevSel; draw();
        }, 50);
    }
}

function exportVideo() {
    const stream = ELEMENTS.canvas.captureStream(state.animation.fps || 30);

    // Try MP4 first, then WebM
    let mimeType = 'video/mp4';
    if (!MediaRecorder.isTypeSupported(mimeType)) {
        console.warn('MP4 not supported, falling back to WebM in MP4 container (or rename)');
        mimeType = 'video/webm';
    }

    // Attempt specific codecs for better compatibility if MP4 is supported
    if (MediaRecorder.isTypeSupported('video/mp4; codecs=avc1.42E01E,mp4a.40.2')) {
        mimeType = 'video/mp4; codecs=avc1.42E01E,mp4a.40.2';
    }

    const recorder = new MediaRecorder(stream, { mimeType });
    const chunks = [];

    recorder.ondataavailable = e => {
        if (e.data.size > 0) chunks.push(e.data);
    };

    recorder.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `frameit-animation.mp4`;
        a.click();

        // Resume preview loop
        startPreviewAnimation();
        ELEMENTS.downloadBtn.classList.remove('active');
        ELEMENTS.downloadBtn.textContent = 'Export';
    };

    // Stop Preview Loop to Control Recording Loop
    stopPreviewAnimation();

    // UI Feedback
    ELEMENTS.downloadBtn.classList.add('active');
    ELEMENTS.downloadBtn.textContent = 'Recording...';

    recorder.start();

    // Recording Loop
    state.animation.isPlaying = true;
    state.animation.startTime = performance.now();
    const durationMs = state.animation.duration * 1000;

    function recordLoop(now) {
        if (!state.animation.isPlaying) return; // safety
        draw(now);

        if (now - state.animation.startTime < durationMs) {
            requestAnimationFrame(recordLoop);
        } else {
            recorder.stop();
        }
    }

    requestAnimationFrame(recordLoop);
}

function setupGradientGrid() {
    ELEMENTS.gradientGrid.innerHTML = '';
    GRADIENTS.forEach(grad => {
        const btn = document.createElement('button'); btn.className = 'grad-btn'; btn.style.background = grad;
        btn.onclick = () => { state.background.type = 'gradient'; state.background.value = grad; draw(); updateEffectPreviews(); };
        ELEMENTS.gradientGrid.appendChild(btn);
    });
}



init();
