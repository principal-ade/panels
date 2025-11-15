import type { Meta, StoryObj } from '@storybook/react';
import { PanelConfigurator, PanelDefinition, PanelLayout } from './PanelConfigurator';
import { ThemeProvider, terminalTheme, regalTheme } from '@principal-ade/industry-theme';
import React, { useState } from 'react';

const meta = {
  title: 'Components/PanelConfigurator',
  component: PanelConfigurator,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof PanelConfigurator>;

export default meta;
type Story = StoryObj<typeof meta>;

// Sample panel definitions
const samplePanels: PanelDefinition[] = [
  {
    id: 'nav',
    label: 'Navigation',
    preview: <div style={{ fontSize: '0.7rem' }}>Nav Menu</div>,
  },
  {
    id: 'main',
    label: 'Main Content',
    preview: <div style={{ fontSize: '0.7rem' }}>Content</div>,
  },
  {
    id: 'sidebar',
    label: 'Sidebar',
    preview: <div style={{ fontSize: '0.7rem' }}>Stats</div>,
  },
  {
    id: 'tools',
    label: 'Tools Panel',
    preview: <div style={{ fontSize: '0.7rem' }}>Tools</div>,
  },
  {
    id: 'properties',
    label: 'Properties',
    preview: <div style={{ fontSize: '0.7rem' }}>Props</div>,
  },
];

// Interactive wrapper component
const InteractivePanelConfigurator = ({ panels, initialLayout }: {
  panels: PanelDefinition[];
  initialLayout: PanelLayout;
}) => {
  const [layout, setLayout] = useState<PanelLayout>(initialLayout);

  return (
    <div>
      <PanelConfigurator
        availablePanels={panels}
        currentLayout={layout}
        onChange={setLayout}
      />

      <div style={{
        marginTop: '2rem',
        padding: '1rem',
        background: 'var(--configurator-bg)',
        borderRadius: '6px',
        fontFamily: 'monospace',
        fontSize: '0.875rem',
      }}>
        <strong>Current Layout:</strong>
        <pre style={{ marginTop: '0.5rem' }}>
          {JSON.stringify(layout, null, 2)}
        </pre>
      </div>
    </div>
  );
};

// Default story with terminal theme
export const Default: Story = {
  render: () => (
    <ThemeProvider theme={terminalTheme}>
      <InteractivePanelConfigurator
        panels={samplePanels}
        initialLayout={{
          left: 'nav',
          middle: 'main',
          right: 'sidebar',
        }}
      />
    </ThemeProvider>
  ),
};

// Story with regal theme
export const RegalTheme: Story = {
  render: () => (
    <ThemeProvider theme={regalTheme}>
      <InteractivePanelConfigurator
        panels={samplePanels}
        initialLayout={{
          left: 'nav',
          middle: 'main',
          right: 'sidebar',
        }}
      />
    </ThemeProvider>
  ),
};

// Story with empty initial layout
export const EmptyLayout: Story = {
  render: () => (
    <ThemeProvider theme={terminalTheme}>
      <InteractivePanelConfigurator
        panels={samplePanels}
        initialLayout={{
          left: null,
          middle: null,
          right: null,
        }}
      />
    </ThemeProvider>
  ),
};

// Story with minimal panels (only 3)
export const MinimalPanels: Story = {
  render: () => (
    <ThemeProvider theme={terminalTheme}>
      <InteractivePanelConfigurator
        panels={samplePanels.slice(0, 3)}
        initialLayout={{
          left: 'nav',
          middle: 'main',
          right: 'sidebar',
        }}
      />
    </ThemeProvider>
  ),
};

// Story with many panels
export const ManyPanels: Story = {
  render: () => (
    <ThemeProvider theme={terminalTheme}>
      <InteractivePanelConfigurator
        panels={[
          ...samplePanels,
          { id: 'console', label: 'Console', preview: <div style={{ fontSize: '0.7rem' }}>Console</div> },
          { id: 'terminal', label: 'Terminal', preview: <div style={{ fontSize: '0.7rem' }}>Terminal</div> },
          { id: 'output', label: 'Output', preview: <div style={{ fontSize: '0.7rem' }}>Output</div> },
        ]}
        initialLayout={{
          left: 'nav',
          middle: 'main',
          right: 'sidebar',
        }}
      />
    </ThemeProvider>
  ),
};

// Story demonstrating tab group creation workflow
export const TabGroupWorkflow: Story = {
  render: () => (
    <ThemeProvider theme={terminalTheme}>
      <div>
        <div style={{
          padding: '1rem',
          background: '#2a2a2a',
          color: '#00ff00',
          borderRadius: '6px',
          marginBottom: '1rem',
          fontFamily: 'monospace',
        }}>
          <h3 style={{ marginTop: 0 }}>How to Create Tab Groups:</h3>
          <ol style={{ marginBottom: 0 }}>
            <li>Click the tab icon toggle on any slot to enable Tab Mode</li>
            <li>With the slot selected, click panels to add them to the tab group</li>
            <li>Configure tab position (top/bottom/left/right) using the dropdown</li>
            <li>Remove panels from the group using the × button next to each panel</li>
            <li>Toggle the tab icon again to convert back to single panel mode</li>
          </ol>
        </div>
        <InteractivePanelConfigurator
          panels={[
            ...samplePanels,
            { id: 'console', label: 'Console', preview: <div style={{ fontSize: '0.7rem' }}>Console</div> },
            { id: 'terminal', label: 'Terminal', preview: <div style={{ fontSize: '0.7rem' }}>Terminal</div> },
            { id: 'output', label: 'Output', preview: <div style={{ fontSize: '0.7rem' }}>Output</div> },
          ]}
          initialLayout={{
            left: null,
            middle: 'main',
            right: null,
          }}
        />
      </div>
    </ThemeProvider>
  ),
};

// Story showing existing tab groups
export const WithExistingTabGroups: Story = {
  render: () => (
    <ThemeProvider theme={terminalTheme}>
      <InteractivePanelConfigurator
        panels={[
          ...samplePanels,
          { id: 'console', label: 'Console', preview: <div style={{ fontSize: '0.7rem' }}>Console</div> },
          { id: 'terminal', label: 'Terminal', preview: <div style={{ fontSize: '0.7rem' }}>Terminal</div> },
          { id: 'output', label: 'Output', preview: <div style={{ fontSize: '0.7rem' }}>Output</div> },
        ]}
        initialLayout={{
          left: {
            type: 'tabs',
            panels: ['nav', 'tools'],
            config: { defaultActiveTab: 0, tabPosition: 'top' }
          },
          middle: 'main',
          right: {
            type: 'tabs',
            panels: ['console', 'terminal', 'output'],
            config: { defaultActiveTab: 0, tabPosition: 'top' }
          },
        }}
      />
    </ThemeProvider>
  ),
};
