import type { Meta, StoryObj } from '@storybook/react-vite';
import React, { useRef, useState, useCallback } from 'react';
import {
  Panel,
  Group,
  Separator,
  PanelImperativeHandle,
  GroupImperativeHandle,
  PanelSize,
} from 'react-resizable-panels';

/**
 * Debug stories to isolate setLayout issues with 0 values.
 * Tests the library directly without ConfigurablePanelLayout wrapper.
 */

const meta = {
  title: 'Debug/SetLayout Investigation',
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

// Shared styles
const panelStyle = (color: string): React.CSSProperties => ({
  padding: 20,
  background: color,
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontFamily: 'monospace',
});

const btnStyle: React.CSSProperties = {
  padding: '8px 16px',
  backgroundColor: '#3182ce',
  color: 'white',
  border: 'none',
  borderRadius: 4,
  cursor: 'pointer',
  fontSize: 13,
  fontWeight: 500,
};

const logStyle: React.CSSProperties = {
  width: 320,
  background: '#0d1117',
  color: '#c9d1d9',
  padding: 12,
  fontFamily: 'monospace',
  fontSize: 11,
  overflow: 'auto',
  whiteSpace: 'pre-wrap',
};

// =============================================================================
// TEST 1: Raw library - no collapsible, no constraints
// =============================================================================
const RawLibraryBasicComponent = () => {
  const groupRef = useRef<GroupImperativeHandle>(null);
  const [log, setLog] = useState<string[]>([]);

  const addLog = (msg: string) => {
    setLog((prev) => [...prev.slice(-20), `${new Date().toISOString().slice(11, 23)}: ${msg}`]);
  };

  const testSetLayout = (layout: Record<string, number>) => {
    addLog(`setLayout(${JSON.stringify(layout)})`);
    const before = groupRef.current?.getLayout();
    addLog(`  before: ${JSON.stringify(before)}`);

    const result = groupRef.current?.setLayout(layout);
    addLog(`  result: ${JSON.stringify(result)}`);

    const after = groupRef.current?.getLayout();
    addLog(`  after:  ${JSON.stringify(after)}`);
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: 12, background: '#1a1a2e', color: '#fff', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <strong style={{ marginRight: 8 }}>Test 1: Raw library, no constraints</strong>
        <button onClick={() => testSetLayout({ left: 0, middle: 50, right: 50 })} style={btnStyle}>
          0/50/50
        </button>
        <button onClick={() => testSetLayout({ left: 1, middle: 50, right: 49 })} style={btnStyle}>
          1/50/49
        </button>
        <button onClick={() => testSetLayout({ left: 33, middle: 34, right: 33 })} style={btnStyle}>
          33/34/33
        </button>
        <button onClick={() => testSetLayout({ left: 50, middle: 50, right: 0 })} style={btnStyle}>
          50/50/0
        </button>
      </div>

      <div style={{ display: 'flex', flex: 1 }}>
        <div style={{ flex: 1 }}>
          <Group
            groupRef={groupRef}
            orientation="horizontal"
            onLayoutChange={() => addLog('onLayoutChange')}
            onLayoutChanged={(layout) => addLog(`onLayoutChanged: ${JSON.stringify(layout)}`)}
          >
            <Panel
              id="left"
              defaultSize="33%"
              onResize={(size) => addLog(`left.onResize: ${size.asPercentage.toFixed(2)}%`)}
            >
              <div style={panelStyle('#e3f2fd')}>LEFT</div>
            </Panel>
            <Separator />
            <Panel
              id="middle"
              defaultSize="34%"
              onResize={(size) => addLog(`middle.onResize: ${size.asPercentage.toFixed(2)}%`)}
            >
              <div style={panelStyle('#f3e5f5')}>MIDDLE</div>
            </Panel>
            <Separator />
            <Panel
              id="right"
              defaultSize="33%"
              onResize={(size) => addLog(`right.onResize: ${size.asPercentage.toFixed(2)}%`)}
            >
              <div style={panelStyle('#e8f5e9')}>RIGHT</div>
            </Panel>
          </Group>
        </div>
        <div style={logStyle}>
          <div style={{ fontWeight: 600, marginBottom: 8, color: '#58a6ff' }}>Event Log</div>
          {log.map((entry, i) => <div key={i}>{entry}</div>)}
        </div>
      </div>
    </div>
  );
};

export const Test1_RawLibraryBasic: Story = {
  name: '1. Raw Library - No Constraints',
  render: () => <RawLibraryBasicComponent />,
};

// =============================================================================
// TEST 2: Raw library - with collapsible panels
// =============================================================================
const RawLibraryCollapsibleComponent = () => {
  const groupRef = useRef<GroupImperativeHandle>(null);
  const leftRef = useRef<PanelImperativeHandle>(null);
  const rightRef = useRef<PanelImperativeHandle>(null);
  const [log, setLog] = useState<string[]>([]);

  const addLog = (msg: string) => {
    setLog((prev) => [...prev.slice(-20), `${new Date().toISOString().slice(11, 23)}: ${msg}`]);
  };

  const testSetLayout = (layout: Record<string, number>) => {
    addLog(`setLayout(${JSON.stringify(layout)})`);
    const before = groupRef.current?.getLayout();
    addLog(`  before: ${JSON.stringify(before)}`);

    const result = groupRef.current?.setLayout(layout);
    addLog(`  result: ${JSON.stringify(result)}`);

    const after = groupRef.current?.getLayout();
    addLog(`  after:  ${JSON.stringify(after)}`);
  };

  const testCollapse = (panel: 'left' | 'right') => {
    addLog(`${panel}.collapse()`);
    const ref = panel === 'left' ? leftRef : rightRef;
    ref.current?.collapse();
    setTimeout(() => {
      addLog(`  layout after: ${JSON.stringify(groupRef.current?.getLayout())}`);
    }, 50);
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: 12, background: '#1a1a2e', color: '#fff', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <strong style={{ marginRight: 8 }}>Test 2: With collapsible</strong>
        <button onClick={() => testSetLayout({ left: 0, middle: 50, right: 50 })} style={btnStyle}>
          0/50/50
        </button>
        <button onClick={() => testSetLayout({ left: 1, middle: 50, right: 49 })} style={btnStyle}>
          1/50/49
        </button>
        <button onClick={() => testCollapse('left')} style={{...btnStyle, backgroundColor: '#e53e3e'}}>
          collapse(left)
        </button>
        <button onClick={() => testCollapse('right')} style={{...btnStyle, backgroundColor: '#e53e3e'}}>
          collapse(right)
        </button>
        <button onClick={() => testSetLayout({ left: 33, middle: 34, right: 33 })} style={btnStyle}>
          33/34/33
        </button>
      </div>

      <div style={{ display: 'flex', flex: 1 }}>
        <div style={{ flex: 1 }}>
          <Group
            groupRef={groupRef}
            orientation="horizontal"
            onLayoutChanged={(layout) => addLog(`onLayoutChanged: ${JSON.stringify(layout)}`)}
          >
            <Panel
              id="left"
              panelRef={leftRef}
              defaultSize="33%"
              collapsible={true}
              collapsedSize="0%"
              onResize={(size) => addLog(`left.onResize: ${size.asPercentage.toFixed(2)}%`)}
            >
              <div style={panelStyle('#e3f2fd')}>LEFT (collapsible)</div>
            </Panel>
            <Separator />
            <Panel
              id="middle"
              defaultSize="34%"
              onResize={(size) => addLog(`middle.onResize: ${size.asPercentage.toFixed(2)}%`)}
            >
              <div style={panelStyle('#f3e5f5')}>MIDDLE</div>
            </Panel>
            <Separator />
            <Panel
              id="right"
              panelRef={rightRef}
              defaultSize="33%"
              collapsible={true}
              collapsedSize="0%"
              onResize={(size) => addLog(`right.onResize: ${size.asPercentage.toFixed(2)}%`)}
            >
              <div style={panelStyle('#e8f5e9')}>RIGHT (collapsible)</div>
            </Panel>
          </Group>
        </div>
        <div style={logStyle}>
          <div style={{ fontWeight: 600, marginBottom: 8, color: '#58a6ff' }}>Event Log</div>
          {log.map((entry, i) => <div key={i}>{entry}</div>)}
        </div>
      </div>
    </div>
  );
};

export const Test2_RawLibraryCollapsible: Story = {
  name: '2. Raw Library - With Collapsible',
  render: () => <RawLibraryCollapsibleComponent />,
};

// =============================================================================
// TEST 7: Add React state tracking (like ConfigurablePanelLayout)
// This mimics how ConfigurablePanelLayout tracks sizes in state
// =============================================================================
const WithStateTrackingComponent = () => {
  const groupRef = useRef<GroupImperativeHandle>(null);
  const [log, setLog] = useState<string[]>([]);

  // Mimicking ConfigurablePanelLayout's state
  const [leftSize, setLeftSize] = useState(33);
  const [middleSize, setMiddleSize] = useState(34);
  const [rightSize, setRightSize] = useState(33);

  const addLog = (msg: string) => {
    setLog((prev) => [...prev.slice(-25), `${new Date().toISOString().slice(11, 23)}: ${msg}`]);
  };

  // Mimic ConfigurablePanelLayout's onResize handlers
  const handleLeftResize = useCallback((panelSize: PanelSize) => {
    const size = panelSize.asPercentage;
    addLog(`left.onResize: ${size.toFixed(2)}% → setLeftSize(${size.toFixed(2)})`);
    setLeftSize(size);
  }, []);

  const handleMiddleResize = useCallback((panelSize: PanelSize) => {
    const size = panelSize.asPercentage;
    addLog(`middle.onResize: ${size.toFixed(2)}% → setMiddleSize(${size.toFixed(2)})`);
    setMiddleSize(size);
  }, []);

  const handleRightResize = useCallback((panelSize: PanelSize) => {
    const size = panelSize.asPercentage;
    addLog(`right.onResize: ${size.toFixed(2)}% → setRightSize(${size.toFixed(2)})`);
    setRightSize(size);
  }, []);

  const testSetLayout = (sizes: { left: number; middle: number; right: number }) => {
    addLog(`=== setLayout(${JSON.stringify(sizes)}) ===`);
    addLog(`React state before: L=${leftSize.toFixed(2)} M=${middleSize.toFixed(2)} R=${rightSize.toFixed(2)}`);

    groupRef.current?.setLayout(sizes);

    // Also update React state (like ConfigurablePanelLayout does)
    setLeftSize(sizes.left);
    setMiddleSize(sizes.middle);
    setRightSize(sizes.right);

    addLog(`Called setLayout + setState`);

    setTimeout(() => {
      addLog(`Library layout: ${JSON.stringify(groupRef.current?.getLayout())}`);
    }, 100);
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: 12, background: '#1a1a2e', color: '#fff', display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <strong style={{ marginRight: 8 }}>Test 7: With State Tracking</strong>
        <button onClick={() => testSetLayout({ left: 0, middle: 50, right: 50 })} style={btnStyle}>
          0/50/50
        </button>
        <button onClick={() => testSetLayout({ left: 1, middle: 50, right: 49 })} style={btnStyle}>
          1/50/49
        </button>
        <button onClick={() => testSetLayout({ left: 33, middle: 34, right: 33 })} style={btnStyle}>
          33/34/33
        </button>
        <div style={{ marginLeft: 'auto', fontSize: 12, fontFamily: 'monospace' }}>
          State: {leftSize.toFixed(1)}/{middleSize.toFixed(1)}/{rightSize.toFixed(1)}
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1 }}>
        <div style={{ flex: 1 }}>
          <Group
            groupRef={groupRef}
            orientation="horizontal"
            onLayoutChanged={(layout) => addLog(`onLayoutChanged: ${JSON.stringify(layout)}`)}
          >
            <Panel
              id="left"
              defaultSize="33%"
              collapsible={true}
              collapsedSize="0%"
              onResize={handleLeftResize}
            >
              <div style={panelStyle('#e3f2fd')}>LEFT ({leftSize.toFixed(1)}%)</div>
            </Panel>
            <Separator />
            <Panel
              id="middle"
              defaultSize="34%"
              onResize={handleMiddleResize}
            >
              <div style={panelStyle('#f3e5f5')}>MIDDLE ({middleSize.toFixed(1)}%)</div>
            </Panel>
            <Separator />
            <Panel
              id="right"
              defaultSize="33%"
              collapsible={true}
              collapsedSize="0%"
              onResize={handleRightResize}
            >
              <div style={panelStyle('#e8f5e9')}>RIGHT ({rightSize.toFixed(1)}%)</div>
            </Panel>
          </Group>
        </div>
        <div style={logStyle}>
          <div style={{ fontWeight: 600, marginBottom: 8, color: '#58a6ff' }}>Event Log</div>
          {log.map((entry, i) => <div key={i}>{entry}</div>)}
          <button onClick={() => setLog([])} style={{...btnStyle, marginTop: 8, backgroundColor: '#4a5568', fontSize: 10}}>
            Clear
          </button>
        </div>
      </div>
    </div>
  );
};

