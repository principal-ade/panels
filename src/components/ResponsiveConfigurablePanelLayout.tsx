import React, { ReactNode, useMemo, useRef, useState } from 'react';
import { ConfigurablePanelLayout, ConfigurablePanelLayoutProps } from './ConfigurablePanelLayout';
import { PanelGroup as PanelGroupType, PanelSlot, TabsConfig } from './PanelConfigurator';
import { TabGroup } from './TabGroup';
import { SnapCarousel, SnapCarouselProps, SnapCarouselRef } from './SnapCarousel';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { mapThemeToTabVars } from '../utils/themeMapping';
import './MobileTabNav.css';

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

interface MobileSlotInfo {
  content: ReactNode;
  label: string;
}

/**
 * ResponsiveConfigurablePanelLayout - Renders ConfigurablePanelLayout on desktop widths
 * and automatically swaps to a bottom-tab-controlled carousel experience on mobile.
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
  const carouselRef = useRef<SnapCarouselRef>(null);
  const [activeTabIndex, setActiveTabIndex] = useState(0);

  const orderedSlots: (PanelSlot | undefined)[] = useMemo(() => [layout?.left, layout?.middle, layout?.right], [layout]);

  const mobileSlots = useMemo(() => {
    const getPanelContent = (panelId: string | null): ReactNode => {
      if (!panelId) return null;
      const panel = panels.find(p => p.id === panelId);
      return panel?.content ?? null;
    };

    const getPanelLabel = (panelId: string): string => {
      const panel = panels.find(p => p.id === panelId);
      return panel?.label ?? panelId;
    };

    const processSlot = (slot: PanelSlot | undefined): MobileSlotInfo | null => {
      if (slot === null || slot === undefined) return null;

      if (typeof slot === 'object' && 'type' in slot) {
        const group = slot as PanelGroupType;
        if (group.type === 'tabs') {
          // For tab groups, use the first panel's label as the slot label
          const firstPanelLabel = group.panels.length > 0 ? getPanelLabel(group.panels[0]) : 'Tab Group';
          return {
            content: (
              <TabGroup
                panelIds={group.panels}
                panels={panels}
                config={group.config as TabsConfig}
                theme={theme}
              />
            ),
            label: firstPanelLabel,
          };
        }
        // Future group types (e.g., tiles) can be added here
        return null;
      }

      // Single panel
      return {
        content: getPanelContent(slot),
        label: getPanelLabel(slot),
      };
    };

    return orderedSlots
      .map(processSlot)
      .filter((info): info is MobileSlotInfo => info !== null);
  }, [orderedSlots, panels, theme]);

  const handleTabClick = (index: number) => {
    setActiveTabIndex(index);
    carouselRef.current?.scrollToPanel(index);
  };

  const handlePanelChange = (index: number) => {
    setActiveTabIndex(index);
  };

  // Apply theme as CSS variables for tabs
  const themeStyles = mapThemeToTabVars(theme) as React.CSSProperties;

  if (isMobile) {
    if (mobileSlots.length === 0) {
      return null;
    }

    const panelContents = mobileSlots.map(slot => slot.content);

    return (
      <div className="mobile-tab-layout" style={themeStyles}>
        <div className="mobile-tab-content">
          <SnapCarousel
            ref={carouselRef}
            theme={theme}
            panels={panelContents}
            minPanelWidth={0}
            idealPanelWidth={1}
            disableSwipe={true}
            onPanelChange={handlePanelChange}
            {...mobileCarouselProps}
          />
        </div>
        <nav className="mobile-tab-nav" role="tablist">
          {mobileSlots.map((slot, index) => (
            <button
              key={index}
              role="tab"
              aria-selected={index === activeTabIndex}
              className={`mobile-tab-button ${index === activeTabIndex ? 'active' : ''}`}
              onClick={() => handleTabClick(index)}
            >
              {slot.label}
            </button>
          ))}
        </nav>
      </div>
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
