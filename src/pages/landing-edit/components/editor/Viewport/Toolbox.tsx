import { Element, useEditor } from '@craftjs/core';
import React from 'react';
import { styled } from 'styled-components';

import { Button } from '../../selectors/Button/Button';
import { Container } from '../../selectors/Container/Container';
import { Text } from '../../selectors/Text/Text';
import { Video } from '../../selectors/Video/Video';
import { Custom1 } from '../../selectors/Custom1/Custom1';
import { Custom2 } from '../../selectors/Custom2/Custom2';
import { Custom3 } from '../../selectors/Custom3/Custom3';
import { Image } from '../../selectors/Image/Image';
import { Link } from '../../selectors/Link/Link';
import { Map } from '../../selectors/Map/Map';
import { Quote } from '../../selectors/Quote/Quote';
import { TwoColumns } from '../../selectors/TwoColumns/TwoColumns';
import { ThreeColumns } from '../../selectors/ThreeColumns/ThreeColumns';
import { TwoColumns37 } from '../../selectors/TwoColumns37/TwoColumns37';

// ============ ICONS ============
const ContainerIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
    <rect x="2" y="2" width="20" height="20" rx="2" />
  </svg>
);

const TextIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
    <path d="M4 7V5h16v2M9 20h6M12 5v15" />
  </svg>
);

const ButtonIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
    <rect x="3" y="8" width="18" height="8" rx="2" />
    <path d="M8 12h8" />
  </svg>
);

const VideoIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <path d="M10 9l5 3-5 3V9z" fill="currentColor" />
  </svg>
);

const ImageIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
    <path d="M3 16l5-5 4 4 6-6 3 3" />
  </svg>
);

const LinkIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);

const MapIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
    <path d="M12 2C8 2 5 5 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-4-3-7-7-7z" />
    <circle cx="12" cy="9" r="2.5" fill="currentColor" />
  </svg>
);

const QuoteIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
    <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V21z" />
    <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V21z" />
  </svg>
);

const TwoColIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
    <rect x="2" y="4" width="9" height="16" rx="1" />
    <rect x="13" y="4" width="9" height="16" rx="1" />
  </svg>
);

const ThreeColIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
    <rect x="2" y="4" width="6" height="16" rx="1" />
    <rect x="9" y="4" width="6" height="16" rx="1" />
    <rect x="16" y="4" width="6" height="16" rx="1" />
  </svg>
);

const TwoCol37Icon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
    <rect x="2" y="4" width="6" height="16" rx="1" />
    <rect x="10" y="4" width="12" height="16" rx="1" />
  </svg>
);

const Custom1Icon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <circle cx="7" cy="10" r="2" fill="currentColor" />
    <circle cx="12" cy="10" r="2" fill="currentColor" />
    <circle cx="17" cy="10" r="2" fill="currentColor" />
  </svg>
);

const Custom2Icon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="M8 12l3-3 3 3-3 3-3-3z" fill="currentColor" />
  </svg>
);

const Custom3Icon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path d="M8 10h8M8 14h5" strokeLinecap="round" />
  </svg>
);

// ============ STYLED COMPONENTS ============
const ToolboxDiv = styled.div<{ $enabled: boolean; $isVisible: boolean }>`
  width: ${(props) => (props.$enabled && props.$isVisible ? '200px' : '0')};
  opacity: ${(props) => (props.$enabled && props.$isVisible ? '1' : '0')};
  padding: ${(props) => (props.$enabled && props.$isVisible ? '0' : '0')};
  transition: all 0.3s ease;
  background: #1a1a2e;
  flex-shrink: 0;
  overflow-y: auto;
  overflow-x: hidden;
`;

const CategoryTitle = styled.div`
  font-size: 9px;
  font-weight: 600;
  text-transform: uppercase;
  color: #6c757d;
  padding: 12px 8px 4px;
  letter-spacing: 0.5px;
`;

const ItemGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px;
  padding: 0 6px 8px;
`;

const Item = styled.div<{ $move?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 10px 4px;
  cursor: ${(props) => (props.$move ? 'move' : 'pointer')};
  transition: all 0.2s ease;
  border-radius: 6px;
  border: 1px solid transparent;
  background: rgba(255, 255, 255, 0.02);

  &:hover {
    background: rgba(255, 193, 7, 0.1);
    border-color: #ffc107;
  }

  svg {
    width: 20px;
    height: 20px;
    stroke: #adb5bd;
    transition: stroke 0.2s ease;
  }

  &:hover svg {
    stroke: #ffc107;
  }
`;

