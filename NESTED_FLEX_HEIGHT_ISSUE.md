# Nested Flex Child Height Inheritance Issue

## Problem

When `AnimatedResizableLayout` is placed inside a flex item (e.g., a content area below a header), components that use `height: 100%` may have 0 height on initial render.

This commonly occurs when the layout structure looks like:

```tsx
<div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
  {/* Header - fixed height */}
  <div style={{ height: '50px', flexShrink: 0 }}>Header</div>

  {/* Content - flex item that fills remaining space */}
  <div style={{ flex: '1 1 0%', minHeight: 0 }}>
    <AnimatedResizableLayout
      rightPanel={
        {/* This has 0 height! */}
        <GraphRenderer style={{ height: '100%' }} />
      }
    />
  </div>
</div>
```

## Root Cause

CSS `height: 100%` only works when the **parent has an explicitly defined height**.

A parent with `flex: 1` becomes a flex ITEM (it grows to fill space), but this does NOT give it a "defined height" for CSS percentage calculations. The browser sees the parent's height as "auto" from the perspective of percentage-based children.

### The Height Cascade

For `height: 100%` to work, every ancestor must have a defined height:

```
✓ html { height: 100% }
✓ body { height: 100% }
✓ .app-container { height: 100vh }
✓ .outer-flex-container { display: flex; height: 100% }
✗ .content-area { flex: 1 }          ← Not a "defined height"!
✗ .animated-resizable-layout { height: 100% }  ← Gets 0 height
✗ .graph-renderer { height: 100% }             ← Gets 0 height
```

## Solution

The parent element must be **both a flex item AND a flex container**:

```tsx
<div style={{
  flex: '1 1 0%',
  minHeight: 0,
  display: 'flex',        // ← Add this!
  flexDirection: 'column' // ← Add this!
}}>
  <AnimatedResizableLayout ... />
</div>
```

When the parent is a flex container, children can use `flex: 1` instead of `height: 100%`, which works correctly because flexbox distributes space based on the container's size, not percentage calculations.

## CSS Fix in AnimatedResizableLayout

The `AnimatedResizableLayout` component now uses `flex: 1` instead of `height: 100%` in its CSS:

```css
.animated-resizable-layout {
  flex: 1;
  min-height: 0;
  width: 100%;
  position: relative;
}

/* Scoped selector to prevent override by other components */
.animated-resizable-layout .panel-content-wrapper {
  flex: 1;
  min-width: 0;
  min-height: 0;
  width: 100%;
}
```

### Why the Scoped Selector?

Multiple panel components define `.panel-content-wrapper` with different styles:
- `AnimatedResizableLayout.css`: `flex: 1; min-height: 0`
- `AnimatedVerticalLayout.css`: `height: 100%`
- `ThreePanelLayout.css`: `flex: 1`

Without scoping, the CSS cascade can cause the wrong styles to win. The scoped selector `.animated-resizable-layout .panel-content-wrapper` has higher specificity and ensures the correct styles are applied.

## Debugging Checklist

If you encounter this issue:

1. **Check the parent element**: Is it a flex item (`flex: 1`) without being a flex container?
   - Fix: Add `display: flex; flex-direction: column`

2. **Inspect computed styles**: In DevTools, check if the element has computed height of 0
   - Look at each ancestor to find where the height cascade breaks

3. **Verify CSS is loaded**: Check that `panels.css` styles are applied
   - The `.animated-resizable-layout` should have `flex: 1`, not `height: 100%`

4. **Check for CSS conflicts**: Other stylesheets might override panel styles
   - Look for other definitions of `.panel-content-wrapper`

## Storybook Test

See the `NestedFlexChild` story in `AnimatedResizableLayout.stories.tsx` for a working example that demonstrates both the problem and the fix.

```bash
# Run Storybook to see the test
bun run storybook

# Navigate to: Layout / AnimatedResizableLayout / Nested Flex Child
```

## Related Issues

- Components using `height: 100%` inside panels (GraphRenderer, Canvas, etc.)
- ResizeObserver returning 0 dimensions on initial render
- "Works after hot reload" symptom (layout recalculates after DOM changes)

## References

- [CSS height: 100% not working](https://stackoverflow.com/questions/1622027/percentage-height-html-5-css)
- [Flexbox min-height: 0 trick](https://css-tricks.com/flexbox-truncated-text/)
- [react-resizable-panels documentation](https://github.com/bvaughn/react-resizable-panels)
