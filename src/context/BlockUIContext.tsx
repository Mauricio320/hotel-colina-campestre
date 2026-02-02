import React, { createContext, useContext, useState, ReactNode } from "react";
import GlobalBlockUI from "@/components/ui/GlobalBlockUI";

interface BlockUIContextType {
  showBlockUI: (message?: string) => void;
  hideBlockUI: () => void;
  isVisible: boolean;
}

const BlockUIContext = createContext<BlockUIContextType | undefined>(undefined);

export const BlockUIProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [message, setMessage] = useState<string | undefined>(undefined);

  const showBlockUI = (msg?: string) => {
    setMessage(msg || "Cargando...");
    setIsVisible(true);
  };

  const hideBlockUI = () => {
    setIsVisible(false);
    setMessage(undefined);
  };

  return (
    <BlockUIContext.Provider value={{ showBlockUI, hideBlockUI, isVisible }}>
      <GlobalBlockUI visible={isVisible} message={message} />
      {children}
    </BlockUIContext.Provider>
  );
};

export const useBlockUI = (): BlockUIContextType => {
  const context = useContext(BlockUIContext);
  if (!context) {
    throw new Error("useBlockUI must be used within a BlockUIProvider");
  }
  return context;
};
