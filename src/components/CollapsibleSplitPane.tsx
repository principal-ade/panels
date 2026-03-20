import React, {
  ReactNode,
  useState,
  useRef,
  useEffect,
  useCallback,
} from 'react';
import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
  ImperativePanelHandle,
} from 'react-resizable-panels';
import { Theme } from '@principal-ade/industry-theme';
import { mapThemeToPanelVars } from '../utils/themeMapping';
import './CollapsibleSplitPane.css';

export interface CollapsedHeaderConfig {
  /** Icon to display in the collapsed header */
  icon?: ReactNode;
  /** Title text for the collapsed header */
  title: string;
}

export interface CollapsibleSplitPaneProps {
  /** Content for the primary panel (bottom, always visible) */
  primaryContent: ReactNode;

  /**
   * Content for the secondary panel (top, collapsible).
   * When undefined/null, the component renders only the primary content
   * without any split pane UI - useful as a stable wrapper that can
   * later receive secondary content without remounting.
   */
  secondaryContent?: ReactNode;

  /**
   * Configuration for the collapsed header bar.
   * Required when secondaryContent is provided.
   */
  collapsedHeader?: CollapsedHeaderConfig;

  /** Whether the secondary panel is collapsed */
  collapsed?: boolean;

  /** Callback when collapsed state changes */
  onCollapsedChange?: (collapsed: boolean) => void;

  /** Split ratio (0-1) - proportion of space for secondary panel when expanded */
  ratio?: number;

  /** Callback when ratio changes via drag */
  onRatioChange?: (ratio: number) => void;

  /** Minimum ratio for secondary panel (default: 0.1) */
  minRatio?: number;

  /** Maximum ratio for secondary panel (default: 0.8) */
  maxRatio?: number;

  /** Height of collapsed header bar in pixels (default: 28) */
  collapsedHeight?: number;

  /** Theme object for customizing colors */
  theme: Theme;

  /** CSS class for the layout container */
  className?: string;

  /** Additional styles to apply to the container */
  style?: React.CSSProperties;

  /** Animation duration in milliseconds (default: 200) */
  animationDuration?: number;

  /** Callback when collapse animation starts */
  onCollapseStart?: () => void;

  /** Callback when collapse animation completes */
  onCollapseComplete?: () => void;

  /** Callback when expand animation starts */
  onExpandStart?: () => void;

  /** Callback when expand animation completes */
  onExpandComplete?: () => void;
}

/**
 * CollapsibleSplitPane - A vertical split pane with a collapsible secondary (top) panel.
 * When collapsed, shows a thin header bar with icon, title, and expand button.
 * Supports drag-to-resize and remembers the ratio per instance.
 */
export const CollapsibleSplitPane: React.FC<CollapsibleSplitPaneProps> = ({
  primaryContent,
  secondaryContent,
  collapsedHeader,
  collapsed = true,
  onCollapsedChange,
  ratio = 0.3,
  onRatioChange,
  minRatio = 0.1,
  maxRatio = 0.8,
  collapsedHeight = 28,
  theme,
  className = '',
  style,
  animationDuration = 200,
  onCollapseStart,
  onCollapseComplete,
  onExpandStart,
  onExpandComplete,
}) => {
  const themeStyles = mapThemeToPanelVars(theme) as React.CSSProperties;

  // When no secondary content, just render primary content directly
  // This provides a stable wrapper that won't cause remounts when
  // secondary content is added later
  if (!secondaryContent) {
    return (
      <div
        className={`collapsible-split-pane ${className}`}
        style={{ ...themeStyles, ...style }}
      >
        <div className="csp-primary-content-full">{primaryContent}</div>
      </div>
    );
  }

  // Secondary content exists - render the full split pane
  return (
    <CollapsibleSplitPaneWithContent
      primaryContent={primaryContent}
      secondaryContent={secondaryContent}
      collapsedHeader={collapsedHeader ?? { title: 'Content' }}
      collapsed={collapsed}
      onCollapsedChange={onCollapsedChange ?? (() => {})}
      ratio={ratio}
      onRatioChange={onRatioChange ?? (() => {})}
      minRatio={minRatio}
      maxRatio={maxRatio}
      collapsedHeight={collapsedHeight}
      theme={theme}
      className={className}
      style={style}
      animationDuration={animationDuration}
      onCollapseStart={onCollapseStart}
      onCollapseComplete={onCollapseComplete}
      onExpandStart={onExpandStart}
      onExpandComplete={onExpandComplete}
    />
  );
};

