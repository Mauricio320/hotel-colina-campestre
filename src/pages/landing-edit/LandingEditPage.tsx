import { Editor, Frame, Element, useEditor } from '@craftjs/core';
import { DndContext, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import React, { useCallback, useEffect, useState } from 'react';
import { useLandingPageState } from '@/hooks/useLandingPage';

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

// Componente para cargar el estado guardado
interface FrameLoaderProps {
  savedState: Record<string, unknown> | undefined;
}

const FrameLoader = ({ savedState }: FrameLoaderProps) => {
  const { actions } = useEditor();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (savedState && !isLoaded) {
      try {
        // Deserialize the saved state into the editor
        actions.deserialize(savedState as Parameters<typeof actions.deserialize>[0]);
        setIsLoaded(true);
      } catch (error) {
        console.error("Error loading saved state:", error);
      }
    }
  }, [savedState, actions, isLoaded]);

  return null;
};

export default function LandingEditPage() {
  const { data: savedState, isLoading } = useLandingPageState();

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

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 font-medium">Cargando editor...</p>
        </div>
      </div>
    );
  }

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
          <FrameLoader savedState={savedState?.nodes_json as Record<string, unknown> | undefined} />
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
