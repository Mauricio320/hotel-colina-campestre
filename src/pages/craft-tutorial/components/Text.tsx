import { useNode, useEditor } from "@craftjs/core";
import React, { useCallback } from "react";

export type TextProps = {
  fontSize?: string;
  textAlign?: "left" | "center" | "right" | "justify";
  fontWeight?: string;
  color?: { r: string; g: string; b: string; a: string };
  shadow?: number;
  text?: string;
  margin?: [string, string, string, string];
};

const defaultProps: Required<TextProps> = {
  fontSize: "15",
  textAlign: "left",
  fontWeight: "400",
  color: { r: "46", g: "47", b: "47", a: "1" },
  shadow: 0,
  text: "Texto editable. Haz doble clic para editar.",
  margin: ["0", "0", "0", "0"],
};

export const Text = (props: Partial<TextProps>) => {
  const mergedProps = { ...defaultProps, ...props };
  const { fontSize, textAlign, fontWeight, color, shadow, text, margin } = mergedProps;

  const {
    connectors: { connect },
    actions: { setProp },
    selected,
  } = useNode((state) => ({
    selected: state.events.selected,
  }));

  const { enabled } = useEditor((state) => ({
    enabled: state.options.enabled,
  }));

  const handleInput = useCallback(
    (e: React.FormEvent<HTMLDivElement>) => {
      const newText = e.currentTarget.innerHTML;
      setProp((prop) => {
        prop.text = newText;
      }, 500);
    },
    [setProp]
  );

  return (
    <div
      ref={connect}
      contentEditable={enabled}
      suppressContentEditableWarning
      onInput={handleInput}
      style={{
        width: "100%",
        margin: `${margin[0]}px ${margin[1]}px ${margin[2]}px ${margin[3]}px`,
        color: `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a})`,
        fontSize: `${fontSize}px`,
        fontWeight,
        textAlign,
        textShadow: `0px 0px 2px rgba(0,0,0,${(shadow || 0) / 100})`,
        outline: selected ? "2px dashed #3b82f6" : "none",
        padding: "4px",
        cursor: enabled ? "text" : "default",
        minHeight: "24px",
      }}
      dangerouslySetInnerHTML={{ __html: text }}
    />
  );
};

Text.craft = {
  displayName: "Text",
  props: {
    ...defaultProps,
  },
  rules: {
    canDrag: () => true,
    canMoveIn: () => false,
    canMoveOut: () => true,
  },
};