const ItemLabel = styled.span`
  font-size: 9px;
  color: #adb5bd;
  margin-top: 4px;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
`;

const Separator = styled.div`
  height: 1px;
  background: rgba(255, 255, 255, 0.05);
  margin: 8px 0;
`;

// ============ COMPONENT ============
export const Toolbox = ({ isVisible = true }: { isVisible?: boolean }) => {
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
    <ToolboxDiv $enabled={enabled} $isVisible={isVisible} className="toolbox h-full">
      {/* LAYOUT */}
      <CategoryTitle>Layout</CategoryTitle>
      <ItemGrid>
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
                />
              );
            }
          }}
        >
          <Item $move>
            <ContainerIcon />
            <ItemLabel>Box</ItemLabel>
          </Item>
        </div>
        <div
          ref={(ref) => {
            if (ref) create(ref, <TwoColumns />);
          }}
        >
          <Item $move>
            <TwoColIcon />
            <ItemLabel>2 Cols</ItemLabel>
          </Item>
        </div>
        <div
          ref={(ref) => {
            if (ref) create(ref, <ThreeColumns />);
          }}
        >
          <Item $move>
            <ThreeColIcon />
            <ItemLabel>3 Cols</ItemLabel>
          </Item>
        </div>
        <div
          ref={(ref) => {
            if (ref) create(ref, <TwoColumns37 />);
          }}
        >
          <Item $move>
            <TwoCol37Icon />
            <ItemLabel>30/70</ItemLabel>
          </Item>
        </div>
      </ItemGrid>

      <Separator />

      {/* BASICS */}
      <CategoryTitle>Basics</CategoryTitle>
      <ItemGrid>
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
            <TextIcon />
            <ItemLabel>Text</ItemLabel>
          </Item>
        </div>
        <div
          ref={(ref) => {
            if (ref) create(ref, <Button />);
          }}
        >
          <Item $move>
            <ButtonIcon />
            <ItemLabel>Button</ItemLabel>
          </Item>
        </div>
        <div
          ref={(ref) => {
            if (ref) create(ref, <Link />);
          }}
        >
          <Item $move>
            <LinkIcon />
            <ItemLabel>Link</ItemLabel>
          </Item>
        </div>
      </ItemGrid>

      <Separator />

      {/* MEDIA */}
      <CategoryTitle>Media</CategoryTitle>
      <ItemGrid>
        <div
          ref={(ref) => {
            if (ref) create(ref, <Image />);
          }}
        >
          <Item $move>
            <ImageIcon />
            <ItemLabel>Image</ItemLabel>
          </Item>
        </div>
        <div
          ref={(ref) => {
            if (ref) create(ref, <Video />);
          }}
        >
          <Item $move>
            <VideoIcon />
            <ItemLabel>Video</ItemLabel>
          </Item>
        </div>
        <div
          ref={(ref) => {
            if (ref) create(ref, <Map />);
          }}
        >
          <Item $move>
            <MapIcon />
            <ItemLabel>Map</ItemLabel>
          </Item>
        </div>
      </ItemGrid>

      <Separator />

      {/* CONTENT */}
      <CategoryTitle>Content</CategoryTitle>
      <ItemGrid>
        <div
          ref={(ref) => {
            if (ref) create(ref, <Quote />);
          }}
        >
          <Item $move>
            <QuoteIcon />
            <ItemLabel>Quote</ItemLabel>
          </Item>
        </div>
      </ItemGrid>

      <Separator />

      {/* CUSTOM */}
      <CategoryTitle>Custom Rules</CategoryTitle>
      <ItemGrid>
        <div
          ref={(ref) => {
            if (ref) create(ref, <Custom1 />);
          }}
        >
          <Item $move>
            <Custom1Icon />
            <ItemLabel>Buttons Only</ItemLabel>
          </Item>
        </div>
        <div
          ref={(ref) => {
            if (ref) create(ref, <Custom2 />);
          }}
        >
          <Item $move>
            <Custom2Icon />
            <ItemLabel>One Video</ItemLabel>
          </Item>
        </div>
        <div
          ref={(ref) => {
            if (ref) create(ref, <Custom3 />);
          }}
        >
          <Item $move>
            <Custom3Icon />
            <ItemLabel>Min 1 Btn</ItemLabel>
          </Item>
        </div>
      </ItemGrid>
    </ToolboxDiv>
  );
};
