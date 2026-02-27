import { Editor, Frame, Element } from '@craftjs/core';
import React from 'react';

import { Viewport } from './components/editor/Viewport';
import { RenderNode } from './components/editor/RenderNode';
import { Container } from './components/selectors/Container/Container';
import { Text } from './components/selectors/Text/Text';
import { Button } from './components/selectors/Button/Button';
import { ButtonOnlyZone, OnlyButtons } from './components/selectors/ButtonOnlyZone/ButtonOnlyZone';
import { VideoDropZone, VideoDropZoneVideoDrop } from './components/selectors/VideoDropZone/VideoDropZone';
import { RequiredButtonZone, RequiredButtonZoneBtnDrop } from './components/selectors/RequiredButtonZone/RequiredButtonZone';
import { Video } from './components/selectors/Video/Video';
import { IntroSection } from './components/sections/IntroSection';
import { ComplexSection } from './components/sections/ComplexSection';
import { ProgrammaticSection } from './components/sections/ProgrammaticSection';

import './styles/landing-edit.css';

export default function LandingEditPage() {
  return (
    <div className="h-screen">
      <Editor
        resolver={{
          Container,
          Text,
          ButtonOnlyZone,
          VideoDropZone,
          VideoDropZoneVideoDrop,
          RequiredButtonZone,
          RequiredButtonZoneBtnDrop,
          OnlyButtons,
          Button,
          Video,
          IntroSection,
          ComplexSection,
          ProgrammaticSection,
        }}
        enabled={false}
        onRender={RenderNode}
      >
        <Viewport>
          <Frame>
            <Element
              canvas
              is={Container}
              width="800px"
              height="auto"
              background={{ r: 255, g: 255, b: 255, a: 1 }}
              padding={['40', '40', '40', '40']}
              custom={{ displayName: 'App' }}
            >
              {/* Canvas vacío - arrastra secciones desde el Toolbox */}
            </Element>
          </Frame>
        </Viewport>
      </Editor>
    </div>
  );
}
