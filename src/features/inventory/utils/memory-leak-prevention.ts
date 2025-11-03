/**
 * Memory Leak Prevention Utilities
 * Provides tools to prevent memory leaks in React components
 */
import { useState, useRef, useEffect, useCallback } from 'react';
export class MemoryLeakPrevention {
  private static activeComponents = new Set<string>();
  private static abortControllers = new Map<string, AbortController>();

  /**
   * Track component mount/unmount for memory leak detection
   */
  static trackComponent(componentName: string): void {
    this.activeComponents.add(componentName);
    console.log(`📊 Component ${componentName} mounted. Active: ${this.activeComponents.size}`);
  }

  static untrackComponent(componentName: string): void {
    this.activeComponents.delete(componentName);
    console.log(`📊 Component ${componentName} unmounted. Active: ${this.activeComponents.size}`);
  }

  /**
   * Create AbortController for request cancellation
   */
  static createAbortController(componentName: string): AbortController {
    // Clean up existing controller if any
    const existing = this.abortControllers.get(componentName);
    if (existing) {
      existing.abort();
    }

    const controller = new AbortController();
    this.abortControllers.set(componentName, controller);
    return controller;
  }

  /**
   * Clean up AbortController
   */
  static cleanupAbortController(componentName: string): void {
    const controller = this.abortControllers.get(componentName);
    if (controller) {
      controller.abort();
      this.abortControllers.delete(componentName);
    }
  }

  /**
   * Get active components count
   */
  static getActiveComponentsCount(): number {
    return this.activeComponents.size;
  }

  /**
   * Get list of active components
   */
  static getActiveComponents(): string[] {
    return Array.from(this.activeComponents);
  }

  /**
   * Check if component is still mounted
   */
  static isComponentActive(componentName: string): boolean {
    return this.activeComponents.has(componentName);
  }

  /**
   * Safe state update - only if component is still mounted
   */
  static safeStateUpdate<T>(
    componentName: string,
    setState: (value: T) => void,
    value: T
  ): void {
    if (this.isComponentActive(componentName)) {
      setState(value);
    } else {
      console.warn(`⚠️ Attempted state update on unmounted component: ${componentName}`);
    }
  }
}

/**
 * Custom hook for memory leak prevention
 */
export function useMemoryLeakPrevention(componentName: string) {
  const [isMounted, setIsMounted] = useState(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // Track component mount
    MemoryLeakPrevention.trackComponent(componentName);
    
    // Create abort controller
    abortControllerRef.current = MemoryLeakPrevention.createAbortController(componentName);

    return () => {
      // Cleanup on unmount
      setIsMounted(false);
      MemoryLeakPrevention.untrackComponent(componentName);
      MemoryLeakPrevention.cleanupAbortController(componentName);
    };
  }, [componentName]);

  const safeSetState = useCallback(<T>(setState: (value: T) => void, value: T) => {
    if (isMounted) {
      setState(value);
    }
  }, [isMounted]);

  const getAbortSignal = useCallback(() => {
    return abortControllerRef.current?.signal;
  }, []);

  return {
    isMounted,
    safeSetState,
    getAbortSignal
  };
}
