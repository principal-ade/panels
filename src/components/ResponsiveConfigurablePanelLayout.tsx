import React, { ReactNode, useMemo } from 'react';
import { ConfigurablePanelLayout, ConfigurablePanelLayoutProps } from './ConfigurablePanelLayout';
import { PanelGroup as PanelGroupType, PanelSlot, TabsConfig } from './PanelConfigurator';
import { TabGroup } from './TabGroup';
import { SnapCarousel, SnapCarouselProps } from './SnapCarousel';
import { useMediaQuery } from '../hooks/useMediaQuery';

export interface ResponsiveConfigurablePanelLayoutProps extends ConfigurablePanelLayoutProps {
  /**
   * Media query used to determine when to switch to the mobile carousel layout.
   * Defaults to `(max-width: 768px)`.
   */
  mobileBreakpoint?: string;

  /**
   * Additional props passed to the SnapCarousel when the mobile layout is active.
   * The `panels` and `theme` props are managed by this component.
   */
  mobileCarouselProps?: Omit<SnapCarouselProps, 'panels' | 'theme'>;
}

/**
 * ResponsiveConfigurablePanelLayout - Renders ConfigurablePanelLayout on desktop widths
 * and automatically swaps to a SnapCarousel-powered experience on mobile.
 */
export const ResponsiveConfigurablePanelLayout: React.FC<ResponsiveConfigurablePanelLayoutProps> = ({
  mobileBreakpoint = '(max-width: 768px)',
  mobileCarouselProps,
  theme,
  layout,
  panels,
  ...rest
}) => {
  const isMobile = useMediaQuery(mobileBreakpoint);

  const orderedSlots: (PanelSlot | undefined)[] = useMemo(() => [layout?.left, layout?.middle, layout?.right], [layout]);

  const mobilePanels = useMemo(() => {
    const getPanelContent = (panelId: string | null): ReactNode => {
      if (!panelId) return null;
      const panel = panels.find(p => p.id === panelId);
      return panel?.content ?? null;
    };

    const renderPanelSlot = (slot: PanelSlot | undefined): ReactNode | null => {
      if (slot === null || slot === undefined) return null;

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
        // Future group types (e.g., tiles) can be added here
        return null;
      }

      return getPanelContent(slot);
    };

    return orderedSlots
      .map(renderPanelSlot)
      .filter((panelContent): panelContent is ReactNode => panelContent !== null);
  }, [orderedSlots, panels, theme]);

  if (isMobile) {
    if (mobilePanels.length === 0) {
      return null;
    }

    return (
      <SnapCarousel
        theme={theme}
        panels={mobilePanels}
        {...mobileCarouselProps}
      />
    );
  }

  return (
    <ConfigurablePanelLayout
      theme={theme}
      layout={layout}
      panels={panels}
      {...rest}
    />
  );
};
