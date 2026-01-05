import React, { ReactNode, useRef, useImperativeHandle, forwardRef, useEffect } from 'react';
import { Theme } from '@principal-ade/industry-theme';
import { mapThemeToPanelVars } from '../utils/themeMapping';
import './SnapCarousel.css';

export interface SnapCarouselRef {
  /** Scroll to a specific panel by index */
  scrollToPanel: (index: number) => void;
  /** Get the current panel index */
  getCurrentPanel: () => number;
}

export interface SnapCarouselProps {
  /** Array of panel content to display in the carousel */
  panels: ReactNode[];

  /** CSS class for the carousel container */
  className?: string;

  /** Additional styles to apply to the container */
  style?: React.CSSProperties;

  /** Theme object for customizing colors */
  theme: Theme;

  /** Minimum width for each panel (default: 350px). For 2-panel layouts, the threshold for switching to 50% width is 2x this value. */
  minPanelWidth?: number;

  /** Ideal width for each panel as a fraction of container width (default: 0.333 for 1/3 of container) */
  idealPanelWidth?: number;

  /** Whether to show a 1px separator between panels (default: false) */
  showSeparator?: boolean;

  /** Callback when a panel comes into view */
  onPanelChange?: (index: number) => void;

  /** Prevent keyboard keys (space, arrows, page up/down) from scrolling the carousel. Useful when panels contain interactive input components like terminals or text editors. (default: true) */
  preventKeyboardScroll?: boolean;

  /** Disable touch/swipe scrolling, only allow programmatic navigation via ref (default: false) */
  disableSwipe?: boolean;
}

/**
 * SnapCarousel - A horizontally scrolling carousel with snap points
 *
 * Responsive behavior:
 * - 1 panel: 100% width of container
 * - 2 panels: 100% width by default, switches to 50% when container width > 2x minPanelWidth (default: 700px)
 * - 3+ panels: Uses max(minPanelWidth, idealPanelWidth%) of container width
 */
