---
name: craftjs
description: Complete reference and implementation guide for craft.js. Covers useNode, useEditor, Canvas Nodes, User Components, Editor, Frame, Element, NodeHelpers, connectors, rules, serialization, undo/redo, and full page editor construction with drag-and-drop.
---

# craft.js Skill

Craft.js is a React library that modularizes the building blocks of a page editor.
It provides drag-and-drop, Node-based state management, and an extensible API.
You design your own UI; craft.js handles the internal system.

## Installation

```bash
yarn add @craftjs/core
# or
npm install --save @craftjs/core
```

## Core Concepts

### Editor Architecture

```
<Editor resolver={{...}}>         <- Global context, registers User Components
  <Frame>                         <- Editable area; delegates rendering to craft.js
    <Element is={Container} canvas>  <- Canvas Node: droppable
      <Text />                       <- Canvas child Node: draggable
    </Element>
  </Frame>
</Editor>
```

### Node Types

| Type | Draggable | Droppable |
|------|-----------|-----------|
| Regular Node | Yes (if child of Canvas) | No |
| Canvas Node | Yes (if child of Canvas) | Yes |
| Root Node | No | Yes |

### Minimal User Component

```jsx
import { useNode } from "@craftjs/core";

const MyComponent = ({ text, fontSize }) => {
  const { connectors: { connect, drag } } = useNode();
  return (
    <div ref={ref => connect(drag(ref))}>
      <p style={{ fontSize }}>{text}</p>
    </div>
  );
};

MyComponent.craft = {
  props: { text: "Hello", fontSize: 16 },
  rules: {
    canDrag: (node) => true,
    canMoveIn: (incoming) => true,
  },
  related: {
    settings: MyComponentSettings
  }
};
```

### Main Hooks

| Hook | Where to use | Purpose |
|------|-------------|---------|
| `useNode(collector?)` | Only inside User Components | State/actions of the current Node |
| `useEditor(collector?)` | Anywhere within the Craft context | State/actions of the entire editor |

## Most Common Patterns

### Read Node state (useNode)

```jsx
const { isSelected, fontSize } = useNode((node) => ({
  isSelected: node.events.selected,
  fontSize: node.data.props.fontSize,
}));
```

### Edit props (useNode)

```jsx
const { actions: { setProp } } = useNode();
setProp(props => { props.text = "New value"; });
```

### Toolbox — create components via drag

```jsx
const { connectors } = useEditor();
<button ref={ref => connectors.create(ref, <MyComponent />)}>
  Drag to create
</button>
```

### Serialize / Save state

```jsx
const { query, actions } = useEditor();

// Save
const json = query.serialize();

// Load
actions.deserialize(json);
// or via Frame prop:
// <Frame data={savedJson}>...</Frame>
```

### Settings Panel — related component

```jsx
const MySettings = () => {
  const { fontSize, actions: { setProp } } = useNode((node) => ({
    fontSize: node.data.props.fontSize,
  }));
  return (
    <input
      type="number"
      value={fontSize}
      onChange={e => setProp(p => p.fontSize = +e.target.value)}
    />
  );
};
```

### Delete / Check if deletable

```jsx
const { actions, selected } = useEditor((state, query) => {
  const [id] = state.events.selected;
  return {
    selected: id ? {
      id,
      isDeletable: query.node(id).isDeletable()
    } : null
  };
});

if (selected?.isDeletable) actions.delete(selected.id);
```

### Undo/Redo History

```jsx
const { actions, canUndo, canRedo } = useEditor((state, query) => ({
  canUndo: query.history.canUndo(),
  canRedo: query.history.canRedo(),
}));

actions.history.undo();
actions.history.redo();
// Without recording in history:
actions.history.ignore().setProp("ROOT", p => p.value = newValue);
// Throttle rapid changes:
actions.history.throttle().setProp("ROOT", p => p.text = value);
```

## Drag/Drop Rules

```jsx
MyComponent.craft = {
  rules: {
    canDrag: (node, helper) => true,
    canDrop: (targetNode, currentNode, helper) => true,
    canMoveIn: (incomingNodes, self, helper) => true,
    canMoveOut: (outgoingNodes, self, helper) => true,
  }
};
```

## Linked Nodes (inside User Components)

```jsx
// ALWAYS specify the `id` prop when using Element inside a User Component
const Hero = ({ background }) => (
  <div style={{ background }}>
    <Element id="title" is={Text} text="Hero Title" />
    <Element id="content" canvas is="section">
      <p>Droppable zone</p>
    </Element>
  </div>
);
```

## Editor Component — Key Props

| Prop | Type | Description |
|------|------|-------------|
| `resolver` | `{[name]: Component}` | Required. Registers all User Components |
| `enabled` | `boolean` | Enable/disable edit mode |
| `onRender` | `ComponentType` | Custom wrapper for every User Element |
| `onNodesChange` | `(query) => void` | Callback when any Node changes |
| `indicator` | `{success, error}` | Drop indicator colors |

---

## Full Reference

For exhaustive details on all types, methods, and advanced examples, read:
references/craftjs-full-docs.md

Contains complete documentation for:
- EditorState (full state structure)
- Node and NodeTree (internal types)
- UserComponent TypeScript type
- Frame and Element (props and examples)
- useEditor() (all actions, queries and connectors)
- useNode() (all return values and examples)
- NodeHelpers (all methods: isRoot, isDeletable, descendants, etc.)