/**
 * Internal component that handles the actual split pane logic
 * when secondary content is present.
 */
const CollapsibleSplitPaneWithContent: React.FC<
  Omit<CollapsibleSplitPaneProps, 'secondaryContent' | 'collapsedHeader' | 'collapsed' | 'onCollapsedChange' | 'ratio' | 'onRatioChange'> & {
    secondaryContent: ReactNode;
    collapsedHeader: CollapsedHeaderConfig;
    collapsed: boolean;
    onCollapsedChange: (collapsed: boolean) => void;
    ratio: number;
    onRatioChange: (ratio: number) => void;
  }
> = ({
  primaryContent,
  secondaryContent,
  collapsedHeader,
  collapsed,
  onCollapsedChange,
  ratio,
  onRatioChange,
  minRatio = 0.1,
  maxRatio = 0.8,
  collapsedHeight = 28,
  theme,
  className = '',
  style,
  animationDuration = 200,
  onCollapseStart,
  onCollapseComplete,
  onExpandStart,
  onExpandComplete,
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const secondaryPanelRef = useRef<ImperativePanelHandle>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const startTimeRef = useRef<number | undefined>(undefined);
  const lastExpandedRatioRef = useRef(ratio);

  // Convert ratio (0-1) to panel size (0-100)
  const ratioToSize = (r: number) => r * 100;
  const sizeToRatio = (s: number) => s / 100;

  // Store the last expanded ratio so we can restore it
  useEffect(() => {
    if (!collapsed && ratio > 0) {
      lastExpandedRatioRef.current = ratio;
    }
  }, [collapsed, ratio]);

  const animatePanel = useCallback(
    (fromSize: number, toSize: number, onComplete?: () => void) => {
      if (!secondaryPanelRef.current) return;

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      startTimeRef.current = performance.now();

      const animate = (currentTime: number) => {
        if (!startTimeRef.current || !secondaryPanelRef.current) return;

        const elapsed = currentTime - startTimeRef.current;
        const progress = Math.min(elapsed / animationDuration, 1);

        // Cubic ease-in-out
        const eased =
          progress < 0.5
            ? 4 * progress * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 3) / 2;

        const newSize = fromSize + (toSize - fromSize) * eased;
        secondaryPanelRef.current.resize(newSize);

        if (progress < 1) {
          animationFrameRef.current = requestAnimationFrame(animate);
        } else {
          if (toSize === 0) {
            secondaryPanelRef.current.collapse();
          } else {
            secondaryPanelRef.current.resize(toSize);
          }
          setIsAnimating(false);
          if (onComplete) onComplete();
        }
      };

      animationFrameRef.current = requestAnimationFrame(animate);
    },
    [animationDuration]
  );

  const handleCollapse = useCallback(() => {
    if (isAnimating || isDragging) return;

    setIsAnimating(true);
    onCollapseStart?.();

    const currentSize = ratioToSize(ratio);
    animatePanel(currentSize, 0, () => {
      onCollapsedChange(true);
      onCollapseComplete?.();
    });
  }, [
    isAnimating,
    isDragging,
    ratio,
    animatePanel,
    onCollapsedChange,
    onCollapseStart,
    onCollapseComplete,
  ]);

  const handleExpand = useCallback(() => {
    if (isAnimating || isDragging) return;

    setIsAnimating(true);
    onExpandStart?.();

    const targetRatio = lastExpandedRatioRef.current || ratio || 0.3;
    const targetSize = ratioToSize(targetRatio);

    animatePanel(0, targetSize, () => {
      onCollapsedChange(false);
      onRatioChange(targetRatio);
      onExpandComplete?.();
    });
  }, [
    isAnimating,
    isDragging,
    ratio,
    animatePanel,
    onCollapsedChange,
    onRatioChange,
    onExpandStart,
    onExpandComplete,
  ]);

  const handleToggle = useCallback(() => {
    if (collapsed) {
      handleExpand();
    } else {
      handleCollapse();
    }
  }, [collapsed, handleCollapse, handleExpand]);

  const handleSecondaryResize = useCallback(
    (size: number) => {
      if (!isAnimating && !collapsed) {
        const newRatio = sizeToRatio(size);
        onRatioChange(newRatio);
      }
    },
    [isAnimating, collapsed, onRatioChange]
  );

  const handleDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Sync with external collapsed prop changes
  useEffect(() => {
    if (collapsed && !isAnimating && secondaryPanelRef.current) {
      const currentSize = secondaryPanelRef.current.getSize();
      if (currentSize > 0) {
        handleCollapse();
      }
    } else if (!collapsed && !isAnimating && secondaryPanelRef.current) {
      const currentSize = secondaryPanelRef.current.getSize();
      if (currentSize === 0) {
        handleExpand();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collapsed]);

  // Cleanup animation frames
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const themeStyles = mapThemeToPanelVars(theme) as React.CSSProperties;

  const secondaryPanelClassName = [
    'csp-secondary-panel',
    isAnimating && !isDragging ? 'csp-animating' : '',
    collapsed ? 'csp-collapsed' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={`collapsible-split-pane ${className}`}
      style={{ ...themeStyles, ...style }}
    >
      {collapsed ? (
        // Collapsed state: show header bar + primary content
        <>
          <div
            className="csp-collapsed-header"
            style={{ height: collapsedHeight }}
            onClick={handleToggle}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleToggle();
              }
            }}
            aria-expanded={false}
            aria-label={`Expand ${collapsedHeader.title}`}
          >
            {collapsedHeader.icon && (
              <span className="csp-collapsed-header-icon">
                {collapsedHeader.icon}
              </span>
            )}
            <span className="csp-collapsed-header-title">
              {collapsedHeader.title}
            </span>
            <button
              className="csp-collapsed-header-expand"
              onClick={(e) => {
                e.stopPropagation();
                handleToggle();
              }}
              aria-label={`Expand ${collapsedHeader.title}`}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M3 5L6 8L9 5" />
              </svg>
            </button>
          </div>
          <div className="csp-primary-content-full">{primaryContent}</div>
        </>
      ) : (
        // Expanded state: resizable split pane
        <PanelGroup direction="vertical" onLayout={handleDragEnd}>
          <Panel
            ref={secondaryPanelRef}
            collapsible
            defaultSize={ratioToSize(ratio)}
            minSize={ratioToSize(minRatio)}
            maxSize={ratioToSize(maxRatio)}
            collapsedSize={0}
            onResize={handleSecondaryResize}
            onCollapse={() => onCollapsedChange(true)}
            className={secondaryPanelClassName}
          >
            <div className="csp-panel-content">
              <div className="csp-secondary-header">
                {collapsedHeader.icon && (
                  <span className="csp-secondary-header-icon">
                    {collapsedHeader.icon}
                  </span>
                )}
                <span className="csp-secondary-header-title">
                  {collapsedHeader.title}
                </span>
                <button
                  className="csp-secondary-header-collapse"
                  onClick={handleCollapse}
                  aria-label={`Collapse ${collapsedHeader.title}`}
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <path d="M3 7L6 4L9 7" />
                  </svg>
                </button>
              </div>
              <div className="csp-secondary-body">{secondaryContent}</div>
            </div>
          </Panel>

          <PanelResizeHandle
            className="csp-resize-handle"
            onDragging={handleDragStart}
          >
            <div className="csp-resize-handle-bar" />
          </PanelResizeHandle>

          <Panel className="csp-primary-panel" minSize={20}>
            <div className="csp-panel-content">{primaryContent}</div>
          </Panel>
        </PanelGroup>
      )}
    </div>
  );
};
