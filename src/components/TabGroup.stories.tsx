import type { Meta, StoryObj } from '@storybook/react';
import React from 'react';
import { ThemeProvider, terminalTheme } from '@principal-ade/industry-theme';
import {
  BarChart3,
  FileText,
  Lightbulb,
  TrendingUp,
  Calendar,
  Settings,
  ScrollText,
  Ruler
} from 'lucide-react';
import { TabGroup } from './TabGroup';
import { PanelDefinitionWithContent } from './ConfigurablePanelLayout';

const demoPanels: PanelDefinitionWithContent[] = [
  {
    id: 'tab-1',
    label: 'Overview',
    icon: <BarChart3 size={20} />,
    preview: <div>Overview</div>,
    content: <div style={{ padding: '1rem' }}>Overview content</div>,
  },
  {
    id: 'tab-2',
    label: 'Details',
    icon: <FileText size={20} />,
    preview: <div>Details</div>,
    content: <div style={{ padding: '1rem' }}>Detailed information</div>,
  },
  {
    id: 'tab-3',
    label: 'Insights',
    icon: <Lightbulb size={20} />,
    preview: <div>Insights</div>,
    content: <div style={{ padding: '1rem' }}>Insightful analysis</div>,
  },
  {
    id: 'tab-4',
    label: 'Reports',
    icon: <TrendingUp size={20} />,
    preview: <div>Reports</div>,
    content: <div style={{ padding: '1rem' }}>Reporting dashboard</div>,
  },
  {
    id: 'tab-5',
    label: 'Activity',
    icon: <Calendar size={20} />,
    preview: <div>Activity</div>,
    content: <div style={{ padding: '1rem' }}>Recent activity feed</div>,
  },
  {
    id: 'tab-6',
    label: 'Settings',
    icon: <Settings size={20} />,
    preview: <div>Settings</div>,
    content: <div style={{ padding: '1rem' }}>Configuration settings</div>,
  },
  {
    id: 'tab-7',
    label: 'Logs',
    icon: <ScrollText size={20} />,
    preview: <div>Logs</div>,
    content: <div style={{ padding: '1rem' }}>System logs</div>,
  },
  {
    id: 'tab-8',
    label: 'Metrics',
    icon: <Ruler size={20} />,
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

export const HiddenTabList: Story = {
  args: {
    panelIds: demoPanels.slice(0, 4).map(panel => panel.id),
    config: {
      tabPosition: 'top',
      hideTabList: true,
      defaultActiveTab: 0,
    },
  },
  render: args => (
    <StoryContainer>
      <TabGroup {...args} />
    </StoryContainer>
  ),
};

const HiddenTabListControlledComponent = (args: { panelIds: string[] }) => {
  const [activeIndex, setActiveIndex] = React.useState(0);

  return (
    <ThemeProvider theme={terminalTheme}>
      <div
        style={{
          width: '800px',
          height: '400px',
          margin: '0 auto',
          padding: '1rem',
          background: '#f0f0f0',
          boxSizing: 'border-box',
        }}
      >
        <TabGroup
          {...args}
          panels={demoPanels}
          config={{
            hideTabList: true,
            activeTabIndex: activeIndex,
            onTabChange: setActiveIndex,
            tabPosition: 'top',
          }}
        />
        <div style={{ marginTop: '1rem', textAlign: 'center' }}>
          <button onClick={() => setActiveIndex(Math.max(0, activeIndex - 1))}>Previous</button>
          <span style={{ margin: '0 1rem' }}>
            Tab {activeIndex + 1} of {args.panelIds.length}
          </span>
          <button onClick={() => setActiveIndex(Math.min(args.panelIds.length - 1, activeIndex + 1))}>Next</button>
        </div>
      </div>
    </ThemeProvider>
  );
};

export const HiddenTabListControlled: Story = {
  args: {
    panelIds: demoPanels.slice(0, 4).map(panel => panel.id),
  },
  render: HiddenTabListControlledComponent,
};
