// Debug script for dropdown issues
// Paste this in the browser console (F12)

console.log('=== DROPDOWN DEBUG SCRIPT ===');

// 1. Check if menu items exist
const menuItems = document.querySelectorAll('.menu-item');
console.log('✓ Found', menuItems.length, 'menu items');

menuItems.forEach((item, index) => {
    const dropdown = item.querySelector('.menu-dropdown');
    console.log(`  ${index + 1}. ${item.id}:`, dropdown ? 'HAS dropdown' : 'NO dropdown');
});

// 2. Check specific dropdown menu items
const layoutMenu = document.getElementById('menu-layout');
const resolutionMenu = document.getElementById('menu-resolution');
const templatesMenu = document.getElementById('menu-templates');
const actionsMenu = document.getElementById('menu-actions');

console.log('\n✓ Dropdown menu items:');
console.log('  Layout:', layoutMenu ? 'EXISTS' : 'MISSING');
console.log('  Resolution:', resolutionMenu ? 'EXISTS' : 'MISSING');
console.log('  Templates:', templatesMenu ? 'EXISTS' : 'MISSING');
console.log('  Actions:', actionsMenu ? 'EXISTS' : 'MISSING');

// 3. Test manual activation
console.log('\n=== MANUAL ACTIVATION TEST ===');
if (layoutMenu) {
    console.log('Adding "active" class to Layout menu...');
    layoutMenu.classList.add('active');

    setTimeout(() => {
        const dropdown = layoutMenu.querySelector('.menu-dropdown');
        if (dropdown) {
            const styles = window.getComputedStyle(dropdown);
            console.log('Dropdown display:', styles.display);
            console.log('Dropdown visibility:', styles.visibility);
            console.log('Dropdown position:', styles.position);
            console.log('Dropdown z-index:', styles.zIndex);
        }

        // Remove active class
        layoutMenu.classList.remove('active');
    }, 1000);
}

// 4. Check if UI object exists and has addMenuListeners
console.log('\n✓ UI object:', typeof window.UI);
console.log('✓ UI.addMenuListeners:', typeof window.UI?.addMenuListeners);

// 5. Test click listener
console.log('\n=== CLICK LISTENER TEST ===');
if (layoutMenu) {
    const testClick = () => {
        console.log('TEST CLICK DETECTED!');
        layoutMenu.classList.toggle('active');
    };

    // Add test listener
    layoutMenu.addEventListener('click', testClick, { once: true });
    console.log('Test listener added. Please click the Layout menu.');
}
