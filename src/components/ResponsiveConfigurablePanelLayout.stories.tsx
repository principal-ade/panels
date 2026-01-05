import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { fn } from '@storybook/test';
import { slateTheme } from '@principal-ade/industry-theme';
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

/**
 * Demonstrates the onMobilePanelChange callback which fires when switching
 * panels in mobile view. Use this to emit focus events or track which panel is active.
 */
const MobilePanelChangeDemo = () => {
  const [logs, setLogs] = useState<string[]>([]);
  const [activeSlot, setActiveSlot] = useState<string>('left');

  const handleMobilePanelChange = (index: number, slot: 'left' | 'middle' | 'right') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev.slice(-9), `[${timestamp}] Panel changed: index=${index}, slot=${slot}`]);
    setActiveSlot(slot);
  };

  const panelsWithLogs: PanelDefinitionWithContent[] = [
    {
      id: 'nav',
      label: 'Navigation',
      content: (
        <div style={{ padding: '20px', background: '#1a1a2e', height: '100%' }}>
          <h3 style={{ color: '#fff' }}>Navigation (Left)</h3>
          <p style={{ color: '#aaa' }}>Tap the bottom tabs to switch panels.</p>
        </div>
      ),
    },
    {
      id: 'main',
      label: 'Main',
      content: (
        <div style={{ padding: '20px', background: '#16213e', height: '100%' }}>
          <h3 style={{ color: '#fff' }}>Main Content (Middle)</h3>
          <p style={{ color: '#aaa' }}>This is the primary content area.</p>
        </div>
      ),
    },
    {
      id: 'sidebar',
      label: 'Sidebar',
      content: (
        <div style={{ padding: '20px', background: '#1a2e1a', height: '100%' }}>
          <h3 style={{ color: '#fff' }}>Sidebar (Right)</h3>
          <p style={{ color: '#aaa' }}>Secondary content lives here.</p>
        </div>
      ),
    },
  ];

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: '#0a0a0a' }}>
      {/* Status Bar */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #333', color: '#fff' }}>
        <div style={{ fontSize: '14px', fontWeight: 600 }}>
          Active Slot: <span style={{ color: '#4ec9b0' }}>{activeSlot}</span>
        </div>
      </div>

      {/* Panel Layout */}
      <div style={{ flex: 1, minHeight: 0 }}>
        <ResponsiveConfigurablePanelLayout
          theme={slateTheme}
          panels={panelsWithLogs}
          layout={baseLayout}
          mobileBreakpoint="(max-width: 9999px)" // Force mobile view for demo
          onMobilePanelChange={handleMobilePanelChange}
        />
      </div>

      {/* Event Log */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid #333', maxHeight: '120px', overflowY: 'auto' }}>
        <div style={{ fontSize: '11px', color: '#888', marginBottom: '8px', textTransform: 'uppercase' }}>
          Event Log
        </div>
        {logs.length === 0 ? (
          <div style={{ color: '#666', fontSize: '12px' }}>Tap tabs to see events...</div>
        ) : (
          logs.map((log, i) => (
            <div key={i} style={{ fontSize: '11px', color: '#aaa', fontFamily: 'monospace' }}>
              {log}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export const MobilePanelChangeEvents: Story = {
  render: () => <MobilePanelChangeDemo />,
  parameters: {
    docs: {
      description: {
        story: `
Demonstrates the \`onMobilePanelChange\` callback which fires when switching panels in mobile view.

**Use cases:**
- Emit \`panel:focus\` events when panel changes
- Track analytics for which panels users view
- Sync focus state with other UI elements

The callback receives:
- \`index\`: The carousel index (0, 1, 2)
- \`slot\`: The slot name ('left', 'middle', 'right')
        `,
      },
    },
  },
};
