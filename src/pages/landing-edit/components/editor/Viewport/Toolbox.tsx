import { Element, useEditor } from '@craftjs/core';
import React from 'react';
import { styled } from 'styled-components';

import { Button } from '../../selectors/Button/Button';
import { Container } from '../../selectors/Container/Container';
import { Text } from '../../selectors/Text/Text';
import { Video } from '../../selectors/Video/Video';
import { ButtonOnlyZone } from '../../selectors/ButtonOnlyZone/ButtonOnlyZone';
import { VideoDropZone } from '../../selectors/VideoDropZone/VideoDropZone';
import { RequiredButtonZone } from '../../selectors/RequiredButtonZone/RequiredButtonZone';

// Generate unique ID for elements
const uid = () => Math.random().toString(36).substring(2, 9);

// SVG Icons
const SquareIcon = () => (
  <svg viewBox="0 0 18 18" fill="currentColor" className="w-6 h-6">
    <path d="M1,2.5v13a.5.5,0,0,0,.5.5h15a.5.5,0,0,0,.5-.5V2.5a.5.5,0,0,0-.5-.5H1.5A.5.5,0,0,0,1,2.5ZM16,15H2V3H16Z" />
  </svg>
);

const TypeIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path fill="none" d="M0 0h24v24H0z" />
    <path d="M5 5v14h14V5H5zM4 3h16a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1zm9 7v7h-2v-7H7V8h10v2h-4z" />
  </svg>
);

const ButtonIcon = () => (
  <svg viewBox="0 0 18 18" fill="currentColor" className="w-6 h-6">
    <path d="M13,4H5A5,5,0,0,0,5,14h8A5,5,0,0,0,13,4Zm0,9.05H5a4.05,4.05,0,0,1,0-8.1h8a4.05,4.05,0,0,1,0,8.1Z" />
    <path d="M13,6.05H5a2.95,2.95,0,0,0,0,5.9h8a2.95,2.95,0,0,0,0-5.9Z" />
  </svg>
);

const YoutubeIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path fill="none" d="M0 0h24v24H0z" />
    <path d="M3 3.993C3 3.445 3.445 3 3.993 3h16.014c.548 0 .993.445.993.993v16.014a.994.994 0 0 1-.993.993H3.993A.994.994 0 0 1 3 20.007V3.993zM5 5v14h14V5H5zm5.622 3.415l4.879 3.252a.4.4 0 0 1 0 .666l-4.88 3.252a.4.4 0 0 1-.621-.332V8.747a.4.4 0 0 1 .622-.332z" />
  </svg>
);

const IntroIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path d="M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.5L18.5 8 12 11 5.5 8 12 4.5zM4 9.2l7 3.5v7.1l-7-3.5V9.2zm9 10.6v-7.1l7-3.5v7.1l-7 3.5z" />
  </svg>
);

const ComplexIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path d="M3 3h8v8H3V3zm2 2v4h4V5H5zm8-2h8v8h-8V3zm2 2v4h4V5h-4zM3 13h8v8H3v-8zm2 2v4h4v-4H5zm8-2h8v8h-8v-8zm2 2v4h4v-4h-4z" />
  </svg>
);

const ProgrammaticIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z" />
  </svg>
);

const ToolboxDiv = styled.div<{ $enabled: boolean }>`
  width: ${(props) => (props.$enabled ? '72px' : '0')};
  opacity: ${(props) => (props.$enabled ? '1' : '0')};
  transition: all 0.4s cubic-bezier(0.19, 1, 0.22, 1);
  background: #fff;
  border-right: 1px solid #e5e5e5;
  flex-shrink: 0;
  overflow: hidden;
`;