export const Test7_WithStateTracking: Story = {
  name: '7. With State Tracking (like CPL)',
  render: () => <WithStateTrackingComponent />,
};

// =============================================================================
// TEST 8: State tracking + collapsed state (closer to ConfigurablePanelLayout)
// =============================================================================
const WithCollapsedStateComponent = () => {
  const groupRef = useRef<GroupImperativeHandle>(null);
  const [log, setLog] = useState<string[]>([]);

  // Mimicking ConfigurablePanelLayout's state
  const [leftSize, setLeftSize] = useState(33);
  const [middleSize, setMiddleSize] = useState(34);
  const [rightSize, setRightSize] = useState(33);
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);

  const addLog = (msg: string) => {
    setLog((prev) => [...prev.slice(-25), `${new Date().toISOString().slice(11, 23)}: ${msg}`]);
  };

  const handleLeftResize = useCallback((panelSize: PanelSize) => {
    const size = panelSize.asPercentage;
    addLog(`left.onResize: ${size.toFixed(2)}%`);
    setLeftSize(size);
    if (size > 0) {
      setLeftCollapsed(false);
    } else {
      setLeftCollapsed(true);
    }
  }, []);

  const handleMiddleResize = useCallback((panelSize: PanelSize) => {
    const size = panelSize.asPercentage;
    addLog(`middle.onResize: ${size.toFixed(2)}%`);
    setMiddleSize(size);
  }, []);

  const handleRightResize = useCallback((panelSize: PanelSize) => {
    const size = panelSize.asPercentage;
    addLog(`right.onResize: ${size.toFixed(2)}%`);
    setRightSize(size);
    if (size > 0) {
      setRightCollapsed(false);
    } else {
      setRightCollapsed(true);
    }
  }, []);

  const testSetLayout = (sizes: { left: number; middle: number; right: number }) => {
    addLog(`=== setLayout(${JSON.stringify(sizes)}) ===`);

    groupRef.current?.setLayout(sizes);

    // Update React state
    setLeftSize(sizes.left);
    setMiddleSize(sizes.middle);
    setRightSize(sizes.right);
    setLeftCollapsed(sizes.left === 0);
    setRightCollapsed(sizes.right === 0);

    setTimeout(() => {
      addLog(`Final library: ${JSON.stringify(groupRef.current?.getLayout())}`);
    }, 100);
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: 12, background: '#1a1a2e', color: '#fff', display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <strong style={{ marginRight: 8 }}>Test 8: With Collapsed State</strong>
        <button onClick={() => testSetLayout({ left: 0, middle: 50, right: 50 })} style={btnStyle}>
          0/50/50
        </button>
        <button onClick={() => testSetLayout({ left: 1, middle: 50, right: 49 })} style={btnStyle}>
          1/50/49
        </button>
        <button onClick={() => testSetLayout({ left: 33, middle: 34, right: 33 })} style={btnStyle}>
          33/34/33
        </button>
        <div style={{ marginLeft: 'auto', fontSize: 11, fontFamily: 'monospace' }}>
          L:{leftCollapsed ? 'COLLAPSED' : leftSize.toFixed(0)} | M:{middleSize.toFixed(0)} | R:{rightCollapsed ? 'COLLAPSED' : rightSize.toFixed(0)}
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1 }}>
        <div style={{ flex: 1 }}>
          <Group
            groupRef={groupRef}
            orientation="horizontal"
            onLayoutChanged={(layout) => addLog(`onLayoutChanged: ${JSON.stringify(layout)}`)}
          >
            <Panel
              id="left"
              defaultSize="33%"
              collapsible={true}
              collapsedSize="0%"
              onResize={handleLeftResize}
            >
              <div style={panelStyle('#e3f2fd')}>LEFT</div>
            </Panel>
            <Separator />
            <Panel
              id="middle"
              defaultSize="34%"
              onResize={handleMiddleResize}
            >
              <div style={panelStyle('#f3e5f5')}>MIDDLE</div>
            </Panel>
            <Separator />
            <Panel
              id="right"
              defaultSize="33%"
              collapsible={true}
              collapsedSize="0%"
              onResize={handleRightResize}
            >
              <div style={panelStyle('#e8f5e9')}>RIGHT</div>
            </Panel>
          </Group>
        </div>
        <div style={logStyle}>
          <div style={{ fontWeight: 600, marginBottom: 8, color: '#58a6ff' }}>Event Log</div>
          {log.map((entry, i) => <div key={i}>{entry}</div>)}
          <button onClick={() => setLog([])} style={{...btnStyle, marginTop: 8, backgroundColor: '#4a5568', fontSize: 10}}>
            Clear
          </button>
        </div>
      </div>
    </div>
  );
};

