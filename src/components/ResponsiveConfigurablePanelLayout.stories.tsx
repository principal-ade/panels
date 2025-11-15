import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { fn } from '@storybook/test';
import { slateTheme } from '@a24z/industry-theme';
import { ResponsiveConfigurablePanelLayout } from './ResponsiveConfigurablePanelLayout';
import { PanelDefinitionWithContent } from './ConfigurablePanelLayout';
import { PanelLayout } from './PanelConfigurator';

const meta = {
  title: 'Components/ResponsiveConfigurablePanelLayout',
  component: ResponsiveConfigurablePanelLayout,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <div style={{ height: '100vh', width: '100vw' }}>
        <Story />
      </div>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof ResponsiveConfigurablePanelLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

const samplePanels: PanelDefinitionWithContent[] = [
  {
    id: 'nav',
    label: 'Navigation',
    content: (
      <div style={{ padding: '20px' }}>
        <h3>Navigation</h3>
        <ul>
          <li>Overview</li>
          <li>Alerts</li>
          <li>Logs</li>
          <li>Settings</li>
        </ul>
      </div>
    ),
  },
  {
    id: 'main',
    label: 'Main Content',
    content: (
      <div style={{ padding: '20px' }}>
        <h2>Primary Canvas</h2>
        <p>Resize the Storybook viewport above 768px to see the desktop layout.</p>
      </div>
    ),
  },
  {
    id: 'sidebar',
    label: 'Sidebar',
    content: (
      <div style={{ padding: '20px' }}>
        <h3>Insights</h3>
        <p>Helpful metrics and secondary tools live here.</p>
      </div>
    ),
  },
];

const baseLayout: PanelLayout = {
  left: 'nav',
  middle: 'main',
  right: 'sidebar',
};

export const DesktopExperience: Story = {
  args: {
    panels: samplePanels,
    layout: baseLayout,
    showCollapseButtons: true,
    defaultSizes: { left: 20, middle: 60, right: 20 },
    theme: slateTheme,
    mobileBreakpoint: '(max-width: 768px)',
    mobileCarouselProps: {
      showSeparator: true,
    },
    onPanelResize: fn(),
  },
};

export const MobileCarousel: Story = {
  args: DesktopExperience.args,
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
};
