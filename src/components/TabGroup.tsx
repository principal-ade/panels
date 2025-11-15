import React, { useState, useEffect } from 'react';
import { Theme } from '@principal-ade/industry-theme';
import { mapThemeToTabVars } from '../utils/themeMapping';
import { PanelDefinitionWithContent } from './ConfigurablePanelLayout';
import { TabsConfig } from './PanelConfigurator';
import './TabGroup.css';

export interface TabGroupProps {
  /** Panel IDs to display as tabs */
  panelIds: string[];

  /** All available panels with content */
  panels: PanelDefinitionWithContent[];

  /** Tab configuration */
  config?: TabsConfig;

  /** Optional class name */
  className?: string;

  /** Theme object for customizing colors */
  theme: Theme;
}

/**
 * TabGroup - Renders multiple panels in a tabbed interface
 */
export const TabGroup: React.FC<TabGroupProps> = ({
  panelIds,
  panels,
  config = {},
  className = '',
  theme,
}) => {
  const {
    defaultActiveTab = 0,
    tabPosition = 'top',
    centered = true,
    hideTabList = false,
    activeTabIndex: controlledIndex,
    onTabChange,
  } = config;

  // Internal state for uncontrolled mode
  const [internalIndex, setInternalIndex] = useState(defaultActiveTab);

  // Determine if component is controlled
  const isControlled = controlledIndex !== undefined;

  // Use controlled value if provided, otherwise use internal state
  const activeTabIndex = isControlled ? controlledIndex : internalIndex;

  // Handle tab changes
  const handleTabClick = (index: number) => {
    if (!isControlled) {
      setInternalIndex(index);
    }
    onTabChange?.(index);
  };

  // Sync internal state when defaultActiveTab changes (for uncontrolled mode)
  useEffect(() => {
    if (!isControlled) {
      setInternalIndex(defaultActiveTab);
    }
  }, [defaultActiveTab, isControlled]);

  // Apply theme as CSS variables
  const themeStyles = mapThemeToTabVars(theme) as React.CSSProperties;

  // Get panels in order
  const tabPanels = panelIds
    .map(id => panels.find(p => p.id === id))
    .filter((p): p is PanelDefinitionWithContent => p !== undefined);

  // Ensure active tab is valid
  const safeActiveIndex = Math.min(activeTabIndex, tabPanels.length - 1);

  const activePanel = tabPanels[safeActiveIndex];

  if (tabPanels.length === 0) {
    return <div className="tab-group-empty">No panels available</div>;
  }

  // For top/bottom positions, always center. For left/right, use the centered config
  const shouldCenter = (tabPosition === 'top' || tabPosition === 'bottom') ? true : centered;

  const tabList = (
    <div className={`tab-list ${shouldCenter ? 'centered' : ''}`} role="tablist">
      {tabPanels.map((panel, index) => (
        <button
          key={panel.id}
          role="tab"
          aria-selected={index === safeActiveIndex}
          aria-controls={`tabpanel-${panel.id}`}
          id={`tab-${panel.id}`}
          className={`tab-button ${index === safeActiveIndex ? 'active' : ''}`}
          onClick={() => handleTabClick(index)}
          title={panel.icon ? panel.label : undefined}
        >
          {panel.icon ? (
            <>
              <span className="tab-icon">{panel.icon}</span>
              <span className="tab-label">{panel.label}</span>
            </>
          ) : (
            panel.label
          )}
        </button>
      ))}
    </div>
  );

  const tabContent = activePanel ? (
    <div
      className="tab-content"
      role="tabpanel"
      id={`tabpanel-${activePanel.id}`}
      aria-labelledby={`tab-${activePanel.id}`}
    >
      {activePanel.content}
    </div>
  ) : null;

  return (
    <div className={`tab-group tab-position-${tabPosition} ${className}`} style={themeStyles}>
      {!hideTabList && (tabPosition === 'top' || tabPosition === 'left') && tabList}
      {tabContent}
      {!hideTabList && (tabPosition === 'bottom' || tabPosition === 'right') && tabList}
    </div>
  );
};
