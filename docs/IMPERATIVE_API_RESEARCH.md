# Imperative API Research - setLayout with 0 values

## Problem Summary

The `ConfigurablePanelLayout` component needs an imperative API (`setLayout`) to change panel sizes programmatically without remounting the component. This preserves child component state (e.g., terminal tabs).

## Current Issue

Setting a panel size to `0` via `setLayout({ left: 0, middle: 50, right: 50 })` does not work correctly with `react-resizable-panels`.

### Observed Behavior
- `setLayout({ left: 1, middle: 50, right: 49 })` works correctly
- `setLayout({ left: 0, middle: 50, right: 50 })` causes issues:
  - Multiple cascading `onPanelResize` callbacks
  - Final sizes are incorrect (e.g., `0/89.96/10.04` instead of `0/50/50`)

## Approaches Tried

### 1. Direct `setLayout` call
```tsx
panelGroupRef.current.setLayout({ left: 0, middle: 50, right: 50 });
```
**Result:** Cascading resize callbacks, incorrect final sizes

### 2. `collapse()` then `setLayout()`
```tsx
leftPanelRef.current.collapse();
requestAnimationFrame(() => {
  panelGroupRef.current.setLayout({ left: 0, middle: 50, right: 50 });
});
```
**Result:** Wrong proportions (89.96/10.04 instead of 50/50)

### 3. Individual `resize()` calls after `collapse()`
```tsx
leftPanelRef.current.collapse();
middlePanelRef.current.resize(50);
rightPanelRef.current.resize(50);
```
**Result:** Did not work - all buttons stopped working

### 4. Using tiny value (0.01) instead of 0
```tsx
const adjustedLeft = sizes.left === 0 ? 0.01 : sizes.left;
panelGroupRef.current.setLayout({ left: adjustedLeft, ... });
```
**Result:** Blocked by minSize constraints (panels had 5-10% minimums)

### 5. Removed minSize constraints
Removed all `minSize` props from Panel components.
**Result:** Still needs testing

## Library Details

- **Library:** `react-resizable-panels` (custom fork at `@anthropic-internal/react-resizable-panels` or similar)
- **Version:** Check `package.json`
- **Key APIs:**
  - `GroupImperativeHandle.setLayout({ panelId: percentage })`
  - `GroupImperativeHandle.getLayout()` - returns `{ panelId: percentage }`
  - `PanelImperativeHandle.collapse()`
  - `PanelImperativeHandle.expand()`
  - `PanelImperativeHandle.resize(percentage)`

## Research Questions

1. **How does `setLayout` handle 0 values internally?**
   - Does it treat 0 as a special "collapse" case?
   - Does it redistribute space differently when a panel is 0?

2. **What's the relationship between `collapse()` and `setLayout()`?**
   - Does calling `setLayout` after `collapse` conflict with the collapsed state?
   - Should we only use one or the other?

3. **Is there a specific order of operations required?**
   - Should we collapse first, wait for layout to stabilize, then resize others?
   - Do we need to use `flushSync` or multiple `requestAnimationFrame` calls?

4. **What does the library's source say about these interactions?**
   - Check the library source for `setLayout` implementation
   - Look for any special handling of 0 values or collapsed panels

## Files Involved

- `/panels/src/components/ConfigurablePanelLayout.tsx` - Main component with imperative API
- `/panels/src/components/ConfigurablePanelLayout.stories.tsx` - Has `ImperativeAPITest` story for debugging
- `/panel-layouts/src/stories/StorybookButtonBehavior.stories.tsx` - Integration test story

## Test Story

The `ImperativeAPITest` story in `ConfigurablePanelLayout.stories.tsx` provides buttons to test various `setLayout` configurations and logs all `onPanelResize` callbacks.

## Next Steps

1. Read the `react-resizable-panels` library source code
2. Look for issues/discussions about `setLayout` with 0 values
3. Consider alternative approaches:
   - Using CSS to visually hide panels instead of sizing to 0
   - Using a wrapper that swaps between different panel configurations
   - Contributing a fix upstream if this is a library bug
