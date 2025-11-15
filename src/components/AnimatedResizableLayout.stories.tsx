import type { Meta, StoryObj } from '@storybook/react-webpack5';
import React, { useState } from 'react';
import { slateTheme } from '@principal-ade/industry-theme';

import { AnimatedResizableLayout, type AnimatedResizableLayoutProps } from './AnimatedResizableLayout';

const meta = {
  title: 'Layout/AnimatedResizableLayout',
  component: AnimatedResizableLayout,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    collapsibleSide: {
      control: 'radio',
      options: ['left', 'right'],
    },
    defaultSize: {
      control: { type: 'range', min: 10, max: 50, step: 5 },
    },
    minSize: {
      control: { type: 'range', min: 5, max: 30, step: 5 },
    },
    collapsed: {
      control: 'boolean',
    },
    showCollapseButton: {
      control: 'boolean',
      description: 'Show/hide the collapse toggle button in the resize handle',
    },
    animationDuration: {
      control: { type: 'range', min: 100, max: 1000, step: 100 },
    },
    animationEasing: {
      control: 'select',
      options: [
        'cubic-bezier(0.4, 0, 0.2, 1)',
        'ease',
        'ease-in',
        'ease-out',
        'ease-in-out',
        'linear',
      ],
    },
  },
} satisfies Meta<typeof AnimatedResizableLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

const LeftPanelContent = () => (
  <div style={{ padding: '20px', backgroundColor: '#e8f4ff', height: '100%' }}>
    <h2>✨ Hybrid Panel</h2>
    <p>This panel supports BOTH:</p>
    <ul style={{ marginTop: '10px' }}>
      <li>
        🎯 <strong>Manual resizing</strong> - Drag the divider!
      </li>
      <li>
        🎭 <strong>Smooth animations</strong> - Click the toggle button!
      </li>
    </ul>
    <div
      style={{ marginTop: '20px', padding: '15px', backgroundColor: 'white', borderRadius: '8px' }}
    >
      <h4>Try it out:</h4>
      <ol>
        <li>Drag the divider to resize manually</li>
        <li>Click the arrow button to animate collapse/expand</li>
        <li>Notice how dragging is instant, but toggle is smooth!</li>
      </ol>
    </div>
  </div>
);

const RightPanelContent = () => (
  <div style={{ padding: '20px', backgroundColor: '#fafafa', height: '100%' }}>
    <h2>📄 Main Content</h2>
    <p>This panel responds to both drag resizing and animated collapse/expand.</p>
    <div style={{ marginTop: '20px' }}>
      <h4>Features Combined:</h4>
      <div
        style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px' }}
      >
        <div
          style={{
            padding: '15px',
            backgroundColor: '#fff',
            borderRadius: '8px',
            border: '1px solid #e0e0e0',
          }}
        >
          <h5 style={{ margin: '0 0 10px 0', color: '#007bff' }}>🔄 From react-resizable-panels</h5>
          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px' }}>
            <li>Drag to resize</li>
            <li>Minimum size constraints</li>
            <li>Flexible layouts</li>
          </ul>
        </div>
        <div
          style={{
            padding: '15px',
            backgroundColor: '#fff',
            borderRadius: '8px',
            border: '1px solid #e0e0e0',
          }}
        >
          <h5 style={{ margin: '0 0 10px 0', color: '#28a745' }}>✨ Custom animations</h5>
          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px' }}>
            <li>Smooth collapse/expand</li>
            <li>Customizable duration</li>
            <li>Various easing functions</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
);

export const Default: Story = {
  args: {
    leftPanel: <LeftPanelContent />,
    rightPanel: <RightPanelContent />,
    collapsibleSide: 'left',
    defaultSize: 30,
    minSize: 15,
    showCollapseButton: false, // Hidden by default
    animationDuration: 300,
    animationEasing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    theme: slateTheme,
  },
  decorators: [
    Story => (
      <div style={{ height: '500px', width: '100%' }}>
        <Story />
      </div>
    ),
  ],
};