export const Test8_WithCollapsedState: Story = {
  name: '8. With Collapsed State',
  render: () => <WithCollapsedStateComponent />,
};

// =============================================================================
// TEST 9: The COLLAPSED_SIZE=1 workaround (what ConfigurablePanelLayout does)
// =============================================================================
const WithCollapsedSizeWorkaroundComponent = () => {
  const groupRef = useRef<GroupImperativeHandle>(null);
  const [log, setLog] = useState<string[]>([]);

  const [leftSize, setLeftSize] = useState(33);
  const [middleSize, setMiddleSize] = useState(34);
  const [rightSize, setRightSize] = useState(33);

  const addLog = (msg: string) => {
    setLog((prev) => [...prev.slice(-25), `${new Date().toISOString().slice(11, 23)}: ${msg}`]);
  };

  const handleLeftResize = useCallback((panelSize: PanelSize) => {
    const size = panelSize.asPercentage;
    addLog(`left.onResize: ${size.toFixed(2)}%`);
    setLeftSize(size);
  }, []);

  const handleMiddleResize = useCallback((panelSize: PanelSize) => {
    const size = panelSize.asPercentage;
    addLog(`middle.onResize: ${size.toFixed(2)}%`);
    setMiddleSize(size);
  }, []);

  const handleRightResize = useCallback((panelSize: PanelSize) => {
    const size = panelSize.asPercentage;
    addLog(`right.onResize: ${size.toFixed(2)}%`);
    setRightSize(size);
  }, []);

  // THIS IS WHAT ConfigurablePanelLayout DOES
  const testSetLayoutWithWorkaround = (sizes: { left: number; middle: number; right: number }) => {
    addLog(`=== User wants: ${JSON.stringify(sizes)} ===`);

    const COLLAPSED_SIZE = 1;
    const adjustedSizes = {
      left: sizes.left === 0 ? COLLAPSED_SIZE : sizes.left,
      middle: sizes.middle === 0 ? COLLAPSED_SIZE : sizes.middle,
      right: sizes.right === 0 ? COLLAPSED_SIZE : sizes.right,
    };

    addLog(`Adjusted to: ${JSON.stringify(adjustedSizes)}`);
    groupRef.current?.setLayout(adjustedSizes);

    // Store ORIGINAL intent in state (not adjusted)
    setLeftSize(sizes.left);
    setMiddleSize(sizes.middle);
    setRightSize(sizes.right);

    setTimeout(() => {
      addLog(`Library says: ${JSON.stringify(groupRef.current?.getLayout())}`);
      addLog(`React state: L=${leftSize} M=${middleSize} R=${rightSize}`);
    }, 100);
  };

  // Test WITHOUT the workaround
  const testSetLayoutDirect = (sizes: { left: number; middle: number; right: number }) => {
    addLog(`=== DIRECT (no workaround): ${JSON.stringify(sizes)} ===`);
    groupRef.current?.setLayout(sizes);
    setLeftSize(sizes.left);
    setMiddleSize(sizes.middle);
    setRightSize(sizes.right);

    setTimeout(() => {
      addLog(`Library says: ${JSON.stringify(groupRef.current?.getLayout())}`);
    }, 100);
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: 12, background: '#1a1a2e', color: '#fff', display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <strong style={{ marginRight: 8 }}>Test 9: COLLAPSED_SIZE=1 Workaround</strong>
        <button onClick={() => testSetLayoutWithWorkaround({ left: 0, middle: 50, right: 50 })} style={{...btnStyle, backgroundColor: '#e53e3e'}}>
          0/50/50 (with workaround)
        </button>
        <button onClick={() => testSetLayoutDirect({ left: 0, middle: 50, right: 50 })} style={{...btnStyle, backgroundColor: '#38a169'}}>
          0/50/50 (direct)
        </button>
        <button onClick={() => testSetLayoutWithWorkaround({ left: 33, middle: 34, right: 33 })} style={btnStyle}>
          Reset 33/34/33
        </button>
      </div>

      <div style={{ display: 'flex', flex: 1 }}>
        <div style={{ flex: 1 }}>
          <Group
            groupRef={groupRef}
            orientation="horizontal"
            onLayoutChanged={(layout) => addLog(`onLayoutChanged: ${JSON.stringify(layout)}`)}
          >
            <Panel
              id="left"
              defaultSize="33%"
              collapsible={true}
              collapsedSize="0%"
              onResize={handleLeftResize}
            >
              <div style={panelStyle('#e3f2fd')}>LEFT (state: {leftSize.toFixed(1)}%)</div>
            </Panel>
            <Separator />
            <Panel
              id="middle"
              defaultSize="34%"
              onResize={handleMiddleResize}
            >
              <div style={panelStyle('#f3e5f5')}>MIDDLE (state: {middleSize.toFixed(1)}%)</div>
            </Panel>
            <Separator />
            <Panel
              id="right"
              defaultSize="33%"
              collapsible={true}
              collapsedSize="0%"
              onResize={handleRightResize}
            >
              <div style={panelStyle('#e8f5e9')}>RIGHT (state: {rightSize.toFixed(1)}%)</div>
            </Panel>
          </Group>
        </div>
        <div style={logStyle}>
          <div style={{ fontWeight: 600, marginBottom: 8, color: '#58a6ff' }}>Event Log</div>
          <div style={{ marginBottom: 8, fontSize: 10, color: '#f97316' }}>
            Red = CPL workaround (0→1)<br/>
            Green = Direct pass-through
          </div>
          {log.map((entry, i) => <div key={i}>{entry}</div>)}
          <button onClick={() => setLog([])} style={{...btnStyle, marginTop: 8, backgroundColor: '#4a5568', fontSize: 10}}>
            Clear
          </button>
        </div>
      </div>
    </div>
  );
};

export const Test9_CollapsedSizeWorkaround: Story = {
  name: '9. COLLAPSED_SIZE=1 Workaround',
  render: () => <WithCollapsedSizeWorkaroundComponent />,
};

