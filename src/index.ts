export { AnimatedResizableLayout, type AnimatedResizableLayoutProps } from './components/AnimatedResizableLayout';
export { AnimatedVerticalLayout, type AnimatedVerticalLayoutProps } from './components/AnimatedVerticalLayout';
export { ThreePanelLayout, type ThreePanelLayoutProps } from './components/ThreePanelLayout';
export { ConfigurablePanelLayout, type ConfigurablePanelLayoutProps, type PanelDefinitionWithContent } from './components/ConfigurablePanelLayout';
export { ResponsiveConfigurablePanelLayout, type ResponsiveConfigurablePanelLayoutProps } from './components/ResponsiveConfigurablePanelLayout';
export { EditableConfigurablePanelLayout, type EditableConfigurablePanelLayoutProps } from './components/EditableConfigurablePanelLayout';
export { PanelConfigurator, type PanelConfiguratorProps, type PanelDefinition, type PanelLayout, type PanelSlot, type PanelGroup, type TabsConfig, type TilesConfig } from './components/PanelConfigurator';
export { TabGroup, type TabGroupProps } from './components/TabGroup';
export { SnapCarousel, type SnapCarouselProps, type SnapCarouselRef } from './components/SnapCarousel';

// Types are kept for potential future use
export type {
  PanelOrientation,
  CollapsibleSide,
  ThemeMode,
  AnimationConfig,
  CollapseButtonConfig,
  PanelCallbacks,
} from './types';

// Theme exports
export { type Theme } from '@a24z/industry-theme';
export { mapThemeToPanelVars, mapThemeToTabVars } from './utils/themeMapping';

export { useMediaQuery } from './hooks/useMediaQuery';
export { useLocalStorage } from './hooks/useLocalStorage';