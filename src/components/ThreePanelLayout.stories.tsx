import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { ThreePanelLayout } from './ThreePanelLayout';
import { slateTheme, terminalTheme } from '@principal-ade/industry-theme';
import React from 'react';

const meta = {
  title: 'Components/ThreePanelLayout',
  component: ThreePanelLayout,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    onPanelResize: fn(),
    onLeftCollapseStart: fn(),
    onLeftCollapseComplete: fn(),
    onLeftExpandStart: fn(),
    onLeftExpandComplete: fn(),
    onRightCollapseStart: fn(),
    onRightCollapseComplete: fn(),
    onRightExpandStart: fn(),
    onRightExpandComplete: fn(),
  },
  decorators: [
    (Story) => (
      <div style={{ height: '100vh', width: '100vw' }}>
        <Story />
      </div>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof ThreePanelLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

// Sample content components
const LeftContent = () => (
  <div style={{ padding: '20px' }}>
    <h3>Left Panel</h3>
    <p>This is the left sidebar content.</p>
    <ul>
      <li>Navigation Item 1</li>
      <li>Navigation Item 2</li>
      <li>Navigation Item 3</li>
      <li>Navigation Item 4</li>
    </ul>
  </div>
);

const MiddleContent = () => (
  <div style={{ padding: '20px' }}>
    <h2>Main Content Area</h2>
    <p>This is the main content panel that remains visible when side panels collapse.</p>
    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
    <div style={{ marginTop: '20px', padding: '15px', background: '#f0f0f0', borderRadius: '8px' }}>
      <h4>Feature Box</h4>
      <p>The middle panel has a minimum width to ensure content remains readable.</p>
    </div>
  </div>
);

const RightContent = () => (
  <div style={{ padding: '20px' }}>
    <h3>Right Panel</h3>
    <p>Additional information or tools.</p>
    <div style={{ marginTop: '15px' }}>
      <h4>Properties</h4>
      <ul>
        <li>Property A: Value 1</li>
        <li>Property B: Value 2</li>
        <li>Property C: Value 3</li>
      </ul>
    </div>
  </div>
);

export const Default: Story = {
  args: {
    leftPanel: <LeftContent />,
    middlePanel: <MiddleContent />,
    rightPanel: <RightContent />,
    showCollapseButtons: true,
    defaultSizes: { left: 20, middle: 60, right: 20 },
    minSizes: { left: 15, middle: 30, right: 15 },
    theme: slateTheme,
  },
};

export const DarkTheme: Story = {
  args: {
    leftPanel: <LeftContent />,
    middlePanel: <MiddleContent />,
    rightPanel: <RightContent />,
    showCollapseButtons: true,
    theme: terminalTheme,
    defaultSizes: { left: 20, middle: 60, right: 20 },
  },
  parameters: {
    backgrounds: {
      default: 'dark',
    },
  },
  decorators: [
    (Story) => (
      <div style={{ height: '100vh', width: '100vw', background: '#1a1a1a', color: '#ffffff' }}>
        <Story />
      </div>
    ),
  ],
};

export const CustomTheme: Story = {
  args: {
    leftPanel: <LeftContent />,
    middlePanel: <MiddleContent />,
    rightPanel: <RightContent />,
    showCollapseButtons: true,
    theme: slateTheme,
    defaultSizes: { left: 25, middle: 50, right: 25 },
  },
};

export const LeftCollapsedInitially: Story = {
  args: {
    leftPanel: <LeftContent />,
    middlePanel: <MiddleContent />,
    rightPanel: <RightContent />,
    collapsed: { left: true, right: false },
    showCollapseButtons: true,
    defaultSizes: { left: 20, middle: 60, right: 20 },
    theme: slateTheme,
  },
};

export const BothCollapsedInitially: Story = {
  args: {
    leftPanel: <LeftContent />,
    middlePanel: <MiddleContent />,
    rightPanel: <RightContent />,
    collapsed: { left: true, right: true },
    showCollapseButtons: true,
    defaultSizes: { left: 20, middle: 60, right: 20 },
    theme: slateTheme,
  },
};

export const OnlyLeftCollapsible: Story = {
  args: {
    leftPanel: <LeftContent />,
    middlePanel: <MiddleContent />,
    rightPanel: <RightContent />,
    collapsiblePanels: { left: true, right: false },
    showCollapseButtons: true,
    defaultSizes: { left: 20, middle: 50, right: 30 },
    theme: slateTheme,
  },
};

export const OnlyRightCollapsible: Story = {
  args: {
    leftPanel: <LeftContent />,
    middlePanel: <MiddleContent />,
    rightPanel: <RightContent />,
    collapsiblePanels: { left: false, right: true },
    showCollapseButtons: true,
    defaultSizes: { left: 30, middle: 50, right: 20 },
    theme: slateTheme,
  },
};

export const NoCollapseButtons: Story = {
  args: {
    leftPanel: <LeftContent />,
    middlePanel: <MiddleContent />,
    rightPanel: <RightContent />,
    showCollapseButtons: false,
    defaultSizes: { left: 20, middle: 60, right: 20 },
    theme: slateTheme,
  },
};

export const CustomAnimation: Story = {
  args: {
    leftPanel: <LeftContent />,
    middlePanel: <MiddleContent />,
    rightPanel: <RightContent />,
    showCollapseButtons: true,
    animationDuration: 600,
    animationEasing: 'ease-in-out',
    defaultSizes: { left: 20, middle: 60, right: 20 },
    theme: slateTheme,
  },
};

export const WithCallbacks: Story = {
  args: {
    leftPanel: <LeftContent />,
    middlePanel: <MiddleContent />,
    rightPanel: <RightContent />,
    showCollapseButtons: true,
    defaultSizes: { left: 20, middle: 60, right: 20 },
    theme: slateTheme,
    onLeftCollapseStart: fn(),
    onLeftCollapseComplete: fn(),
    onLeftExpandStart: fn(),
    onLeftExpandComplete: fn(),
    onRightCollapseStart: fn(),
    onRightCollapseComplete: fn(),
    onRightExpandStart: fn(),
    onRightExpandComplete: fn(),
    onPanelResize: fn(),
  },
};

const ControlledByExternalButtonsComponent = () => {
  const [leftCollapsed, setLeftCollapsed] = React.useState(false);
  const [rightCollapsed, setRightCollapsed] = React.useState(false);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '10px', borderBottom: '1px solid #ccc', background: '#f7f7f7' }}>
        <h4>External Controls</h4>
        <button onClick={() => setLeftCollapsed(!leftCollapsed)} style={{ marginRight: '10px' }}>
          Toggle Left Panel
        </button>
        <button onClick={() => setRightCollapsed(!rightCollapsed)}>
          Toggle Right Panel
        </button>
      </div>
      <div style={{ flex: 1 }}>
        <ThreePanelLayout
          leftPanel={<LeftContent />}
          middlePanel={<MiddleContent />}
          rightPanel={<RightContent />}
          collapsed={{ left: leftCollapsed, right: rightCollapsed }}
          showCollapseButtons={true}
        />
      </div>
    </div>
  );
};

export const ControlledByExternalButtons: Story = {
  render: () => <ControlledByExternalButtonsComponent />,
};