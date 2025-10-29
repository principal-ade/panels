import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { ThemeProvider, terminalTheme } from '@a24z/industry-theme';
import { TabGroup } from './TabGroup';
import { PanelDefinitionWithContent } from './ConfigurablePanelLayout';

const demoPanels: PanelDefinitionWithContent[] = [
  {
    id: 'tab-1',
    label: 'Overview',
    icon: '📊',
    preview: <div>Overview</div>,
    content: <div style={{ padding: '1rem' }}>Overview content</div>,
  },
  {
    id: 'tab-2',
    label: 'Details',
    icon: '📝',
    preview: <div>Details</div>,
    content: <div style={{ padding: '1rem' }}>Detailed information</div>,
  },
  {
    id: 'tab-3',
    label: 'Insights',
    icon: '💡',
    preview: <div>Insights</div>,
    content: <div style={{ padding: '1rem' }}>Insightful analysis</div>,
  },
  {
    id: 'tab-4',
    label: 'Reports',
    icon: '📈',
    preview: <div>Reports</div>,
    content: <div style={{ padding: '1rem' }}>Reporting dashboard</div>,
  },
  {
    id: 'tab-5',
    label: 'Activity',
    icon: '📅',
    preview: <div>Activity</div>,
    content: <div style={{ padding: '1rem' }}>Recent activity feed</div>,
  },
  {
    id: 'tab-6',
    label: 'Settings',
    icon: '⚙️',
    preview: <div>Settings</div>,
    content: <div style={{ padding: '1rem' }}>Configuration settings</div>,
  },
  {
    id: 'tab-7',
    label: 'Logs',
    icon: '📜',
    preview: <div>Logs</div>,
    content: <div style={{ padding: '1rem' }}>System logs</div>,
  },
  {
    id: 'tab-8',
    label: 'Metrics',
    icon: '📐',
    preview: <div>Metrics</div>,
    content: <div style={{ padding: '1rem' }}>Performance metrics</div>,
  },
];

const meta = {
  title: 'Components/TabGroup',
  component: TabGroup,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    theme: terminalTheme,
    panels: demoPanels,
    panelIds: demoPanels.slice(0, 4).map(panel => panel.id),
    config: {
      tabPosition: 'top',
    },
  },
} satisfies Meta<typeof TabGroup>;

export default meta;

type Story = StoryObj<typeof meta>;

const StoryContainer: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider theme={terminalTheme}>
    <div
      style={{
        width: '800px',
        height: '300px',
        margin: '0 auto',
        padding: '1rem',
        background: '#f0f0f0',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ background: '#fff', border: '1px solid #ddd', height: '100%' }}>{children}</div>
    </div>
  </ThemeProvider>
);

export const Default: Story = {
  render: args => (
    <StoryContainer>
      <TabGroup {...args} />
    </StoryContainer>
  ),
};

export const OverflowingTabs: Story = {
  args: {
    panelIds: demoPanels.map(panel => panel.id),
  },
  render: args => (
    <ThemeProvider theme={terminalTheme}>
      <div
        style={{
          width: '250px',
          height: '300px',
          margin: '0 auto',
          padding: '1rem',
          background: '#f0f0f0',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ background: '#fff', border: '1px solid #ddd', height: '100%' }}>
          <TabGroup {...args} />
        </div>
      </div>
    </ThemeProvider>
  ),
};