// =============================================================================
// TEST 10: The real issue - state sync conflict
// =============================================================================
const StateSyncConflictComponent = () => {
  const groupRef = useRef<GroupImperativeHandle>(null);
  const [log, setLog] = useState<string[]>([]);

  const [leftSize, setLeftSize] = useState(33);
  const [middleSize, setMiddleSize] = useState(34);
  const [rightSize, setRightSize] = useState(33);
  const [ignoreCallbacks, setIgnoreCallbacks] = useState(false);

  const addLog = (msg: string) => {
    setLog((prev) => [...prev.slice(-30), `${new Date().toISOString().slice(11, 23)}: ${msg}`]);
  };

  const handleLeftResize = useCallback((panelSize: PanelSize) => {
    const size = panelSize.asPercentage;
    if (ignoreCallbacks) {
      addLog(`left.onResize: ${size.toFixed(2)}% (IGNORED)`);
      return;
    }
    addLog(`left.onResize: ${size.toFixed(2)}% → setState`);
    setLeftSize(size);
  }, [ignoreCallbacks]);

  const handleMiddleResize = useCallback((panelSize: PanelSize) => {
    const size = panelSize.asPercentage;
    if (ignoreCallbacks) {
      addLog(`middle.onResize: ${size.toFixed(2)}% (IGNORED)`);
      return;
    }
    addLog(`middle.onResize: ${size.toFixed(2)}% → setState`);
    setMiddleSize(size);
  }, [ignoreCallbacks]);

  const handleRightResize = useCallback((panelSize: PanelSize) => {
    const size = panelSize.asPercentage;
    if (ignoreCallbacks) {
      addLog(`right.onResize: ${size.toFixed(2)}% (IGNORED)`);
      return;
    }
    addLog(`right.onResize: ${size.toFixed(2)}% → setState`);
    setRightSize(size);
  }, [ignoreCallbacks]);

  const testWithCallbackConflict = (sizes: { left: number; middle: number; right: number }) => {
    addLog(`=== WITH callback conflict ===`);
    setIgnoreCallbacks(false);

    groupRef.current?.setLayout(sizes);
    setLeftSize(sizes.left);
    setMiddleSize(sizes.middle);
    setRightSize(sizes.right);

    setTimeout(() => {
      addLog(`Final state: L=${leftSize} M=${middleSize} R=${rightSize}`);
      addLog(`Library: ${JSON.stringify(groupRef.current?.getLayout())}`);
    }, 150);
  };

  const testWithoutCallbackConflict = (sizes: { left: number; middle: number; right: number }) => {
    addLog(`=== WITHOUT callback conflict (ignore onResize) ===`);
    setIgnoreCallbacks(true);

    groupRef.current?.setLayout(sizes);
    setLeftSize(sizes.left);
    setMiddleSize(sizes.middle);
    setRightSize(sizes.right);

    setTimeout(() => {
      setIgnoreCallbacks(false);
      addLog(`Final state: L=${leftSize} M=${middleSize} R=${rightSize}`);
      addLog(`Library: ${JSON.stringify(groupRef.current?.getLayout())}`);
    }, 150);
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: 12, background: '#1a1a2e', color: '#fff', display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <strong style={{ marginRight: 8 }}>Test 10: State Sync Conflict</strong>
        <button onClick={() => testWithCallbackConflict({ left: 0, middle: 50, right: 50 })} style={{...btnStyle, backgroundColor: '#e53e3e'}}>
          0/50/50 (WITH conflict)
        </button>
        <button onClick={() => testWithoutCallbackConflict({ left: 0, middle: 50, right: 50 })} style={{...btnStyle, backgroundColor: '#38a169'}}>
          0/50/50 (ignore callbacks)
        </button>
        <button onClick={() => testWithCallbackConflict({ left: 33, middle: 34, right: 33 })} style={btnStyle}>
          Reset
        </button>
      </div>

      <div style={{ display: 'flex', flex: 1 }}>
        <div style={{ flex: 1 }}>
          <Group
            groupRef={groupRef}
            orientation="horizontal"
          >
            <Panel
              id="left"
              defaultSize="33%"
              collapsible={true}
              collapsedSize="0%"
              onResize={handleLeftResize}
            >
              <div style={panelStyle('#e3f2fd')}>LEFT</div>
            </Panel>
            <Separator />
            <Panel
              id="middle"
              defaultSize="34%"
              onResize={handleMiddleResize}
            >
              <div style={panelStyle('#f3e5f5')}>MIDDLE</div>
            </Panel>
            <Separator />
            <Panel
              id="right"
              defaultSize="33%"
              collapsible={true}
              collapsedSize="0%"
              onResize={handleRightResize}
            >
              <div style={panelStyle('#e8f5e9')}>RIGHT</div>
            </Panel>
          </Group>
        </div>
        <div style={logStyle}>
          <div style={{ fontWeight: 600, marginBottom: 8, color: '#58a6ff' }}>State Sync Test</div>
          <div style={{ marginBottom: 8, fontSize: 10, color: '#f97316' }}>
            Red = Let onResize update state (conflict)<br/>
            Green = Ignore onResize during setLayout
          </div>
          {log.map((entry, i) => <div key={i}>{entry}</div>)}
          <button onClick={() => setLog([])} style={{...btnStyle, marginTop: 8, backgroundColor: '#4a5568', fontSize: 10}}>
            Clear
          </button>
        </div>
      </div>
    </div>
  );
};

export const Test10_StateSyncConflict: Story = {
  name: '10. State Sync Conflict',
  render: () => <StateSyncConflictComponent />,
};

// =============================================================================
// TEST 11: With onLayoutChange/onLayoutChanged (like ConfigurablePanelLayout)
// =============================================================================
const WithLayoutChangeHandlersComponent = () => {
  const groupRef = useRef<GroupImperativeHandle>(null);
  const [log, setLog] = useState<string[]>([]);

  const [leftSize, setLeftSize] = useState(33);
  const [middleSize, setMiddleSize] = useState(34);
  const [rightSize, setRightSize] = useState(33);
  const [isDragging, setIsDragging] = useState(false);

  const addLog = (msg: string) => {
    setLog((prev) => [...prev.slice(-30), `${new Date().toISOString().slice(11, 23)}: ${msg}`]);
  };

  // Mimic ConfigurablePanelLayout's handlers
  const handleDragStart = useCallback(() => {
    addLog('onLayoutChange → setIsDragging(true)');
    setIsDragging(true);
  }, []);

  const handleDragComplete = useCallback(() => {
    addLog('onLayoutChanged → setIsDragging(false)');
    setIsDragging(false);
  }, []);

  const handleLeftResize = useCallback((panelSize: PanelSize) => {
    const size = panelSize.asPercentage;
    addLog(`left.onResize: ${size.toFixed(2)}%`);
    setLeftSize(size);
  }, []);

  const handleMiddleResize = useCallback((panelSize: PanelSize) => {
    const size = panelSize.asPercentage;
    addLog(`middle.onResize: ${size.toFixed(2)}%`);
    setMiddleSize(size);
  }, []);

  const handleRightResize = useCallback((panelSize: PanelSize) => {
    const size = panelSize.asPercentage;
    addLog(`right.onResize: ${size.toFixed(2)}%`);
    setRightSize(size);
  }, []);

  const testSetLayout = (sizes: { left: number; middle: number; right: number }) => {
    addLog(`=== setLayout(${JSON.stringify(sizes)}) ===`);
    addLog(`State before: L=${leftSize.toFixed(1)} M=${middleSize.toFixed(1)} R=${rightSize.toFixed(1)}`);

    groupRef.current?.setLayout(sizes);

    // Set state AFTER library call (like CPL does)
    setLeftSize(sizes.left);
    setMiddleSize(sizes.middle);
    setRightSize(sizes.right);

    setTimeout(() => {
      addLog(`State after: L=${leftSize.toFixed(1)} M=${middleSize.toFixed(1)} R=${rightSize.toFixed(1)}`);
      addLog(`Library: ${JSON.stringify(groupRef.current?.getLayout())}`);
    }, 150);
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: 12, background: '#1a1a2e', color: '#fff', display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <strong style={{ marginRight: 8 }}>Test 11: With onLayoutChange/Changed</strong>
        <button onClick={() => testSetLayout({ left: 0, middle: 50, right: 50 })} style={btnStyle}>
          0/50/50
        </button>
        <button onClick={() => testSetLayout({ left: 0, middle: 100, right: 0 })} style={{...btnStyle, backgroundColor: '#9333ea'}}>
          0/100/0
        </button>
        <button onClick={() => testSetLayout({ left: 33, middle: 34, right: 33 })} style={btnStyle}>
          Reset
        </button>
        <span style={{ fontSize: 11, opacity: 0.7 }}>isDragging: {isDragging ? 'true' : 'false'}</span>
      </div>

      <div style={{ display: 'flex', flex: 1 }}>
        <div style={{ flex: 1 }}>
          <Group
            groupRef={groupRef}
            orientation="horizontal"
            onLayoutChange={handleDragStart}
            onLayoutChanged={handleDragComplete}
          >
            <Panel
              id="left"
              defaultSize="33%"
              collapsible={true}
              collapsedSize="0%"
              minSize="0%"
              onResize={handleLeftResize}
            >
              <div style={panelStyle('#e3f2fd')}>LEFT ({leftSize.toFixed(1)}%)</div>
            </Panel>
            <Separator />
            <Panel
              id="middle"
              defaultSize="34%"
              minSize="0%"
              onResize={handleMiddleResize}
            >
              <div style={panelStyle('#f3e5f5')}>MIDDLE ({middleSize.toFixed(1)}%)</div>
            </Panel>
            <Separator />
            <Panel
              id="right"
              defaultSize="33%"
              collapsible={true}
              collapsedSize="0%"
              minSize="0%"
              onResize={handleRightResize}
            >
              <div style={panelStyle('#e8f5e9')}>RIGHT ({rightSize.toFixed(1)}%)</div>
            </Panel>
          </Group>
        </div>
        <div style={logStyle}>
          <div style={{ fontWeight: 600, marginBottom: 8, color: '#58a6ff' }}>Event Log</div>
          {log.map((entry, i) => <div key={i}>{entry}</div>)}
          <button onClick={() => setLog([])} style={{...btnStyle, marginTop: 8, backgroundColor: '#4a5568', fontSize: 10}}>
            Clear
          </button>
        </div>
      </div>
    </div>
  );
};

export const Test11_WithLayoutChangeHandlers: Story = {
  name: '11. With onLayoutChange/Changed',
  render: () => <WithLayoutChangeHandlersComponent />,
};

// =============================================================================
// TEST 12: Use actual ConfigurablePanelLayout component
// =============================================================================
import { ConfigurablePanelLayout, ConfigurablePanelLayoutHandle, PanelDefinitionWithContent } from './ConfigurablePanelLayout';
import { slateTheme } from '@principal-ade/industry-theme';

