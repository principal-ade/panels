import React, { ReactNode, useState, useRef, useEffect, useCallback } from 'react';
import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
  ImperativePanelHandle,
} from 'react-resizable-panels';
import { Theme } from '@principal-ade/industry-theme';
import { mapThemeToPanelVars } from '../utils/themeMapping';
import './AnimatedVerticalLayout.css';

export interface AnimatedVerticalLayoutProps {
  /** Content for the top panel */
  topPanel: ReactNode;

  /** Content for the bottom panel */
  bottomPanel: ReactNode;

  /** Which panels are collapsible */
  collapsiblePanels?: {
    top?: boolean;
    bottom?: boolean;
  };

  /** Default sizes for each panel (0-100) */
  defaultSizes?: {
    top: number;
    bottom: number;
  };

  /** Minimum sizes for each panel when expanded (0-100) */
  minSizes?: {
    top: number;
    bottom: number;
  };

  /** CSS class for the layout container */
  className?: string;

  /** Initial collapsed state for panels */
  collapsed?: {
    top?: boolean;
    bottom?: boolean;
  };

  /** Additional styles to apply to the container */
  style?: React.CSSProperties;

  /** Whether to show the collapse/expand toggle buttons */
  showCollapseButtons?: boolean;

  /** Animation duration in milliseconds */
  animationDuration?: number;

  /** Animation easing function */
  animationEasing?: string;

  /** Theme object for customizing colors */
  theme: Theme;

  /** Callbacks for panel events */
  onTopCollapseStart?: () => void;
  onTopCollapseComplete?: () => void;
  onTopExpandStart?: () => void;
  onTopExpandComplete?: () => void;
  onBottomCollapseStart?: () => void;
  onBottomCollapseComplete?: () => void;
  onBottomExpandStart?: () => void;
  onBottomExpandComplete?: () => void;
  onPanelResize?: (sizes: { top: number; bottom: number }) => void;
}

/**
 * AnimatedVerticalLayout - Vertical version with both panels independently collapsible
 * Supports both manual dragging to resize AND smooth animations for collapse/expand
 */
