import React, { ReactNode, useState, useRef, useCallback, forwardRef, useImperativeHandle, useEffect } from 'react';
import {
  Panel,
  Group,
  Separator,
  PanelImperativeHandle,
  GroupImperativeHandle,
  PanelSize,
} from 'react-resizable-panels';
import { Theme } from '@principal-ade/industry-theme';
import { mapThemeToPanelVars } from '../utils/themeMapping';
import { PanelLayout, PanelSlot, PanelGroup as PanelGroupType, TabsConfig } from './PanelConfigurator';
import { TabGroup } from './TabGroup';
import { PanelBoundsProvider } from '../hooks/usePanelBounds';
import './ConfigurablePanelLayout.css';

/**
 * Imperative handle for ConfigurablePanelLayout
 * Allows programmatic control of panel sizes without remounting
 */
export interface ConfigurablePanelLayoutHandle {
  /**
   * Set panel sizes programmatically without remounting
   * @param sizes - Object with left, middle, and right sizes (0-100, should sum to 100)
   */
  setLayout: (sizes: { left: number; middle: number; right: number }) => void;

  /**
   * Collapse a specific panel
   */
  collapsePanel: (panel: 'left' | 'right') => void;

  /**
   * Expand a specific panel
   */
  expandPanel: (panel: 'left' | 'right') => void;

  /**
   * Get current panel sizes
   * @returns Object with left, middle, and right sizes
   */
  getLayout: () => { left: number; middle: number; right: number };
}

export interface PanelDefinitionWithContent {
  id: string;
  label: string;
  content: ReactNode;
  preview?: ReactNode;
  icon?: ReactNode;
}

export interface ConfigurablePanelLayoutProps {
  /** Available panels with their content */
  panels: PanelDefinitionWithContent[];

  /** Current layout configuration - omit or set positions to null/undefined for two-panel layouts */
  layout: PanelLayout;

  /** Custom data attributes for slot identification (for edit mode) */
  slotDataAttributes?: {
    left?: Record<string, string>;
    middle?: Record<string, string>;
    right?: Record<string, string>;
  };

  /** Which panels are collapsible - only specify for active panels */
  collapsiblePanels?: {
    left?: boolean;
    middle?: boolean;
    right?: boolean;
  };

  /** Default sizes for each panel (0-100, should sum to 100 for active panels) - only specify for active panels */
  defaultSizes?: {
    left?: number;
    middle?: number;
    right?: number;
  };


  /** CSS class for the layout container */
  className?: string;

  /** Initial collapsed state for panels */
  collapsed?: {
    left?: boolean;
    middle?: boolean;
    right?: boolean;
  };

  /** Additional styles to apply to the container */
  style?: React.CSSProperties;

  /** Whether to show collapse/expand toggle buttons */
  showCollapseButtons?: boolean;

  /** Animation duration in milliseconds */
  animationDuration?: number;

  /** Animation easing function */
  animationEasing?: string;

  /** Theme object for customizing colors */
  theme: Theme;

  /** Callbacks for panel events */
  onLeftCollapseStart?: () => void;
  onLeftCollapseComplete?: () => void;
  onLeftExpandStart?: () => void;
  onLeftExpandComplete?: () => void;
  onMiddleCollapseStart?: () => void;
  onMiddleCollapseComplete?: () => void;
  onMiddleExpandStart?: () => void;
  onMiddleExpandComplete?: () => void;
  onRightCollapseStart?: () => void;
  onRightCollapseComplete?: () => void;
  onRightExpandStart?: () => void;
  onRightExpandComplete?: () => void;
  onPanelResize?: (sizes: { left: number; middle: number; right: number }) => void;
}

