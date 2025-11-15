import React, { ReactNode, useState, useRef, useEffect, useCallback } from 'react';
import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
  ImperativePanelHandle,
} from 'react-resizable-panels';
import { Theme } from '@principal-ade/industry-theme';
import { mapThemeToPanelVars } from '../utils/themeMapping';
import './AnimatedResizableLayout.css';

export interface AnimatedResizableLayoutProps {
  /** Content for the left panel */
  leftPanel: ReactNode;

  /** Content for the right panel */
  rightPanel: ReactNode;

  /** Which side is collapsible */
  collapsibleSide?: 'left' | 'right';

  /** Default size of the collapsible panel (0-100) */
  defaultSize?: number;

  /** Minimum size of the collapsible panel when expanded (0-100) */
  minSize?: number;

  /** CSS class for the layout container */
  className?: string;

  /** Whether the panel is initially collapsed */
  collapsed?: boolean;

  /** Additional styles to apply to the container */
  style?: React.CSSProperties;

  /** Whether to show the collapse/expand toggle button */
  showCollapseButton?: boolean;

  /** Animation duration in milliseconds */
  animationDuration?: number;

  /** Animation easing function */
  animationEasing?: string;

  /** Callback fired when collapse starts */
  onCollapseStart?: () => void;

  /** Callback fired when collapse completes */
  onCollapseComplete?: () => void;

  /** Callback fired when expand starts */
  onExpandStart?: () => void;

  /** Callback fired when expand completes */
  onExpandComplete?: () => void;

  /** Theme object for customizing colors */
  theme: Theme;
}

/**
 * AnimatedResizableLayout - Combines react-resizable-panels with smooth animations
 * Supports both manual dragging to resize AND smooth animations for collapse/expand
 */
