const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const sizes = [16, 48, 128];
const iconsDir = path.join(__dirname, '..', 'icons');

// Ensure icons directory exists
if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
}

function drawIcon(size) {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    
    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(1, '#764ba2');
    
    // Draw rounded rectangle
    const radius = size * 0.15;
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
    
    // Draw game controller shape
    ctx.fillStyle = 'white';
    const scale = size / 128;
    
    // Controller body
    const bodyWidth = 70 * scale;
    const bodyHeight = 35 * scale;
    const bodyX = (size - bodyWidth) / 2;
    const bodyY = (size - bodyHeight) / 2 + 5 * scale;
    const bodyRadius = 10 * scale;
    
    ctx.beginPath();
    ctx.moveTo(bodyX + bodyRadius, bodyY);
    ctx.lineTo(bodyX + bodyWidth - bodyRadius, bodyY);
    ctx.quadraticCurveTo(bodyX + bodyWidth, bodyY, bodyX + bodyWidth, bodyY + bodyRadius);
    ctx.lineTo(bodyX + bodyWidth, bodyY + bodyHeight - bodyRadius);
    ctx.quadraticCurveTo(bodyX + bodyWidth, bodyY + bodyHeight, bodyX + bodyWidth - bodyRadius, bodyY + bodyHeight);
    ctx.lineTo(bodyX + bodyRadius, bodyY + bodyHeight);
    ctx.quadraticCurveTo(bodyX, bodyY + bodyHeight, bodyX, bodyY + bodyHeight - bodyRadius);
    ctx.lineTo(bodyX, bodyY + bodyRadius);
    ctx.quadraticCurveTo(bodyX, bodyY, bodyX + bodyRadius, bodyY);
    ctx.fill();
    
    // Left grip
    ctx.beginPath();
    ctx.ellipse(bodyX + 12 * scale, bodyY + bodyHeight, 10 * scale, 15 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Right grip
    ctx.beginPath();
    ctx.ellipse(bodyX + bodyWidth - 12 * scale, bodyY + bodyHeight, 10 * scale, 15 * scale, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // D-pad (left side) - only draw if icon is large enough
    if (size >= 48) {
        ctx.fillStyle = '#667eea';
        const dpadX = bodyX + 18 * scale;
        const dpadY = bodyY + bodyHeight / 2;
        const dpadSize = 4 * scale;
        ctx.fillRect(dpadX - dpadSize * 1.5, dpadY - dpadSize / 2, dpadSize * 3, dpadSize);
        ctx.fillRect(dpadX - dpadSize / 2, dpadY - dpadSize * 1.5, dpadSize, dpadSize * 3);
        
        // Buttons (right side)
        const btnX = bodyX + bodyWidth - 20 * scale;
        const btnY = bodyY + bodyHeight / 2;
        const btnRadius = 3 * scale;
        
        ctx.beginPath();
        ctx.arc(btnX - 5 * scale, btnY, btnRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(btnX + 5 * scale, btnY, btnRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(btnX, btnY - 5 * scale, btnRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(btnX, btnY + 5 * scale, btnRadius, 0, Math.PI * 2);
        ctx.fill();
    }
    
    return canvas;
}

// Generate icons
console.log('🎮 Generating icons for Hypixel Creator Manager...\n');

sizes.forEach(size => {
    const canvas = drawIcon(size);
    const buffer = canvas.toBuffer('image/png');
    const filepath = path.join(iconsDir, `icon${size}.png`);
    fs.writeFileSync(filepath, buffer);
    console.log(`✅ Created icon${size}.png (${size}x${size})`);
});

console.log('\n🎉 All icons generated successfully!');
console.log(`📁 Icons saved to: ${iconsDir}`);
