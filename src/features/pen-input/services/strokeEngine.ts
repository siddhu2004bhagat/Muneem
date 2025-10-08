// Wrapper around CanvasService for feature-scoped stroke logic (stub for now)
import { CanvasService } from '@/services/canvas.service';
export const StrokeEngine = {
  smooth: CanvasService.smoothStroke,
  velocityBetween: CanvasService.velocityBetween,
  widthFromVelocity: CanvasService.widthFromVelocity,
};

export default StrokeEngine;


