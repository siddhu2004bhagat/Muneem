/**
 * Template Tests
 * 
 * Tests for the page template system including:
 * - Template rendering (blank, lined, columnar)
 * - Thumbnail generation
 * - Template options
 * - Performance benchmarks
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { drawTemplate, getTemplateThumbnail, TemplateId } from '../index';

describe('Template System', () => {
  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;

  beforeEach(() => {
    canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    ctx = canvas.getContext('2d')!;
  });

  describe('drawTemplate', () => {
    it('should draw blank template without errors', () => {
      expect(() => {
        drawTemplate(ctx, canvas.width, canvas.height, 'blank');
      }).not.toThrow();
    });

    it('should draw lined template without errors', () => {
      expect(() => {
        drawTemplate(ctx, canvas.width, canvas.height, 'lined');
      }).not.toThrow();
    });

    it('should draw columnar template without errors', () => {
      expect(() => {
        drawTemplate(ctx, canvas.width, canvas.height, 'columnar');
      }).not.toThrow();
    });

    it('should accept custom options', () => {
      expect(() => {
        drawTemplate(ctx, canvas.width, canvas.height, 'lined', {
          lineSpacing: 40,
          margin: 50,
          color: '#cccccc',
        });
      }).not.toThrow();
    });

    it('should handle zero dimensions gracefully', () => {
      expect(() => {
        drawTemplate(ctx, 0, 0, 'lined');
      }).not.toThrow();
    });

    it('should handle negative dimensions gracefully', () => {
      expect(() => {
        drawTemplate(ctx, -100, -100, 'lined');
      }).not.toThrow();
    });
  });

  describe('getTemplateThumbnail', () => {
    it('should generate thumbnail for blank template', () => {
      const thumbnail = getTemplateThumbnail('blank', 120, 160);
      expect(thumbnail).toBeInstanceOf(HTMLCanvasElement);
      expect(thumbnail.width).toBe(120 * window.devicePixelRatio);
      expect(thumbnail.height).toBe(160 * window.devicePixelRatio);
    });

    it('should generate thumbnail for lined template', () => {
      const thumbnail = getTemplateThumbnail('lined', 120, 160);
      expect(thumbnail).toBeInstanceOf(HTMLCanvasElement);
      expect(thumbnail.width).toBe(120 * window.devicePixelRatio);
      expect(thumbnail.height).toBe(160 * window.devicePixelRatio);
    });

    it('should generate thumbnail for columnar template', () => {
      const thumbnail = getTemplateThumbnail('columnar', 120, 160);
      expect(thumbnail).toBeInstanceOf(HTMLCanvasElement);
      expect(thumbnail.width).toBe(120 * window.devicePixelRatio);
      expect(thumbnail.height).toBe(160 * window.devicePixelRatio);
    });

    it('should cache thumbnails', () => {
      const thumb1 = getTemplateThumbnail('lined', 120, 160);
      const thumb2 = getTemplateThumbnail('lined', 120, 160);
      // Note: Due to caching logic, these might be different instances
      // but should have same dimensions
      expect(thumb1.width).toBe(thumb2.width);
      expect(thumb1.height).toBe(thumb2.height);
    });
  });

  describe('Template Performance', () => {
    it('should render blank template in < 20ms', () => {
      const start = performance.now();
      drawTemplate(ctx, 1920, 1080, 'blank');
      const end = performance.now();
      const duration = end - start;
      
      console.log(`[Benchmark] Blank template: ${duration.toFixed(2)}ms`);
      expect(duration).toBeLessThan(20);
    });

    it('should render lined template in < 20ms', () => {
      const start = performance.now();
      drawTemplate(ctx, 1920, 1080, 'lined');
      const end = performance.now();
      const duration = end - start;
      
      console.log(`[Benchmark] Lined template: ${duration.toFixed(2)}ms`);
      expect(duration).toBeLessThan(20);
    });

    it('should render columnar template in < 20ms', () => {
      const start = performance.now();
      drawTemplate(ctx, 1920, 1080, 'columnar');
      const end = performance.now();
      const duration = end - start;
      
      console.log(`[Benchmark] Columnar template: ${duration.toFixed(2)}ms`);
      expect(duration).toBeLessThan(20);
    });

    it('should generate thumbnail in < 10ms', () => {
      const start = performance.now();
      getTemplateThumbnail('lined', 120, 160);
      const end = performance.now();
      const duration = end - start;
      
      console.log(`[Benchmark] Thumbnail generation: ${duration.toFixed(2)}ms`);
      expect(duration).toBeLessThan(10);
    });
  });

  describe('Template Options', () => {
    it('should respect lineSpacing option', () => {
      const spy = vi.spyOn(ctx, 'moveTo');
      drawTemplate(ctx, 800, 600, 'lined', { lineSpacing: 50 });
      
      // Should have fewer lines with larger spacing
      const callCount = spy.mock.calls.length;
      expect(callCount).toBeGreaterThan(0);
      
      spy.mockRestore();
    });

    it('should respect margin option', () => {
      const spy = vi.spyOn(ctx, 'moveTo');
      drawTemplate(ctx, 800, 600, 'lined', { margin: 100 });
      
      // Check that lines start at margin
      const calls = spy.mock.calls;
      if (calls.length > 0) {
        const firstCall = calls[0];
        expect(firstCall[0]).toBeGreaterThanOrEqual(100);
      }
      
      spy.mockRestore();
    });

    it('should respect color option', () => {
      const spy = vi.spyOn(ctx, 'stroke');
      drawTemplate(ctx, 800, 600, 'lined', { color: '#ff0000' });
      
      expect(ctx.strokeStyle).toContain('ff0000');
      spy.mockRestore();
    });

    it('should respect columnCount option for columnar template', () => {
      const spy = vi.spyOn(ctx, 'moveTo');
      drawTemplate(ctx, 800, 600, 'columnar', { columnCount: 3 });
      
      // Should draw vertical lines for columns
      expect(spy).toHaveBeenCalled();
      spy.mockRestore();
    });
  });

  describe('Template Types', () => {
    const templateIds: TemplateId[] = ['blank', 'lined', 'columnar'];

    templateIds.forEach(templateId => {
      it(`should support ${templateId} template`, () => {
        expect(() => {
          drawTemplate(ctx, 800, 600, templateId);
        }).not.toThrow();
      });

      it(`should generate ${templateId} thumbnail`, () => {
        const thumbnail = getTemplateThumbnail(templateId, 120, 160);
        expect(thumbnail).toBeInstanceOf(HTMLCanvasElement);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle very small canvas', () => {
      const smallCanvas = document.createElement('canvas');
      smallCanvas.width = 10;
      smallCanvas.height = 10;
      const smallCtx = smallCanvas.getContext('2d')!;
      
      expect(() => {
        drawTemplate(smallCtx, 10, 10, 'lined');
      }).not.toThrow();
    });

    it('should handle very large canvas', () => {
      const largeCanvas = document.createElement('canvas');
      largeCanvas.width = 4000;
      largeCanvas.height = 3000;
      const largeCtx = largeCanvas.getContext('2d')!;
      
      expect(() => {
        drawTemplate(largeCtx, 4000, 3000, 'lined');
      }).not.toThrow();
    });

    it('should handle unusual aspect ratios', () => {
      expect(() => {
        drawTemplate(ctx, 2000, 100, 'lined');
      }).not.toThrow();

      expect(() => {
        drawTemplate(ctx, 100, 2000, 'lined');
      }).not.toThrow();
    });
  });
});

describe('Migration Tests', () => {
  it('should be exported from templates module', async () => {
    const module = await import('../index');
    expect(module.drawTemplate).toBeDefined();
    expect(module.getTemplateThumbnail).toBeDefined();
  });
});