const ActualCPLComponent = () => {
  const layoutRef = useRef<ConfigurablePanelLayoutHandle>(null);
  const [log, setLog] = useState<string[]>([]);

  const addLog = (msg: string) => {
    setLog((prev) => [...prev.slice(-30), `${new Date().toISOString().slice(11, 23)}: ${msg}`]);
  };

  const panels: PanelDefinitionWithContent[] = [
    { id: 'left', label: 'Left', content: <div style={{ padding: 20, background: '#e3f2fd', height: '100%' }}>Left Panel</div> },
    { id: 'middle', label: 'Middle', content: <div style={{ padding: 20, background: '#f3e5f5', height: '100%' }}>Middle Panel</div> },
    { id: 'right', label: 'Right', content: <div style={{ padding: 20, background: '#e8f5e9', height: '100%' }}>Right Panel</div> },
  ];

  const testSetLayout = (sizes: { left: number; middle: number; right: number }) => {
    addLog(`=== setLayout(${JSON.stringify(sizes)}) ===`);

    const before = layoutRef.current?.getLayout();
    addLog(`Before: ${JSON.stringify(before)}`);

    layoutRef.current?.setLayout(sizes);

    const afterImmediate = layoutRef.current?.getLayout();
    addLog(`After (immediate): ${JSON.stringify(afterImmediate)}`);

    setTimeout(() => {
      const afterDelay = layoutRef.current?.getLayout();
      addLog(`After (100ms): ${JSON.stringify(afterDelay)}`);
    }, 100);

    setTimeout(() => {
      const afterLonger = layoutRef.current?.getLayout();
      addLog(`After (500ms): ${JSON.stringify(afterLonger)}`);
    }, 500);
  };

  const handlePanelResize = useCallback((sizes: { left: number; middle: number; right: number }) => {
    addLog(`onPanelResize: ${JSON.stringify(sizes)}`);
  }, []);

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: 12, background: '#1a1a2e', color: '#fff', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <strong style={{ marginRight: 8 }}>Test 12: Actual ConfigurablePanelLayout</strong>
        <button onClick={() => testSetLayout({ left: 0, middle: 50, right: 50 })} style={{...btnStyle, backgroundColor: '#e53e3e'}}>
          0/50/50
        </button>
        <button onClick={() => testSetLayout({ left: 1, middle: 50, right: 49 })} style={btnStyle}>
          1/50/49
        </button>
        <button onClick={() => testSetLayout({ left: 25, middle: 50, right: 25 })} style={btnStyle}>
          25/50/25
        </button>
        <button onClick={() => testSetLayout({ left: 50, middle: 50, right: 0 })} style={{...btnStyle, backgroundColor: '#e53e3e'}}>
          50/50/0
        </button>
        <button onClick={() => testSetLayout({ left: 0, middle: 100, right: 0 })} style={{...btnStyle, backgroundColor: '#9333ea'}}>
          0/100/0
        </button>
      </div>

      <div style={{ display: 'flex', flex: 1 }}>
        <div style={{ flex: 1 }}>
          <ConfigurablePanelLayout
            ref={layoutRef}
            panels={panels}
            layout={{ left: 'left', middle: 'middle', right: 'right' }}
            defaultSizes={{ left: 25, middle: 50, right: 25 }}
            collapsiblePanels={{ left: true, middle: false, right: true }}
            theme={slateTheme}
            onPanelResize={handlePanelResize}
          />
        </div>
        <div style={logStyle}>
          <div style={{ fontWeight: 600, marginBottom: 8, color: '#58a6ff' }}>ConfigurablePanelLayout Test</div>
          <div style={{ marginBottom: 8, fontSize: 10, color: '#f97316' }}>
            Red buttons test 0 values
          </div>
          {log.map((entry, i) => <div key={i}>{entry}</div>)}
          <button onClick={() => setLog([])} style={{...btnStyle, marginTop: 8, backgroundColor: '#4a5568', fontSize: 10}}>
            Clear
          </button>
        </div>
      </div>
    </div>
  );
};

export const Test12_ActualCPL: Story = {
  name: '12. Actual ConfigurablePanelLayout',
  render: () => <ActualCPLComponent />,
};

// =============================================================================
// TEST 12b: Mimics DevWorkspaceTitlebar toggle behavior
// =============================================================================
const TitlebarToggleComponent = () => {
  const layoutRef = useRef<ConfigurablePanelLayoutHandle>(null);
  const [log, setLog] = useState<string[]>([]);

  // Track panel sizes like DevWorkspaceApp does
  const [panelSizes, setPanelSizes] = useState({ left: 25, middle: 50, right: 25 });

  // Track last expanded sizes like DevWorkspaceTitlebar does
  const lastExpandedSizesRef = useRef({ left: 25, right: 25 });

  const addLog = (msg: string) => {
    setLog((prev) => [...prev.slice(-30), `${new Date().toISOString().slice(11, 23)}: ${msg}`]);
  };

  // Derive collapsed state from sizes (like titlebar does)
  const isLeftCollapsed = panelSizes.left < 5;
  const isRightCollapsed = panelSizes.right < 5;

  // Update last expanded sizes when panels are expanded (like titlebar does)
  React.useEffect(() => {
    if (panelSizes.left >= 5) {
      lastExpandedSizesRef.current.left = panelSizes.left;
    }
    if (panelSizes.right >= 5) {
      lastExpandedSizesRef.current.right = panelSizes.right;
    }
  }, [panelSizes]);

  // When panelSizes changes, call setLayout (like DevWorkspacePanelFramework does)
  React.useEffect(() => {
    if (layoutRef.current) {
      addLog(`Effect: setLayout(${JSON.stringify(panelSizes)})`);
      layoutRef.current.setLayout(panelSizes);
    }
  }, [panelSizes]);

  // Toggle left (exactly like DevWorkspaceTitlebar)
  const handleToggleLeft = () => {
    addLog(`--- Toggle Left (currently ${isLeftCollapsed ? 'collapsed' : 'expanded'}) ---`);
    if (isLeftCollapsed) {
      // Expand: restore last size
      const newLeft = lastExpandedSizesRef.current.left;
      const newSizes = {
        left: newLeft,
        middle: panelSizes.middle - newLeft,
        right: panelSizes.right,
      };
      addLog(`Expanding left to: ${JSON.stringify(newSizes)}`);
      setPanelSizes(newSizes);
    } else {
      // Collapse: set to 0
      const newSizes = {
        left: 0,
        middle: panelSizes.middle + panelSizes.left,
        right: panelSizes.right,
      };
      addLog(`Collapsing left to: ${JSON.stringify(newSizes)}`);
      setPanelSizes(newSizes);
    }
  };

  // Toggle right (exactly like DevWorkspaceTitlebar)
  const handleToggleRight = () => {
    addLog(`--- Toggle Right (currently ${isRightCollapsed ? 'collapsed' : 'expanded'}) ---`);
    if (isRightCollapsed) {
      // Expand: restore last size
      const newRight = lastExpandedSizesRef.current.right;
      const newSizes = {
        left: panelSizes.left,
        middle: panelSizes.middle - newRight,
        right: newRight,
      };
      addLog(`Expanding right to: ${JSON.stringify(newSizes)}`);
      setPanelSizes(newSizes);
    } else {
      // Collapse: set to 0
      const newSizes = {
        left: panelSizes.left,
        middle: panelSizes.middle + panelSizes.right,
        right: 0,
      };
      addLog(`Collapsing right to: ${JSON.stringify(newSizes)}`);
      setPanelSizes(newSizes);
    }
  };

  const panels: PanelDefinitionWithContent[] = [
    { id: 'left', label: 'Left', content: <div style={{ padding: 20, background: '#e3f2fd', height: '100%' }}>Left Panel</div> },
    { id: 'middle', label: 'Middle', content: <div style={{ padding: 20, background: '#f3e5f5', height: '100%' }}>Middle Panel</div> },
    { id: 'right', label: 'Right', content: <div style={{ padding: 20, background: '#e8f5e9', height: '100%' }}>Right Panel</div> },
  ];

  const handlePanelResize = useCallback((sizes: { left: number; middle: number; right: number }) => {
    addLog(`onPanelResize: ${JSON.stringify(sizes)}`);
    // Note: In real app, this would update panelSizes but we skip to avoid feedback loop
  }, []);

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: 12, background: '#1a1a2e', color: '#fff', display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <strong style={{ marginRight: 8 }}>Test 12b: Titlebar Toggle Behavior</strong>
        <button
          onClick={handleToggleLeft}
          style={{...btnStyle, backgroundColor: isLeftCollapsed ? '#38a169' : '#e53e3e'}}
        >
          {isLeftCollapsed ? '◀ Expand Left' : '▶ Collapse Left'}
        </button>
        <button
          onClick={handleToggleRight}
          style={{...btnStyle, backgroundColor: isRightCollapsed ? '#38a169' : '#e53e3e'}}
        >
          {isRightCollapsed ? 'Expand Right ▶' : 'Collapse Right ◀'}
        </button>
        <div style={{ marginLeft: 'auto', fontSize: 11, fontFamily: 'monospace' }}>
          sizes: {panelSizes.left.toFixed(0)}/{panelSizes.middle.toFixed(0)}/{panelSizes.right.toFixed(0)} |
          lastExpanded: {lastExpandedSizesRef.current.left}/{lastExpandedSizesRef.current.right}
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1 }}>
        <div style={{ flex: 1 }}>
          <ConfigurablePanelLayout
            ref={layoutRef}
            panels={panels}
            layout={{ left: 'left', middle: 'middle', right: 'right' }}
            defaultSizes={{ left: 25, middle: 50, right: 25 }}
            collapsiblePanels={{ left: true, middle: false, right: true }}
            theme={slateTheme}
            onPanelResize={handlePanelResize}
          />
        </div>
        <div style={logStyle}>
          <div style={{ fontWeight: 600, marginBottom: 8, color: '#58a6ff' }}>Titlebar Toggle Test</div>
          <div style={{ marginBottom: 8, fontSize: 10, color: '#f97316' }}>
            Mimics DevWorkspaceTitlebar behavior:<br/>
            - Tracks lastExpandedSizes<br/>
            - Derives collapsed from size {'<'} 5<br/>
            - Updates panelSizes state → triggers setLayout
          </div>
          {log.map((entry, i) => <div key={i}>{entry}</div>)}
          <button onClick={() => setLog([])} style={{...btnStyle, marginTop: 8, backgroundColor: '#4a5568', fontSize: 10}}>
            Clear
          </button>
        </div>
      </div>
    </div>
  );
};