/**
 * ConfigurablePanelLayout - A flexible panel layout that supports 2 or 3 panels
 *
 * Supports both two-panel and three-panel layouts:
 * - For two panels: omit or set unused positions to null/undefined (e.g., { left: 'panel1', right: 'panel2' })
 * - For three panels: define all positions (e.g., { left: 'panel1', middle: 'panel2', right: 'panel3' })
 *
 * The component automatically adjusts sizing and behavior based on active panels.
 *
 * @example
 * // Using the imperative API to set sizes without remounting
 * const layoutRef = useRef<ConfigurablePanelLayoutHandle>(null);
 *
 * // Later, to change sizes:
 * layoutRef.current?.setLayout({ left: 0, middle: 50, right: 50 });
 */
export const ConfigurablePanelLayout: React.ForwardRefExoticComponent<
  ConfigurablePanelLayoutProps & React.RefAttributes<ConfigurablePanelLayoutHandle>
> = forwardRef<ConfigurablePanelLayoutHandle, ConfigurablePanelLayoutProps>(({
  panels,
  layout,
  slotDataAttributes = {},
  collapsiblePanels = { left: true, middle: false, right: true },
  defaultSizes = { left: 20, middle: 60, right: 20 },
  className = '',
  collapsed = { left: false, middle: false, right: false },
  style,
  showCollapseButtons = false,
  animationDuration = 300,
  animationEasing = 'cubic-bezier(0.4, 0, 0.2, 1)',
  theme,
  onLeftCollapseStart,
  onLeftCollapseComplete,
  onLeftExpandStart,
  onLeftExpandComplete,
  onMiddleCollapseStart: _onMiddleCollapseStart,
  onMiddleCollapseComplete: _onMiddleCollapseComplete,
  onMiddleExpandStart: _onMiddleExpandStart,
  onMiddleExpandComplete: _onMiddleExpandComplete,
  onRightCollapseStart,
  onRightCollapseComplete,
  onRightExpandStart,
  onRightExpandComplete,
  onPanelResize,
}, ref) => {
  // Auto-detect which panels are active (have content)
  // Support both undefined and null for inactive panels
  const isLeftActive = layout.left !== null && layout.left !== undefined;
  const isMiddleActive = layout.middle !== null && layout.middle !== undefined;
  const isRightActive = layout.right !== null && layout.right !== undefined;

  // Compute smart defaults based on active panels
  const activeCount = [isLeftActive, isMiddleActive, isRightActive].filter(Boolean).length;

  // Smart defaults:
  // - Two panels: 50/50 split by default
  // - Three panels: 20/60/20 split by default
  // - One panel: 100%
  const computedDefaultSizes = {
    left: isLeftActive ? (defaultSizes?.left ?? (activeCount === 2 ? 50 : activeCount === 3 ? 20 : 100)) : 0,
    middle: isMiddleActive ? (defaultSizes?.middle ?? (activeCount === 2 ? 50 : activeCount === 3 ? 60 : 100)) : 0,
    right: isRightActive ? (defaultSizes?.right ?? (activeCount === 2 ? 50 : activeCount === 3 ? 20 : 100)) : 0,
  };


  // State for collapsed status - auto-collapse inactive panels
  const [leftCollapsed, setLeftCollapsed] = useState(collapsed.left || !isLeftActive);
  const [middleCollapsed, setMiddleCollapsed] = useState(collapsed.middle || !isMiddleActive);
  const [rightCollapsed, setRightCollapsed] = useState(collapsed.right || !isRightActive);

  // State for drag detection
  const [isDragging, setIsDragging] = useState(false);

  // Ref to track programmatic collapse/expand - prevents resize handlers from
  // resetting collapsed state during animation
  const isAnimatingCollapseRef = useRef(false);

  // State to track if component has mounted - disables transitions on first render
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => {
    // Use requestAnimationFrame to ensure the initial render completes before enabling transitions
    const frame = requestAnimationFrame(() => {
      setHasMounted(true);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  // Helper to get panel content by ID
  const getPanelContent = useCallback((panelId: string | null): ReactNode => {
    if (!panelId) return null;
    const panel = panels.find(p => p.id === panelId);
    return panel?.content || null;
  }, [panels]);

  // Helper to render a panel slot (handles single panels, groups, or null)
  const renderPanelSlot = useCallback((slot: PanelSlot): ReactNode => {
    if (slot === null) return null;

    // Check if it's a group
    if (typeof slot === 'object' && 'type' in slot) {
      const group = slot as PanelGroupType;
      if (group.type === 'tabs') {
        return (
          <TabGroup
            panelIds={group.panels}
            panels={panels}
            config={group.config as TabsConfig}
            theme={theme}
          />
        );
      }
      // TODO: Handle tiles when implemented
      return null;
    }

    // It's a single panel ID
    return getPanelContent(slot as string);
  }, [panels, getPanelContent, theme]);

  // Get actual panel content from layout
  const leftPanel = renderPanelSlot(layout.left ?? null);
  const middlePanel = renderPanelSlot(layout.middle ?? null);
  const rightPanel = renderPanelSlot(layout.right ?? null);

  // State for current sizes - set to 0 for inactive or collapsed panels
  const [leftSize, setLeftSize] = useState((collapsed.left || !isLeftActive) ? 0 : computedDefaultSizes.left);
  const [middleSize, setMiddleSize] = useState((collapsed.middle || !isMiddleActive) ? 0 : computedDefaultSizes.middle);
  const [rightSize, setRightSize] = useState((collapsed.right || !isRightActive) ? 0 : computedDefaultSizes.right);

  // State to preserve the last expanded size for collapsed panels
  const [lastExpandedLeftSize, setLastExpandedLeftSize] = useState(computedDefaultSizes.left);
  const [lastExpandedMiddleSize, setLastExpandedMiddleSize] = useState(computedDefaultSizes.middle);
  const [lastExpandedRightSize, setLastExpandedRightSize] = useState(computedDefaultSizes.right);

  // Panel refs
  const panelGroupRef = useRef<GroupImperativeHandle>(null);
  const leftPanelRef = useRef<PanelImperativeHandle>(null);
  const middlePanelRef = useRef<PanelImperativeHandle>(null);
  const rightPanelRef = useRef<PanelImperativeHandle>(null);

  // Left panel collapse/expand handlers
  const handleLeftCollapse = useCallback(() => {
    if (isDragging || !collapsiblePanels.left) return;
    onLeftCollapseStart?.();
    leftPanelRef.current?.collapse();
    setLeftCollapsed(true);
    onLeftCollapseComplete?.();
  }, [isDragging, collapsiblePanels.left, onLeftCollapseStart, onLeftCollapseComplete]);

  const handleLeftExpand = useCallback(() => {
    if (isDragging || !collapsiblePanels.left) return;
    onLeftExpandStart?.();
    leftPanelRef.current?.expand();
    setLeftCollapsed(false);
    onLeftExpandComplete?.();
  }, [isDragging, collapsiblePanels.left, onLeftExpandStart, onLeftExpandComplete]);

  // Right panel collapse/expand handlers
  const handleRightCollapse = useCallback(() => {
    if (isDragging || !collapsiblePanels.right) return;
    onRightCollapseStart?.();
    rightPanelRef.current?.collapse();
    setRightCollapsed(true);
    onRightCollapseComplete?.();
  }, [isDragging, collapsiblePanels.right, onRightCollapseStart, onRightCollapseComplete]);

  const handleRightExpand = useCallback(() => {
    if (isDragging || !collapsiblePanels.right) return;
    onRightExpandStart?.();
    rightPanelRef.current?.expand();
    setRightCollapsed(false);
    onRightExpandComplete?.();
  }, [isDragging, collapsiblePanels.right, onRightExpandStart, onRightExpandComplete]);

  // Toggle handlers
  const toggleLeftPanel = useCallback(() => {
    if (leftCollapsed) {
      handleLeftExpand();
    } else {
      handleLeftCollapse();
    }
  }, [leftCollapsed, handleLeftCollapse, handleLeftExpand]);

  // TODO: Add handleMiddleCollapse/handleMiddleExpand and toggleMiddlePanel
  // if we want to support collapsible middle panels in the future.
  // The callbacks (onMiddleCollapseStart, etc.) are already in the props interface.

  const toggleRightPanel = useCallback(() => {
    if (rightCollapsed) {
      handleRightExpand();
    } else {
      handleRightCollapse();
    }
  }, [rightCollapsed, handleRightCollapse, handleRightExpand]);

  // Expose imperative API for programmatic control
  useImperativeHandle(ref, () => ({
    setLayout: (sizes: { left: number; middle: number; right: number }) => {
      if (!panelGroupRef.current) return;

      // Get CURRENT layout from the actual panel group to avoid stale closure issues
      const currentLayout = panelGroupRef.current.getLayout();
      const currentLeftSize = currentLayout.left ?? 0;
      const currentRightSize = currentLayout.right ?? 0;

      // Handle collapse/expand via panel refs for reliable behavior
      // react-resizable-panels setLayout doesn't always work for 0 sizes
      const shouldCollapseLeft = sizes.left === 0 || sizes.left < 1;
      const shouldCollapseRight = sizes.right === 0 || sizes.right < 1;
      const currentLeftCollapsed = currentLeftSize < 1;
      const currentRightCollapsed = currentRightSize < 1;

      // Handle left panel collapse/expand
      if (shouldCollapseLeft && !currentLeftCollapsed) {
        leftPanelRef.current?.collapse();
        // Delay setting collapsed state until animation completes
        // to avoid hiding content before animation finishes
        setTimeout(() => setLeftCollapsed(true), animationDuration);
      } else if (!shouldCollapseLeft && currentLeftCollapsed) {
        leftPanelRef.current?.expand();
        setLeftCollapsed(false);
      }

      // Handle right panel collapse/expand
      if (shouldCollapseRight && !currentRightCollapsed) {
        rightPanelRef.current?.collapse();
        // Delay setting collapsed state until animation completes
        setTimeout(() => setRightCollapsed(true), animationDuration);
      } else if (!shouldCollapseRight && currentRightCollapsed) {
        rightPanelRef.current?.expand();
        setRightCollapsed(false);
      }

      // After expand/collapse, set the actual sizes
      // We need to wait a tick for expand() to finish before setLayout works
      const needsExpandLeft = !shouldCollapseLeft && currentLeftCollapsed;
      const needsExpandRight = !shouldCollapseRight && currentRightCollapsed;

      if (needsExpandLeft || needsExpandRight) {
        // After expanding, we need to set the layout with correct sizes
        // Use requestAnimationFrame to ensure expand animation has started
        requestAnimationFrame(() => {
          panelGroupRef.current?.setLayout(sizes);
        });
      } else {
        // Either collapsing, or no collapse/expand needed - set the layout directly
        // This handles cases like Storybook preset { left: 0, middle: 50, right: 50 }
        // where left is collapsed but we still need to resize middle and right
        panelGroupRef.current.setLayout(sizes);
      }
    },
    collapsePanel: (panel: 'left' | 'right') => {
      // Set animating flag to prevent resize handlers from resetting collapsed state
      isAnimatingCollapseRef.current = true;

      if (panel === 'left') {
        leftPanelRef.current?.collapse();
        // Delay setting collapsed state until animation completes
        setTimeout(() => {
          setLeftCollapsed(true);
          isAnimatingCollapseRef.current = false;
        }, animationDuration);
      } else {
        rightPanelRef.current?.collapse();
        setTimeout(() => {
          setRightCollapsed(true);
          isAnimatingCollapseRef.current = false;
        }, animationDuration);
      }
    },
    expandPanel: (panel: 'left' | 'right') => {
      // Set animating flag to prevent resize handlers from resetting collapsed state
      isAnimatingCollapseRef.current = true;
      setTimeout(() => {
        isAnimatingCollapseRef.current = false;
      }, animationDuration);

      // Set collapsed state immediately so content is visible as panel expands
      if (panel === 'left') {
        setLeftCollapsed(false);
        leftPanelRef.current?.expand();
      } else {
        setRightCollapsed(false);
        rightPanelRef.current?.expand();
      }
    },
    getLayout: () => ({
      left: leftSize,
      middle: middleSize,
      right: rightSize,
    }),
  }), [leftSize, middleSize, rightSize]);

  // Resize handlers - update state when panels are resized via drag
  const handleLeftResize = useCallback((panelSize: PanelSize) => {
    const size = panelSize.asPercentage;
    setLeftSize(size);

    // Skip collapsed state updates during programmatic collapse/expand animation
    if (isAnimatingCollapseRef.current) return;

    if (size > 0) {
      setLastExpandedLeftSize(size);
      setLeftCollapsed(false);
    } else {
      setLeftCollapsed(true);
    }
  }, []);

  const handleMiddleResize = useCallback((panelSize: PanelSize) => {
    const size = panelSize.asPercentage;
    setMiddleSize(size);

    // Skip collapsed state updates during programmatic collapse/expand animation
    if (isAnimatingCollapseRef.current) return;

    if (size > 0) {
      setLastExpandedMiddleSize(size);
      setMiddleCollapsed(false);
    } else {
      setMiddleCollapsed(true);
    }
  }, []);

  const handleRightResize = useCallback((panelSize: PanelSize) => {
    const size = panelSize.asPercentage;
    setRightSize(size);

    // Skip collapsed state updates during programmatic collapse/expand animation
    if (isAnimatingCollapseRef.current) return;

    if (size > 0) {
      setLastExpandedRightSize(size);
      setRightCollapsed(false);
    } else {
      setRightCollapsed(true);
    }
  }, []);

  // Drag handlers
  const handleDragEnd = useCallback(() => {
    if (onPanelResize) {
      // Use the last expanded size for collapsed panels to preserve their size
      const reportedLeftSize = leftCollapsed ? lastExpandedLeftSize : leftSize;
      const reportedMiddleSize = middleCollapsed ? lastExpandedMiddleSize : middleSize;
      const reportedRightSize = rightCollapsed ? lastExpandedRightSize : rightSize;

      onPanelResize({
        left: reportedLeftSize,
        middle: reportedMiddleSize,
        right: reportedRightSize,
      });
    }
  }, [leftSize, middleSize, rightSize, leftCollapsed, middleCollapsed, rightCollapsed, lastExpandedLeftSize, lastExpandedMiddleSize, lastExpandedRightSize, onPanelResize]);

  const handleDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleDragComplete = useCallback(() => {
    setIsDragging(false);
    handleDragEnd();
  }, [handleDragEnd]);

  // Note: The collapsed prop is only used for initial state.
  // After mount, collapsed state is managed internally via onResize callbacks.
  // Use the imperative API (setLayout) to programmatically change collapsed state.

  // Panel class helper
  const getPanelClassName = (panelName: 'left' | 'middle' | 'right') => {
    let className = 'three-panel-item';

    if (panelName === 'left') {
      if (collapsiblePanels.left || !isLeftActive) {
        className += ' collapsible-panel';
        if (leftCollapsed) className += ' collapsed';
      }
    } else if (panelName === 'middle') {
      className += ' middle-panel';
      if (collapsiblePanels.middle || !isMiddleActive) {
        className += ' collapsible-panel';
        if (middleCollapsed) className += ' collapsed';
      }
    } else if (panelName === 'right') {
      if (collapsiblePanels.right || !isRightActive) {
        className += ' collapsible-panel';
        if (rightCollapsed) className += ' collapsed';
      }
    }

    return className;
  };

  // Apply theme as CSS variables
  const themeStyles = mapThemeToPanelVars(theme) as React.CSSProperties;


  return (
    <div
      className={`three-panel-layout ${className} ${isDragging ? 'is-dragging' : ''} ${!hasMounted ? 'is-mounting' : ''}`}
      style={{
        ...themeStyles,
        ...style,
        '--panel-transition-duration': `${animationDuration}ms`,
        '--panel-transition-easing': animationEasing,
      } as React.CSSProperties}
    >
      <Group groupRef={panelGroupRef} orientation="horizontal" onLayoutChange={handleDragStart} onLayoutChanged={handleDragComplete}>
        {/* Left Panel */}
        <Panel
          id="left"
          panelRef={leftPanelRef}
          collapsible={collapsiblePanels.left || !isLeftActive}
          defaultSize={(collapsed.left || !isLeftActive) ? '0%' : `${computedDefaultSizes.left}%`}
          minSize="0%"
          collapsedSize="0%"
          onResize={handleLeftResize}
          className={getPanelClassName('left')}
          {...(slotDataAttributes.left || {})}
        >
          <div className="panel-content-wrapper">
            <PanelBoundsProvider slot="left">
              {leftPanel}
            </PanelBoundsProvider>
          </div>
        </Panel>

        {/* Left Resize Handle - between left and middle */}
        <Separator
          className={`resize-handle left-handle ${leftCollapsed || !isLeftActive || !isMiddleActive ? 'collapsed' : ''}`}
          disabled={leftCollapsed || !isLeftActive || !isMiddleActive}
        >
          {showCollapseButtons && collapsiblePanels.left && (
            <div className="handle-bar">
              <button
                onClick={toggleLeftPanel}
                className="collapse-toggle"
                aria-label={leftCollapsed ? 'Expand left panel' : 'Collapse left panel'}
              >
                {leftCollapsed ? '▸' : '◂'}
              </button>
            </div>
          )}
        </Separator>

        {/* Middle Panel */}
        <Panel
          id="middle"
          panelRef={middlePanelRef}
          collapsible={collapsiblePanels.middle || !isMiddleActive}
          defaultSize={(collapsed.middle || !isMiddleActive) ? '0%' : `${computedDefaultSizes.middle}%`}
          minSize="0%"
          collapsedSize="0%"
          onResize={handleMiddleResize}
          className={getPanelClassName('middle')}
          {...(slotDataAttributes.middle || {})}
        >
          <div className="panel-content-wrapper">
            <PanelBoundsProvider slot="middle">
              {middlePanel}
            </PanelBoundsProvider>
          </div>
        </Panel>

        {/* Right Resize Handle - between middle and right, OR between left and right if middle is inactive */}
        <Separator
          className={`resize-handle right-handle ${rightCollapsed || !isRightActive || (!isMiddleActive && !isLeftActive) ? 'collapsed' : ''}`}
          disabled={rightCollapsed || !isRightActive || (!isMiddleActive && !isLeftActive)}
        >
          {showCollapseButtons && collapsiblePanels.right && (
            <div className="handle-bar">
              <button
                onClick={toggleRightPanel}
                className="collapse-toggle"
                aria-label={rightCollapsed ? 'Expand right panel' : 'Collapse right panel'}
              >
                {rightCollapsed ? '◂' : '▸'}
              </button>
            </div>
          )}
        </Separator>

        {/* Right Panel */}
        <Panel
          id="right"
          panelRef={rightPanelRef}
          collapsible={collapsiblePanels.right || !isRightActive}
          defaultSize={(collapsed.right || !isRightActive) ? '0%' : `${computedDefaultSizes.right}%`}
          minSize="0%"
          collapsedSize="0%"
          onResize={handleRightResize}
          className={getPanelClassName('right')}
          {...(slotDataAttributes.right || {})}
        >
          <div className="panel-content-wrapper">
            <PanelBoundsProvider slot="right">
              {rightPanel}
            </PanelBoundsProvider>
          </div>
        </Panel>
      </Group>
    </div>
  );
});

// Add display name for debugging
ConfigurablePanelLayout.displayName = 'ConfigurablePanelLayout';