export const AnimatedVerticalLayout: React.FC<AnimatedVerticalLayoutProps> = ({
  topPanel,
  bottomPanel,
  collapsiblePanels = { top: true, bottom: true },
  defaultSizes = { top: 30, bottom: 30 },
  minSizes = { top: 5, bottom: 5 },
  className = '',
  collapsed = { top: false, bottom: false },
  style,
  showCollapseButtons = false,
  animationDuration = 300,
  animationEasing = 'cubic-bezier(0.4, 0, 0.2, 1)',
  theme,
  onTopCollapseStart,
  onTopCollapseComplete,
  onTopExpandStart,
  onTopExpandComplete,
  onBottomCollapseStart,
  onBottomCollapseComplete,
  onBottomExpandStart,
  onBottomExpandComplete,
  onPanelResize,
}) => {
  // Top panel state
  const [isTopCollapsed, setIsTopCollapsed] = useState(collapsed.top || false);
  const [isTopAnimating, setIsTopAnimating] = useState(false);
  const [currentTopSize, setCurrentTopSize] = useState(collapsed.top ? 0 : defaultSizes.top);
  const topPanelRef = useRef<ImperativePanelHandle>(null);
  const topAnimationFrameRef = useRef<number | undefined>(undefined);
  const topStartTimeRef = useRef<number | undefined>(undefined);

  // Bottom panel state
  const [isBottomCollapsed, setIsBottomCollapsed] = useState(collapsed.bottom || false);
  const [isBottomAnimating, setIsBottomAnimating] = useState(false);
  const [currentBottomSize, setCurrentBottomSize] = useState(collapsed.bottom ? 0 : defaultSizes.bottom);
  const bottomPanelRef = useRef<ImperativePanelHandle>(null);
  const bottomAnimationFrameRef = useRef<number | undefined>(undefined);
  const bottomStartTimeRef = useRef<number | undefined>(undefined);

  const [isDragging, setIsDragging] = useState(false);

  // Top panel animation
  const animateTopPanel = useCallback(
    (fromSize: number, toSize: number, onComplete?: () => void) => {
      if (!topPanelRef.current) return;

      if (topAnimationFrameRef.current) {
        cancelAnimationFrame(topAnimationFrameRef.current);
      }

      topStartTimeRef.current = performance.now();

      const animate = (currentTime: number) => {
        if (!topStartTimeRef.current || !topPanelRef.current) return;

        const elapsed = currentTime - topStartTimeRef.current;
        const progress = Math.min(elapsed / animationDuration, 1);

        const eased =
          progress < 0.5
            ? 4 * progress * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 3) / 2;

        const newSize = fromSize + (toSize - fromSize) * eased;
        topPanelRef.current.resize(newSize);

        if (progress < 1) {
          topAnimationFrameRef.current = requestAnimationFrame(animate);
        } else {
          if (toSize === 0) {
            topPanelRef.current.collapse();
          } else {
            topPanelRef.current.resize(toSize);
          }
          setIsTopAnimating(false);
          if (onComplete) onComplete();
        }
      };

      topAnimationFrameRef.current = requestAnimationFrame(animate);
    },
    [animationDuration],
  );

  // Bottom panel animation
  const animateBottomPanel = useCallback(
    (fromSize: number, toSize: number, onComplete?: () => void) => {
      if (!bottomPanelRef.current) return;

      if (bottomAnimationFrameRef.current) {
        cancelAnimationFrame(bottomAnimationFrameRef.current);
      }

      bottomStartTimeRef.current = performance.now();

      const animate = (currentTime: number) => {
        if (!bottomStartTimeRef.current || !bottomPanelRef.current) return;

        const elapsed = currentTime - bottomStartTimeRef.current;
        const progress = Math.min(elapsed / animationDuration, 1);

        const eased =
          progress < 0.5
            ? 4 * progress * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 3) / 2;

        const newSize = fromSize + (toSize - fromSize) * eased;
        bottomPanelRef.current.resize(newSize);

        if (progress < 1) {
          bottomAnimationFrameRef.current = requestAnimationFrame(animate);
        } else {
          if (toSize === 0) {
            bottomPanelRef.current.collapse();
          } else {
            bottomPanelRef.current.resize(toSize);
          }
          setIsBottomAnimating(false);
          if (onComplete) onComplete();
        }
      };

      bottomAnimationFrameRef.current = requestAnimationFrame(animate);
    },
    [animationDuration],
  );

  // Top panel handlers
  const handleTopCollapse = useCallback(() => {
    if (isTopAnimating || isDragging || !collapsiblePanels.top) return;

    setIsTopAnimating(true);
    setIsTopCollapsed(true);
    if (onTopCollapseStart) onTopCollapseStart();

    animateTopPanel(currentTopSize, 0, () => {
      setCurrentTopSize(0);
      if (onTopCollapseComplete) onTopCollapseComplete();
    });
  }, [isTopAnimating, isDragging, currentTopSize, collapsiblePanels.top, animateTopPanel, onTopCollapseStart, onTopCollapseComplete]);

  const handleTopExpand = useCallback(() => {
    if (isTopAnimating || isDragging || !collapsiblePanels.top) return;

    setIsTopAnimating(true);
    setIsTopCollapsed(false);
    if (onTopExpandStart) onTopExpandStart();

    animateTopPanel(0, defaultSizes.top, () => {
      setCurrentTopSize(defaultSizes.top);
      if (onTopExpandComplete) onTopExpandComplete();
    });
  }, [isTopAnimating, isDragging, defaultSizes.top, collapsiblePanels.top, animateTopPanel, onTopExpandStart, onTopExpandComplete]);

  const toggleTopPanel = useCallback(() => {
    if (isTopCollapsed) {
      handleTopExpand();
    } else {
      handleTopCollapse();
    }
  }, [isTopCollapsed, handleTopCollapse, handleTopExpand]);

  // Bottom panel handlers
  const handleBottomCollapse = useCallback(() => {
    if (isBottomAnimating || isDragging || !collapsiblePanels.bottom) return;

    setIsBottomAnimating(true);
    setIsBottomCollapsed(true);
    if (onBottomCollapseStart) onBottomCollapseStart();

    animateBottomPanel(currentBottomSize, 0, () => {
      setCurrentBottomSize(0);
      if (onBottomCollapseComplete) onBottomCollapseComplete();
    });
  }, [isBottomAnimating, isDragging, currentBottomSize, collapsiblePanels.bottom, animateBottomPanel, onBottomCollapseStart, onBottomCollapseComplete]);

  const handleBottomExpand = useCallback(() => {
    if (isBottomAnimating || isDragging || !collapsiblePanels.bottom) return;

    setIsBottomAnimating(true);
    setIsBottomCollapsed(false);
    if (onBottomExpandStart) onBottomExpandStart();

    animateBottomPanel(0, defaultSizes.bottom, () => {
      setCurrentBottomSize(defaultSizes.bottom);
      if (onBottomExpandComplete) onBottomExpandComplete();
    });
  }, [isBottomAnimating, isDragging, defaultSizes.bottom, collapsiblePanels.bottom, animateBottomPanel, onBottomExpandStart, onBottomExpandComplete]);

  const toggleBottomPanel = useCallback(() => {
    if (isBottomCollapsed) {
      handleBottomExpand();
    } else {
      handleBottomCollapse();
    }
  }, [isBottomCollapsed, handleBottomCollapse, handleBottomExpand]);

  const handleTopResize = useCallback(
    (size: number) => {
      if (!isTopAnimating) {
        setCurrentTopSize(size);
        if (size > 0) {
          setIsTopCollapsed(false);
        }
      }
    },
    [isTopAnimating],
  );

  const handleBottomResize = useCallback(
    (size: number) => {
      if (!isBottomAnimating) {
        setCurrentBottomSize(size);
        if (size > 0) {
          setIsBottomCollapsed(false);
        }
      }
    },
    [isBottomAnimating],
  );

  const handleDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    if (onPanelResize) {
      onPanelResize({
        top: currentTopSize,
        bottom: currentBottomSize,
      });
    }
  }, [currentTopSize, currentBottomSize, onPanelResize]);

  // Sync top panel with external prop changes
  useEffect(() => {
    if (collapsed.top !== undefined && collapsed.top !== isTopCollapsed) {
      if (collapsed.top) {
        handleTopCollapse();
      } else {
        handleTopExpand();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- handleTopCollapse/handleTopExpand would cause infinite loop
  }, [collapsed.top]);

  // Sync bottom panel with external prop changes
  useEffect(() => {
    if (collapsed.bottom !== undefined && collapsed.bottom !== isBottomCollapsed) {
      if (collapsed.bottom) {
        handleBottomCollapse();
      } else {
        handleBottomExpand();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- handleBottomCollapse/handleBottomExpand would cause infinite loop
  }, [collapsed.bottom]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (topAnimationFrameRef.current) {
        cancelAnimationFrame(topAnimationFrameRef.current);
      }
      if (bottomAnimationFrameRef.current) {
        cancelAnimationFrame(bottomAnimationFrameRef.current);
      }
    };
  }, []);

  // Apply theme as CSS variables
  const themeStyles = mapThemeToPanelVars(theme) as React.CSSProperties;

  const topPanelStyle =
    isTopAnimating && !isDragging
      ? ({ transition: `flex ${animationDuration}ms ${animationEasing}` } satisfies React.CSSProperties)
      : undefined;

  const bottomPanelStyle =
    isBottomAnimating && !isDragging
      ? ({ transition: `flex ${animationDuration}ms ${animationEasing}` } satisfies React.CSSProperties)
      : undefined;

  const getTopPanelClassName = () => {
    let className = 'vertical-panel collapsible-panel';
    if (isTopAnimating && !isDragging) {
      className += ' animating';
    }
    if (isTopCollapsed) {
      className += ' collapsed';
    }
    return className;
  };

  const getBottomPanelClassName = () => {
    let className = 'vertical-panel collapsible-panel';
    if (isBottomAnimating && !isDragging) {
      className += ' animating';
    }
    if (isBottomCollapsed) {
      className += ' collapsed';
    }
    return className;
  };

  return (
    <div className={`animated-vertical-layout ${className}`} style={{ ...themeStyles, ...style }}>
      <PanelGroup direction="vertical" onLayout={handleDragEnd}>
        <Panel
          ref={topPanelRef}
          collapsible={collapsiblePanels.top}
          defaultSize={collapsed.top ? 0 : defaultSizes.top}
          minSize={minSizes.top}
          collapsedSize={0}
          onResize={handleTopResize}
          onCollapse={() => setIsTopCollapsed(true)}
          onExpand={() => setIsTopCollapsed(false)}
          className={getTopPanelClassName()}
          style={topPanelStyle}
        >
          <div
            className="panel-content-wrapper"
            style={{
              opacity: isTopCollapsed ? 0 : 1,
              transition: isTopAnimating
                ? `opacity ${animationDuration * 0.5}ms ${animationEasing}`
                : 'none',
            }}
          >
            {topPanel}
          </div>
        </Panel>

        <PanelResizeHandle
          className="vertical-resize-handle"
          onDragging={handleDragStart}
        >
          {showCollapseButtons && (
            <div className="handle-bar">
              {collapsiblePanels.top && (
                <button
                  onClick={toggleTopPanel}
                  className="collapse-toggle collapse-toggle-top"
                  disabled={isTopAnimating}
                  aria-label={isTopCollapsed ? 'Expand top panel' : 'Collapse top panel'}
                >
                  {isTopCollapsed ? '▾' : '▴'}
                </button>
              )}
              {collapsiblePanels.bottom && (
                <button
                  onClick={toggleBottomPanel}
                  className="collapse-toggle collapse-toggle-bottom"
                  disabled={isBottomAnimating}
                  aria-label={isBottomCollapsed ? 'Expand bottom panel' : 'Collapse bottom panel'}
                >
                  {isBottomCollapsed ? '▴' : '▾'}
                </button>
              )}
            </div>
          )}
        </PanelResizeHandle>

        <Panel
          ref={bottomPanelRef}
          collapsible={collapsiblePanels.bottom}
          defaultSize={collapsed.bottom ? 0 : defaultSizes.bottom}
          minSize={minSizes.bottom}
          collapsedSize={0}
          onResize={handleBottomResize}
          onCollapse={() => setIsBottomCollapsed(true)}
          onExpand={() => setIsBottomCollapsed(false)}
          className={getBottomPanelClassName()}
          style={bottomPanelStyle}
        >
          <div
            className="panel-content-wrapper"
            style={{
              opacity: isBottomCollapsed ? 0 : 1,
              transition: isBottomAnimating
                ? `opacity ${animationDuration * 0.5}ms ${animationEasing}`
                : 'none',
            }}
          >
            {bottomPanel}
          </div>
        </Panel>
      </PanelGroup>
    </div>
  );
};
