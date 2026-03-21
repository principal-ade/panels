/**
 * Panel Bounds Hook and Context
 *
 * Provides panels with their viewport-relative bounds, enabling use cases like:
 * - Canvas rendering that spans the full viewport but is clipped by the panel
 * - Positioning elements relative to the viewport origin
 * - Calculating offsets for fixed-size content within variable-size panels
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  ReactNode,
} from 'react';
import type {
  PanelBounds,
  PanelSlotPosition,
  PanelBoundsContextValue,
} from '../types';

// Default bounds when not in a panel context
const DEFAULT_BOUNDS: PanelBounds = {
  x: 0,
  y: 0,
  width: 0,
  height: 0,
};

/**
 * Context for panel bounds
 */
const PanelBoundsContext = createContext<PanelBoundsContextValue | null>(null);

/**
 * Props for the PanelBoundsProvider component
 */
export interface PanelBoundsProviderProps {
  /** The slot position this provider is for */
  slot: PanelSlotPosition;
  /** Child components that will have access to panel bounds */
  children: ReactNode;
}

/**
 * Provider component that tracks and provides panel bounds to children
 *
 * This component wraps each panel slot's content in ConfigurablePanelLayout.
 * It uses ResizeObserver and scroll/resize listeners to keep bounds up to date.
 */
export const PanelBoundsProvider: React.FC<PanelBoundsProviderProps> = ({
  slot,
  children,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [bounds, setBounds] = useState<PanelBounds>(DEFAULT_BOUNDS);

  const updateBounds = useCallback(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setBounds({
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height,
      });
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Initial measurement
    updateBounds();

    // Set up ResizeObserver for size changes
    const resizeObserver = new ResizeObserver(() => {
      updateBounds();
    });
    resizeObserver.observe(container);

    // Listen for scroll and resize events (for position changes)
    window.addEventListener('resize', updateBounds);
    window.addEventListener('scroll', updateBounds, true);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateBounds);
      window.removeEventListener('scroll', updateBounds, true);
    };
  }, [updateBounds]);

  const contextValue: PanelBoundsContextValue = {
    slot,
    bounds,
  };

  return (
    <PanelBoundsContext.Provider value={contextValue}>
      <div
        ref={containerRef}
        className="panel-bounds-container"
        style={{
          width: '100%',
          height: '100%',
          minWidth: 0,
        }}
      >
        {children}
      </div>
    </PanelBoundsContext.Provider>
  );
};

/**
 * Return type for usePanelBounds hook
 */
export interface UsePanelBoundsReturn {
  /** The current slot this panel is in (null if not in a panel) */
  slot: PanelSlotPosition | null;
  /** The bounds of this panel relative to the viewport */
  bounds: PanelBounds;
  /** Whether this hook is being used within a PanelBoundsProvider */
  isInPanel: boolean;
}

/**
 * Hook to access the current panel's viewport-relative bounds
 *
 * @example
 * ```tsx
 * const MyCanvasPanel: React.FC = () => {
 *   const { bounds, isInPanel } = usePanelBounds();
 *
 *   // Use bounds.x and bounds.y to offset a viewport-sized canvas
 *   const canvasStyle = {
 *     position: 'absolute' as const,
 *     top: 0,
 *     left: 0,
 *     width: '100dvw',
 *     height: '100dvh',
 *     transform: `translate(${-bounds.x}px, ${-bounds.y}px)`,
 *   };
 *
 *   return <canvas style={canvasStyle} />;
 * };
 * ```
 */
export function usePanelBounds(): UsePanelBoundsReturn {
  const context = useContext(PanelBoundsContext);

  if (!context) {
    return {
      slot: null,
      bounds: DEFAULT_BOUNDS,
      isInPanel: false,
    };
  }

  return {
    slot: context.slot,
    bounds: context.bounds,
    isInPanel: true,
  };
}

/**
 * Hook to get just the panel offset (x, y) for convenience
 *
 * @example
 * ```tsx
 * const { offsetX, offsetY } = usePanelOffset();
 * // Use to position a viewport-sized element at the viewport origin
 * const style = { transform: `translate(${-offsetX}px, ${-offsetY}px)` };
 * ```
 */
export function usePanelOffset(): { offsetX: number; offsetY: number } {
  const { bounds } = usePanelBounds();
  return {
    offsetX: bounds.x,
    offsetY: bounds.y,
  };
}
