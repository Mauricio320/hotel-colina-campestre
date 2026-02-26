import { Editor, Frame } from "@craftjs/core";
import React from "react";
import { resolver } from "@/components/craft-editor/resolver";
import { useLandingPageState } from "@/hooks/useLandingPage";
import { ProgressSpinner } from "primereact/progressspinner";

const LandingPagePreview = () => {
  const { data: savedState, isLoading, error } = useLandingPageState();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <ProgressSpinner />
      </div>
    );
  }

  if (error || !savedState) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
        <h1 className="text-4xl font-bold text-emerald-800">Hotel Colina Campestre</h1>
        <p className="text-gray-600">Bienvenido a nuestro hotel. La página está en construcción.</p>
      </div>
    );
  }

  const initialJson = savedState.nodes_json
    ? JSON.stringify(savedState.nodes_json)
    : undefined;

  return (
    <Editor resolver={resolver} enabled={false}>
      {initialJson ? (
        <Frame json={initialJson} />
      ) : (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
          <h1 className="text-4xl font-bold text-emerald-800">Hotel Colina Campestre</h1>
          <p className="text-gray-600">Bienvenido a nuestro hotel. La página está en construcción.</p>
        </div>
      )}
    </Editor>
  );
};

export default LandingPagePreview;
