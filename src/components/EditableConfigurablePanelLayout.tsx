import React, { useState, useCallback, ReactNode, useEffect } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragMoveEvent,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
} from '@dnd-kit/core';
import { ConfigurablePanelLayout, ConfigurablePanelLayoutProps } from './ConfigurablePanelLayout';
import { PanelLayout, PanelDefinition } from './PanelConfigurator';
import './EditablePanelLayout.css';

export interface EditableConfigurablePanelLayoutProps extends ConfigurablePanelLayoutProps {
  /** Whether edit mode is enabled (controlled) */
  isEditMode: boolean;

  /** Callback when layout changes in edit mode */
  onLayoutChange?: (layout: PanelLayout) => void;

  /** Available panels for drag-and-drop */
  availablePanels?: PanelDefinition[];
}

type SlotPosition = 'left' | 'middle' | 'right';


// Slot Overlay Component for Edit Mode
interface SlotOverlayWrapperProps {
  slotPosition: SlotPosition;
  isEditing: boolean;
  isDragging: boolean;
  children: ReactNode;
}

const SlotOverlayWrapper: React.FC<SlotOverlayWrapperProps> = ({
  slotPosition,
  isEditing,
  isDragging,
  children,
}) => {
  const { attributes, listeners, setNodeRef: setDraggableRef, transform } = useDraggable({
    id: `slot-${slotPosition}`,
    data: { slotPosition },
    disabled: !isEditing,
  });

  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: `drop-${slotPosition}`,
    data: { slotPosition },
  });

  const style: React.CSSProperties = {
    position: 'relative',
    height: '100%',
    width: '100%',
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
  };

  // Merge refs
  const setRefs = useCallback((node: HTMLDivElement | null) => {
    setDraggableRef(node);
    setDroppableRef(node);
  }, [setDraggableRef, setDroppableRef]);

  return (
    <div
      ref={setRefs}
      style={style}
      className={`slot-with-overlay ${isEditing ? 'edit-mode' : ''} ${isDragging ? 'dragging' : ''} ${isOver ? 'drag-over' : ''}`}
    >
      {children}
      {isEditing && (
        <div
          className="slot-edit-overlay"
          {...attributes}
          {...listeners}
        >
          <div className="drag-indicator">⋮⋮</div>
          <div className="slot-position-label">{slotPosition.toUpperCase()}</div>
        </div>
      )}
    </div>
  );
};

/**
 * EditableConfigurablePanelLayout - Wrapper component that adds iPhone-style edit mode
 * Allows dragging entire slot sections (left/middle/right) to rearrange them
 */
