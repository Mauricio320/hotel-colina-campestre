import { useEditor } from "@craftjs/core";
import cx from "classnames";
import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { styled } from "styled-components";
import { useAuth } from "@/hooks/useAuth";
import { useSaveLandingPage } from "@/hooks/useLandingPage";
import { cleanHtml } from "../../../utils/cleanHtml";

// SVG Icons as components
const UndoIcon = () => (
  <svg viewBox="0 0 18 18" fill="currentColor" className="h-5 w-5">
    <path d="M15.3315,6.271A5.19551,5.19551,0,0,0,11.8355,5H5.5V2.4A.4.4,0,0,0,5.1,2a.39352.39352,0,0,0-.2635.1L1.072,5.8245a.25.25,0,0,0,0,.35L4.834,9.9a.39352.39352,0,0,0,.2635.1.4.4,0,0,0,.4-.4V7h6.441A3.06949,3.06949,0,0,1,15.05,9.9a2.9445,2.9445,0,0,1-2.78274,3.09783Q12.13375,13.005,12,13H8.5a.5.5,0,0,0-.5.5v1a.5.5,0,0,0,.5.5h3.263a5.16751,5.16751,0,0,0,5.213-4.5065A4.97351,4.97351,0,0,0,15.3315,6.271Z" />
  </svg>
);

const RedoIcon = () => (
  <svg viewBox="0 0 18 18" fill="currentColor" className="h-5 w-5">
    <path d="M2.6685,6.271A5.19551,5.19551,0,0,1,6.1645,5H12.5V2.4a.4.4,0,0,1,.4-.4.39352.39352,0,0,1,.2635.1l3.762,3.7225a.25.25,0,0,1,0,.35L13.166,9.9a.39352.39352,0,0,1-.2635.1.4.4,0,0,1-.4-.4V7H6.0615A3.06949,3.06949,0,0,0,2.95,9.9a2.9445,2.9445,0,0,0,2.78274,3.09783Q5.86626,13.005,6,13H9.5a.5.5,0,0,1,.5.5v1a.5.5,0,0,1-.5.5H6.237a5.16751,5.16751,0,0,1-5.213-4.5065A4.97349,4.97349,0,0,1,2.6685,6.271Z" />
  </svg>
);

const HeaderDiv = styled.div`
  width: 100%;
  height: 45px;
  z-index: 99999;
  position: relative;
  padding: 0px 10px;
  background: #d4d4d4;
  display: flex;
`;

const Item = styled.a<{ disabled?: boolean }>`
  margin-right: 10px;
  cursor: pointer;
  svg {
    width: 20px;
    height: 20px;
    fill: #707070;
  }
  ${(props) =>
    props.disabled &&
    `
    opacity:0.5;
    cursor: not-allowed;
  `}
`;

export const Header = ({
  canvasRef,
  isToolboxVisible,
  setToolboxVisible,
  isSidebarVisible,
  setSidebarVisible,
}: {
  canvasRef: React.RefObject<HTMLDivElement | null>;
  isToolboxVisible: boolean;
  setToolboxVisible: (v: boolean) => void;
  isSidebarVisible: boolean;
  setSidebarVisible: (v: boolean) => void;
}) => {
  const navigate = useNavigate();

  const { enabled, canUndo, canRedo, actions, query } = useEditor((state, query) => ({
    enabled: state.options.enabled,
    canUndo: query.history.canUndo(),
    canRedo: query.history.canRedo(),
  }));

  const { employee } = useAuth();
  const saveMutation = useSaveLandingPage();
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = useCallback(async () => {
    if (!employee?.id) {
      alert("Debes iniciar sesión para guardar");
      return;
    }

    setIsSaving(true);
    try {
      const nodesJson = query.serialize() as unknown as Record<string, unknown>;

      let htmlContent = "";
      if (canvasRef.current) {
        const rawHtml = canvasRef.current.innerHTML;
        htmlContent = cleanHtml(rawHtml);
      }

      await saveMutation.mutateAsync({
        nodesJson,
        htmlContent,
        globalStyles: {},
        employeeId: employee.id,
      });
      actions.history.clear();
      alert("Landing page guardada exitosamente");
    } catch (error) {
      console.error("Error al guardar:", error);
      alert("Error al guardar la landing page");
    } finally {
      setIsSaving(false);
    }
  }, [actions, query, saveMutation, employee, canvasRef]);

  return (
    <HeaderDiv className="header w-full text-white transition">
      <div className="flex w-full items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setToolboxVisible(!isToolboxVisible)}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border-none bg-gray-600 text-white transition hover:bg-gray-700"
            title={isToolboxVisible ? "Ocultar componentes" : "Mostrar componentes"}
          >
            <i className={`pi ${isToolboxVisible ? "pi-align-left" : "pi-bars"} text-sm`}></i>
          </button>
          <button
            onClick={() => navigate(-1)}
            className="flex cursor-pointer items-center rounded-md border-none bg-gray-600 px-3 py-1 text-[13px] text-white transition hover:bg-gray-700"
            title="Volver a la aplicación"
          >
            <i className="pi pi-arrow-left mr-2 text-xs"></i>
            Volver
          </button>
        </div>

        {enabled && (
          <div className="flex flex-1 justify-center">
            <Item disabled={!canUndo} onClick={() => actions.history.undo()} title="Undo">
              <UndoIcon />
            </Item>
            <Item disabled={!canRedo} onClick={() => actions.history.redo()} title="Redo">
              <RedoIcon />
            </Item>
          </div>
        )}

        <div className="flex justify-end gap-2">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className={cx([
              "flex cursor-pointer items-center rounded-md border-none px-4 py-1 text-[13px] text-white transition",
              {
                "bg-gray-400": isSaving,
                "bg-emerald-500 hover:bg-emerald-600": !isSaving,
              },
            ])}
          >
            {isSaving ? (
              <>
                <span className="mr-1 inline-block animate-spin">⏳</span>
                Guardando...
              </>
            ) : (
              <>💾 Guardar</>
            )}
          </button>

          <button
            onClick={() => setSidebarVisible(!isSidebarVisible)}
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border-none bg-gray-600 text-white transition hover:bg-gray-700"
            title={isSidebarVisible ? "Ocultar propiedades" : "Mostrar propiedades"}
          >
            <i className={`pi ${isSidebarVisible ? "pi-align-right" : "pi-cog"} text-sm`}></i>
          </button>
        </div>
      </div>
    </HeaderDiv>
  );
};
