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
   * Note: `onPanelChange` is merged with internal handler - use it to get notified of panel changes.
   */
  mobileCarouselProps?: Omit<SnapCarouselProps, 'panels' | 'theme'>;

  /**
   * Callback fired when the active panel changes in mobile view.
   * Receives the panel index (0=left, 1=middle, 2=right) and the slot name.
   */
  onMobilePanelChange?: (index: number, slot: 'left' | 'middle' | 'right') => void;
}

interface MobileSlotInfo {
  content: ReactNode;
  label: string;
  slot: 'left' | 'middle' | 'right';
}

/**
 * ResponsiveConfigurablePanelLayout - Renders ConfigurablePanelLayout on desktop widths
 * and automatically swaps to a bottom-tab-controlled carousel experience on mobile.
 */
export const ResponsiveConfigurablePanelLayout: React.FC<ResponsiveConfigurablePanelLayoutProps> = ({
  mobileBreakpoint = '(max-width: 768px)',
  mobileCarouselProps,
  onMobilePanelChange,
  theme,
  layout,
  panels,
  ...rest
}) => {
  const isMobile = useMediaQuery(mobileBreakpoint);
  const carouselRef = useRef<SnapCarouselRef>(null);
  const [activeTabIndex, setActiveTabIndex] = useState(0);

  const orderedSlots: (PanelSlot | undefined)[] = useMemo(() => [layout?.left, layout?.middle, layout?.right], [layout]);

  const slotNames: ('left' | 'middle' | 'right')[] = ['left', 'middle', 'right'];

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

    const processSlot = (slot: PanelSlot | undefined, slotName: 'left' | 'middle' | 'right'): MobileSlotInfo | null => {
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
            slot: slotName,
          };
        }
        // Future group types (e.g., tiles) can be added here
        return null;
      }

      // Single panel
      return {
        content: getPanelContent(slot),
        label: getPanelLabel(slot),
        slot: slotName,
      };
    };

    return orderedSlots
      .map((slot, index) => processSlot(slot, slotNames[index]))
      .filter((info): info is MobileSlotInfo => info !== null);
  }, [orderedSlots, panels, theme]);

  const handleTabClick = (index: number) => {
    setActiveTabIndex(index);
    carouselRef.current?.scrollToPanel(index);
    // Notify consumer of panel change
    const slot = mobileSlots[index]?.slot;
    if (slot) {
      onMobilePanelChange?.(index, slot);
    }
  };

  const handlePanelChange = (index: number) => {
    setActiveTabIndex(index);
    // Also call user's onPanelChange if provided via mobileCarouselProps
    mobileCarouselProps?.onPanelChange?.(index);
    // Notify consumer via the dedicated callback
    const slot = mobileSlots[index]?.slot;
    if (slot) {
      onMobilePanelChange?.(index, slot);
    }
  };

  // Extract onPanelChange from mobileCarouselProps so we don't override internal handler
  const { onPanelChange: _userOnPanelChange, ...restCarouselProps } = mobileCarouselProps ?? {};

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
            {...restCarouselProps}
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
