import React, {
  ReactNode,
  useState,
  useRef,
  useEffect,
  useCallback,
} from 'react';
import {
  Panel,
  Group,
  Separator,
  PanelImperativeHandle,
  PanelSize,
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

  /** Maximum ratio for secondary panel (default: 0.8) */
  maxRatio?: number;

  /** Height of collapsed header bar in pixels (default: 28) */
  collapsedHeight?: number;

  /** Hide the header completely (default: true, set to false to show header) */
  hideHeader?: boolean;

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
  maxRatio = 0.8,
  collapsedHeight = 28,
  hideHeader = true,
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
      maxRatio={maxRatio}
      collapsedHeight={collapsedHeight}
      hideHeader={hideHeader}
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
  maxRatio = 0.8,
  collapsedHeight = 28,
  hideHeader = true,
  theme,
  className = '',
  style,
  animationDuration = 200,
  onCollapseStart,
  onCollapseComplete,
  onExpandStart,
  onExpandComplete,
}) => {
  // DEBUG logging
  console.log('[CSP] render', { collapsed, hideHeader, ratio });
  const [isAnimating, setIsAnimating] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const secondaryPanelRef = useRef<PanelImperativeHandle>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const startTimeRef = useRef<number | undefined>(undefined);
  const lastExpandedRatioRef = useRef(ratio);
  const isAnimatingRef = useRef(false); // Sync ref for immediate checks
  const collapsedRef = useRef(collapsed); // Sync ref for collapsed state
  const isInitialMountRef = useRef(true); // Track initial mount to skip animation

  // Convert ratio (0-1) to panel size (0-100)
  const ratioToSize = (r: number) => r * 100;
  const sizeToRatio = (s: number) => s / 100;

  // Keep collapsedRef in sync
  useEffect(() => {
    collapsedRef.current = collapsed;
  }, [collapsed]);

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
        secondaryPanelRef.current.resize(`${newSize}%`);

        if (progress < 1) {
          animationFrameRef.current = requestAnimationFrame(animate);
        } else {
          secondaryPanelRef.current.resize(`${toSize}%`);
          if (onComplete) onComplete();
          isAnimatingRef.current = false;
          setIsAnimating(false);
        }
      };

      animationFrameRef.current = requestAnimationFrame(animate);
    },
    [animationDuration]
  );

  const handleCollapse = useCallback(() => {
    if (isAnimating || isDragging || !secondaryPanelRef.current) return;

    // Save the current ratio before collapsing
    if (ratio > 0) {
      lastExpandedRatioRef.current = ratio;
    }

    isAnimatingRef.current = true;
    setIsAnimating(true);
    onCollapseStart?.();

    const currentSize = ratioToSize(ratio);
    animatePanel(currentSize, 0, () => {
      collapsedRef.current = true; // Set immediately before state update
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
    if (isAnimating || isDragging || !secondaryPanelRef.current) return;

    isAnimatingRef.current = true;
    setIsAnimating(true);
    onExpandStart?.();

    const targetRatio = lastExpandedRatioRef.current || ratio || 0.3;
    const targetSize = ratioToSize(targetRatio);

    animatePanel(0, targetSize, () => {
      collapsedRef.current = false;
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
    (panelSize: PanelSize) => {
      console.log('[CSP] onResize', {
        size: panelSize.asPercentage,
        isInitialMount: isInitialMountRef.current,
        isAnimating: isAnimatingRef.current,
        collapsedRef: collapsedRef.current
      });
      // Use refs for immediate check (state updates are async)
      if (isAnimatingRef.current) return;
      // Skip resize events during initial mount - react-resizable-panels may fire
      // with incorrect sizes before defaultSize is fully applied
      if (isInitialMountRef.current) return;

      const newRatio = sizeToRatio(panelSize.asPercentage);

      // Sync collapsed state with actual panel size when dragging
      if (newRatio <= 0.01 && !collapsedRef.current) {
        // Dragged to ~0, mark as collapsed
        // Use 40% as default expand size since drag-to-collapse means last ratio was tiny
        lastExpandedRatioRef.current = 0.4;
        collapsedRef.current = true;
        onCollapsedChange(true);
      } else if (newRatio > 0.01 && collapsedRef.current) {
        // Dragged from 0 to visible, mark as expanded
        collapsedRef.current = false;
        onCollapsedChange(false);
      }

      if (!collapsedRef.current) {
        onRatioChange(newRatio);
      }
    },
    [onRatioChange, onCollapsedChange]
  );

  const handleDragStart = useCallback(() => {
    if (!isAnimating) {
      setIsDragging(true);
    }
  }, [isAnimating]);

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Clear initial mount flag after layout settles
  // This prevents resize callbacks from triggering state changes during mount
  // react-resizable-panels fires resize events with incorrect sizes during initial layout,
  // so we need to wait for layout to fully settle (100ms seems sufficient)
  useEffect(() => {
    console.log('[CSP] mount effect - scheduling clear of isInitialMountRef');
    const timeout = setTimeout(() => {
      console.log('[CSP] clearing isInitialMountRef');
      isInitialMountRef.current = false;
    }, 100);
    return () => clearTimeout(timeout);
  }, []);

  // Sync with external collapsed prop changes
  // Skip on initial mount - defaultSize already handles initial state
  useEffect(() => {
    const currentSize = secondaryPanelRef.current?.getSize().asPercentage ?? -1;
    console.log('[CSP] collapsed sync effect', {
      collapsed,
      isInitialMount: isInitialMountRef.current,
      isAnimating,
      currentSize
    });
    if (isInitialMountRef.current) {
      console.log('[CSP] skipping sync - initial mount');
      return;
    }

    if (collapsed && !isAnimating && secondaryPanelRef.current) {
      if (currentSize > 0) {
        console.log('[CSP] triggering handleCollapse from sync effect');
        handleCollapse();
      }
    } else if (!collapsed && !isAnimating && secondaryPanelRef.current) {
      if (currentSize === 0) {
        console.log('[CSP] triggering handleExpand from sync effect');
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

  // Track if we're still in initial mount phase for CSS hiding
  const [isMounting, setIsMounting] = useState(true);

  useEffect(() => {
    // Clear mounting state after initial layout settles
    const timeout = setTimeout(() => {
      setIsMounting(false);
    }, 100);
    return () => clearTimeout(timeout);
  }, []);

  const secondaryPanelClassName = [
    'csp-secondary-panel',
    isAnimating && !isDragging ? 'csp-animating' : '',
    collapsed ? 'csp-collapsed' : '',
    // Hide during mount if should be collapsed - prevents flash
    isMounting && collapsed ? 'csp-mounting-hidden' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={`collapsible-split-pane ${className}`}
      style={{ ...themeStyles, ...style }}
    >
      {/* Header - always at top, never moves */}
      {!hideHeader && (
        <div
          className={`csp-header ${collapsed ? 'csp-header-collapsed' : ''}`}
          style={{
            height: collapsedHeight,
            backgroundColor: theme.colors.backgroundSecondary,
            borderBottom: `1px solid ${theme.colors.border}`,
          }}
          onClick={collapsed ? handleToggle : undefined}
          role={collapsed ? 'button' : undefined}
          tabIndex={collapsed ? 0 : undefined}
          onKeyDown={
            collapsed
              ? (e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleToggle();
                  }
                }
              : undefined
          }
          aria-expanded={!collapsed}
          aria-label={
            collapsed
              ? `Expand ${collapsedHeader.title}`
              : collapsedHeader.title
          }
        >
          {collapsedHeader.icon && (
            <span
              className="csp-header-icon"
              style={{ color: theme.colors.textSecondary }}
            >
              {collapsedHeader.icon}
            </span>
          )}
          <span
            className="csp-header-title"
            style={{
              color: theme.colors.text,
              fontFamily: theme.fonts.body,
              fontSize: theme.fontSizes[1],
              fontWeight: theme.fontWeights.medium,
            }}
          >
            {collapsedHeader.title}
          </span>
          <button
            className="csp-header-toggle"
            style={{ color: theme.colors.textSecondary }}
            onClick={(e) => {
              e.stopPropagation();
              handleToggle();
            }}
            aria-label={
              collapsed
                ? `Expand ${collapsedHeader.title}`
                : `Collapse ${collapsedHeader.title}`
            }
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
              <path d={collapsed ? 'M3 5L6 8L9 5' : 'M3 7L6 4L9 7'} />
            </svg>
          </button>
        </div>
      )}

      {/* Content area - always render the Group */}
      <div className="csp-content-area">
        <Group
          orientation="vertical"
          onLayoutChange={handleDragStart}
          onLayoutChanged={handleDragEnd}
        >
          <Panel
            panelRef={secondaryPanelRef}
            defaultSize={collapsed || hideHeader ? '0%' : `${ratioToSize(ratio)}%`}
            minSize="0%"
            maxSize={hideHeader && collapsed ? '0%' : `${ratioToSize(maxRatio)}%`}
            onResize={handleSecondaryResize}
            className={secondaryPanelClassName}
            style={hideHeader && collapsed ? { display: 'none' } : undefined}
          >
            <div className="csp-secondary-body">{secondaryContent}</div>
          </Panel>

          <Separator className="csp-resize-handle">
            <div className="csp-resize-handle-bar" />
          </Separator>

          <Panel className="csp-primary-panel" minSize="20%">
            <div className="csp-panel-content">{primaryContent}</div>
          </Panel>
        </Group>
      </div>
    </div>
  );
};