const Item = styled.div<{ $move?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 12px 8px;
  cursor: ${(props) => (props.$move ? 'move' : 'pointer')};
  transition: background 0.2s;
  border-bottom: 1px solid #f0f0f0;

  &:hover {
    background: #f5f5f5;
  }

  svg {
    width: 22px;
    height: 22px;
    fill: #505050;
    margin-bottom: 4px;
  }
`;

const ItemLabel = styled.span`
  font-size: 10px;
  color: #666;
  text-transform: capitalize;
  white-space: nowrap;
`;

const Separator = styled.div`
  border-top: 2px solid #d0d0d0;
  margin: 8px 4px;
`;

export const Toolbox = () => {
  const {
    enabled,
    connectors: { create },
  } = useEditor((state) => ({
    enabled: state.options.enabled,
  }));

  if (!enabled) {
    return null;
  }

  return (
    <ToolboxDiv
      $enabled={enabled}
      className="toolbox h-full flex flex-col"
    >
      <div className="flex flex-col">
        {/* Basic Components */}
        <div
          ref={(ref) => {
            if (ref) {
              create(
                ref,
                <Element
                  canvas
                  is={Container}
                  background={{ r: 78, g: 78, b: 78, a: 1 }}
                  color={{ r: 0, g: 0, b: 0, a: 1 }}
                  height="300px"
                  width="300px"
                ></Element>
              );
            }
          }}
        >
          <Item $move>
            <SquareIcon />
            <ItemLabel>Container</ItemLabel>
          </Item>
        </div>
        <div
          ref={(ref) => {
            if (ref) {
              create(
                ref,
                <Text fontSize="12" textAlign="left" text="Hi there" />
              );
            }
          }}
        >
          <Item $move>
            <TypeIcon />
            <ItemLabel>Text</ItemLabel>
          </Item>
        </div>
        <div
          ref={(ref) => {
            if (ref) {
              create(ref, <Button />);
            }
          }}
        >
          <Item $move>
            <ButtonIcon />
            <ItemLabel>Button</ItemLabel>
          </Item>
        </div>
        <div
          ref={(ref) => {
            if (ref) {
              create(ref, <Video />);
            }
          }}
        >
          <Item $move>
            <YoutubeIcon />
            <ItemLabel>Video</ItemLabel>
          </Item>
        </div>

        <Separator />

        {/* Sections */}
        <div
          ref={(ref) => {
            if (ref) {
              const id = uid();
              create(
                ref,
                <Element
                  canvas
                  id={`intro-${id}`}
                  is={Container}
                  flexDirection="row"
                  width="100%"
                  height="auto"
                  padding={['40', '40', '40', '40']}
                  margin={['0', '0', '40', '0']}
                  custom={{ displayName: 'Introduction' }}
                >
                  <Element
                    canvas
                    id={`intro-h-${id}`}
                    is={Container}
                    width="40%"
                    height="100%"
                    padding={['0', '20', '0', '20']}
                    custom={{ displayName: 'Heading' }}
                  >
                    <Text
                      fontSize="23"
                      fontWeight="400"
                      text="Craft.js is a React framework for building powerful &amp; feature-rich drag-n-drop page editors."
                    />
                  </Element>
                  <Element
                    canvas
                    id={`intro-d-${id}`}
                    is={Container}
                    width="60%"
                    height="100%"
                    padding={['0', '20', '0', '20']}
                    custom={{ displayName: 'Description' }}
                  >
                    <Text
                      fontSize="14"
                      fontWeight="400"
                      text="Everything you see here, including the editor, itself is made of React components. Craft.js comes only with the building blocks for a page editor; it provides a drag-n-drop system and handles the way user components should be rendered, updated and moved, among other things. <br /> <br /> You control the way your editor looks and behave."
                    />
                  </Element>
                </Element>
              );
            }
          }}
        >
          <Item $move>
            <IntroIcon />
            <ItemLabel>Intro</ItemLabel>
          </Item>
        </div>

        <div
          ref={(ref) => {
            if (ref) {
              const id = uid();
              create(
                ref,
                <Element
                  canvas
                  id={`complex-${id}`}
                  is={Container}
                  background={{ r: 39, g: 41, b: 41, a: 1 }}
                  flexDirection="column"
                  width="100%"
                  height="auto"
                  padding={['40', '40', '40', '40']}
                  margin={['0', '0', '40', '0']}
                  custom={{ displayName: 'ComplexSection' }}
                >
                  <Element
                    canvas
                    id={`complex-w-${id}`}
                    background={{ r: 76, g: 78, b: 78, a: 0 }}
                    is={Container}
                    flexDirection="row"
                    margin={['0', '0', '0', '0']}
                    width="100%"
                    height="auto"
                    alignItems="center"
                    custom={{ displayName: 'Wrapper' }}
                  >
                    <Element
                      canvas
                      id={`complex-s-${id}`}
                      background={{ r: 0, g: 0, b: 0, a: 0 }}
                      is={Container}
                      alignItems="center"
                      padding={['0', '0', '0', '0']}
                      flexDirection="row"
                      width="350px"
                      height="250px"
                      custom={{ displayName: 'Square' }}
                    >
                      <Element
                        canvas
                        id={`complex-o-${id}`}
                        is={Container}
                        justifyContent="center"
                        alignItems="center"
                        background={{ r: 76, g: 78, b: 78, a: 1 }}
                        shadow={25}
                        width="90%"
                        height="90%"
                        padding={['10', '20', '10', '20']}
                        custom={{ displayName: 'Outer' }}
                      >
                        <Element
                          canvas
                          id={`complex-m-${id}`}
                          is={Container}
                          justifyContent="center"
                          alignItems="center"
                          background={{ r: 76, g: 78, b: 78, a: 1 }}
                          shadow={50}
                          width="80%"
                          height="80%"
                          padding={['10', '20', '10', '20']}
                          custom={{ displayName: 'Middle' }}
                        >
                          <Element
                            canvas
                            id={`complex-i-${id}`}
                            is={Container}
                            justifyContent="center"
                            alignItems="center"
                            background={{ r: 76, g: 78, b: 78, a: 1 }}
                            shadow={50}
                            width="60%"
                            height="60%"
                            padding={['10', '20', '10', '20']}
                            custom={{ displayName: 'Inner' }}
                          />
                        </Element>
                      </Element>
                    </Element>
                    <Element
                      canvas
                      id={`complex-c-${id}`}
                      background={{ r: 0, g: 0, b: 0, a: 0 }}
                      is={Container}
                      padding={['0', '0', '0', '20']}
                      flexDirection="column"
                      width="55%"
                      height="100%"
                      fillSpace="yes"
                      custom={{ displayName: 'Content' }}
                    >
                      <Text
                        color={{ r: '255', g: '255', b: '255', a: '1' }}
                        margin={['0', '0', '18', '0']}
                        fontSize="20"
                        text="Design complex components"
                      />
                      <Text
                        color={{ r: '255', g: '255', b: '255', a: '0.8' }}
                        fontSize="14"
                        fontWeight="400"
                        text="You can define areas within your React component which users can drop other components into. <br/><br />You can even design how the component should be edited — content editable, drag to resize, have inputs on toolbars — anything really."
                      />
                    </Element>
                  </Element>
                </Element>
              );
            }
          }}
        >
          <Item $move>
            <ComplexIcon />
            <ItemLabel>Complex</ItemLabel>
          </Item>
        </div>

        <div
          ref={(ref) => {
            if (ref) {
              const id = uid();
              create(
                ref,
                <Element
                  canvas
                  id={`prog-root-${id}`}
                  is={Container}
                  background={{ r: 234, g: 245, b: 245, a: 1 }}
                  flexDirection="column"
                  width="100%"
                  height="auto"
                  padding={['40', '40', '40', '40']}
                  margin={['0', '0', '40', '0']}
                  custom={{ displayName: 'Programmatic' }}
                >
                  <Element
                    canvas
                    id={`prog-head-${id}`}
                    background={{ r: 76, g: 78, b: 78, a: 0 }}
                    is={Container}
                    flexDirection="column"
                    margin={['0', '0', '20', '0']}
                    width="100%"
                    height="auto"
                    custom={{ displayName: 'Heading' }}
                  >
                    <Text
                      color={{ r: '46', g: '47', b: '47', a: '1' }}
                      fontSize="23"
                      text="Programmatic drag &amp; drop"
                    />
                    <Text
                      fontSize="14"
                      fontWeight="400"
                      text="Govern what goes in and out of your components"
                    />
                  </Element>
                  <Element
                    canvas
                    id={`prog-cont-${id}`}
                    background={{ r: 76, g: 78, b: 78, a: 0 }}
                    is={Container}
                    flexDirection="row"
                    margin={['30', '0', '0', '0']}
                    width="100%"
                    height="auto"
                    custom={{ displayName: 'Content' }}
                  >
                    <Element
                      canvas
                      id={`prog-left-${id}`}
                      background={{ r: 0, g: 0, b: 0, a: 0 }}
                      is={Container}
                      padding={['0', '20', '0', '0']}
                      flexDirection="row"
                      width="45%"
                      custom={{ displayName: 'Left' }}
                    >
                      <ButtonOnlyZone
                        background={{ r: 119, g: 219, b: 165, a: 1 }}
                        height="auto"
                        width="100%"
                        padding={['20', '20', '20', '20']}
                        margin={['0', '0', '0', '0']}
                        shadow={40}
                      />
                    </Element>
                    <Element
                      canvas
                      id={`prog-right-${id}`}
                      background={{ r: 0, g: 0, b: 0, a: 0 }}
                      is={Container}
                      padding={['0', '0', '0', '20']}
                      flexDirection="column"
                      width="55%"
                      custom={{ displayName: 'Right' }}
                    >
                      <VideoDropZone
                        background={{ r: 108, g: 126, b: 131, a: 1 }}
                        height="125px"
                        width="100%"
                        padding={['0', '0', '0', '20']}
                        margin={['0', '0', '0', '0']}
                        shadow={40}
                        flexDirection="row"
                        alignItems="center"
                      />
                      <RequiredButtonZone
                        background={{ r: 134, g: 187, b: 201, a: 1 }}
                        height="auto"
                        width="100%"
                        padding={['20', '20', '20', '20']}
                        margin={['20', '0', '0', '0']}
                        shadow={40}
                        flexDirection="column"
                      />
                    </Element>
                  </Element>
                </Element>
              );
            }
          }}
        >
          <Item $move>
            <ProgrammaticIcon />
            <ItemLabel>Programmatic</ItemLabel>
          </Item>
        </div>
      </div>
    </ToolboxDiv>
  );
};
