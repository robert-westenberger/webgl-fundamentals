export function getCircleVertices() {
    const centerX = 0;
    const centerY = 0;
    const radius = 0.5;
    const segments = 60;

    const vertices = [];
    for (let i = 0; i <= segments; i++) {
        const angle = (i / segments) * 2 * Math.PI;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        vertices.push(x, y);
    }

    return vertices;

}