export const SnapCarousel = forwardRef<SnapCarouselRef, SnapCarouselProps>(({
  panels,
  className = '',
  style,
  theme,
  minPanelWidth = 350,
  idealPanelWidth = 0.333, // 1/3 of container
  showSeparator = false,
  onPanelChange,
  preventKeyboardScroll = true,
  disableSwipe = false,
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isProgrammaticScrollRef = useRef(false);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Apply theme as CSS variables
  const themeStyles = mapThemeToPanelVars(theme) as React.CSSProperties;

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    scrollToPanel: (index: number) => {
      if (!containerRef.current) return;

      const container = containerRef.current;
      const targetPanel = container.children[index] as HTMLElement;

      if (targetPanel) {
        // Mark as programmatic scroll to prevent onPanelChange during animation
        isProgrammaticScrollRef.current = true;

        // Clear any existing timeout
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }

        // Calculate the scroll position directly instead of using scrollIntoView
        // This prevents scrolling ancestor containers
        const scrollLeft = targetPanel.offsetLeft;
        container.scrollTo({
          left: scrollLeft,
          behavior: 'smooth',
        });

        // Reset flag after smooth scroll animation completes (~300-500ms)
        scrollTimeoutRef.current = setTimeout(() => {
          isProgrammaticScrollRef.current = false;
        }, 500);
      }
    },
    getCurrentPanel: () => {
      if (!containerRef.current || containerRef.current.children.length === 0) return 0;

      const container = containerRef.current;
      const containerRect = container.getBoundingClientRect();

      // The snap point is the left edge of the container
      const snapPointX = containerRect.left;

      // Find which panel's left edge is closest to the snap point
      let closestIndex = 0;
      let closestDistance = Infinity;

      for (let i = 0; i < container.children.length; i++) {
        const panel = container.children[i] as HTMLElement;
        const panelRect = panel.getBoundingClientRect();

        // Distance from this panel's left edge to the snap point
        const distance = Math.abs(panelRect.left - snapPointX);

        if (distance < closestDistance) {
          closestDistance = distance;
          closestIndex = i;
        }
      }

      return closestIndex;
    },
  }));

  // Handle scroll to track which panel is in view
  const handleScroll = (_e: React.UIEvent<HTMLDivElement>) => {
    if (!onPanelChange || !containerRef.current || containerRef.current.children.length === 0) return;

    // Skip onPanelChange callback during programmatic scrolls (e.g., tab clicks)
    // to prevent tab highlighting from flickering during smooth scroll animation
    if (isProgrammaticScrollRef.current) return;

    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();

    // The snap point is the left edge of the container
    const snapPointX = containerRect.left;

    // Find which panel's left edge is closest to the snap point
    let closestIndex = 0;
    let closestDistance = Infinity;

    for (let i = 0; i < container.children.length; i++) {
      const panel = container.children[i] as HTMLElement;
      const panelRect = panel.getBoundingClientRect();

      // Distance from this panel's left edge to the snap point
      const distance = Math.abs(panelRect.left - snapPointX);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = i;
      }
    }

    onPanelChange(closestIndex);
  };

  // Prevent keyboard-triggered scrolling when enabled
  useEffect(() => {
    if (!preventKeyboardScroll || !containerRef.current) return;

    const container = containerRef.current;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't prevent keyboard events if they're targeting interactive elements
      const target = e.target as HTMLElement;
      const isInteractive =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.isContentEditable ||
        target.closest('.xterm') !== null || // Terminal elements
        target.closest('[contenteditable="true"]') !== null;

      if (isInteractive) {
        return; // Let the event through to the interactive element
      }

      // Prevent keys that trigger browser scrolling
      const scrollKeys = [' ', 'Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'PageUp', 'PageDown'];

      if (scrollKeys.includes(e.key)) {
        e.preventDefault();
      }
    };

    container.addEventListener('keydown', handleKeyDown);

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, [preventKeyboardScroll]);

  // Cleanup scroll timeout on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // Calculate panel count for responsive sizing
  const panelCount = panels.length;

  // Calculate threshold for 2-panel layout: 2x minPanelWidth
  const twoPanelThreshold = minPanelWidth * 2;

  // Set panel width based on count
  let panelWidth: string;
  if (panelCount === 1) {
    panelWidth = '100%';
  } else if (panelCount === 2) {
    // For 2 panels, use 50% if parent > threshold, else 100%
    // We'll use container queries in CSS for this
    panelWidth = '100%'; // Default, CSS container query will override
  } else {
    // 3+ panels: use the maximum of minPanelWidth or idealPanelWidth% of container
    // This ensures panels are at least minPanelWidth wide, but can be larger if needed
    // For full-width mobile panels, set minPanelWidth to 0
    panelWidth = `max(${minPanelWidth}px, ${idealPanelWidth * 100}%)`;
  }

  // Generate unique ID for this carousel instance to scope the dynamic styles
  const carouselId = React.useId().replace(/:/g, '_');

  return (
    <>
      {/* Dynamic styles for 2-panel threshold */}
      {panelCount === 2 && (
        <style>
          {`
            .snap-carousel-container[data-carousel-id="${carouselId}"][data-panel-count="2"] .snap-carousel-panel {
              width: 100%;
            }
            @container (min-width: ${twoPanelThreshold}px) {
              .snap-carousel-container[data-carousel-id="${carouselId}"][data-panel-count="2"] .snap-carousel-panel {
                width: 50%;
              }
            }
          `}
        </style>
      )}
      <div
        ref={containerRef}
        className={`snap-carousel-container ${disableSwipe ? 'swipe-disabled' : ''} ${className}`}
        style={{
          ...themeStyles,
          ...style,
          '--snap-carousel-min-width': `${minPanelWidth}px`,
          '--snap-carousel-ideal-width': `${idealPanelWidth * 100}%`,
          '--snap-carousel-gap': showSeparator ? '1px' : '0px',
          '--snap-carousel-panel-width': panelWidth,
          '--snap-carousel-panel-count': panelCount,
          '--snap-carousel-two-panel-threshold': `${twoPanelThreshold}px`,
        } as React.CSSProperties}
        onScroll={handleScroll}
        data-panel-count={panelCount}
        data-carousel-id={carouselId}
      >
        {panels.map((panel, index) => (
          <div key={index} className="snap-carousel-panel">
            {panel}
          </div>
        ))}
      </div>
    </>
  );
});

SnapCarousel.displayName = 'SnapCarousel';
