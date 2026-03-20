import type { Meta, StoryObj } from '@storybook/react-vite';
import { fn } from 'storybook/test';
import React, { useState } from 'react';
import { slateTheme } from '@principal-ade/industry-theme';

import {
  CollapsibleSplitPane,
  type CollapsibleSplitPaneProps,
} from './CollapsibleSplitPane';

const meta = {
  title: 'Layout/CollapsibleSplitPane',
  component: CollapsibleSplitPane,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  args: {
    onCollapsedChange: fn(),
    onRatioChange: fn(),
    onCollapseStart: fn(),
    onCollapseComplete: fn(),
    onExpandStart: fn(),
    onExpandComplete: fn(),
  },
  argTypes: {
    collapsed: {
      control: 'boolean',
      description: 'Whether the secondary panel is collapsed',
    },
    ratio: {
      control: { type: 'range', min: 0.1, max: 0.8, step: 0.05 },
      description: 'Split ratio (0-1) for secondary panel',
    },
    maxRatio: {
      control: { type: 'range', min: 0.5, max: 0.9, step: 0.05 },
    },
    collapsedHeight: {
      control: { type: 'range', min: 20, max: 48, step: 4 },
    },
    animationDuration: {
      control: { type: 'range', min: 100, max: 500, step: 50 },
    },
  },
} satisfies Meta<typeof CollapsibleSplitPane>;

export default meta;
type Story = StoryObj<typeof meta>;

const FileIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);

const TerminalIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <polyline points="4 17 10 11 4 5" />
    <line x1="12" y1="19" x2="20" y2="19" />
  </svg>
);

const SecondaryContent = () => (
  <div style={{ padding: '16px', height: '100%', backgroundColor: '#f8fafc' }}>
    <h3 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 600 }}>
      Associated Content
    </h3>
    <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#64748b' }}>
      This panel is associated with the terminal below. It could contain:
    </p>
    <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#475569' }}>
      <li>Skill output or logs</li>
      <li>File preview</li>
      <li>Documentation</li>
      <li>Test results</li>
    </ul>
  </div>
);

const PrimaryContent = () => (
  <div
    style={{
      padding: '16px',
      height: '100%',
      backgroundColor: '#1e293b',
      color: '#e2e8f0',
      fontFamily: 'monospace',
      fontSize: '13px',
    }}
  >
    <div style={{ marginBottom: '8px' }}>
      <span style={{ color: '#22c55e' }}>user@machine</span>
      <span style={{ color: '#64748b' }}>:</span>
      <span style={{ color: '#3b82f6' }}>~/project</span>
      <span style={{ color: '#64748b' }}>$</span>
      <span> npm run build</span>
    </div>
    <div style={{ color: '#94a3b8' }}>
      <div>Building for production...</div>
      <div style={{ color: '#22c55e' }}>Build completed successfully!</div>
    </div>
  </div>
);

