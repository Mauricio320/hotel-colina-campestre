import { useNode } from '@craftjs/core';
import React, { useState } from 'react';

export const ToolbarSection = ({ title, props, summary, children }: any) => {
  const [expanded, setExpanded] = useState(true);
  const { nodeProps } = useNode((node) => ({
    nodeProps:
      props &&
      props.reduce((res: any, key: any) => {
        res[key] = node.data.props[key] || null;
        return res;
      }, {}),
  }));

  return (
    <div className="border-b border-gray-200">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-4 w-full">
          <div className="w-1/3">
            <h5 className="text-sm font-medium text-gray-700 text-left">
              {title}
            </h5>
          </div>
          {summary && props ? (
            <div className="w-2/3">
              <div className="text-sm text-blue-500 text-right truncate">
                {summary(
                  props.reduce((acc: any, key: any) => {
                    acc[key] = nodeProps[key];
                    return acc;
                  }, {})
                )}
              </div>
            </div>
          ) : null}
        </div>
        <svg
          viewBox="0 0 10 6"
          fill="currentColor"
          className={`w-2.5 h-2.5 ml-2 text-gray-400 transition-transform flex-shrink-0 ${
            expanded ? 'rotate-180' : ''
          }`}
        >
          <path d="M9.99,1.01A.9999.9999,0,0,0,8.28266.30327L5,3.58594,1.71734.30327A.9999.9999,0,1,0,.30327,1.71734L4.29266,5.69673a.99965.99965,0,0,0,1.41468,0L9.69673,1.71734A.99669.99669,0,0,0,9.99,1.01Z" />
        </svg>
      </button>
      {expanded && (
        <div className="px-4 pb-4 pt-2 bg-white">
          <div className="grid grid-cols-2 gap-3">{children}</div>
        </div>
      )}
    </div>
  );
};
