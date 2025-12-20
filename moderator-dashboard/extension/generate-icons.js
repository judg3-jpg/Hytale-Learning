/**
 * Generate icons for Moderator Dashboard Extension
 * 
 * This script generates icon16.png, icon48.png, and icon128.png
 * 
 * Requirements: npm install canvas
 * Run: node generate-icons.js
 */

const fs = require('fs');
const path = require('path');

// Check if canvas is available
let createCanvas;
try {
    const canvas = require('canvas');
    createCanvas = canvas.createCanvas;
} catch (error) {
    console.error('❌ Error: canvas package not found.');
    console.log('\n📦 Please install canvas first:');
    console.log('   npm install canvas');
    console.log('\n💡 Alternative: Open generate-icons.html in your browser to generate icons visually.');
    process.exit(1);
}

const sizes = [16, 48, 128];
const iconsDir = path.join(__dirname, 'icons');

// Ensure icons directory exists
if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
}

function drawIcon(size) {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    
    // Create gradient background (blue theme for dashboard)
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, '#3b82f6');
    gradient.addColorStop(1, '#2563eb');
    
    // Draw rounded rectangle background
    const radius = size * 0.2;
    ctx.beginPath();
    ctx.moveTo(radius, 0);
    ctx.lineTo(size - radius, 0);
    ctx.quadraticCurveTo(size, 0, size, radius);
    ctx.lineTo(size, size - radius);
    ctx.quadraticCurveTo(size, size, size - radius, size);
    ctx.lineTo(radius, size);
    ctx.quadraticCurveTo(0, size, 0, size - radius);
    ctx.lineTo(0, radius);
    ctx.quadraticCurveTo(0, 0, radius, 0);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Draw chart/dashboard icon
    ctx.fillStyle = 'white';
    const scale = size / 128;
    const padding = 12 * scale;
    const chartWidth = size - (padding * 2);
    const chartHeight = size - (padding * 2);
    const chartX = padding;
    const chartY = padding;
    
    // Draw chart bars (bar chart representation)
    const barCount = size >= 48 ? 4 : 3;
    const barWidth = (chartWidth - (barCount - 1) * 4 * scale) / barCount;
    const maxBarHeight = chartHeight * 0.8;
    
    const barHeights = size >= 48 ? [0.6, 0.9, 0.4, 0.7] : [0.7, 0.9, 0.5];
    
    for (let i = 0; i < barCount; i++) {
        const barX = chartX + i * (barWidth + 4 * scale);
        const barHeight = maxBarHeight * barHeights[i];
        const barY = chartY + chartHeight - barHeight;
        
        // Draw bar with slight gradient
        const barGradient = ctx.createLinearGradient(barX, barY, barX, barY + barHeight);
        barGradient.addColorStop(0, '#ffffff');
        barGradient.addColorStop(1, '#e0e7ff');
        ctx.fillStyle = barGradient;
        ctx.fillRect(barX, barY, barWidth, barHeight);
        
        // Add subtle border
        ctx.strokeStyle = 'rgba(59, 130, 246, 0.3)';
        ctx.lineWidth = Math.max(0.5 * scale, 0.5);
        ctx.strokeRect(barX, barY, barWidth, barHeight);
    }
    
    // Draw chart base line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = Math.max(1 * scale, 1);
    ctx.beginPath();
    ctx.moveTo(chartX, chartY + chartHeight);
    ctx.lineTo(chartX + chartWidth, chartY + chartHeight);
    ctx.stroke();
    
    // Add small chart grid lines (if size allows)
    if (size >= 48) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = Math.max(0.5 * scale, 0.5);
        for (let i = 1; i < 3; i++) {
            const y = chartY + (chartHeight / 3) * i;
            ctx.beginPath();
            ctx.moveTo(chartX, y);
            ctx.lineTo(chartX + chartWidth, y);
            ctx.stroke();
        }
    }
    
    return canvas;
}

// Generate icons
console.log('📊 Generating icons for Moderator Dashboard Extension...\n');

sizes.forEach(size => {
    const canvas = drawIcon(size);
    const buffer = canvas.toBuffer('image/png');
    const filepath = path.join(iconsDir, `icon${size}.png`);
    fs.writeFileSync(filepath, buffer);
    console.log(`✅ Created icon${size}.png (${size}x${size})`);
});

console.log('\n🎉 All icons generated successfully!');
console.log(`📁 Icons saved to: ${iconsDir}`);
console.log('\n💡 Next steps:');
console.log('   1. Reload the extension in chrome://extensions/ or edge://extensions/');
console.log('   2. The icons should now appear in the extension!');

