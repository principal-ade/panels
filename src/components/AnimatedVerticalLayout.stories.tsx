import type { Meta, StoryObj } from '@storybook/react-webpack5';
import { fn } from '@storybook/test';
import React, { useState } from 'react';
import { slateTheme } from '@principal-ade/industry-theme';

import { AnimatedVerticalLayout, type AnimatedVerticalLayoutProps } from './AnimatedVerticalLayout';

const meta = {
  title: 'Layout/AnimatedVerticalLayout',
  component: AnimatedVerticalLayout,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  args: {
    onTopCollapseStart: fn(),
    onTopCollapseComplete: fn(),
    onTopExpandStart: fn(),
    onTopExpandComplete: fn(),
    onBottomCollapseStart: fn(),
    onBottomCollapseComplete: fn(),
    onBottomExpandStart: fn(),
    onBottomExpandComplete: fn(),
    onPanelResize: fn(),
  },
  argTypes: {
    showCollapseButtons: {
      control: 'boolean',
      description: 'Show/hide the collapse toggle buttons in the resize handle',
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
} satisfies Meta<typeof AnimatedVerticalLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

const TopPanelContent = () => (
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

const BottomPanelContent = () => (
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
    topPanel: <TopPanelContent />,
    bottomPanel: <BottomPanelContent />,
    collapsiblePanels: { top: true, bottom: true },
    defaultSizes: { top: 30, bottom: 30 },
    minSizes: { top: 15, bottom: 15 },
    collapsed: { top: false, bottom: false },
    showCollapseButtons: false, // Hidden by default
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

const WithControlsComponent = (args: AnimatedVerticalLayoutProps) => {
  const [topCollapsed, setTopCollapsed] = useState(false);
  const [bottomCollapsed, setBottomCollapsed] = useState(false);
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
            <button
              onClick={() => {
                setTopCollapsed(!topCollapsed);
                addLog(topCollapsed ? 'External top expand triggered' : 'External top collapse triggered');
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
              {topCollapsed ? '↓ Expand Top' : '↑ Collapse Top'}
            </button>
            <button
              onClick={() => {
                setBottomCollapsed(!bottomCollapsed);
                addLog(bottomCollapsed ? 'External bottom expand triggered' : 'External bottom collapse triggered');
              }}
              style={{
                padding: '10px 20px',
                fontSize: '16px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }}
            >
              {bottomCollapsed ? '↑ Expand Bottom' : '↓ Collapse Bottom'}
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
          <AnimatedVerticalLayout
            {...args}
            collapsed={{ top: topCollapsed, bottom: bottomCollapsed }}
            showCollapseButtons={true} // Show buttons for this interactive demo
            onTopCollapseStart={() => {
              addLog('🎬 Top: Collapse started');
              setDragStatus('Animating top collapse...');
            }}
            onTopCollapseComplete={() => {
              addLog('✅ Top: Collapse complete');
              setDragStatus('Not dragging');
            }}
            onTopExpandStart={() => {
              addLog('🎬 Top: Expand started');
              setDragStatus('Animating top expand...');
            }}
            onTopExpandComplete={() => {
              addLog('✅ Top: Expand complete');
              setDragStatus('Not dragging');
            }}
            onBottomCollapseStart={() => {
              addLog('🎬 Bottom: Collapse started');
              setDragStatus('Animating bottom collapse...');
            }}
            onBottomCollapseComplete={() => {
              addLog('✅ Bottom: Collapse complete');
              setDragStatus('Not dragging');
            }}
            onBottomExpandStart={() => {
              addLog('🎬 Bottom: Expand started');
              setDragStatus('Animating bottom expand...');
            }}
            onBottomExpandComplete={() => {
              addLog('✅ Bottom: Expand complete');
              setDragStatus('Not dragging');
            }}
            topPanel={
              <div style={{ padding: '20px', backgroundColor: '#e8f4ff', height: '100%' }}>
                <h2>🎮 Top Interactive Panel</h2>
                <p>Both panels are independently collapsible!</p>
                <ol style={{ marginTop: '15px' }}>
                  <li>
                    <strong>Drag the divider</strong> - Instant resize, no animation
                  </li>
                  <li>
                    <strong>Click toggle buttons</strong> - Smooth animated collapse/expand
                  </li>
                  <li>
                    <strong>Use external buttons</strong> - Trigger animation programmatically
                  </li>
                </ol>

                <div
                  style={{
                    marginTop: '20px',
                    padding: '15px',
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    maxHeight: '150px',
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
            bottomPanel={<BottomPanelContent />}
          />
        </div>
      </div>
    );
};

export const WithControls: Story = {
  render: WithControlsComponent,
  args: {
    topPanel: <div />, // Will be provided by render function
    bottomPanel: <div />, // Will be provided by render function
    collapsiblePanels: { top: true, bottom: true },
    defaultSizes: { top: 35, bottom: 35 },
    minSizes: { top: 15, bottom: 15 },
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
    topPanel: (
      <div style={{ padding: '20px', backgroundColor: '#f0f8ff', height: '100%' }}>
        <h2>🐌 Slow Animation Demo</h2>
        <p>This uses an 800ms animation duration for a more dramatic effect.</p>
        <p style={{ marginTop: '10px' }}>
          Notice how dragging is still instant, but the toggle animation is much slower.
        </p>
      </div>
    ),
    bottomPanel: <BottomPanelContent />,
    collapsiblePanels: { top: true, bottom: true },
    defaultSizes: { top: 30, bottom: 30 },
    minSizes: { top: 15, bottom: 15 },
    collapsed: { top: false, bottom: false },
    showCollapseButtons: true,
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

export const BothCollapsed: Story = {
  args: {
    topPanel: <TopPanelContent />,
    bottomPanel: <BottomPanelContent />,
    collapsiblePanels: { top: true, bottom: true },
    defaultSizes: { top: 30, bottom: 30 },
    minSizes: { top: 15, bottom: 15 },
    collapsed: { top: true, bottom: true },
    showCollapseButtons: true,
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
