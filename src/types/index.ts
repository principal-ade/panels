// Basic types for panel components

export type PanelOrientation = 'horizontal' | 'vertical';
export type CollapsibleSide = 'left' | 'right' | 'both' | 'none';
export type ThemeMode = 'light' | 'dark' | 'auto';
export type MobileLayout = 'stack' | 'tabs' | 'drawer';
export type TabletLayout = 'two-panel' | 'drawer-main';
export type DesktopLayout = 'three-panel' | 'two-panel';

export interface AnimationConfig {
  duration?: number;
  easing?: string;
}

export interface CollapseButtonConfig {
  show?: boolean;
  position?: 'handle' | 'panel' | 'both';
}

export interface PanelCallbacks {
  onPanelResize?: (sizes: number[]) => void;
  onPanelCollapse?: (panel: string) => void;
  onPanelExpand?: (panel: string) => void;
  onCollapseStart?: (panel: string) => void;
  onCollapseComplete?: (panel: string) => void;
  onExpandStart?: (panel: string) => void;
  onExpandComplete?: (panel: string) => void;
}

// Component-specific props removed - using AnimatedResizableLayout only

// Panel bounds types for viewport-relative positioning
/**
 * Panel slot identifier
 */
export type PanelSlotPosition = 'left' | 'middle' | 'right';

/**
 * Represents the bounds of a panel slot relative to the viewport
 */
export interface PanelBounds {
  /** Distance from the left edge of the viewport in pixels */
  x: number;
  /** Distance from the top edge of the viewport in pixels */
  y: number;
  /** Width of the panel in pixels */
  width: number;
  /** Height of the panel in pixels */
  height: number;
}

/**
 * Context value provided by PanelBoundsProvider
 */
export interface PanelBoundsContextValue {
  /** The current slot this panel is in */
  slot: PanelSlotPosition;
  /** The bounds of this panel relative to the viewport */
  bounds: PanelBounds;
}