const WithControlsComponent = (args: AnimatedResizableLayoutProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const [eventLog, setEventLog] = useState<string[]>([]);
  const [dragStatus, setDragStatus] = useState('Not dragging');

    const addLog = (message: string) => {
      setEventLog(prev => [...prev.slice(-9), `${new Date().toLocaleTimeString()}: ${message}`]);
    };

    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div
          style={{ padding: '15px', backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <button
              onClick={() => {
                setCollapsed(!collapsed);
                addLog(collapsed ? 'External expand triggered' : 'External collapse triggered');
              }}
              style={{
                padding: '10px 20px',
                fontSize: '16px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }}
            >
              {collapsed ? '→ Expand with Animation' : '← Collapse with Animation'}
            </button>
            <div
              style={{
                padding: '8px 16px',
                backgroundColor: dragStatus === 'Not dragging' ? '#e9ecef' : '#ffc107',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: '500',
              }}
            >
              {dragStatus}
            </div>
            <button
              onClick={() => setEventLog([])}
              style={{
                padding: '6px 12px',
                fontSize: '14px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Clear Log
            </button>
          </div>
        </div>

        <div style={{ flex: 1, position: 'relative' }}>
          <AnimatedResizableLayout
            {...args}
            collapsed={collapsed}
            showCollapseButton={true} // Show button for this interactive demo
            onCollapseStart={() => {
              addLog('🎬 Animation: Collapse started');
              setDragStatus('Animating collapse...');
            }}
            onCollapseComplete={() => {
              addLog('✅ Animation: Collapse complete');
              setDragStatus('Not dragging');
            }}
            onExpandStart={() => {
              addLog('🎬 Animation: Expand started');
              setDragStatus('Animating expand...');
            }}
            onExpandComplete={() => {
              addLog('✅ Animation: Expand complete');
              setDragStatus('Not dragging');
            }}
            leftPanel={
              <div style={{ padding: '20px', backgroundColor: '#e8f4ff', height: '100%' }}>
                <h2>🎮 Interactive Panel</h2>
                <p>Try both interaction methods:</p>
                <ol style={{ marginTop: '15px' }}>
                  <li>
                    <strong>Drag the divider</strong> - Instant resize, no animation
                  </li>
                  <li>
                    <strong>Click toggle button</strong> - Smooth animated collapse/expand
                  </li>
                  <li>
                    <strong>Use external button</strong> - Trigger animation programmatically
                  </li>
                </ol>

                <div
                  style={{
                    marginTop: '20px',
                    padding: '15px',
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    maxHeight: '200px',
                    overflow: 'auto',
                  }}
                >
                  <h4>Event Log:</h4>
                  <div style={{ fontSize: '12px', fontFamily: 'monospace' }}>
                    {eventLog.length === 0 ? (
                      <div style={{ color: '#999' }}>No events yet...</div>
                    ) : (
                      eventLog.map((log, i) => (
                        <div
                          key={i}
                          style={{ padding: '2px 0', borderBottom: '1px solid #f0f0f0' }}
                        >
                          {log}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            }
            rightPanel={<RightPanelContent />}
          />
        </div>
      </div>
    );
};

export const WithControls: Story = {
  render: WithControlsComponent,
  args: {
    leftPanel: <div />, // Will be provided by render function
    rightPanel: <div />, // Will be provided by render function
    collapsibleSide: 'left',
    defaultSize: 35,
    minSize: 15,
    animationDuration: 400,
    animationEasing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    theme: slateTheme,
  },
  decorators: [
    Story => (
      <div style={{ height: '600px', width: '100%' }}>
        <Story />
      </div>
    ),
  ],
};

export const SlowAnimation: Story = {
  args: {
    leftPanel: (
      <div style={{ padding: '20px', backgroundColor: '#f0f8ff', height: '100%' }}>
        <h2>🐌 Slow Animation Demo</h2>
        <p>This uses an 800ms animation duration for a more dramatic effect.</p>
        <p style={{ marginTop: '10px' }}>
          Notice how dragging is still instant, but the toggle animation is much slower.
        </p>
      </div>
    ),
    rightPanel: <RightPanelContent />,
    collapsibleSide: 'left',
    defaultSize: 30,
    minSize: 15,
    animationDuration: 800,
    animationEasing: 'ease-in-out',
    theme: slateTheme,
  },
  decorators: [
    Story => (
      <div style={{ height: '500px', width: '100%' }}>
        <Story />
      </div>
    ),
  ],
};

export const RightCollapsible: Story = {
  args: {
    leftPanel: <RightPanelContent />,
    rightPanel: <LeftPanelContent />,
    collapsibleSide: 'right',
    defaultSize: 30,
    minSize: 15,
    animationDuration: 300,
    animationEasing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    theme: slateTheme,
  },
  decorators: [
    Story => (
      <div style={{ height: '500px', width: '100%' }}>
        <Story />
      </div>
    ),
  ],
};
