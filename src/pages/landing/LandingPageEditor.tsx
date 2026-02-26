import { Editor } from "@craftjs/core";
import React, { useState, useEffect } from "react";
import { resolver } from "@/components/craft-editor/resolver";
import { Toolbox, SettingsPanel, Toolbar, Viewport } from "@/components/craft-editor/editor";
import { useLandingPageState } from "@/hooks/useLandingPage";
import { ProgressSpinner } from "primereact/progressspinner";

const LandingPageEditor = () => {
  const [isPreview, setIsPreview] = useState(false);
  const { data: savedState, isLoading } = useLandingPageState();
  const [initialState, setInitialState] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (savedState?.nodes_json) {
      setInitialState(JSON.stringify(savedState.nodes_json));
    }
  }, [savedState]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <ProgressSpinner />
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col">
      <Editor
        resolver={resolver}
        enabled={!isPreview}
        onNodesChange={(query) => {
          console.log("Nodes changed:", query.serialize());
        }}
      >
        <Toolbar onPreview={() => setIsPreview(!isPreview)} isPreview={isPreview} />
        <div className="flex flex-1 overflow-hidden">
          {!isPreview && <Toolbox />}
          <Viewport initialState={initialState} />
          {!isPreview && <SettingsPanel />}
        </div>
      </Editor>
    </div>
  );
};

export default LandingPageEditor;