export const Test12b_TitlebarToggle: Story = {
  name: '12b. Titlebar Toggle Behavior',
  render: () => <TitlebarToggleComponent />,
};

// =============================================================================
// TEST 13: Isolate wrapper structure issue
// =============================================================================
const WrapperIsolationComponent = () => {
  const groupRef = useRef<GroupImperativeHandle>(null);
  const [log, setLog] = useState<string[]>([]);

  const [leftSize, setLeftSize] = useState(33);
  const [middleSize, setMiddleSize] = useState(34);
  const [rightSize, setRightSize] = useState(33);

  const addLog = (msg: string) => {
    setLog((prev) => [...prev.slice(-30), `${new Date().toISOString().slice(11, 23)}: ${msg}`]);
  };

  const handleLeftResize = useCallback((panelSize: PanelSize) => {
    setLeftSize(panelSize.asPercentage);
  }, []);

  const handleMiddleResize = useCallback((panelSize: PanelSize) => {
    setMiddleSize(panelSize.asPercentage);
  }, []);

  const handleRightResize = useCallback((panelSize: PanelSize) => {
    setRightSize(panelSize.asPercentage);
  }, []);

  const testSetLayout = (sizes: { left: number; middle: number; right: number }) => {
    addLog(`setLayout(${JSON.stringify(sizes)})`);
    groupRef.current?.setLayout(sizes);

    setTimeout(() => {
      addLog(`After: ${JSON.stringify(groupRef.current?.getLayout())}`);
    }, 500);
  };

  // Wrapper styles matching ConfigurablePanelLayout
  const wrapperStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    minWidth: 0,
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: 12, background: '#1a1a2e', color: '#fff', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <strong style={{ marginRight: 8 }}>Test 13: Wrapper Isolation</strong>
        <button onClick={() => testSetLayout({ left: 0, middle: 100, right: 0 })} style={{...btnStyle, backgroundColor: '#9333ea'}}>
          0/100/0
        </button>
        <button onClick={() => testSetLayout({ left: 33, middle: 34, right: 33 })} style={btnStyle}>
          Reset
        </button>
      </div>

      <div style={{ display: 'flex', flex: 1 }}>
        <div style={{ flex: 1 }}>
          <Group groupRef={groupRef} orientation="horizontal">
            <Panel id="left" defaultSize="33%" collapsible={true} collapsedSize="0%" minSize="0%" onResize={handleLeftResize}>
              {/* Mimicking CPL wrapper structure */}
              <div style={wrapperStyle}>
                <div style={wrapperStyle}>
                  <div style={{ padding: 20, background: '#e3f2fd', height: '100%' }}>LEFT</div>
                </div>
              </div>
            </Panel>
            <Separator />
            <Panel id="middle" defaultSize="34%" minSize="0%" onResize={handleMiddleResize}>
              <div style={wrapperStyle}>
                <div style={wrapperStyle}>
                  <div style={{ padding: 20, background: '#f3e5f5', height: '100%' }}>MIDDLE</div>
                </div>
              </div>
            </Panel>
            <Separator />
            <Panel id="right" defaultSize="33%" collapsible={true} collapsedSize="0%" minSize="0%" onResize={handleRightResize}>
              <div style={wrapperStyle}>
                <div style={wrapperStyle}>
                  <div style={{ padding: 20, background: '#e8f5e9', height: '100%' }}>RIGHT</div>
                </div>
              </div>
            </Panel>
          </Group>
        </div>
        <div style={logStyle}>
          <div style={{ fontWeight: 600, marginBottom: 8, color: '#58a6ff' }}>Wrapper Test</div>
          {log.map((entry, i) => <div key={i}>{entry}</div>)}
        </div>
      </div>
    </div>
  );
};

export const Test13_WrapperIsolation: Story = {
  name: '13. Wrapper Isolation',
  render: () => <WrapperIsolationComponent />,
};

// =============================================================================
// TEST 14: With PanelBoundsProvider
// =============================================================================
import { PanelBoundsProvider } from '../hooks/usePanelBounds';

const WithPanelBoundsComponent = () => {
  const groupRef = useRef<GroupImperativeHandle>(null);
  const [log, setLog] = useState<string[]>([]);

  const [leftSize, setLeftSize] = useState(33);
  const [middleSize, setMiddleSize] = useState(34);
  const [rightSize, setRightSize] = useState(33);

  const addLog = (msg: string) => {
    setLog((prev) => [...prev.slice(-30), `${new Date().toISOString().slice(11, 23)}: ${msg}`]);
  };

  const handleLeftResize = useCallback((panelSize: PanelSize) => {
    setLeftSize(panelSize.asPercentage);
  }, []);

  const handleMiddleResize = useCallback((panelSize: PanelSize) => {
    setMiddleSize(panelSize.asPercentage);
  }, []);

  const handleRightResize = useCallback((panelSize: PanelSize) => {
    setRightSize(panelSize.asPercentage);
  }, []);

  const testSetLayout = (sizes: { left: number; middle: number; right: number }) => {
    addLog(`setLayout(${JSON.stringify(sizes)})`);
    groupRef.current?.setLayout(sizes);

    setTimeout(() => {
      addLog(`After: ${JSON.stringify(groupRef.current?.getLayout())}`);
    }, 500);
  };

  const wrapperStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    minWidth: 0,
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: 12, background: '#1a1a2e', color: '#fff', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <strong style={{ marginRight: 8 }}>Test 14: With PanelBoundsProvider</strong>
        <button onClick={() => testSetLayout({ left: 0, middle: 100, right: 0 })} style={{...btnStyle, backgroundColor: '#9333ea'}}>
          0/100/0
        </button>
        <button onClick={() => testSetLayout({ left: 33, middle: 34, right: 33 })} style={btnStyle}>
          Reset
        </button>
      </div>

      <div style={{ display: 'flex', flex: 1 }}>
        <div style={{ flex: 1 }}>
          <Group groupRef={groupRef} orientation="horizontal">
            <Panel id="left" defaultSize="33%" collapsible={true} collapsedSize="0%" minSize="0%" onResize={handleLeftResize}>
              <div style={wrapperStyle}>
                <PanelBoundsProvider slot="left">
                  <div style={{ padding: 20, background: '#e3f2fd', height: '100%' }}>LEFT</div>
                </PanelBoundsProvider>
              </div>
            </Panel>
            <Separator />
            <Panel id="middle" defaultSize="34%" minSize="0%" onResize={handleMiddleResize}>
              <div style={wrapperStyle}>
                <PanelBoundsProvider slot="middle">
                  <div style={{ padding: 20, background: '#f3e5f5', height: '100%' }}>MIDDLE</div>
                </PanelBoundsProvider>
              </div>
            </Panel>
            <Separator />
            <Panel id="right" defaultSize="33%" collapsible={true} collapsedSize="0%" minSize="0%" onResize={handleRightResize}>
              <div style={wrapperStyle}>
                <PanelBoundsProvider slot="right">
                  <div style={{ padding: 20, background: '#e8f5e9', height: '100%' }}>RIGHT</div>
                </PanelBoundsProvider>
              </div>
            </Panel>
          </Group>
        </div>
        <div style={logStyle}>
          <div style={{ fontWeight: 600, marginBottom: 8, color: '#58a6ff' }}>With PanelBoundsProvider</div>
          {log.map((entry, i) => <div key={i}>{entry}</div>)}
        </div>
      </div>
    </div>
  );
};

export const Test14_WithPanelBounds: Story = {
  name: '14. With PanelBoundsProvider',
  render: () => <WithPanelBoundsComponent />,
};

