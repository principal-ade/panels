import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { EditableConfigurablePanelLayout } from './EditableConfigurablePanelLayout';
import { PanelDefinitionWithContent } from './ConfigurablePanelLayout';
import { PanelLayout, PanelDefinition } from './PanelConfigurator';
import { slateTheme, terminalTheme } from '@principal-ade/industry-theme';
import React, { useState } from 'react';

const meta = {
  title: 'Components/EditableConfigurablePanelLayout',
  component: EditableConfigurablePanelLayout,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    onLayoutChange: fn(),
  },
  decorators: [
    (Story) => (
      <div style={{ height: '100vh', width: '100vw' }}>
        <Story />
      </div>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof EditableConfigurablePanelLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

// Sample panel definitions (for drag-and-drop)
const availablePanels: PanelDefinition[] = [
  {
    id: 'nav',
    label: 'Navigation',
    icon: <span>📁</span>,
  },
  {
    id: 'editor',
    label: 'Editor',
    icon: <span>✏️</span>,
  },
  {
    id: 'terminal',
    label: 'Terminal',
    icon: <span>⌨️</span>,
  },
  {
    id: 'preview',
    label: 'Preview',
    icon: <span>👁️</span>,
  },
  {
    id: 'debugger',
    label: 'Debugger',
    icon: <span>🐛</span>,
  },
  {
    id: 'properties',
    label: 'Properties',
    icon: <span>⚙️</span>,
  },
  {
    id: 'console',
    label: 'Console',
    icon: <span>💬</span>,
  },
];

// Panel content components
const NavigationPanel = () => (
  <div style={{ padding: '20px', background: '#f0f9ff', height: '100%' }}>
    <h3 style={{ margin: '0 0 16px 0', color: '#0369a1' }}>Navigation</h3>
    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
      <li style={{ padding: '8px 0', borderBottom: '1px solid #bae6fd' }}>Dashboard</li>
      <li style={{ padding: '8px 0', borderBottom: '1px solid #bae6fd' }}>Projects</li>
      <li style={{ padding: '8px 0', borderBottom: '1px solid #bae6fd' }}>Tasks</li>
      <li style={{ padding: '8px 0', borderBottom: '1px solid #bae6fd' }}>Team</li>
    </ul>
  </div>
);

const EditorPanel = () => (
  <div style={{ padding: '20px', background: '#fefce8', height: '100%' }}>
    <h3 style={{ margin: '0 0 16px 0', color: '#a16207' }}>Code Editor</h3>
    <div style={{
      fontFamily: 'monospace',
      fontSize: '14px',
      background: '#ffffff',
      padding: '12px',
      borderRadius: '4px',
    }}>
      <div>function helloWorld() {'{'}</div>
      <div style={{ marginLeft: '16px' }}>console.log('Hello!');</div>
      <div>{'}'}</div>
    </div>
  </div>
);

const TerminalPanel = () => (
  <div style={{ padding: '20px', background: '#1f2937', height: '100%', color: '#10b981' }}>
    <h3 style={{ margin: '0 0 16px 0', color: '#34d399' }}>Terminal</h3>
    <div style={{
      fontFamily: 'monospace',
      fontSize: '13px',
      background: '#111827',
      padding: '12px',
      borderRadius: '4px',
    }}>
      <div>$ npm run dev</div>
      <div style={{ color: '#6b7280' }}>Server running on port 3000...</div>
    </div>
  </div>
);

const PreviewPanel = () => (
  <div style={{ padding: '20px', background: '#f5f3ff', height: '100%' }}>
    <h3 style={{ margin: '0 0 16px 0', color: '#7c3aed' }}>Preview</h3>
    <div style={{
      background: '#ffffff',
      padding: '16px',
      borderRadius: '8px',
      border: '1px solid #e9d5ff'
    }}>
      <div style={{ fontSize: '20px', fontWeight: 'bold' }}>Welcome!</div>
      <p style={{ margin: '8px 0 0 0', color: '#6b7280' }}>
        This is a preview panel.
      </p>
    </div>
  </div>
);

const DebuggerPanel = () => (
  <div style={{ padding: '20px', background: '#fef2f2', height: '100%' }}>
    <h3 style={{ margin: '0 0 16px 0', color: '#dc2626' }}>Debugger</h3>
    <div style={{ fontSize: '13px' }}>
      <div style={{ marginBottom: '8px', padding: '8px', background: '#fee2e2', borderRadius: '4px' }}>
        Breakpoint: line 42
      </div>
    </div>
  </div>
);

const PropertiesPanel = () => (
  <div style={{ padding: '20px', background: '#f0fdf4', height: '100%' }}>
    <h3 style={{ margin: '0 0 16px 0', color: '#15803d' }}>Properties</h3>
    <div style={{ fontSize: '13px' }}>
      <div style={{ marginBottom: '8px' }}>
        <strong>Width:</strong> 100%
      </div>
      <div>
        <strong>Height:</strong> auto
      </div>
    </div>
  </div>
);

const ConsolePanel = () => (
  <div style={{ padding: '20px', background: '#fffbeb', height: '100%' }}>
    <h3 style={{ margin: '0 0 16px 0', color: '#d97706' }}>Console</h3>
    <div style={{ fontFamily: 'monospace', fontSize: '12px' }}>
      <div style={{ color: '#6b7280' }}>[Info] Application started</div>
      <div style={{ color: '#10b981' }}>[Success] Connected to server</div>
    </div>
  </div>
);

// Panels with content for rendering
const panelsWithContent: PanelDefinitionWithContent[] = [
  { id: 'nav', label: 'Navigation', icon: <span>📁</span>, content: <NavigationPanel /> },
  { id: 'editor', label: 'Editor', icon: <span>✏️</span>, content: <EditorPanel /> },
  { id: 'terminal', label: 'Terminal', icon: <span>⌨️</span>, content: <TerminalPanel /> },
  { id: 'preview', label: 'Preview', icon: <span>👁️</span>, content: <PreviewPanel /> },
  { id: 'debugger', label: 'Debugger', icon: <span>🐛</span>, content: <DebuggerPanel /> },
  { id: 'properties', label: 'Properties', icon: <span>⚙️</span>, content: <PropertiesPanel /> },
  { id: 'console', label: 'Console', icon: <span>💬</span>, content: <ConsolePanel /> },
];

// Basic story - not in edit mode
export const Default: Story = {
  args: {
    availablePanels,
    panels: panelsWithContent,
    isEditMode: false,
    layout: {
      left: 'nav',
      middle: {
        type: 'tabs',
        panels: ['editor', 'preview'],
        config: {
          tabPosition: 'top',
          defaultActiveTab: 0,
        },
      },
      right: 'properties',
    },
    showCollapseButtons: true,
    defaultSizes: [20, 55, 25],
    minSizes: [150, 300, 150],
    theme: slateTheme,
  },
};

// Edit mode active
export const EditModeActive: Story = {
  args: {
    availablePanels,
    panels: panelsWithContent,
    isEditMode: true,
    layout: {
      left: 'nav',
      middle: 'editor',
      right: 'properties',
    },
    showCollapseButtons: true,
    defaultSizes: [20, 60, 20],
    theme: slateTheme,
  },
};

// With tab groups in edit mode
export const WithTabGroups: Story = {
  args: {
    availablePanels,
    panels: panelsWithContent,
    isEditMode: true,
    layout: {
      left: 'nav',
      middle: {
        type: 'tabs',
        panels: ['editor', 'preview'],
        config: {
          tabPosition: 'top',
          defaultActiveTab: 0,
        },
      },
      right: {
        type: 'tabs',
        panels: ['terminal', 'debugger', 'console'],
        config: {
          tabPosition: 'top',
          defaultActiveTab: 0,
        },
      },
    },
    showCollapseButtons: true,
    defaultSizes: [15, 50, 35],
    theme: slateTheme,
  },
};

// Two panel layout
export const TwoPanelLayout: Story = {
  args: {
    availablePanels,
    panels: panelsWithContent,
    isEditMode: false,
    layout: {
      left: {
        type: 'tabs',
        panels: ['nav', 'properties'],
        config: { tabPosition: 'top' },
      },
      middle: {
        type: 'tabs',
        panels: ['editor', 'terminal', 'preview'],
        config: { tabPosition: 'top' },
      },
    },
    showCollapseButtons: true,
    defaultSizes: [25, 75],
    theme: slateTheme,
  },
};

// Terminal theme
export const TerminalTheme: Story = {
  args: {
    availablePanels,
    panels: panelsWithContent,
    isEditMode: false,
    layout: {
      left: 'nav',
      middle: {
        type: 'tabs',
        panels: ['editor', 'preview'],
        config: { tabPosition: 'top' },
      },
      right: {
        type: 'tabs',
        panels: ['terminal', 'console'],
        config: { tabPosition: 'top' },
      },
    },
    showCollapseButtons: true,
    defaultSizes: [20, 50, 30],
    theme: terminalTheme,
  },
};

// Interactive story with state management and toggle
const InteractiveEditableLayout = () => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [layout, setLayout] = useState<PanelLayout>({
    left: 'nav',
    middle: {
      type: 'tabs',
      panels: ['editor', 'preview'],
      config: { tabPosition: 'top' },
    },
    right: {
      type: 'tabs',
      panels: ['terminal', 'properties'],
      config: { tabPosition: 'top' },
    },
  });

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{
        padding: '16px',
        background: '#f9fafb',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h3 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>Interactive Demo</h3>
          <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
            Toggle edit mode and drag panels to rearrange them.
          </p>
        </div>
        <button
          onClick={() => setIsEditMode(!isEditMode)}
          style={{
            padding: '8px 16px',
            borderRadius: '6px',
            border: '1px solid #d1d5db',
            background: isEditMode ? '#3b82f6' : 'white',
            color: isEditMode ? 'white' : '#374151',
            cursor: 'pointer',
            fontWeight: 500
          }}
        >
          {isEditMode ? 'Done' : 'Edit Layout'}
        </button>
      </div>
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <EditableConfigurablePanelLayout
          availablePanels={availablePanels}
          panels={panelsWithContent}
          isEditMode={isEditMode}
          layout={layout}
          onLayoutChange={(newLayout) => {
            console.log('Layout changed:', newLayout);
            setLayout(newLayout);
          }}
          showCollapseButtons={true}
          defaultSizes={[20, 50, 30]}
          minSizes={[150, 300, 150]}
          theme={slateTheme}
        />
      </div>
    </div>
  );
};

export const Interactive: Story = {
  render: () => <InteractiveEditableLayout />,
};