// Interactive story with controlled state
const InteractiveComponent = (args: Omit<CollapsibleSplitPaneProps, 'collapsed' | 'ratio' | 'onCollapsedChange' | 'onRatioChange'>) => {
  const [collapsed, setCollapsed] = useState(false);
  const [ratio, setRatio] = useState(0.35);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div
        style={{
          padding: '12px 16px',
          backgroundColor: '#f1f5f9',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
        }}
      >
        <button
          onClick={() => setCollapsed(!collapsed)}
          style={{
            padding: '6px 12px',
            fontSize: '13px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          {collapsed ? 'Expand' : 'Collapse'} Secondary
        </button>
        <span style={{ fontSize: '13px', color: '#64748b' }}>
          Ratio: {(ratio * 100).toFixed(0)}%
        </span>
        <span style={{ fontSize: '13px', color: '#64748b' }}>
          Collapsed: {collapsed ? 'Yes' : 'No'}
        </span>
      </div>

      <div style={{ flex: 1 }}>
        <CollapsibleSplitPane
          {...args}
          collapsed={collapsed}
          ratio={ratio}
          onCollapsedChange={setCollapsed}
          onRatioChange={setRatio}
        />
      </div>
    </div>
  );
};

export const Default: Story = {
  render: InteractiveComponent,
  args: {
    primaryContent: <PrimaryContent />,
    secondaryContent: <SecondaryContent />,
    collapsedHeader: {
      icon: <FileIcon />,
      title: 'skill-output.md',
    },
    maxRatio: 0.7,
    collapsedHeight: 28,
    animationDuration: 200,
    theme: slateTheme,
  },
};

// Story showing collapsed state
const CollapsedStateComponent = (args: CollapsibleSplitPaneProps) => {
  const [collapsed, setCollapsed] = useState(true);
  const [ratio, setRatio] = useState(0.35);

  return (
    <CollapsibleSplitPane
      {...args}
      collapsed={collapsed}
      ratio={ratio}
      onCollapsedChange={setCollapsed}
      onRatioChange={setRatio}
    />
  );
};

export const CollapsedByDefault: Story = {
  render: CollapsedStateComponent,
  args: {
    primaryContent: <PrimaryContent />,
    secondaryContent: <SecondaryContent />,
    collapsedHeader: {
      icon: <FileIcon />,
      title: 'test-results.log',
    },
    maxRatio: 0.7,
    collapsedHeight: 28,
    animationDuration: 200,
    theme: slateTheme,
  },
};

// Story with terminal use case
const TerminalUseCaseComponent = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [ratio, setRatio] = useState(0.4);

  return (
    <CollapsibleSplitPane
      primaryContent={
        <div
          style={{
            height: '100%',
            backgroundColor: '#0f172a',
            color: '#e2e8f0',
            fontFamily: 'monospace',
            fontSize: '13px',
            padding: '12px',
          }}
        >
          <div style={{ marginBottom: '4px' }}>
            <span style={{ color: '#22c55e' }}>$</span> Running skill: analyze-code
          </div>
          <div style={{ color: '#94a3b8' }}>Analyzing src/components...</div>
          <div style={{ color: '#94a3b8' }}>Found 3 potential improvements</div>
          <div style={{ color: '#fbbf24' }}>See associated panel for details</div>
        </div>
      }
      secondaryContent={
        <div style={{ padding: '16px', height: '100%', overflow: 'auto' }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '14px' }}>Code Analysis Results</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { file: 'Button.tsx', issue: 'Missing aria-label', severity: 'warning' },
              { file: 'Form.tsx', issue: 'Unused import', severity: 'info' },
              { file: 'Modal.tsx', issue: 'Memory leak risk', severity: 'error' },
            ].map((item, i) => (
              <div
                key={i}
                style={{
                  padding: '12px',
                  backgroundColor: '#f8fafc',
                  borderRadius: '6px',
                  borderLeft: `3px solid ${
                    item.severity === 'error'
                      ? '#ef4444'
                      : item.severity === 'warning'
                        ? '#f59e0b'
                        : '#3b82f6'
                  }`,
                }}
              >
                <div style={{ fontSize: '13px', fontWeight: 500 }}>{item.file}</div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>{item.issue}</div>
              </div>
            ))}
          </div>
        </div>
      }
      collapsedHeader={{
        icon: <TerminalIcon />,
        title: 'Code Analysis Results',
      }}
      collapsed={collapsed}
      ratio={ratio}
      onCollapsedChange={setCollapsed}
      onRatioChange={setRatio}
      theme={slateTheme}
    />
  );
};

export const TerminalUseCase: Story = {
  render: TerminalUseCaseComponent,
  args: {} as CollapsibleSplitPaneProps,
};

// Story showing different header heights
const HeaderHeightsComponent = () => {
  const [collapsed, setCollapsed] = useState(true);
  const [ratio, setRatio] = useState(0.3);
  const [height, setHeight] = useState(28);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div
        style={{
          padding: '12px 16px',
          backgroundColor: '#f1f5f9',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <span style={{ fontSize: '13px' }}>Header height:</span>
        {[24, 28, 32, 40].map((h) => (
          <button
            key={h}
            onClick={() => setHeight(h)}
            style={{
              padding: '4px 8px',
              fontSize: '12px',
              backgroundColor: height === h ? '#3b82f6' : '#e2e8f0',
              color: height === h ? 'white' : '#334155',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            {h}px
          </button>
        ))}
      </div>
      <div style={{ flex: 1 }}>
        <CollapsibleSplitPane
          primaryContent={<PrimaryContent />}
          secondaryContent={<SecondaryContent />}
          collapsedHeader={{
            icon: <FileIcon />,
            title: 'preview.md',
          }}
          collapsed={collapsed}
          ratio={ratio}
          onCollapsedChange={setCollapsed}
          onRatioChange={setRatio}
          collapsedHeight={height}
          theme={slateTheme}
        />
      </div>
    </div>
  );
};

export const HeaderHeights: Story = {
  render: HeaderHeightsComponent,
  args: {} as CollapsibleSplitPaneProps,
};
