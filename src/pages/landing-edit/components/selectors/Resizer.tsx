import { useNode, useEditor } from '@craftjs/core';
import cx from 'classnames';
import debounce from 'lodash.debounce';
import { Resizable } from 're-resizable';
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { styled } from 'styled-components';

import {
  isPercentage,
  pxToPercent,
  percentToPx,
  getElementDimensions,
} from '../../utils/numToMeasurement';

const formatPosition = (value: number | string): string => {
  if (typeof value === 'string') return value;
  return `${value}px`;
};

const DragHandle = styled.div`
  position: absolute;
  top: -30px;
  left: 50%;
  transform: translateX(-50%);
  width: 28px;
  height: 28px;
  background: #36a9e0;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: grab;
  pointer-events: auto !important;
  z-index: 99999;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  touch-action: none;

  &:hover {
    background: #2a8bc2;
  }

  &:active {
    cursor: grabbing;
  }

  svg {
    width: 16px;
    height: 16px;
    color: white;
    pointer-events: none;
  }
`;

const Indicators = styled.div<{ $bound?: 'row' | 'column' }>`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  border: 2px solid #36a9e0;
  box-shadow: 0 0 0 4px rgba(54, 169, 224, 0.2);
  span {
    position: absolute;
    width: 10px;
    height: 10px;
    background: #fff;
    border-radius: 100%;
    display: block;
    box-shadow: 0px 0px 12px -1px rgba(0, 0, 0, 0.25);
    z-index: 99999;
    pointer-events: none;
    border: 2px solid #36a9e0;
    &:nth-child(1) {
      ${(props) =>
        props.$bound
          ? props.$bound === 'row'
            ? `
                left: 50%;
                top: -5px;
                transform:translateX(-50%);
              `
            : `
              top: 50%;
              left: -5px;
              transform:translateY(-50%);
            `
          : `
              left: -5px;
              top:-5px;
            `}
    }
    &:nth-child(2) {
      right: -5px;
      top: -5px;
      display: ${(props) => (props.$bound ? 'none' : 'block')};
    }
    &:nth-child(3) {
      ${(props) =>
        props.$bound
          ? props.$bound === 'row'
            ? `
                left: 50%;
                bottom: -5px;
                transform:translateX(-50%);
              `
            : `
                bottom: 50%;
                left: -5px;
                transform:translateY(-50%);
              `
          : `
              left: -5px;
              bottom:-5px;
            `}
    }
    &:nth-child(4) {
      bottom: -5px;
      right: -5px;
      display: ${(props) => (props.$bound ? 'none' : 'block')};
    }
  }
`;