// =============================================================================
// TEST 15: With CSS classes from ConfigurablePanelLayout
// =============================================================================
import './ConfigurablePanelLayout.css';

const WithCSSClassesComponent = () => {
  const groupRef = useRef<GroupImperativeHandle>(null);
  const [log, setLog] = useState<string[]>([]);

  const [leftSize, setLeftSize] = useState(33);
  const [middleSize, setMiddleSize] = useState(34);
  const [rightSize, setRightSize] = useState(33);
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);

  const addLog = (msg: string) => {
    setLog((prev) => [...prev.slice(-30), `${new Date().toISOString().slice(11, 23)}: ${msg}`]);
  };

  const handleLeftResize = useCallback((panelSize: PanelSize) => {
    const size = panelSize.asPercentage;
    setLeftSize(size);
    setLeftCollapsed(size === 0);
  }, []);

  const handleMiddleResize = useCallback((panelSize: PanelSize) => {
    setMiddleSize(panelSize.asPercentage);
  }, []);

  const handleRightResize = useCallback((panelSize: PanelSize) => {
    const size = panelSize.asPercentage;
    setRightSize(size);
    setRightCollapsed(size === 0);
  }, []);

  const testSetLayout = (sizes: { left: number; middle: number; right: number }) => {
    addLog(`setLayout(${JSON.stringify(sizes)})`);
    groupRef.current?.setLayout(sizes);

    setTimeout(() => {
      addLog(`After: ${JSON.stringify(groupRef.current?.getLayout())}`);
    }, 500);
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: 12, background: '#1a1a2e', color: '#fff', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <strong style={{ marginRight: 8 }}>Test 15: With CSS Classes</strong>
        <button onClick={() => testSetLayout({ left: 0, middle: 100, right: 0 })} style={{...btnStyle, backgroundColor: '#9333ea'}}>
          0/100/0
        </button>
        <button onClick={() => testSetLayout({ left: 33, middle: 34, right: 33 })} style={btnStyle}>
          Reset
        </button>
      </div>

      <div style={{ display: 'flex', flex: 1 }}>
        <div style={{ flex: 1 }}>
          <Group groupRef={groupRef} orientation="horizontal">
            <Panel
              id="left"
              defaultSize="33%"
              collapsible={true}
              collapsedSize="0%"
              minSize="0%"
              onResize={handleLeftResize}
              className={`three-panel-item collapsible-panel ${leftCollapsed ? 'collapsed' : ''}`}
            >
              <div className="panel-content-wrapper" style={{ opacity: leftCollapsed ? 0 : 1 }}>
                <PanelBoundsProvider slot="left">
                  <div style={{ padding: 20, background: '#e3f2fd', height: '100%' }}>LEFT</div>
                </PanelBoundsProvider>
              </div>
            </Panel>
            <Separator />
            <Panel
              id="middle"
              defaultSize="34%"
              minSize="0%"
              onResize={handleMiddleResize}
              className="three-panel-item"
            >
              <div className="panel-content-wrapper">
                <PanelBoundsProvider slot="middle">
                  <div style={{ padding: 20, background: '#f3e5f5', height: '100%' }}>MIDDLE</div>
                </PanelBoundsProvider>
              </div>
            </Panel>
            <Separator />
            <Panel
              id="right"
              defaultSize="33%"
              collapsible={true}
              collapsedSize="0%"
              minSize="0%"
              onResize={handleRightResize}
              className={`three-panel-item collapsible-panel ${rightCollapsed ? 'collapsed' : ''}`}
            >
              <div className="panel-content-wrapper" style={{ opacity: rightCollapsed ? 0 : 1 }}>
                <PanelBoundsProvider slot="right">
                  <div style={{ padding: 20, background: '#e8f5e9', height: '100%' }}>RIGHT</div>
                </PanelBoundsProvider>
              </div>
            </Panel>
          </Group>
        </div>
        <div style={logStyle}>
          <div style={{ fontWeight: 600, marginBottom: 8, color: '#58a6ff' }}>With CSS Classes</div>
          {log.map((entry, i) => <div key={i}>{entry}</div>)}
        </div>
      </div>
    </div>
  );
};

export const Test15_WithCSSClasses: Story = {
  name: '15. With CSS Classes',
  render: () => <WithCSSClassesComponent />,
};

// =============================================================================
// TEST 16: With Separator classes (likely the culprit)
// =============================================================================
const WithSeparatorClassesComponent = () => {
  const groupRef = useRef<GroupImperativeHandle>(null);
  const [log, setLog] = useState<string[]>([]);

  const [leftSize, setLeftSize] = useState(33);
  const [middleSize, setMiddleSize] = useState(34);
  const [rightSize, setRightSize] = useState(33);
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);

  const addLog = (msg: string) => {
    setLog((prev) => [...prev.slice(-30), `${new Date().toISOString().slice(11, 23)}: ${msg}`]);
  };

  const handleLeftResize = useCallback((panelSize: PanelSize) => {
    const size = panelSize.asPercentage;
    addLog(`left.onResize: ${size.toFixed(2)}%`);
    setLeftSize(size);
    setLeftCollapsed(size === 0);
  }, []);

  const handleMiddleResize = useCallback((panelSize: PanelSize) => {
    const size = panelSize.asPercentage;
    addLog(`middle.onResize: ${size.toFixed(2)}%`);
    setMiddleSize(size);
  }, []);

  const handleRightResize = useCallback((panelSize: PanelSize) => {
    const size = panelSize.asPercentage;
    addLog(`right.onResize: ${size.toFixed(2)}%`);
    setRightSize(size);
    setRightCollapsed(size === 0);
  }, []);

  const testSetLayout = (sizes: { left: number; middle: number; right: number }) => {
    addLog(`=== setLayout(${JSON.stringify(sizes)}) ===`);
    groupRef.current?.setLayout(sizes);

    setTimeout(() => {
      addLog(`After 500ms: ${JSON.stringify(groupRef.current?.getLayout())}`);
    }, 500);
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: 12, background: '#1a1a2e', color: '#fff', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <strong style={{ marginRight: 8 }}>Test 16: With Separator Classes</strong>
        <button onClick={() => testSetLayout({ left: 0, middle: 100, right: 0 })} style={{...btnStyle, backgroundColor: '#9333ea'}}>
          0/100/0
        </button>
        <button onClick={() => testSetLayout({ left: 33, middle: 34, right: 33 })} style={btnStyle}>
          Reset
        </button>
      </div>

      <div style={{ display: 'flex', flex: 1 }}>
        <div style={{ flex: 1 }}>
          <Group groupRef={groupRef} orientation="horizontal">
            <Panel
              id="left"
              defaultSize="33%"
              collapsible={true}
              collapsedSize="0%"
              minSize="0%"
              onResize={handleLeftResize}
              className={`three-panel-item collapsible-panel ${leftCollapsed ? 'collapsed' : ''}`}
            >
              <div className="panel-content-wrapper">
                <div style={{ padding: 20, background: '#e3f2fd', height: '100%' }}>LEFT</div>
              </div>
            </Panel>
            <Separator className={`resize-handle left-handle ${leftCollapsed ? 'collapsed' : ''}`} />
            <Panel
              id="middle"
              defaultSize="34%"
              minSize="0%"
              onResize={handleMiddleResize}
              className="three-panel-item"
            >
              <div className="panel-content-wrapper">
                <div style={{ padding: 20, background: '#f3e5f5', height: '100%' }}>MIDDLE</div>
              </div>
            </Panel>
            <Separator className={`resize-handle right-handle ${rightCollapsed ? 'collapsed' : ''}`} />
            <Panel
              id="right"
              defaultSize="33%"
              collapsible={true}
              collapsedSize="0%"
              minSize="0%"
              onResize={handleRightResize}
              className={`three-panel-item collapsible-panel ${rightCollapsed ? 'collapsed' : ''}`}
            >
              <div className="panel-content-wrapper">
                <div style={{ padding: 20, background: '#e8f5e9', height: '100%' }}>RIGHT</div>
              </div>
            </Panel>
          </Group>
        </div>
        <div style={logStyle}>
          <div style={{ fontWeight: 600, marginBottom: 8, color: '#58a6ff' }}>With Separator Classes</div>
          <div style={{ fontSize: 10, color: '#f97316', marginBottom: 8 }}>
            Separators get .collapsed class → width: 0
          </div>
          {log.map((entry, i) => <div key={i}>{entry}</div>)}
        </div>
      </div>
    </div>
  );
};

export const Test16_WithSeparatorClasses: Story = {
  name: '16. With Separator Classes',
  render: () => <WithSeparatorClassesComponent />,
};

