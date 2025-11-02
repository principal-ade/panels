import React, { ReactNode, useState, useRef, useEffect, useCallback } from 'react';
import { flushSync } from 'react-dom';
import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
  ImperativePanelHandle,
  ImperativePanelGroupHandle,
} from 'react-resizable-panels';
import { Theme } from '@a24z/industry-theme';
import { mapThemeToPanelVars } from '../utils/themeMapping';
import { PanelLayout, PanelSlot, PanelGroup as PanelGroupType, TabsConfig } from './PanelConfigurator';
import { TabGroup } from './TabGroup';
import './ConfigurablePanelLayout.css';

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

  /** Minimum sizes for each panel when expanded (0-100) - only specify for active panels */
  minSizes?: {
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
 */
export const ConfigurablePanelLayout: React.FC<ConfigurablePanelLayoutProps> = ({
  panels,
  layout,
  collapsiblePanels = { left: true, middle: false, right: true },
  defaultSizes = { left: 20, middle: 60, right: 20 },
  minSizes = { left: 5, middle: 10, right: 5 },
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
  onMiddleCollapseStart,
  onMiddleCollapseComplete,
  onMiddleExpandStart,
  onMiddleExpandComplete,
  onRightCollapseStart,
  onRightCollapseComplete,
  onRightExpandStart,
  onRightExpandComplete,
  onPanelResize,
}) => {
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

  const computedMinSizes = {
    left: minSizes?.left ?? 5,
    middle: minSizes?.middle ?? 10,
    right: minSizes?.right ?? 5,
  };

  // State for collapsed status - auto-collapse inactive panels
  const [leftCollapsed, setLeftCollapsed] = useState(collapsed.left || !isLeftActive);
  const [middleCollapsed, setMiddleCollapsed] = useState(collapsed.middle || !isMiddleActive);
  const [rightCollapsed, setRightCollapsed] = useState(collapsed.right || !isRightActive);

  // State for animation
  const [leftAnimating, setLeftAnimating] = useState(false);
  const [middleAnimating, setMiddleAnimating] = useState(false);
  const [rightAnimating, setRightAnimating] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const leftFullyCollapsed = leftCollapsed && !leftAnimating;
  const middleFullyCollapsed = middleCollapsed && !middleAnimating;
  const rightFullyCollapsed = rightCollapsed && !rightAnimating;

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
  const panelGroupRef = useRef<ImperativePanelGroupHandle>(null);
  const leftPanelRef = useRef<ImperativePanelHandle>(null);
  const middlePanelRef = useRef<ImperativePanelHandle>(null);
  const rightPanelRef = useRef<ImperativePanelHandle>(null);

  // Animation refs
  const leftAnimationFrameRef = useRef<number | undefined>(undefined);
  const middleAnimationFrameRef = useRef<number | undefined>(undefined);
  const rightAnimationFrameRef = useRef<number | undefined>(undefined);
  const leftStartTimeRef = useRef<number | undefined>(undefined);
  const middleStartTimeRef = useRef<number | undefined>(undefined);
  const rightStartTimeRef = useRef<number | undefined>(undefined);

  // Multi-panel animation function for coordinated resizing
  const animateMultiplePanels = useCallback(
    (
      animations: Array<{
        panelRef: React.RefObject<ImperativePanelHandle | null>;
        fromSize: number;
        toSize: number;
        animationFrameRef: React.MutableRefObject<number | undefined>;
        startTimeRef: React.MutableRefObject<number | undefined>;
      }>,
      onComplete?: () => void
    ) => {
      // Validate all panel refs exist
      const validAnimations = animations.filter(anim => anim.panelRef.current);
      if (validAnimations.length === 0) return;

      // Cancel any existing animations
      validAnimations.forEach(anim => {
        if (anim.animationFrameRef.current) {
          cancelAnimationFrame(anim.animationFrameRef.current);
        }
      });

      const steps = 10;
      let currentStep = 0;

      const animate = () => {
        currentStep++;
        const progress = currentStep / steps;

        if (progress >= 1) {
          // Final update - set all panels to their target sizes
          validAnimations.forEach(anim => {
            if (anim.panelRef.current) {
              if (anim.toSize === 0) {
                anim.panelRef.current.collapse();
              } else {
                anim.panelRef.current.resize(anim.toSize);
              }
            }
          });
          if (onComplete) onComplete();
          return;
        }

        // Apply easing
        const eased =
          progress < 0.5
            ? 4 * progress * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 3) / 2;

        // Update all panels simultaneously
        validAnimations.forEach(anim => {
          if (anim.panelRef.current) {
            const newSize = anim.fromSize + (anim.toSize - anim.fromSize) * eased;
            anim.panelRef.current.resize(newSize);
          }
        });

        // Schedule next update (use the first animation's ref for tracking)
        validAnimations[0].animationFrameRef.current = requestAnimationFrame(() => {
          setTimeout(animate, animationDuration / steps);
        });
      };

      animate();
    },
    [animationDuration]
  );

  // Left panel collapse/expand handlers
  const handleLeftCollapse = useCallback(() => {
    if (leftAnimating || isDragging || !collapsiblePanels.left) return;

    flushSync(() => {
      setLeftAnimating(true);
      setMiddleAnimating(true);
      setRightAnimating(true);
      setLeftCollapsed(true);
    });
    if (onLeftCollapseStart) onLeftCollapseStart();

    if (leftAnimationFrameRef.current) {
      cancelAnimationFrame(leftAnimationFrameRef.current);
    }

    leftAnimationFrameRef.current = requestAnimationFrame(() => {
      // Get the actual current layout
      const currentLayout = panelGroupRef.current?.getLayout();
      const actualLeftSize = Math.round((currentLayout?.[0] ?? leftSize) * 1000) / 1000;
      const actualMiddleSize = Math.round((currentLayout?.[1] ?? middleSize) * 1000) / 1000;
      const actualRightSize = Math.round((currentLayout?.[2] ?? rightSize) * 1000) / 1000;

      // Calculate proportional redistribution
      // Remaining panels get space proportionally to their current sizes
      const remainingTotal = actualMiddleSize + actualRightSize;
      const newMiddleSize = remainingTotal > 0 ? (actualMiddleSize / remainingTotal) * 100 : (isMiddleActive ? 50 : 0);
      const newRightSize = remainingTotal > 0 ? (actualRightSize / remainingTotal) * 100 : (isRightActive ? 50 : 0);

      // Update last expanded sizes for middle and right panels
      if (newMiddleSize > 0) setLastExpandedMiddleSize(newMiddleSize);
      if (newRightSize > 0) setLastExpandedRightSize(newRightSize);

      animateMultiplePanels(
        [
          {
            panelRef: leftPanelRef,
            fromSize: actualLeftSize,
            toSize: 0,
            animationFrameRef: leftAnimationFrameRef,
            startTimeRef: leftStartTimeRef,
          },
          {
            panelRef: middlePanelRef,
            fromSize: actualMiddleSize,
            toSize: newMiddleSize,
            animationFrameRef: middleAnimationFrameRef,
            startTimeRef: middleStartTimeRef,
          },
          {
            panelRef: rightPanelRef,
            fromSize: actualRightSize,
            toSize: newRightSize,
            animationFrameRef: rightAnimationFrameRef,
            startTimeRef: rightStartTimeRef,
          },
        ],
        () => {
          setLeftSize(0);
          setMiddleSize(newMiddleSize);
          setRightSize(newRightSize);
          setLeftAnimating(false);
          setMiddleAnimating(false);
          setRightAnimating(false);
          if (onLeftCollapseComplete) onLeftCollapseComplete();
        }
      );
    });
  }, [
    leftAnimating,
    isDragging,
    leftSize,
    middleSize,
    rightSize,
    isMiddleActive,
    isRightActive,
    collapsiblePanels.left,
    animateMultiplePanels,
    onLeftCollapseStart,
    onLeftCollapseComplete,
  ]);

  const handleLeftExpand = useCallback(() => {
    if (leftAnimating || isDragging || !collapsiblePanels.left) return;

    flushSync(() => {
      setLeftAnimating(true);
      setMiddleAnimating(true);
      setRightAnimating(true);
      setLeftCollapsed(false);
    });
    if (onLeftExpandStart) onLeftExpandStart();

    if (leftAnimationFrameRef.current) {
      cancelAnimationFrame(leftAnimationFrameRef.current);
    }

    leftAnimationFrameRef.current = requestAnimationFrame(() => {
      // Get the actual current layout
      const currentLayout = panelGroupRef.current?.getLayout();
      const actualLeftSize = Math.round((currentLayout?.[0] ?? 0) * 1000) / 1000;
      const actualMiddleSize = Math.round((currentLayout?.[1] ?? middleSize) * 1000) / 1000;
      const actualRightSize = Math.round((currentLayout?.[2] ?? rightSize) * 1000) / 1000;

      // Use the last expanded size to restore the panel to its previous size
      const targetLeftSize = lastExpandedLeftSize || computedDefaultSizes.left;

      // Calculate proportional redistribution for other panels
      // They need to shrink proportionally to make room
      const spaceForOthers = 100 - targetLeftSize;
      const currentOthersTotal = actualMiddleSize + actualRightSize;
      const newMiddleSize = currentOthersTotal > 0 ? (actualMiddleSize / currentOthersTotal) * spaceForOthers : (isMiddleActive ? spaceForOthers / 2 : 0);
      const newRightSize = currentOthersTotal > 0 ? (actualRightSize / currentOthersTotal) * spaceForOthers : (isRightActive ? spaceForOthers / 2 : 0);

      // Update last expanded sizes for middle and right panels
      if (newMiddleSize > 0) setLastExpandedMiddleSize(newMiddleSize);
      if (newRightSize > 0) setLastExpandedRightSize(newRightSize);

      animateMultiplePanels(
        [
          {
            panelRef: leftPanelRef,
            fromSize: actualLeftSize,
            toSize: targetLeftSize,
            animationFrameRef: leftAnimationFrameRef,
            startTimeRef: leftStartTimeRef,
          },
          {
            panelRef: middlePanelRef,
            fromSize: actualMiddleSize,
            toSize: newMiddleSize,
            animationFrameRef: middleAnimationFrameRef,
            startTimeRef: middleStartTimeRef,
          },
          {
            panelRef: rightPanelRef,
            fromSize: actualRightSize,
            toSize: newRightSize,
            animationFrameRef: rightAnimationFrameRef,
            startTimeRef: rightStartTimeRef,
          },
        ],
        () => {
          setLeftSize(targetLeftSize);
          setMiddleSize(newMiddleSize);
          setRightSize(newRightSize);
          setLeftAnimating(false);
          setMiddleAnimating(false);
          setRightAnimating(false);
          if (onLeftExpandComplete) onLeftExpandComplete();
        }
      );
    });
  }, [
    leftAnimating,
    isDragging,
    middleSize,
    rightSize,
    computedDefaultSizes.left,
    lastExpandedLeftSize,
    isMiddleActive,
    isRightActive,
    collapsiblePanels.left,
    animateMultiplePanels,
    onLeftExpandStart,
    onLeftExpandComplete,
  ]);

  // Right panel collapse/expand handlers
  const handleRightCollapse = useCallback(() => {
    if (rightAnimating || isDragging || !collapsiblePanels.right) return;

    flushSync(() => {
      setLeftAnimating(true);
      setMiddleAnimating(true);
      setRightAnimating(true);
      setRightCollapsed(true);
    });
    if (onRightCollapseStart) onRightCollapseStart();

    if (rightAnimationFrameRef.current) {
      cancelAnimationFrame(rightAnimationFrameRef.current);
    }

    rightAnimationFrameRef.current = requestAnimationFrame(() => {
      // Get the actual current layout
      const currentLayout = panelGroupRef.current?.getLayout();
      const actualLeftSize = Math.round((currentLayout?.[0] ?? leftSize) * 1000) / 1000;
      const actualMiddleSize = Math.round((currentLayout?.[1] ?? middleSize) * 1000) / 1000;
      const actualRightSize = Math.round((currentLayout?.[2] ?? rightSize) * 1000) / 1000;

      // Calculate proportional redistribution
      const remainingTotal = actualLeftSize + actualMiddleSize;
      const newLeftSize = remainingTotal > 0 ? (actualLeftSize / remainingTotal) * 100 : (isLeftActive ? 50 : 0);
      const newMiddleSize = remainingTotal > 0 ? (actualMiddleSize / remainingTotal) * 100 : (isMiddleActive ? 50 : 0);

      // Update last expanded sizes for left and middle panels
      if (newLeftSize > 0) setLastExpandedLeftSize(newLeftSize);
      if (newMiddleSize > 0) setLastExpandedMiddleSize(newMiddleSize);

      animateMultiplePanels(
        [
          {
            panelRef: leftPanelRef,
            fromSize: actualLeftSize,
            toSize: newLeftSize,
            animationFrameRef: leftAnimationFrameRef,
            startTimeRef: leftStartTimeRef,
          },
          {
            panelRef: middlePanelRef,
            fromSize: actualMiddleSize,
            toSize: newMiddleSize,
            animationFrameRef: middleAnimationFrameRef,
            startTimeRef: middleStartTimeRef,
          },
          {
            panelRef: rightPanelRef,
            fromSize: actualRightSize,
            toSize: 0,
            animationFrameRef: rightAnimationFrameRef,
            startTimeRef: rightStartTimeRef,
          },
        ],
        () => {
          setLeftSize(newLeftSize);
          setMiddleSize(newMiddleSize);
          setRightSize(0);
          setLeftAnimating(false);
          setMiddleAnimating(false);
          setRightAnimating(false);
          if (onRightCollapseComplete) onRightCollapseComplete();
        }
      );
    });
  }, [
    rightAnimating,
    isDragging,
    leftSize,
    middleSize,
    rightSize,
    isLeftActive,
    isMiddleActive,
    collapsiblePanels.right,
    animateMultiplePanels,
    onRightCollapseStart,
    onRightCollapseComplete,
  ]);

  const handleRightExpand = useCallback(() => {
    if (rightAnimating || isDragging || !collapsiblePanels.right) return;

    flushSync(() => {
      setLeftAnimating(true);
      setMiddleAnimating(true);
      setRightAnimating(true);
      setRightCollapsed(false);
    });
    if (onRightExpandStart) onRightExpandStart();

    if (rightAnimationFrameRef.current) {
      cancelAnimationFrame(rightAnimationFrameRef.current);
    }

    rightAnimationFrameRef.current = requestAnimationFrame(() => {
      // Get the actual current layout
      const currentLayout = panelGroupRef.current?.getLayout();
      const actualLeftSize = Math.round((currentLayout?.[0] ?? leftSize) * 1000) / 1000;
      const actualMiddleSize = Math.round((currentLayout?.[1] ?? middleSize) * 1000) / 1000;
      const actualRightSize = Math.round((currentLayout?.[2] ?? 0) * 1000) / 1000;

      // Use the last expanded size to restore the panel to its previous size
      const targetRightSize = lastExpandedRightSize || computedDefaultSizes.right;

      // Calculate proportional redistribution for other panels
      const spaceForOthers = 100 - targetRightSize;
      const currentOthersTotal = actualLeftSize + actualMiddleSize;
      const newLeftSize = currentOthersTotal > 0 ? (actualLeftSize / currentOthersTotal) * spaceForOthers : (isLeftActive ? spaceForOthers / 2 : 0);
      const newMiddleSize = currentOthersTotal > 0 ? (actualMiddleSize / currentOthersTotal) * spaceForOthers : (isMiddleActive ? spaceForOthers / 2 : 0);

      // Update last expanded sizes for left and middle panels
      if (newLeftSize > 0) setLastExpandedLeftSize(newLeftSize);
      if (newMiddleSize > 0) setLastExpandedMiddleSize(newMiddleSize);

      animateMultiplePanels(
        [
          {
            panelRef: leftPanelRef,
            fromSize: actualLeftSize,
            toSize: newLeftSize,
            animationFrameRef: leftAnimationFrameRef,
            startTimeRef: leftStartTimeRef,
          },
          {
            panelRef: middlePanelRef,
            fromSize: actualMiddleSize,
            toSize: newMiddleSize,
            animationFrameRef: middleAnimationFrameRef,
            startTimeRef: middleStartTimeRef,
          },
          {
            panelRef: rightPanelRef,
            fromSize: actualRightSize,
            toSize: targetRightSize,
            animationFrameRef: rightAnimationFrameRef,
            startTimeRef: rightStartTimeRef,
          },
        ],
        () => {
          setLeftSize(newLeftSize);
          setMiddleSize(newMiddleSize);
          setRightSize(targetRightSize);
          setLeftAnimating(false);
          setMiddleAnimating(false);
          setRightAnimating(false);
          if (onRightExpandComplete) onRightExpandComplete();
        }
      );
    });
  }, [
    rightAnimating,
    isDragging,
    leftSize,
    middleSize,
    computedDefaultSizes.right,
    lastExpandedRightSize,
    isLeftActive,
    isMiddleActive,
    collapsiblePanels.right,
    animateMultiplePanels,
    onRightExpandStart,
    onRightExpandComplete,
  ]);

  // Toggle handlers
  const toggleLeftPanel = useCallback(() => {
    if (leftCollapsed) {
      handleLeftExpand();
    } else {
      handleLeftCollapse();
    }
  }, [leftCollapsed, handleLeftCollapse, handleLeftExpand]);

  // Middle panel collapse/expand handlers
  const handleMiddleCollapse = useCallback(() => {
    if (middleAnimating || isDragging || !collapsiblePanels.middle) return;

    flushSync(() => {
      setLeftAnimating(true);
      setMiddleAnimating(true);
      setRightAnimating(true);
      setMiddleCollapsed(true);
    });
    if (onMiddleCollapseStart) onMiddleCollapseStart();

    if (middleAnimationFrameRef.current) {
      cancelAnimationFrame(middleAnimationFrameRef.current);
    }

    middleAnimationFrameRef.current = requestAnimationFrame(() => {
      const currentLayout = panelGroupRef.current?.getLayout();
      const actualLeftSize = Math.round((currentLayout?.[0] ?? leftSize) * 1000) / 1000;
      const actualMiddleSize = Math.round((currentLayout?.[1] ?? middleSize) * 1000) / 1000;
      const actualRightSize = Math.round((currentLayout?.[2] ?? rightSize) * 1000) / 1000;

      // Calculate proportional redistribution
      const remainingTotal = actualLeftSize + actualRightSize;
      const newLeftSize = remainingTotal > 0 ? (actualLeftSize / remainingTotal) * 100 : (isLeftActive ? 50 : 0);
      const newRightSize = remainingTotal > 0 ? (actualRightSize / remainingTotal) * 100 : (isRightActive ? 50 : 0);

      // Update last expanded sizes for left and right panels
      if (newLeftSize > 0) setLastExpandedLeftSize(newLeftSize);
      if (newRightSize > 0) setLastExpandedRightSize(newRightSize);

      animateMultiplePanels(
        [
          {
            panelRef: leftPanelRef,
            fromSize: actualLeftSize,
            toSize: newLeftSize,
            animationFrameRef: leftAnimationFrameRef,
            startTimeRef: leftStartTimeRef,
          },
          {
            panelRef: middlePanelRef,
            fromSize: actualMiddleSize,
            toSize: 0,
            animationFrameRef: middleAnimationFrameRef,
            startTimeRef: middleStartTimeRef,
          },
          {
            panelRef: rightPanelRef,
            fromSize: actualRightSize,
            toSize: newRightSize,
            animationFrameRef: rightAnimationFrameRef,
            startTimeRef: rightStartTimeRef,
          },
        ],
        () => {
          setLeftSize(newLeftSize);
          setMiddleSize(0);
          setRightSize(newRightSize);
          setLeftAnimating(false);
          setMiddleAnimating(false);
          setRightAnimating(false);
          if (onMiddleCollapseComplete) onMiddleCollapseComplete();
        }
      );
    });
  }, [
    middleAnimating,
    isDragging,
    leftSize,
    middleSize,
    rightSize,
    isLeftActive,
    isRightActive,
    collapsiblePanels.middle,
    animateMultiplePanels,
    onMiddleCollapseStart,
    onMiddleCollapseComplete,
  ]);

  const handleMiddleExpand = useCallback(() => {
    if (middleAnimating || isDragging || !collapsiblePanels.middle) return;

    flushSync(() => {
      setLeftAnimating(true);
      setMiddleAnimating(true);
      setRightAnimating(true);
      setMiddleCollapsed(false);
    });
    if (onMiddleExpandStart) onMiddleExpandStart();

    if (middleAnimationFrameRef.current) {
      cancelAnimationFrame(middleAnimationFrameRef.current);
    }

    middleAnimationFrameRef.current = requestAnimationFrame(() => {
      // Get the actual current layout
      const currentLayout = panelGroupRef.current?.getLayout();
      const actualLeftSize = Math.round((currentLayout?.[0] ?? leftSize) * 1000) / 1000;
      const actualMiddleSize = Math.round((currentLayout?.[1] ?? 0) * 1000) / 1000;
      const actualRightSize = Math.round((currentLayout?.[2] ?? rightSize) * 1000) / 1000;

      const targetMiddleSize = lastExpandedMiddleSize || computedDefaultSizes.middle;

      // Calculate proportional redistribution for other panels
      const spaceForOthers = 100 - targetMiddleSize;
      const currentOthersTotal = actualLeftSize + actualRightSize;
      const newLeftSize = currentOthersTotal > 0 ? (actualLeftSize / currentOthersTotal) * spaceForOthers : (isLeftActive ? spaceForOthers / 2 : 0);
      const newRightSize = currentOthersTotal > 0 ? (actualRightSize / currentOthersTotal) * spaceForOthers : (isRightActive ? spaceForOthers / 2 : 0);

      // Update last expanded sizes for left and right panels
      if (newLeftSize > 0) setLastExpandedLeftSize(newLeftSize);
      if (newRightSize > 0) setLastExpandedRightSize(newRightSize);

      animateMultiplePanels(
        [
          {
            panelRef: leftPanelRef,
            fromSize: actualLeftSize,
            toSize: newLeftSize,
            animationFrameRef: leftAnimationFrameRef,
            startTimeRef: leftStartTimeRef,
          },
          {
            panelRef: middlePanelRef,
            fromSize: actualMiddleSize,
            toSize: targetMiddleSize,
            animationFrameRef: middleAnimationFrameRef,
            startTimeRef: middleStartTimeRef,
          },
          {
            panelRef: rightPanelRef,
            fromSize: actualRightSize,
            toSize: newRightSize,
            animationFrameRef: rightAnimationFrameRef,
            startTimeRef: rightStartTimeRef,
          },
        ],
        () => {
          setLeftSize(newLeftSize);
          setMiddleSize(targetMiddleSize);
          setRightSize(newRightSize);
          setLeftAnimating(false);
          setMiddleAnimating(false);
          setRightAnimating(false);
          if (onMiddleExpandComplete) onMiddleExpandComplete();
        }
      );
    });
  }, [
    middleAnimating,
    isDragging,
    leftSize,
    rightSize,
    computedDefaultSizes.middle,
    lastExpandedMiddleSize,
    isLeftActive,
    isRightActive,
    collapsiblePanels.middle,
    animateMultiplePanels,
    onMiddleExpandStart,
    onMiddleExpandComplete,
  ]);

  // Note: toggleMiddlePanel can be added if middle panel collapse buttons are needed
  // const toggleMiddlePanel = useCallback(() => {
  //   if (middleCollapsed) {
  //     handleMiddleExpand();
  //   } else {
  //     handleMiddleCollapse();
  //   }
  // }, [middleCollapsed, handleMiddleCollapse, handleMiddleExpand]);

  const toggleRightPanel = useCallback(() => {
    if (rightCollapsed) {
      handleRightExpand();
    } else {
      handleRightCollapse();
    }
  }, [rightCollapsed, handleRightCollapse, handleRightExpand]);

  // Resize handlers
  const handleLeftResize = useCallback((size: number) => {
    if (!leftAnimating && !middleAnimating && !rightAnimating) {
      setLeftSize(size);
      // Track the last expanded size (only when > 0)
      if (size > 0) {
        setLastExpandedLeftSize(size);
        setLeftCollapsed(false);
      }
    }
  }, [leftAnimating, middleAnimating, rightAnimating]);

  const handleMiddleResize = useCallback((size: number) => {
    if (!leftAnimating && !middleAnimating && !rightAnimating) {
      setMiddleSize(size);
      // Track the last expanded size (only when > 0)
      if (size > 0) {
        setLastExpandedMiddleSize(size);
        setMiddleCollapsed(false);
      }
    }
  }, [leftAnimating, middleAnimating, rightAnimating]);

  const handleRightResize = useCallback((size: number) => {
    if (!leftAnimating && !middleAnimating && !rightAnimating) {
      setRightSize(size);
      // Track the last expanded size (only when > 0)
      if (size > 0) {
        setLastExpandedRightSize(size);
        setRightCollapsed(false);
      }
    }
  }, [leftAnimating, middleAnimating, rightAnimating]);

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

  const handleDragging = useCallback(
    (dragging: boolean) => {
      setIsDragging(dragging);
      if (!dragging) {
        handleDragEnd();
      }
    },
    [handleDragEnd]
  );

  // Effect for external collapsed prop changes
  useEffect(() => {
    if (collapsed.left !== undefined && collapsed.left !== leftCollapsed) {
      // Defer to next tick to avoid flushSync warning
      queueMicrotask(() => {
        if (collapsed.left) {
          handleLeftCollapse();
        } else {
          handleLeftExpand();
        }
      });
    }
  }, [collapsed.left, leftCollapsed, handleLeftCollapse, handleLeftExpand]);

  useEffect(() => {
    if (collapsed.middle !== undefined && collapsed.middle !== middleCollapsed) {
      // Defer to next tick to avoid flushSync warning
      queueMicrotask(() => {
        if (collapsed.middle) {
          handleMiddleCollapse();
        } else {
          handleMiddleExpand();
        }
      });
    }
  }, [collapsed.middle, middleCollapsed, handleMiddleCollapse, handleMiddleExpand]);

  useEffect(() => {
    if (collapsed.right !== undefined && collapsed.right !== rightCollapsed) {
      // Defer to next tick to avoid flushSync warning
      queueMicrotask(() => {
        if (collapsed.right) {
          handleRightCollapse();
        } else {
          handleRightExpand();
        }
      });
    }
  }, [collapsed.right, rightCollapsed, handleRightCollapse, handleRightExpand]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (leftAnimationFrameRef.current) {
        cancelAnimationFrame(leftAnimationFrameRef.current);
      }
      if (middleAnimationFrameRef.current) {
        cancelAnimationFrame(middleAnimationFrameRef.current);
      }
      if (rightAnimationFrameRef.current) {
        cancelAnimationFrame(rightAnimationFrameRef.current);
      }
    };
  }, []);

  // Panel class helper
  const getPanelClassName = (panelName: 'left' | 'middle' | 'right') => {
    let className = 'three-panel-item';

    if (panelName === 'left') {
      if (collapsiblePanels.left || !isLeftActive) {
        className += ' collapsible-panel';
        if (leftAnimating && !isDragging) className += ' animating';
        if (leftFullyCollapsed) className += ' collapsed';
      }
    } else if (panelName === 'middle') {
      className += ' middle-panel';
      if (collapsiblePanels.middle || !isMiddleActive) {
        className += ' collapsible-panel';
        if (middleAnimating && !isDragging) className += ' animating';
        if (middleFullyCollapsed) className += ' collapsed';
      }
    } else if (panelName === 'right') {
      if (collapsiblePanels.right || !isRightActive) {
        className += ' collapsible-panel';
        if (rightAnimating && !isDragging) className += ' animating';
        if (rightFullyCollapsed) className += ' collapsed';
      }
    }

    return className;
  };

  const leftCollapsiblePanelStyle =
    leftAnimating && !isDragging
      ? ({
          transition: `width ${animationDuration}ms ${animationEasing}`,
          width: leftCollapsed ? '0%' : `${computedDefaultSizes.left}%`
        } satisfies React.CSSProperties)
      : undefined;

  const middleCollapsiblePanelStyle =
    middleAnimating && !isDragging
      ? ({
          transition: `width ${animationDuration}ms ${animationEasing}`,
          width: middleCollapsed ? '0%' : `${computedDefaultSizes.middle}%`
        } satisfies React.CSSProperties)
      : undefined;

  const rightCollapsiblePanelStyle =
    rightAnimating && !isDragging
      ? ({
          transition: `width ${animationDuration}ms ${animationEasing}`,
          width: rightCollapsed ? '0%' : `${computedDefaultSizes.right}%`
        } satisfies React.CSSProperties)
      : undefined;

  // Apply theme as CSS variables
  const themeStyles = mapThemeToPanelVars(theme) as React.CSSProperties;

  const leftPanelMinSize = leftAnimating || middleAnimating || rightAnimating ? 0 : computedMinSizes.left;
  const middlePanelMinSize = leftAnimating || middleAnimating || rightAnimating ? 0 : computedMinSizes.middle;
  const rightPanelMinSize = leftAnimating || middleAnimating || rightAnimating ? 0 : computedMinSizes.right;

  return (
    <div className={`three-panel-layout ${className}`} style={{ ...themeStyles, ...style }}>
      <PanelGroup ref={panelGroupRef} direction="horizontal" onLayout={handleDragEnd}>
        {/* Left Panel */}
        <Panel
          ref={leftPanelRef}
          collapsible={collapsiblePanels.left || !isLeftActive}
          defaultSize={(collapsed.left || !isLeftActive) ? 0 : computedDefaultSizes.left}
          minSize={leftPanelMinSize}
          collapsedSize={0}
          onResize={handleLeftResize}
          onCollapse={() => setLeftCollapsed(true)}
          onExpand={() => setLeftCollapsed(false)}
          className={getPanelClassName('left')}
          style={leftCollapsiblePanelStyle}
        >
          <div
            className="panel-content-wrapper"
            style={{
              opacity: leftCollapsed ? 0 : 1,
              transition: leftAnimating
                ? `opacity ${animationDuration * 0.5}ms ${animationEasing}`
                : 'none',
            }}
          >
            {leftPanel}
          </div>
        </Panel>

        {/* Left Resize Handle - between left and middle */}
        <PanelResizeHandle
          className={`resize-handle left-handle ${leftFullyCollapsed || !isLeftActive || !isMiddleActive ? 'collapsed' : ''}`}
          onDragging={handleDragging}
          disabled={leftFullyCollapsed || !isLeftActive || !isMiddleActive}
        >
          {showCollapseButtons && collapsiblePanels.left && (
            <div className="handle-bar">
              <button
                onClick={toggleLeftPanel}
                className="collapse-toggle"
                disabled={leftAnimating}
                aria-label={leftCollapsed ? 'Expand left panel' : 'Collapse left panel'}
              >
                {leftCollapsed ? '▸' : '◂'}
              </button>
            </div>
          )}
        </PanelResizeHandle>

        {/* Middle Panel */}
        <Panel
          ref={middlePanelRef}
          collapsible={collapsiblePanels.middle || !isMiddleActive}
          defaultSize={(collapsed.middle || !isMiddleActive) ? 0 : computedDefaultSizes.middle}
          minSize={middlePanelMinSize}
          collapsedSize={0}
          onResize={handleMiddleResize}
          onCollapse={() => setMiddleCollapsed(true)}
          onExpand={() => setMiddleCollapsed(false)}
          className={getPanelClassName('middle')}
          style={middleCollapsiblePanelStyle}
        >
          <div
            className="panel-content-wrapper"
            style={{
              opacity: middleCollapsed ? 0 : 1,
              transition: middleAnimating
                ? `opacity ${animationDuration * 0.5}ms ${animationEasing}`
                : 'none',
            }}
          >
            {middlePanel}
          </div>
        </Panel>

        {/* Right Resize Handle - between middle and right, OR between left and right if middle is inactive */}
        <PanelResizeHandle
          className={`resize-handle right-handle ${rightFullyCollapsed || !isRightActive || (!isMiddleActive && !isLeftActive) ? 'collapsed' : ''}`}
          onDragging={handleDragging}
          disabled={rightFullyCollapsed || !isRightActive || (!isMiddleActive && !isLeftActive)}
        >
          {showCollapseButtons && collapsiblePanels.right && (
            <div className="handle-bar">
              <button
                onClick={toggleRightPanel}
                className="collapse-toggle"
                disabled={rightAnimating}
                aria-label={rightCollapsed ? 'Expand right panel' : 'Collapse right panel'}
              >
                {rightCollapsed ? '◂' : '▸'}
              </button>
            </div>
          )}
        </PanelResizeHandle>

        {/* Right Panel */}
        <Panel
          ref={rightPanelRef}
          collapsible={collapsiblePanels.right || !isRightActive}
          defaultSize={(collapsed.right || !isRightActive) ? 0 : computedDefaultSizes.right}
          minSize={rightPanelMinSize}
          collapsedSize={0}
          onResize={handleRightResize}
          onCollapse={() => setRightCollapsed(true)}
          onExpand={() => setRightCollapsed(false)}
          className={getPanelClassName('right')}
          style={rightCollapsiblePanelStyle}
        >
          <div
            className="panel-content-wrapper"
            style={{
              opacity: rightCollapsed ? 0 : 1,
              transition: rightAnimating
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