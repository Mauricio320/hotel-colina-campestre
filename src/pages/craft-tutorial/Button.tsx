import React from "react";
import { useNode } from "@craftjs/core";

interface ButtonProps {
  size?: "small" | "medium" | "large";
  variant?: "text" | "outlined" | "contained";
  color?: string;
  text?: string;
  children?: React.ReactNode;
}

export const Button = ({ size = "small", variant = "outlined", color = "#000", text, children }: ButtonProps) => {
  const {
    connectors: { connect, drag },
  } = useNode();

  return (
    <button
      ref={(ref) => {
        connect(drag(ref));
      }}
      style={{
        padding: size === "small" ? "5px 10px" : size === "medium" ? "10px 20px" : "15px 30px",
        background: variant === "contained" ? color : "transparent",
        color: variant === "contained" ? "#fff" : color,
        border: variant === "outlined" ? `1px solid ${color}` : "none",
        cursor: "pointer",
        borderRadius: "4px",
      }}
    >
      {text || children}
    </button>
  );
};

Button.craft = {
  displayName: "Button",
};
