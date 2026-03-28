import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
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
  args: {
    onCollapseStart: fn(),
    onCollapseComplete: fn(),
    onExpandStart: fn(),
    onExpandComplete: fn(),
  },
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
          style={{ padding: '15px', backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6', flexShrink: 0 }}
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

        <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
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

/**
 * Component that requires height inheritance to render properly.
 * Simulates components like graph renderers, canvas editors, etc. that
 * use height: 100% and need their parent to have a defined height.
 */
const HeightDependentContent = ({ label }: { label: string }) => {
  const [dimensions, setDimensions] = React.useState({ width: 0, height: 0 });
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setDimensions({ width: Math.round(width), height: Math.round(height) });
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const hasValidHeight = dimensions.height > 0;

  return (
    <div
      ref={containerRef}
      style={{
        height: '100%',
        width: '100%',
        backgroundColor: hasValidHeight ? '#e8f5e9' : '#ffebee',
        border: `2px solid ${hasValidHeight ? '#4caf50' : '#f44336'}`,
        borderRadius: '8px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        boxSizing: 'border-box',
      }}
    >
      <h3 style={{ margin: '0 0 10px 0', color: hasValidHeight ? '#2e7d32' : '#c62828' }}>
        {hasValidHeight ? '✅ Height Inherited!' : '❌ Height is 0!'}
      </h3>
      <div style={{ fontFamily: 'monospace', fontSize: '14px', textAlign: 'center' }}>
        <div>{label}</div>
        <div style={{ marginTop: '8px', fontWeight: 'bold' }}>
          {dimensions.width} × {dimensions.height}
        </div>
      </div>
      {!hasValidHeight && (
        <p style={{ marginTop: '15px', color: '#c62828', fontSize: '12px', maxWidth: '300px', textAlign: 'center' }}>
          This component uses height: 100% but its parent has no defined height.
          See NESTED_FLEX_HEIGHT_ISSUE.md for details.
        </p>
      )}
    </div>
  );
};

/**
 * This story reproduces a common bug where AnimatedResizableLayout is placed
 * inside a flex item (not a flex container), causing height: 100% children
 * to have 0 height.
 *
 * The issue: CSS `height: 100%` only works when the parent has an explicitly
 * defined height. A parent with `flex: 1` is a flex ITEM but doesn't provide
 * a defined height for percentage calculations.
 *
 * The fix: The parent must also be a flex CONTAINER (`display: flex; flex-direction: column`)
 * and children should use `flex: 1` instead of `height: 100%`.
 *
 * @see NESTED_FLEX_HEIGHT_ISSUE.md
 */
const NestedFlexChildComponent = (args: AnimatedResizableLayoutProps) => {
  return (
    <div style={{
      height: '500px',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      border: '2px solid #333',
      fontFamily: 'system-ui, sans-serif',
    }}>
      {/* Header - fixed height */}
      <div style={{
        height: '50px',
        backgroundColor: '#1a1a2e',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        padding: '0 20px',
        flexShrink: 0,
      }}>
        <span style={{ fontWeight: 'bold' }}>Header (50px fixed)</span>
      </div>

      {/* Content area - flex item that should fill remaining space */}
      {/* BUG: If this is NOT a flex container, children with height: 100% get 0 height */}
      {/* FIX: Add display: flex; flexDirection: column to make it a flex container */}
      <div style={{
        flex: '1 1 0%',
        minHeight: 0,
        overflow: 'hidden',
        // FIX: Uncomment these to make it a flex container:
        display: 'flex',
        flexDirection: 'column',
      }}>
        <AnimatedResizableLayout
          {...args}
          leftPanel={
            <div style={{ padding: '10px', height: '100%', boxSizing: 'border-box' }}>
              <h4 style={{ margin: '0 0 10px 0' }}>Left Panel</h4>
              <p style={{ fontSize: '12px', color: '#666' }}>
                Sidebar content here
              </p>
            </div>
          }
          rightPanel={
            <HeightDependentContent label="Graph Renderer (height: 100%)" />
          }
        />
      </div>
    </div>
  );
};

/**
 * Reproduces the nested flex child height inheritance bug.
 *
 * This is a common issue when AnimatedResizableLayout is used inside a flex item
 * (like a content area below a header). The parent has `flex: 1` but is not a
 * flex container itself, causing `height: 100%` children to have 0 height.
 *
 * **Root cause**: CSS `height: 100%` requires the parent to have a defined height.
 * `flex: 1` makes an element a flex ITEM (it grows), but doesn't give it a
 * defined height for percentage calculations.
 *
 * **Solution**: The parent must be both a flex item AND a flex container:
 * ```css
 * .content-area {
 *   flex: 1 1 0%;
 *   min-height: 0;
 *   display: flex;
 *   flex-direction: column;
 * }
 * ```
 *
 * And AnimatedResizableLayout should use `flex: 1` instead of `height: 100%`
 * (which it now does via scoped CSS selector).
 */
export const NestedFlexChild: Story = {
  render: NestedFlexChildComponent,
  args: {
    leftPanel: <div />,
    rightPanel: <div />,
    collapsibleSide: 'left',
    defaultSize: 25,
    minSize: 10,
    collapsed: false,
    animationDuration: 300,
    animationEasing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    theme: slateTheme,
  },
  parameters: {
    docs: {
      description: {
        story: `
**Bug**: When AnimatedResizableLayout is placed inside a flex item (e.g., content area below a header),
children that use \`height: 100%\` may have 0 height on initial render.

**Cause**: CSS \`height: 100%\` requires the parent to have a defined height. A parent with \`flex: 1\`
is a flex ITEM but doesn't provide a defined height for percentage calculations.

**Fix**: The parent must be both a flex item AND a flex container:
\`\`\`tsx
<div style={{
  flex: '1 1 0%',
  minHeight: 0,
  display: 'flex',
  flexDirection: 'column',
}}>
  <AnimatedResizableLayout ... />
</div>
\`\`\`

See NESTED_FLEX_HEIGHT_ISSUE.md for full documentation.
        `,
      },
    },
  },
};

/**
 * Tests that starting with collapsed={true} does NOT animate.
 * The right panel should immediately have full width without any animation.
 * This is important for cases like CanvasEditorPanel where the sidebar
 * should be hidden from the start when there's no workflow.
 */
const StartCollapsedComponent = (args: AnimatedResizableLayoutProps) => {
  const [collapsed, setCollapsed] = React.useState(true);
  const [dimensionHistory, setDimensionHistory] = React.useState<{ w: number; h: number }[]>([]);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const layoutRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver(([entry]) => {
      const w = Math.round(entry.contentRect.width);
      const h = Math.round(entry.contentRect.height);
      setDimensionHistory(prev => {
        // Only add if different from last entry
        const last = prev[prev.length - 1];
        if (!last || last.w !== w || last.h !== h) {
          return [...prev, { w, h }];
        }
        return prev;
      });
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const hasWidthAnimation = dimensionHistory.filter((d, i, arr) => i > 0 && arr[i - 1].w !== d.w).length > 2;
  const hasHeightChange = dimensionHistory.some((d, i, arr) => i > 0 && Math.abs(arr[i - 1].h - d.h) > 10);

  const formatHistory = () => {
    if (dimensionHistory.length === 0) return 'none';
    return dimensionHistory.map(d => `${d.w}x${d.h}`).join(' → ');
  };

  return (
    <div style={{ height: '500px', width: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{
        padding: '15px',
        backgroundColor: hasHeightChange ? '#fff3e0' : (hasWidthAnimation ? '#ffebee' : '#e8f5e9'),
        borderBottom: '2px solid #dee2e6',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
          <h3 style={{ margin: 0, color: hasHeightChange ? '#e65100' : (hasWidthAnimation ? '#c62828' : '#2e7d32') }}>
            {hasHeightChange ? '⚠️ HEIGHT CHANGED!' : (hasWidthAnimation ? '❌ Animation detected on mount!' : '✅ No animation on mount')}
          </h3>
          <button
            onClick={() => {
              setCollapsed(c => !c);
            }}
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            {collapsed ? '→ Expand (should animate)' : '← Collapse (should animate)'}
          </button>
          <button
            onClick={() => setDimensionHistory([])}
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            Clear History
          </button>
        </div>
        <div style={{ fontFamily: 'monospace', fontSize: '11px', height: '40px', overflow: 'auto', backgroundColor: '#f5f5f5', padding: '4px', borderRadius: '4px' }}>
          Dimensions (WxH): [{formatHistory()}]
        </div>
        <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
          Height should stay constant. Width should animate during expand/collapse.
        </div>
      </div>
      <div ref={layoutRef} style={{ flex: '1 1 0%', minHeight: 0, display: 'flex', flexDirection: 'column', border: '2px solid blue' }}>
        <AnimatedResizableLayout
          {...args}
          collapsed={collapsed}
          leftPanel={
            <div style={{ padding: '20px', backgroundColor: '#e8f4ff', height: '100%' }}>
              <h3>Left Panel (should be collapsed on start)</h3>
            </div>
          }
          rightPanel={
            <div
              ref={containerRef}
              style={{ padding: '20px', backgroundColor: '#fafafa', height: '100%' }}
            >
              <h3>Right Panel</h3>
              <p>This panel should have full width immediately without animation on mount.</p>
              <p>When you click the toggle button, it SHOULD animate smoothly.</p>
            </div>
          }
        />
      </div>
    </div>
  );
};

/**
 * Verifies that starting with `collapsed={true}` does not trigger an animation.
 * The left panel should be immediately collapsed, and the right panel should
 * have full width from the start.
 */
export const StartCollapsed: Story = {
  render: StartCollapsedComponent,
  args: {
    leftPanel: <div />,
    rightPanel: <div />,
    collapsibleSide: 'left',
    defaultSize: 30,
    minSize: 15,
    collapsed: true,
    animationDuration: 300,
    animationEasing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    theme: slateTheme,
  },
};
