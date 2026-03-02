import { useEditor } from "@craftjs/core";
import cx from "classnames";
import React, { useEffect, useRef, useState } from "react";

import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { Toolbox } from "./Toolbox";
import { ResizableCanvas } from "./ResizableCanvas";

export const Viewport: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const [isToolboxVisible, setIsToolboxVisible] = useState(true);
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const canvasRef = useRef<HTMLDivElement>(null);
  const {
    enabled,
    connectors,
    actions: { setOptions },
  } = useEditor((state) => ({
    enabled: state.options.enabled,
  }));

  useEffect(() => {
    if (!window) {
      return;
    }

    window.requestAnimationFrame(() => {
      setTimeout(() => {
        setOptions((options) => {
          options.enabled = true;
        });
      }, 200);
    });
  }, [setOptions]);

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <Toolbox isVisible={isToolboxVisible} />
      <div
        className={cx([
          "page-container flex h-full flex-col overflow-hidden",
          enabled ? "flex-1" : "flex-1",
        ])}
      >
        <Header
          canvasRef={canvasRef}
          isToolboxVisible={isToolboxVisible}
          setToolboxVisible={setIsToolboxVisible}
          isSidebarVisible={isSidebarVisible}
          setSidebarVisible={setIsSidebarVisible}
        />
        <div
          className={cx([
            "craftjs-renderer min-h-20.5 w-full flex-1 overflow-auto",
            {
              "bg-gray-100": enabled,
            },
          ])}
          ref={(ref) => {
            connectors.select(connectors.hover(ref, null), null);
          }}
        >
          <div ref={canvasRef} style={{ minHeight: "100%", width: "100%" }}>
            <ResizableCanvas initialWidth="100%">
              {children}
            </ResizableCanvas>
          </div>
        </div>
      </div>
      <Sidebar isVisible={isSidebarVisible} />
    </div>
  );
};
