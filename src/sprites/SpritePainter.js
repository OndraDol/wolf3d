export class SpritePainter {
    clear(ctx, width, height) {
        ctx.clearRect(0, 0, width, height);
    }

    drawShadowEllipse(ctx, centerX, centerY, radiusX, radiusY, alpha = 0.24) {
        ctx.save();
        ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
        ctx.beginPath();
        ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }

    drawLimb(ctx, x, y, width, height, color) {
        ctx.fillStyle = color;
        ctx.fillRect(x, y, width, height);
    }

    drawMuzzleFlash(ctx, x, y, radius = 6, innerColor = '#fff6c4', outerColor = '#f0c048') {
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, innerColor);
        gradient.addColorStop(1, outerColor);
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
    }

    drawArmorPlate(ctx, x, y, width, height, baseColor, highlightColor = '#d8dee4') {
        ctx.fillStyle = baseColor;
        ctx.fillRect(x, y, width, height);
        ctx.fillStyle = highlightColor;
        ctx.fillRect(x + 1, y + 1, Math.max(0, width - 2), 1);
        ctx.fillStyle = 'rgba(0,0,0,0.22)';
        ctx.fillRect(x + 1, y + height - 2, Math.max(0, width - 2), 1);
    }

    mirrorFrame(ctx, width, height, paintSource) {
        ctx.save();
        ctx.translate(width, 0);
        ctx.scale(-1, 1);
        paintSource();
        ctx.restore();
    }

    exportToUint32Array(ctx, width, height) {
        const imageData = ctx.getImageData(0, 0, width, height);
        return new Uint32Array(imageData.data.buffer.slice(0));
    }
}

