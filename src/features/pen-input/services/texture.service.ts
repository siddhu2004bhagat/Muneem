
export const createPencilPattern = (ctx: CanvasRenderingContext2D, color: string, opacity: number) => {
    const size = 32; // Smaller pattern for better tiling
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const c = canvas.getContext('2d');
    if (!c) return null;

    // 1. Fill with base color (semi-transparent)
    c.fillStyle = color;
    c.globalAlpha = opacity * 0.6; // Base layer
    c.fillRect(0, 0, size, size);

    // 2. Add graphite grain texture using small random dots
    c.globalAlpha = 1;
    const dotCount = 150; // Number of grain dots

    for (let i = 0; i < dotCount; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const dotSize = Math.random() * 1.5 + 0.5; // 0.5-2px dots
        const dotOpacity = Math.random() * 0.4 + 0.3; // 0.3-0.7 opacity

        c.fillStyle = color;
        c.globalAlpha = dotOpacity;
        c.fillRect(x, y, dotSize, dotSize);
    }

    // 3. Add some larger grain clusters for realism
    const clusterCount = 20;
    for (let i = 0; i < clusterCount; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const clusterSize = Math.random() * 2 + 1; // 1-3px clusters

        c.fillStyle = color;
        c.globalAlpha = Math.random() * 0.3 + 0.2;
        c.beginPath();
        c.arc(x, y, clusterSize, 0, Math.PI * 2);
        c.fill();
    }

    return ctx.createPattern(canvas, 'repeat');
};
