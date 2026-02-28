import { Editor, Frame, Element } from '@craftjs/core';
import { DndContext, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import React, { useCallback } from 'react';

import { Viewport } from './components/editor/Viewport';
import { RenderNode } from './components/editor/RenderNode';
import { Container } from './components/selectors/Container/Container';
import { Text } from './components/selectors/Text/Text';
import { Button } from './components/selectors/Button/Button';
import { Custom1, OnlyButtons } from './components/selectors/Custom1/Custom1';
import { Custom2, Custom2VideoDrop } from './components/selectors/Custom2/Custom2';
import { Custom3, Custom3BtnDrop } from './components/selectors/Custom3/Custom3';
import { Video } from './components/selectors/Video/Video';

// New Components
import { Image } from './components/selectors/Image/Image';
import { Link } from './components/selectors/Link/Link';
import { Map } from './components/selectors/Map/Map';
import { Quote } from './components/selectors/Quote/Quote';
import { TwoColumns } from './components/selectors/TwoColumns/TwoColumns';
import { ThreeColumns } from './components/selectors/ThreeColumns/ThreeColumns';
import { TwoColumns37 } from './components/selectors/TwoColumns37/TwoColumns37';

import './styles/landing-edit.css';

export default function LandingEditPage() {
  // Configurar sensores de @dnd-kit para drag-and-drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Activar después de mover 5px
      },
    })
  );

  // Manejar el final del arrastre
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, delta } = event;

    if (active.data.current?.type === 'resizable-node') {
      const currentX = active.data.current.x ?? 0;
      const currentY = active.data.current.y ?? 0;

      const newX = Math.max(0, Math.round(currentX + delta.x));
      const newY = Math.max(0, Math.round(currentY + delta.y));

      // La actualización real se hace en el componente Resizer
      // Este handler es para cualquier lógica adicional a nivel de editor
    }
  }, []);

  return (
    <div className="h-screen">
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <Editor
          resolver={{
            // Basic
            Container,
            Text,
            Button,
            Video,
            // Custom with Rules
            Custom1,
            OnlyButtons,
            Custom2,
            Custom2VideoDrop,
            Custom3,
            Custom3BtnDrop,
            // New Layout Components
            TwoColumns,
            ThreeColumns,
            TwoColumns37,
            // New Media Components
            Image,
            Map,
            // New Navigation
            Link,
            // New Content
            Quote,
          }}
          enabled={true}
          onRender={RenderNode}
        >
          <Viewport>
            <Frame>
              <Element
                canvas
                is={Container}
                width="100%"
                height="100%"
                background={{ r: 255, g: 255, b: 255, a: 1 }}
                padding={['40', '40', '40', '40']}
                custom={{ displayName: 'App' }}
              >
                {/* Canvas vacío - arrastra componentes desde el Toolbox */}
              </Element>
            </Frame>
          </Viewport>
        </Editor>
      </DndContext>
    </div>
  );
}