export const Resizer = ({ propKey, children, bounds, maxWidth, maxHeight, resizeHandles, x, y, position, ...props }: any) => {
  const {
    id,
    actions: { setProp },
    connectors: { connect },
    fillSpace,
    nodeWidth,
    nodeHeight,
    nodeX,
    nodeY,
    nodePosition,
    parent,
    active,
    inNodeContext,
  } = useNode((node) => ({
    parent: node.data.parent,
    active: node.events.selected,
    nodeWidth: node.data.props[propKey.width],
    nodeHeight: node.data.props[propKey.height],
    nodeX: node.data.props.x ?? 0,
    nodeY: node.data.props.y ?? 0,
    nodePosition: node.data.props.position ?? 'relative',
    fillSpace: node.data.props.fillSpace,
  }));

  const { isRootNode, parentDirection } = useEditor((state, query) => {
    return {
      parentDirection:
        parent &&
        state.nodes[parent] &&
        state.nodes[parent].data.props.flexDirection,
      isRootNode: query.node(id).isRoot(),
    };
  });

  const resizable = useRef<Resizable>(null);
  const isResizing = useRef<Boolean>(false);
  const editingDimensions = useRef<any>(null);
  const nodeDimensions = useRef(null);
  nodeDimensions.current = { width: nodeWidth, height: nodeHeight };

  /**
   * Using an internal value to ensure the width/height set in the node is converted to px
   * because for some reason the <re-resizable /> library does not work well with percentages.
   */
  const [internalDimensions, setInternalDimensions] = useState({
    width: nodeWidth,
    height: nodeHeight,
  });

  const updateInternalDimensionsInPx = useCallback(() => {
    const { width: nodeWidth, height: nodeHeight } = nodeDimensions.current;

    const width = percentToPx(
      nodeWidth,
      resizable.current &&
        getElementDimensions(resizable.current.resizable.parentElement).width
    );
    const height = percentToPx(
      nodeHeight,
      resizable.current &&
        getElementDimensions(resizable.current.resizable.parentElement).height
    );

    setInternalDimensions({
      width,
      height,
    });
  }, []);

  const updateInternalDimensionsWithOriginal = useCallback(() => {
    const { width: nodeWidth, height: nodeHeight } = nodeDimensions.current;
    setInternalDimensions({
      width: nodeWidth,
      height: nodeHeight,
    });
  }, []);

  const getUpdatedDimensions = (width, height) => {
    const dom = resizable.current.resizable;
    if (!dom) return;

    const currentWidth = parseInt(editingDimensions.current.width),
      currentHeight = parseInt(editingDimensions.current.height);

    return {
      width: currentWidth + parseInt(width),
      height: currentHeight + parseInt(height),
    };
  };

  useEffect(() => {
    if (!isResizing.current) updateInternalDimensionsWithOriginal();
  }, [nodeWidth, nodeHeight, updateInternalDimensionsWithOriginal]);

  useEffect(() => {
    const listener = debounce(updateInternalDimensionsWithOriginal, 1);
    window.addEventListener('resize', listener);

    return () => {
      window.removeEventListener('resize', listener);
    };
  }, [updateInternalDimensionsWithOriginal]);

  // Sistema de arrastre manual con eventos de mouse
  // Esto evita conflictos con Craft.js y re-resizable
  const [isDragging, setIsDragging] = useState(false);
  const [dragPixelPos, setDragPixelPos] = useState<{ x: number; y: number } | null>(null);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const initialPos = useRef({ x: 0, y: 0 });
  const parentDimensions = useRef({ width: 0, height: 0 });
  const elementDimensions = useRef({ width: 0, height: 0 });

  // Manejar inicio del arrastre desde el DragHandle
  const handleDragStart = useCallback((e: React.MouseEvent) => {
    if (!active || !inNodeContext || nodePosition !== 'absolute') return;

    e.preventDefault();
    e.stopPropagation();

    // Obtener dimensiones del padre y del elemento
    const dom = resizable.current?.resizable;
    if (dom) {
      elementDimensions.current = {
        width: dom.offsetWidth,
        height: dom.offsetHeight
      };
      const parent = dom.parentElement;
      if (parent) {
        parentDimensions.current = {
          width: parent.offsetWidth,
          height: parent.offsetHeight
        };
      }
    }

    dragStartPos.current = { x: e.clientX, y: e.clientY };
    initialPos.current = { x: dom.offsetLeft, y: dom.offsetTop };
    setIsDragging(true);

    console.log('[Drag Start]', { x: dom.offsetLeft, y: dom.offsetTop, clientX: e.clientX, clientY: e.clientY });
  }, [active, inNodeContext, nodePosition]);

  // Manejar movimiento del mouse durante el arrastre
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();

      const deltaX = e.clientX - dragStartPos.current.x;
      const deltaY = e.clientY - dragStartPos.current.y;

      const maxX = Math.max(0, parentDimensions.current.width - elementDimensions.current.width);
      const maxY = Math.max(0, parentDimensions.current.height - elementDimensions.current.height);

      const newX = Math.min(maxX, Math.max(0, initialPos.current.x + deltaX));
      const newY = Math.min(maxY, Math.max(0, initialPos.current.y + deltaY));

      setDragPixelPos({ x: newX, y: newY });
    };

    const handleMouseUp = (e: MouseEvent) => {
      e.preventDefault();

      const deltaX = e.clientX - dragStartPos.current.x;
      const deltaY = e.clientY - dragStartPos.current.y;

      const maxX = Math.max(0, parentDimensions.current.width - elementDimensions.current.width);
      const maxY = Math.max(0, parentDimensions.current.height - elementDimensions.current.height);

      const newX = Math.min(maxX, Math.max(0, Math.round(initialPos.current.x + deltaX)));
      const newY = Math.min(maxY, Math.max(0, Math.round(initialPos.current.y + deltaY)));

      console.log('[Drag End]', { newX, newY, deltaX, deltaY, maxX, maxY });

      setProp((prop: any) => {
        const pw = parentDimensions.current.width;
        const ph = parentDimensions.current.height;

        if (typeof nodeX === 'string' && isPercentage(nodeX)) {
          prop.x = `${((newX / pw) * 100).toFixed(1)}%`;
        } else {
          prop.x = newX;
        }
        if (typeof nodeY === 'string' && isPercentage(nodeY)) {
          prop.y = `${((newY / ph) * 100).toFixed(1)}%`;
        } else {
          prop.y = newY;
        }
      }, 500);

      setIsDragging(false);
      setDragPixelPos(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, setProp, nodeX, nodeY]);


  return (
    <Resizable
      enable={
        nodePosition === 'absolute'
          // Para posición absoluta: permitir redimensionamiento en todas direcciones
          ? [
              'top',
              'left',
              'bottom',
              'right',
              'topLeft',
              'topRight',
              'bottomLeft',
              'bottomRight',
            ].reduce((acc: any, key) => {
              acc[key] = active && inNodeContext;
              return acc;
            }, {})
          : resizeHandles
            ? resizeHandles.reduce((acc: any, key: string) => {
                acc[key] = active && inNodeContext;
                return acc;
              }, {})
            : [
                'top',
                'left',
                'bottom',
                'right',
                'topLeft',
                'topRight',
                'bottomLeft',
                'bottomRight',
              ].reduce((acc: any, key) => {
                acc[key] = active && inNodeContext;
                return acc;
              }, {})
      }
      className={cx([
        {
          'm-auto': isRootNode,
          flex: true,
        },
      ])}
      bounds={bounds}
      maxWidth={maxWidth}
      maxHeight={maxHeight}
      ref={(ref) => {
        if (ref) {
          resizable.current = ref;
          connect(ref.resizable);
        }
      }}
      size={internalDimensions}
      onResizeStart={(e) => {
        updateInternalDimensionsInPx();
        e.preventDefault();
        e.stopPropagation();
        const dom = resizable.current?.resizable;
        if (!dom) return;
        editingDimensions.current = {
          width: dom.getBoundingClientRect().width,
          height: dom.getBoundingClientRect().height,
        };
        isResizing.current = true;
      }}
      onResize={(_, __, ___, d) => {
        const dom = resizable.current?.resizable;
        if (!dom) return;
        let { width, height }: any = getUpdatedDimensions(d.width, d.height);
        if (isPercentage(nodeWidth))
          width =
            pxToPercent(width, getElementDimensions(dom.parentElement).width) +
            '%';
        else width = `${width}px`;

        if (isPercentage(nodeHeight))
          height =
            pxToPercent(
              height,
              getElementDimensions(dom.parentElement).height
            ) + '%';
        else height = `${height}px`;

        if (isPercentage(width) && dom.parentElement.style.width === 'auto') {
          width = editingDimensions.current.width + d.width + 'px';
        }

        if (isPercentage(height) && dom.parentElement.style.height === 'auto') {
          height = editingDimensions.current.height + d.height + 'px';
        }

        setProp((prop: any) => {
          prop[propKey.width] = width;
          prop[propKey.height] = height;
        }, 500);
      }}
      onResizeStop={() => {
        isResizing.current = false;
        updateInternalDimensionsWithOriginal();
      }}
      {...props}
      style={{
        ...props.style,
        position: nodePosition === 'absolute' ? 'absolute' : 'relative',
        left: nodePosition === 'absolute'
          ? (dragPixelPos ? `${dragPixelPos.x}px` : formatPosition(nodeX))
          : undefined,
        top: nodePosition === 'absolute'
          ? (dragPixelPos ? `${dragPixelPos.y}px` : formatPosition(nodeY))
          : undefined,
      }}
    >
      {children}
      {active && (
        <>
          {nodePosition === 'absolute' && (
            <DragHandle
              title="Arrastra para mover"
              onMouseDown={handleDragStart}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="9" cy="12" r="1.5" fill="currentColor" />
                <circle cx="15" cy="12" r="1.5" fill="currentColor" />
                <circle cx="9" cy="6" r="1.5" fill="currentColor" />
                <circle cx="15" cy="6" r="1.5" fill="currentColor" />
                <circle cx="9" cy="18" r="1.5" fill="currentColor" />
                <circle cx="15" cy="18" r="1.5" fill="currentColor" />
              </svg>
            </DragHandle>
          )}
          <Indicators $bound={fillSpace === 'yes' ? parentDirection : false}>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
          </Indicators>
        </>
      )}
    </Resizable>
  );
};