// =============================================================================
// TEST 17: With .three-panel-layout wrapper (flex-direction: column)
// =============================================================================
const WithLayoutWrapperComponent = () => {
  const groupRef = useRef<GroupImperativeHandle>(null);
  const [log, setLog] = useState<string[]>([]);

  const [leftSize, setLeftSize] = useState(33);
  const [middleSize, setMiddleSize] = useState(34);
  const [rightSize, setRightSize] = useState(33);
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);

  const addLog = (msg: string) => {
    setLog((prev) => [...prev.slice(-30), `${new Date().toISOString().slice(11, 23)}: ${msg}`]);
  };

  const handleLeftResize = useCallback((panelSize: PanelSize) => {
    const size = panelSize.asPercentage;
    addLog(`left.onResize: ${size.toFixed(2)}%`);
    setLeftSize(size);
    setLeftCollapsed(size === 0);
  }, []);

  const handleMiddleResize = useCallback((panelSize: PanelSize) => {
    const size = panelSize.asPercentage;
    addLog(`middle.onResize: ${size.toFixed(2)}%`);
    setMiddleSize(size);
  }, []);

  const handleRightResize = useCallback((panelSize: PanelSize) => {
    const size = panelSize.asPercentage;
    addLog(`right.onResize: ${size.toFixed(2)}%`);
    setRightSize(size);
    setRightCollapsed(size === 0);
  }, []);

  const testSetLayout = (sizes: { left: number; middle: number; right: number }) => {
    addLog(`=== setLayout(${JSON.stringify(sizes)}) ===`);
    groupRef.current?.setLayout(sizes);

    setTimeout(() => {
      addLog(`After 500ms: ${JSON.stringify(groupRef.current?.getLayout())}`);
    }, 500);
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: 12, background: '#1a1a2e', color: '#fff', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <strong style={{ marginRight: 8 }}>Test 17: With .three-panel-layout wrapper</strong>
        <button onClick={() => testSetLayout({ left: 0, middle: 100, right: 0 })} style={{...btnStyle, backgroundColor: '#9333ea'}}>
          0/100/0
        </button>
        <button onClick={() => testSetLayout({ left: 33, middle: 34, right: 33 })} style={btnStyle}>
          Reset
        </button>
      </div>

      <div style={{ display: 'flex', flex: 1 }}>
        {/* This is the key difference - wrapping in .three-panel-layout */}
        <div className="three-panel-layout" style={{ flex: 1 }}>
          <Group groupRef={groupRef} orientation="horizontal">
            <Panel
              id="left"
              defaultSize="33%"
              collapsible={true}
              collapsedSize="0%"
              minSize="0%"
              onResize={handleLeftResize}
              className={`three-panel-item collapsible-panel ${leftCollapsed ? 'collapsed' : ''}`}
            >
              <div className="panel-content-wrapper">
                <div style={{ padding: 20, background: '#e3f2fd', height: '100%' }}>LEFT</div>
              </div>
            </Panel>
            <Separator className={`resize-handle left-handle ${leftCollapsed ? 'collapsed' : ''}`} />
            <Panel
              id="middle"
              defaultSize="34%"
              minSize="0%"
              onResize={handleMiddleResize}
              className="three-panel-item"
            >
              <div className="panel-content-wrapper">
                <div style={{ padding: 20, background: '#f3e5f5', height: '100%' }}>MIDDLE</div>
              </div>
            </Panel>
            <Separator className={`resize-handle right-handle ${rightCollapsed ? 'collapsed' : ''}`} />
            <Panel
              id="right"
              defaultSize="33%"
              collapsible={true}
              collapsedSize="0%"
              minSize="0%"
              onResize={handleRightResize}
              className={`three-panel-item collapsible-panel ${rightCollapsed ? 'collapsed' : ''}`}
            >
              <div className="panel-content-wrapper">
                <div style={{ padding: 20, background: '#e8f5e9', height: '100%' }}>RIGHT</div>
              </div>
            </Panel>
          </Group>
        </div>
        <div style={logStyle}>
          <div style={{ fontWeight: 600, marginBottom: 8, color: '#58a6ff' }}>With .three-panel-layout</div>
          <div style={{ fontSize: 10, color: '#f97316', marginBottom: 8 }}>
            Outer div has flex-direction: column
          </div>
          {log.map((entry, i) => <div key={i}>{entry}</div>)}
        </div>
      </div>
    </div>
  );
};

export const Test17_WithLayoutWrapper: Story = {
  name: '17. With .three-panel-layout wrapper',
  render: () => <WithLayoutWrapperComponent />,
};

// =============================================================================
// TEST 18: With disabled Separators (like ConfigurablePanelLayout)
// =============================================================================
const WithDisabledSeparatorsComponent = () => {
  const groupRef = useRef<GroupImperativeHandle>(null);
  const [log, setLog] = useState<string[]>([]);

  const [leftSize, setLeftSize] = useState(33);
  const [middleSize, setMiddleSize] = useState(34);
  const [rightSize, setRightSize] = useState(33);
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);

  const addLog = (msg: string) => {
    setLog((prev) => [...prev.slice(-30), `${new Date().toISOString().slice(11, 23)}: ${msg}`]);
  };

  const handleLeftResize = useCallback((panelSize: PanelSize) => {
    const size = panelSize.asPercentage;
    addLog(`left.onResize: ${size.toFixed(2)}%`);
    setLeftSize(size);
    setLeftCollapsed(size === 0);
  }, []);

  const handleMiddleResize = useCallback((panelSize: PanelSize) => {
    const size = panelSize.asPercentage;
    addLog(`middle.onResize: ${size.toFixed(2)}%`);
    setMiddleSize(size);
  }, []);

  const handleRightResize = useCallback((panelSize: PanelSize) => {
    const size = panelSize.asPercentage;
    addLog(`right.onResize: ${size.toFixed(2)}%`);
    setRightSize(size);
    setRightCollapsed(size === 0);
  }, []);

  const testSetLayout = (sizes: { left: number; middle: number; right: number }) => {
    addLog(`=== setLayout(${JSON.stringify(sizes)}) ===`);
    groupRef.current?.setLayout(sizes);

    setTimeout(() => {
      addLog(`After 500ms: ${JSON.stringify(groupRef.current?.getLayout())}`);
    }, 500);
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: 12, background: '#1a1a2e', color: '#fff', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <strong style={{ marginRight: 8 }}>Test 18: With disabled Separators</strong>
        <button onClick={() => testSetLayout({ left: 0, middle: 100, right: 0 })} style={{...btnStyle, backgroundColor: '#9333ea'}}>
          0/100/0
        </button>
        <button onClick={() => testSetLayout({ left: 33, middle: 34, right: 33 })} style={btnStyle}>
          Reset
        </button>
      </div>

      <div style={{ display: 'flex', flex: 1 }}>
        <div className="three-panel-layout" style={{ flex: 1 }}>
          <Group groupRef={groupRef} orientation="horizontal">
            <Panel
              id="left"
              defaultSize="33%"
              collapsible={true}
              collapsedSize="0%"
              minSize="0%"
              onResize={handleLeftResize}
              className={`three-panel-item collapsible-panel ${leftCollapsed ? 'collapsed' : ''}`}
            >
              <div className="panel-content-wrapper">
                <div style={{ padding: 20, background: '#e3f2fd', height: '100%' }}>LEFT</div>
              </div>
            </Panel>
            <Separator
              className={`resize-handle left-handle ${leftCollapsed ? 'collapsed' : ''}`}
              disabled={leftCollapsed}
            />
            <Panel
              id="middle"
              defaultSize="34%"
              minSize="0%"
              onResize={handleMiddleResize}
              className="three-panel-item"
            >
              <div className="panel-content-wrapper">
                <div style={{ padding: 20, background: '#f3e5f5', height: '100%' }}>MIDDLE</div>
              </div>
            </Panel>
            <Separator
              className={`resize-handle right-handle ${rightCollapsed ? 'collapsed' : ''}`}
              disabled={rightCollapsed}
            />
            <Panel
              id="right"
              defaultSize="33%"
              collapsible={true}
              collapsedSize="0%"
              minSize="0%"
              onResize={handleRightResize}
              className={`three-panel-item collapsible-panel ${rightCollapsed ? 'collapsed' : ''}`}
            >
              <div className="panel-content-wrapper">
                <div style={{ padding: 20, background: '#e8f5e9', height: '100%' }}>RIGHT</div>
              </div>
            </Panel>
          </Group>
        </div>
        <div style={logStyle}>
          <div style={{ fontWeight: 600, marginBottom: 8, color: '#58a6ff' }}>With disabled Separators</div>
          {log.map((entry, i) => <div key={i}>{entry}</div>)}
        </div>
      </div>
    </div>
  );
};

export const Test18_WithDisabledSeparators: Story = {
  name: '18. With disabled Separators',
  render: () => <WithDisabledSeparatorsComponent />,
};