export const AnimatedResizableLayout: React.FC<AnimatedResizableLayoutProps> = ({
  leftPanel,
  rightPanel,
  collapsibleSide = 'left',
  defaultSize = 25,
  minSize = 5,
  className = '',
  collapsed = false,
  style,
  showCollapseButton = false,
  animationDuration = 300,
  animationEasing = 'cubic-bezier(0.4, 0, 0.2, 1)',
  onCollapseStart,
  onCollapseComplete,
  onExpandStart,
  onExpandComplete,
  theme,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(collapsed);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [hideHandle, setHideHandle] = useState(collapsed);
  const [currentSize, setCurrentSize] = useState(collapsed ? 0 : defaultSize);
  const panelRef = useRef<ImperativePanelHandle>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const startTimeRef = useRef<number | undefined>(undefined);
  const animationTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Smooth animation using requestAnimationFrame
  const animatePanel = useCallback(
    (fromSize: number, toSize: number, onComplete?: () => void) => {
      if (!panelRef.current) return;

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      startTimeRef.current = performance.now();

      const animate = (currentTime: number) => {
        if (!startTimeRef.current || !panelRef.current) return;

        const elapsed = currentTime - startTimeRef.current;
        const progress = Math.min(elapsed / animationDuration, 1);

        // Apply easing
        const eased =
          progress < 0.5
            ? 4 * progress * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 3) / 2;

        const newSize = fromSize + (toSize - fromSize) * eased;

        // Always use resize during animation, never collapse
        panelRef.current.resize(newSize);

        if (progress < 1) {
          animationFrameRef.current = requestAnimationFrame(animate);
        } else {
          // Ensure final state is set correctly
          if (toSize === 0) {
            panelRef.current.collapse();
          } else {
            panelRef.current.resize(toSize);
          }
          setIsAnimating(false);
          if (onComplete) onComplete();
        }
      };

      animationFrameRef.current = requestAnimationFrame(animate);
    },
    [animationDuration],
  );

  const handleCollapse = useCallback(() => {
    if (isAnimating || isDragging) return;

    setIsAnimating(true);
    setIsCollapsed(true);
    if (onCollapseStart) onCollapseStart();

    // Animate from current size to 0
    animatePanel(currentSize, 0, () => {
      setCurrentSize(0);
      setHideHandle(true); // Hide handle AFTER animation completes
      if (onCollapseComplete) onCollapseComplete();
    });
  }, [isAnimating, isDragging, currentSize, animatePanel, onCollapseStart, onCollapseComplete]);

  const handleExpand = useCallback(() => {
    if (isAnimating || isDragging) return;

    setIsAnimating(true);
    setIsCollapsed(false);
    setHideHandle(false); // Show handle immediately when expanding
    if (onExpandStart) onExpandStart();

    // Animate from 0 to the default size
    animatePanel(0, defaultSize, () => {
      setCurrentSize(defaultSize);
      if (onExpandComplete) onExpandComplete();
    });
  }, [isAnimating, isDragging, defaultSize, animatePanel, onExpandStart, onExpandComplete]);

  const togglePanel = useCallback(() => {
    if (isCollapsed) {
      handleExpand();
    } else {
      handleCollapse();
    }
  }, [isCollapsed, handleCollapse, handleExpand]);

  const handleResize = useCallback(
    (size: number) => {
      if (!isAnimating) {
        setCurrentSize(size);
        // If manually resized to non-zero, ensure we're not in collapsed state
        if (size > 0) {
          setIsCollapsed(false);
        }
      }
    },
    [isAnimating],
  );

  const handleDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  useEffect(() => {
    if (collapsed !== isCollapsed) {
      if (collapsed) {
        handleCollapse();
      } else {
        handleExpand();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- handleCollapse/handleExpand would cause infinite loop
  }, [collapsed]);

  // Update hideHandle when collapsed prop changes externally
  useEffect(() => {
    if (collapsed && !isAnimating) {
      setHideHandle(true);
    } else if (!collapsed && !isAnimating) {
      setHideHandle(false);
    }
  }, [collapsed, isAnimating]);

  useEffect(() => {
    const animationFrame = animationFrameRef.current;
    const animationTimeout = animationTimeoutRef.current;
    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
      if (animationTimeout) {
        clearTimeout(animationTimeout);
      }
    };
  }, []);

  const leftIsCollapsible = collapsibleSide === 'left';
  const toggleIcon = isCollapsed ? (leftIsCollapsible ? '▸' : '◂') : leftIsCollapsible ? '◂' : '▸';

  // Apply theme as CSS variables
  const themeStyles = mapThemeToPanelVars(theme) as React.CSSProperties;

  const collapsiblePanelStyle =
    isAnimating && !isDragging
      ? ({ transition: `flex ${animationDuration}ms ${animationEasing}` } satisfies React.CSSProperties)
      : undefined;

  // Apply animation class when animating, not when dragging
  const getPanelClassName = (isCollapsiblePanel: boolean) => {
    let className = 'hybrid-panel';
    if (isCollapsiblePanel) {
      className += ' collapsible-panel';
      if (isAnimating && !isDragging) {
        className += ' animating';
      }
      if (isCollapsed) {
        className += ' collapsed';
      }
    }
    return className;
  };

  return (
    <div className={`animated-resizable-layout ${className}`} style={{ ...themeStyles, ...style }}>
      <PanelGroup direction="horizontal" onLayout={handleDragEnd}>
        <Panel
          ref={leftIsCollapsible ? panelRef : undefined}
          collapsible={leftIsCollapsible}
          defaultSize={leftIsCollapsible ? (collapsed ? 0 : defaultSize) : undefined}
          minSize={leftIsCollapsible ? minSize : 30}
          collapsedSize={0}
          onResize={leftIsCollapsible ? handleResize : undefined}
          onCollapse={leftIsCollapsible ? () => setIsCollapsed(true) : undefined}
          onExpand={leftIsCollapsible ? () => setIsCollapsed(false) : undefined}
          className={getPanelClassName(leftIsCollapsible)}
          style={leftIsCollapsible ? collapsiblePanelStyle : undefined}
        >
          <div
            className="panel-content-wrapper"
            style={{
              opacity: leftIsCollapsible && isCollapsed ? 0 : 1,
              transition: isAnimating
                ? `opacity ${animationDuration * 0.5}ms ${animationEasing}`
                : 'none',
            }}
          >
            {leftPanel}
          </div>
        </Panel>

        <PanelResizeHandle
          className={`resize-handle ${hideHandle ? 'collapsed' : ''}`}
          onDragging={handleDragStart}
          style={hideHandle ? { visibility: 'hidden', width: 0 } : undefined}
        >
          {showCollapseButton && (
            <div className="handle-bar">
              <button
                onClick={togglePanel}
                className="collapse-toggle"
                disabled={isAnimating}
                aria-label={isCollapsed ? 'Expand panel' : 'Collapse panel'}
              >
                {toggleIcon}
              </button>
            </div>
          )}
        </PanelResizeHandle>

        <Panel
          ref={!leftIsCollapsible ? panelRef : undefined}
          collapsible={!leftIsCollapsible}
          defaultSize={!leftIsCollapsible ? (collapsed ? 0 : defaultSize) : undefined}
          minSize={!leftIsCollapsible ? minSize : 30}
          collapsedSize={0}
          onResize={!leftIsCollapsible ? handleResize : undefined}
          onCollapse={!leftIsCollapsible ? () => setIsCollapsed(true) : undefined}
          onExpand={!leftIsCollapsible ? () => setIsCollapsed(false) : undefined}
          className={getPanelClassName(!leftIsCollapsible)}
          style={!leftIsCollapsible ? collapsiblePanelStyle : undefined}
        >
          <div
            className="panel-content-wrapper"
            style={{
              opacity: !leftIsCollapsible && isCollapsed ? 0 : 1,
              transition: isAnimating
                ? `opacity ${animationDuration * 0.5}ms ${animationEasing}`
                : 'none',
            }}
          >
            {rightPanel}
          </div>
        </Panel>
      </PanelGroup>
    </div>
  );
};