export const EditableConfigurablePanelLayout: React.FC<EditableConfigurablePanelLayoutProps> = ({
  isEditMode,
  onLayoutChange,
  panels,
  layout,
  ...layoutProps
}) => {
  const [activeSlot, setActiveSlot] = useState<SlotPosition | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const id = event.active.id as string;
    if (id.startsWith('slot-')) {
      const slotPosition = id.replace('slot-', '') as SlotPosition;
      setActiveSlot(slotPosition);
      setDragOffset({ x: 0, y: 0 });
    }
  }, []);

  const handleDragMove = useCallback((event: DragMoveEvent) => {
    const { delta } = event;
    setDragOffset({ x: delta.x, y: delta.y });
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    setActiveSlot(null);
    setDragOffset({ x: 0, y: 0 });

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Extract slot positions
    const sourceSlot = activeId.replace('slot-', '') as SlotPosition;
    const targetSlot = overId.replace('drop-', '') as SlotPosition;

    if (sourceSlot === targetSlot) return;

    // Swap the slot contents
    const newLayout = { ...layout };
    const temp = newLayout[sourceSlot];
    newLayout[sourceSlot] = newLayout[targetSlot];
    newLayout[targetSlot] = temp;

    // Notify parent of layout change
    if (onLayoutChange) {
      onLayoutChange(newLayout);
    }
  }, [layout, onLayoutChange]);

  // Apply transforms to slots during drag
  useEffect(() => {
    if (!activeSlot || !isEditMode) return;

    const element = document.querySelector(`[data-slot="${activeSlot}"]`) as HTMLElement;

    if (element) {
      // Mark as dragging
      element.setAttribute('data-dragging', 'true');

      // Apply transform with !important to override any existing transforms
      // Keep the scale(0.95) and add the translation
      element.style.setProperty('transform', `scale(0.95) translate(${dragOffset.x}px, ${dragOffset.y}px)`, 'important');
      element.style.setProperty('z-index', '1000', 'important');
      element.style.setProperty('transition', 'none', 'important');
      element.style.setProperty('opacity', '0.95', 'important');
      element.style.setProperty('box-shadow', '0 12px 24px rgba(0, 0, 0, 0.25)', 'important');
    }

    return () => {
      if (element) {
        element.removeAttribute('data-dragging');
        element.style.removeProperty('transform');
        element.style.removeProperty('z-index');
        element.style.removeProperty('transition');
        element.style.removeProperty('opacity');
        element.style.removeProperty('box-shadow');
      }
    };
  }, [activeSlot, dragOffset, isEditMode]);

  // Create data attributes for slot identification
  const slotDataAttributes = {
    left: { 'data-slot': 'left', 'data-edit-mode': isEditMode ? 'true' : 'false' },
    middle: { 'data-slot': 'middle', 'data-edit-mode': isEditMode ? 'true' : 'false' },
    right: { 'data-slot': 'right', 'data-edit-mode': isEditMode ? 'true' : 'false' },
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
    >
      <div className={`editable-panel-layout ${isEditMode ? 'edit-mode-active' : ''}`}>
        {/* Render layout with data attributes */}
        <ConfigurablePanelLayout
          {...layoutProps}
          panels={panels}
          layout={layout}
          slotDataAttributes={slotDataAttributes}
        />

        {/* Slot overlays for edit mode - provides draggable areas */}
        {isEditMode && (
          <SlotOverlays
            layout={layout}
            activeSlot={activeSlot}
            onDragStart={() => {}}
            onDragEnd={() => {}}
          />
        )}
      </div>
    </DndContext>
  );
};

// Slot Overlays Component - renders absolutely positioned overlays on top of slots
interface SlotOverlaysProps {
  layout: PanelLayout;
  activeSlot: SlotPosition | null;
  onDragStart: () => void;
  onDragEnd: () => void;
}

const SlotOverlays: React.FC<SlotOverlaysProps> = ({ layout, activeSlot }) => {
  const [slotRects, setSlotRects] = useState<Map<SlotPosition, DOMRect>>(new Map());

  // Update slot positions
  React.useEffect(() => {
    const updatePositions = () => {
      const newRects = new Map<SlotPosition, DOMRect>();

      (['left', 'middle', 'right'] as SlotPosition[]).forEach(slot => {
        const element = document.querySelector(`[data-slot="${slot}"]`);
        if (element) {
          const rect = element.getBoundingClientRect();
          newRects.set(slot, rect);
        }
      });

      setSlotRects(newRects);
    };

    updatePositions();

    // Update on resize
    window.addEventListener('resize', updatePositions);
    const interval = setInterval(updatePositions, 100); // Poll for changes

    return () => {
      window.removeEventListener('resize', updatePositions);
      clearInterval(interval);
    };
  }, [layout]);

  return (
    <div style={{ pointerEvents: 'none', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999 }}>
      {(['left', 'middle', 'right'] as SlotPosition[]).map(slotPosition => {
        const slot = layout[slotPosition];
        if (!slot) return null;

        const rect = slotRects.get(slotPosition);
        if (!rect) return null;

        const isDragging = activeSlot === slotPosition;

        return (
          <div
            key={slotPosition}
            style={{
              position: 'fixed',
              top: rect.top,
              left: rect.left,
              width: rect.width,
              height: rect.height,
              pointerEvents: 'auto',
            }}
          >
            <SlotOverlayWrapper
              slotPosition={slotPosition}
              isEditing={true}
              isDragging={isDragging}
            >
              <div style={{ height: '100%' }} />
            </SlotOverlayWrapper>
          </div>
        );
      })}
    </div>
  );
};
