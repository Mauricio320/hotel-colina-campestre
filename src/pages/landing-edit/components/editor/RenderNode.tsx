import { useNode, useEditor } from '@craftjs/core';
import { ROOT_NODE } from '@craftjs/utils';
import * as React from 'react';
import ReactDOM from 'react-dom';
import { styled } from 'styled-components';

// SVG Icons as components
const ArrowUpIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M4 12l1.41 1.41L11 7.83V20h2V7.83l5.58 5.59L20 12l-8-8-8 8z" />
  </svg>
);

const DeleteIcon = () => (
  <svg viewBox="0 0 18 18" fill="currentColor" className="w-4 h-4">
    <path d="M15.75,3H12V2a1,1,0,0,0-1-1H6A1,1,0,0,0,5,2V3H1.25A.25.25,0,0,0,1,3.25v.5A.25.25,0,0,0,1.25,4h1L3.4565,16.55a.5.5,0,0,0,.5.45H13.046a.5.5,0,0,0,.5-.45L14.75,4h1A.25.25,0,0,0,16,3.75v-.5A.25.25,0,0,0,15.75,3ZM5.5325,14.5a.5.5,0,0,1-.53245-.46529L5,14.034l-.5355-8a.50112.50112,0,0,1,1-.067l.5355,8a.5.5,0,0,1-.46486.53283ZM9,14a.5.5,0,0,1-1,0V6A.5.5,0,0,1,9,6ZM11,3H6V2h5Zm1,11.034a.50112.50112,0,0,1-1-.067l.5355-8a.50112.50112,0,1,1,1,.067Z" />
  </svg>
);

const MoveIcon = () => (
  <svg viewBox="0 0 18 18" fill="currentColor" className="w-4 h-4">
    <path d="M17,9a.25.25,0,0,0-.0565-.158L16,8.0145V8h-.0165L14.927,7.0735A.245.245,0,0,0,14.75,7a.25.25,0,0,0-.25.25V8H10V3.5h.75A.25.25,0,0,0,11,3.25a.24448.24448,0,0,0-.0735-.175L10,2.0165V2H9.9855L9.158,1.0565a.25.25,0,0,0-.316,0L8.0145,2H8v.0165L7.0735,3.073A.24449.24449,0,0,0,7,3.25a.25.25,0,0,0,.25.25H8V8H3.5V7.25A.25.25,0,0,0,3.25,7a.245.245,0,0,0-.175.0735L2.0165,8H2v.0145l-.9435.8275a.25.25,0,0,0,0,.316L2,9.9855V10h.0165l1.0565.926A.24552.24552,0,0,0,3.25,11a.25.25,0,0,0,.25-.25V10H8v4.5H7.25a.25.25,0,0,0-.25.25.24352.24352,0,0,0,.0735.175L8,15.9835V16h.0145l.8275.9435a.25.25,0,0,0,.316,0L9.9855,16H10v-.0165l.9265-1.057A.24349.24349,0,0,0,11,14.75a.25.25,0,0,0-.25-.25H10V10h4.5v.75a.25.25,0,0,0,.25.25.24549.24549,0,0,0,.175-.074L15.9835,10H16V9.9855l.9435-.8275A.25.25,0,0,0,17,9Z" />
  </svg>
);

const IndicatorDiv = styled.div`
  height: 30px;
  margin-top: -29px;
  font-size: 12px;
  line-height: 12px;

  svg {
    fill: #fff;
    width: 15px;
    height: 15px;
  }
`;

const Btn = styled.a`
  padding: 0 0px;
  opacity: 0.9;
  display: flex;
  align-items: center;
  > div {
    position: relative;
    top: -50%;
    left: -50%;
  }
`;

export const RenderNode = ({ render }) => {
  const { id } = useNode();
  const { actions, query, isActive } = useEditor((_, query) => ({
    isActive: query.getEvent('selected').contains(id),
  }));

  const {
    isHover,
    dom,
    name,
    moveable,
    deletable,
    connectors: { drag },
    parent,
  } = useNode((node) => ({
    isHover: node.events.hovered,
    dom: node.dom,
    name: node.data.custom.displayName || node.data.displayName,
    moveable: query.node(node.id).isDraggable(),
    deletable: query.node(node.id).isDeletable(),
    parent: node.data.parent,
    props: node.data.props,
  }));

  const currentRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (dom) {
      if (isActive || isHover) dom.classList.add('component-selected');
      else dom.classList.remove('component-selected');
    }
  }, [dom, isActive, isHover]);

  const getPos = React.useCallback((dom: HTMLElement) => {
    const { top, left, bottom } = dom
      ? dom.getBoundingClientRect()
      : { top: 0, left: 0, bottom: 0 };
    return {
      top: `${top > 0 ? top : bottom}px`,
      left: `${left}px`,
    };
  }, []);

  const scroll = React.useCallback(() => {
    const { current: currentDOM } = currentRef;

    if (!currentDOM) {
      return;
    }

    const { top, left } = getPos(dom);
    currentDOM.style.top = top;
    currentDOM.style.left = left;
  }, [dom, getPos]);

  React.useEffect(() => {
    const renderer = document.querySelector('.craftjs-renderer');
    if (!renderer) return;

    renderer.addEventListener('scroll', scroll);

    return () => {
      renderer.removeEventListener('scroll', scroll);
    };
  }, [scroll]);

  return (
    <>
      {isHover || isActive
        ? ReactDOM.createPortal(
            <IndicatorDiv
              ref={currentRef}
              className="px-2 py-2 text-white bg-primary fixed flex items-center"
              style={{
                left: getPos(dom).left,
                top: getPos(dom).top,
                zIndex: 9999,
              }}
            >
              <h2 className="flex-1 mr-4">{name}</h2>
              {moveable ? (
                <Btn
                  className="mr-2 cursor-move"
                  ref={(dom) => {
                    drag(dom);
                  }}
                >
                  <MoveIcon />
                </Btn>
              ) : null}
              {id !== ROOT_NODE && (
                <Btn
                  className="mr-2 cursor-pointer"
                  onClick={() => {
                    actions.selectNode(parent);
                  }}
                >
                  <ArrowUpIcon />
                </Btn>
              )}
              {deletable ? (
                <Btn
                  className="cursor-pointer"
                  onMouseDown={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    actions.delete(id);
                  }}
                >
                  <DeleteIcon />
                </Btn>
              ) : null}
            </IndicatorDiv>,
            document.querySelector('.page-container')
          )
        : null}
      {render}
    </>
  );
};
