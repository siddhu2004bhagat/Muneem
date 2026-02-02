/**
 * Geometry Service for Vector Operations
 * Used for "Object Eraser" hit testing
 */

import type { Stroke, StrokePoint } from '../types/pen.types';

export const GeometryService = {
    /**
     * Check if point is near a stroke (Hit Test)
     */
    isPointNearStroke(
        point: { x: number; y: number },
        stroke: Stroke,
        threshold: number = 10
    ): boolean {
        // 1. Fast Bounding Box Check
        if (!this.isPointInBoundingBox(point, stroke, threshold)) {
            return false;
        }

        // 2. Precise Segment Check
        for (let i = 0; i < stroke.points.length - 1; i++) {
            const p1 = stroke.points[i];
            const p2 = stroke.points[i + 1];
            const dist = this.distanceToSegment(point, p1, p2);

            // Hit if distance is less than eraser radius + stroke width
            const hitRadius = threshold + (stroke.width / 2);
            if (dist < hitRadius) {
                return true;
            }
        }
        return false;
    },

    /**
     * Calculate distance from point P to line segment AB
     */
    distanceToSegment(
        p: { x: number; y: number },
        v: { x: number; y: number },
        w: { x: number; y: number }
    ): number {
        const l2 = this.dist2(v, w);
        if (l2 === 0) return this.dist2(p, v); // v == w case

        let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
        t = Math.max(0, Math.min(1, t)); // Clamp t to segment [0,1]

        const projection = {
            x: v.x + t * (w.x - v.x),
            y: v.y + t * (w.y - v.y)
        };

        return Math.sqrt(this.dist2(p, projection));
    },

    /**
     * Square distance between two points
     */
    dist2(v: { x: number; y: number }, w: { x: number; y: number }): number {
        return (v.x - w.x) ** 2 + (v.y - w.y) ** 2;
    },

    /**
     * Fast Bounding Box Check
     */
    isPointInBoundingBox(
        p: { x: number; y: number },
        stroke: Stroke,
        padding: number
    ): boolean {
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

        // TODO: Ideally cache this on the stroke object
        for (const pt of stroke.points) {
            if (pt.x < minX) minX = pt.x;
            if (pt.x > maxX) maxX = pt.x;
            if (pt.y < minY) minY = pt.y;
            if (pt.y > maxY) maxY = pt.y;
        }

        return (
            p.x >= minX - padding &&
            p.x <= maxX + padding &&
            p.y >= minY - padding &&
            p.y <= maxY + padding
        );
    }
};
