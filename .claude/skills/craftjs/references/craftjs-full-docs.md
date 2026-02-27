# craft.js — Documentación Completa

> Fuente: [craft.js.org/docs](https://craft.js.org/docs/overview)  
> Compilado desde todas las secciones de la documentación oficial.

---

## Tabla de Contenidos

1. [Introducción / Overview](#overview)
2. [Core Concepts — Nodes](#nodes)
3. [Core Concepts — User Components](#user-components)
4. [Core Concepts — Interacting with the Editor](#interacting-with-the-editor)
5. [Guía — Basic Tutorial](#basic-tutorial)
6. [API Reference — EditorState](#editorstate)
7. [API Reference — Node](#node)
8. [API Reference — UserComponent](#usercomponent)
9. [API Reference — NodeTree](#nodetree)
10. [API Reference — `<Editor />`](#editor-)
11. [API Reference — `<Frame />`](#frame-)
12. [API Reference — `<Element />`](#element-)
13. [API Reference — `useEditor()`](#useeditor)
14. [API Reference — `useNode()`](#usenode)
15. [API Reference — NodeHelpers](#nodehelpers)

---

## Overview

### Motivación

Los editores de páginas son una excelente forma de brindar una gran experiencia de usuario. Sin embargo, construir uno es una tarea difícil.

Existen bibliotecas que vienen con un editor de páginas completo listo para usar con una interfaz de usuario y componentes editables. Pero si deseas personalizar la interfaz, inevitablemente tendrás que modificar la librería misma.

**Craft.js** resuelve este problema modularizando los bloques de construcción de un editor de páginas. Proporciona un sistema de drag-and-drop y maneja cómo los componentes del usuario deben renderizarse, actualizarse y moverse. De esta manera, puedes centrarte en construir el editor de páginas según tus propias especificaciones.

### Características

#### Es solo React

No necesitas sistemas de plugins complicados. Diseña tu editor de arriba a abajo igual que cualquier otra aplicación de React.

Un componente de usuario simple puede definirse así:

```jsx
import {useNode} from "@craftjs/core";

const TextComponent = ({text}) => {
  const { connectors: {drag} } = useNode();

  return (
    <div ref={drag}>
      <h2>{text}</h2>
    </div>
  )
}
```

Y toda la UI del editor también es solo React:

```jsx
import React from "react";
import {Editor, Frame, Canvas, Selector} from "@craftjs/core";

const App = () => {
  return (
    <div>
      <header>Some fancy header or whatever</header>
      <Editor>
        <Frame resolver={TextComponent, Container}>
          <Canvas>
            <TextComponent text="I'm already rendered here" />
          </Canvas>
        </Frame>
      </Editor>
    </div>
  )
}
```

#### Control sobre cómo se editan los componentes

```jsx
import {useNode} from "@craftjs/core";

const TextComponent = ({text}) => {
  const { connectors: { connect, drag }, isClicked, actions: {setProp} } = useNode(
    (state) => ({
      isClicked: state.event.selected,
    })
  );

  return (
    <div ref={dom => connect(drag(dom))}>
      <h2>{text}</h2>
      {
        isClicked ? (
          <Modal>
            <input
              type="text"
              value={text}
              onChange={e => setProp(e.target.value)}
            />
          </Modal>
        ) : null
      }
    </div>
  )
}
```

#### Regiones droppable en los componentes

```jsx
import {useNode} from "@craftjs/core";

const Container = () => {
  const { connectors: {drag} } = useNode();

  return (
    <div ref={drag}>
      <Canvas id="drop_section">
        <TextComponent />
      </Canvas>
    </div>
  )
}
```

#### API extensible

```jsx
import {useEditor, useNode} from "@craftjs/core";

const Container = () => {
  const { actions: {add}, query: { createNode, node } } = useEditor();
  const { id, connectors: {drag, connect} } = useNode();

  return (
    <div ref={dom => connect(drag(dom))}>
      ...
      <a onClick={() => {
        const { data: {type, props}} = node(id).get();
        add(
          createNode(React.createElement(type, props))
        );
      }}>
        Make a copy of me
      </a>
    </div>
  )
}
```

#### Estado serializable

```jsx
const SaveButton = () => {
  const { query } = useEditor();
  return <a onClick={() => console.log(query.serialize())}>Get JSON</a>
}

// Y para cargar desde JSON:
const App = () => {
  const jsonString = /* retrieve JSON from server */
  return (
    <Editor>
      <Frame json={jsonString}>
        ...
      </Frame>
    </Editor>
  )
}
```

---

## Nodes

Craft.js mantiene un estado interno compuesto de objetos llamados **Nodes** que representan y gestionan los User Elements renderizados en el editor. Estos Nodes contienen información como el tipo del elemento, los props actuales, el elemento DOM, el Node padre, etc.

### User Elements

Los User Elements son React Elements que el usuario final podrá manipular. Pueden ser tags HTML simples o React Components.

```jsx
<div style={{ background: "#333" }}>     // Node de tipo div
  <h1>Hi</h1>                            // Node de tipo h1; no draggable
  <MyComp>Hey</MyComp>                   // Node de tipo MyComp; no draggable
  <MyContainerComponent>               // Node de tipo MyContainerComponent; no draggable
    <h2>Second level</h2>              // Node de tipo h2; no draggable
  </MyContainerComponent>
</div>
```

Por defecto, se crea un **non-Canvas Node**. Para crear un **Canvas Node** (droppable), usamos el componente `<Element />`:

```jsx
<Element is="div" style={{ background: "#333" }} canvas>  // Canvas Node; droppable
  <h1>Hi</h1>          // draggable (hijo de Canvas)
  <MyComp>Hey</MyComp> // draggable
  <MyContainerComponent> // draggable
    <h2>Second level</h2> // NO draggable (no es hijo directo de Canvas)
  </MyContainerComponent>
</Element>
```

La prop `is` especifica el tipo de User Element; puede ser un tag HTML o un User Component.

---

## User Components

Los User Components se escriben igual que cualquier otro componente React.

```jsx
const Text = ({text, fontSize}) => {
  return (
    <span contentEditable="true" style={{fontSize}}>{text}</span>
  )
}
```

### Conectar con el editor usando `useNode`

```jsx
const { connectors: {connect, drag}, setProp, ...collected } = useNode((node) => {});
```

También se puede pasar configuración vía la propiedad estática `craft`:

```jsx
const Text = () => {...}
Text.craft = {
  props: {},
  rules: {
    canDrop: () => true,
    canDrag: () => true,
    canMoveIn: () => true,
    canMoveOut: () => true
  },
  related: {}
}
```

### Connectors

- `connect`: especifica el DOM que representa al User Component. Si el Node es un Canvas, también define el área droppable.
- `drag`: especifica el DOM que debe ser draggable.

```jsx
const Container = ({children}) => {
  const { connectors: {connect, drag} } = useNode();
  return (
    <div ref={dom => connect(drag(dom))}>
      {children}
    </div>
  )
}
```

### Props Manipulation

```jsx
const Text = ({text, fontSize}) => {
  const { connectors: {connect, drag}, actions: {setProp} } = useNode();

  return (
    <span
      ref={dom => connect(drag(dom))}
      style={{fontSize}}
      onKeyUp={(e) => {
        setProp(props => {
          props.text = e.target.innerText;
        })
      }}
    >
      {text}
    </span>
  )
}
```

### Collecting Node's State

```jsx
const Text = ({text, fontSize}) => {
  const { connectors: {connect, drag}, setProp, isClicked } = useNode((node) => ({
    isClicked: node.events.selected
  }));

  return (
    <span
      ref={dom => connect(drag(dom))}
      style={{fontSize}}
      contentEditable={isClicked}
      onKeyUp={(e) => {
        setProp(props => {
          props.text = e.target.innerText;
        })
      }}
    >
      {text}
    </span>
  )
}
```

### Default Props

```jsx
const Text = ({text, fontSize}) => { /** ... **/ }
Text.craft = {
  props: {
    text: "Hi there!",
    fontSize: 12
  }
}
```

### Drag/Drop Rules

```jsx
const Text = ({text, fontSize}) => { /** ... **/ }
Text.craft = {
  props: { /** ... **/ },
  rules: {
    canDrag: (node) => !!node.data.props.text == "Drag"
  }
}
```

### Related Components

Los Related Components comparten el mismo contexto de Node que el User Component y tienen acceso al hook `useNode`.

```jsx
const Text = ({text, fontSize}) => { /** ... **/ }
Text.craft = {
  related: {
    toolbar: TextToolbarSettings
  }
}

const TextToolbarSettings = () => {
  const { setProp, fontSize } = useNode((node) => ({
    fontSize: node.data.props.fontSize
  }));

  return (
    <div>
      <h2>Text settings</h2>
      <input
        type="number"
        value={fontSize}
        placeholder="Font size"
        onChange={e =>
          setProp(prop => prop.fontSize = e.target.value)
        }
      />
    </div>
  )
}
```

### Definir elementos editables dentro de User Components

Para crear un nuevo Node dentro de un User Component, usa `<Element />` con una prop `id`:

```jsx
const Hero = ({background}) => {
  return (
    <div style={{ background }}>
      <Element is={Text} text="Hero Title" id="title_text" />
      <Element canvas is="section" id="droppable_container">
        <h2>I'm dropped here for now</h2>
      </Element>
    </div>
  )
}
```

> **Importante:** Debes especificar la prop `id` en `<Element />` cuando se usa dentro de un User Component.

---

## Interacting with the Editor

El hook `useEditor` permite leer y manipular el estado interno completo del editor.

```jsx
const { actions, connectors, ...collected } = useEditor((state) => {});
```

> A diferencia de `useNode` (solo en User Components), `useEditor` puede usarse en cualquier lugar dentro del contexto de Craft.

### Obtener información del estado

```jsx
const App = () => {
  const { hoveredNodeName } = useEditor((state) => {
    const currentlyHoveredId = state.events.hovered;
    return {
      hoveredNodeName: state.nodes[currentlyHoveredId].displayName
    }
  })
  return (
    <h2>The component being hovered is: {hoveredNodeName}</h2>
  )
}
```

### Connectors en el Editor

```jsx
// Seleccionar un Node al hacer click
const LayerItem = (nodeId) => {
  const { connectors: { select }} = useEditor();
  return (
    <div>
      <a ref={ref => select(ref, nodeId)}>Click me to select node {nodeId}</a>
    </div>
  );
}

// Crear nuevo componente al hacer drag
const DragToCreate = (nodeId) => {
  const { connectors: { create }} = useEditor();
  return (
    <div>
      <a ref={ref => create(ref, <Text />)}>Drag me to create a new Text</a>
    </div>
  );
}
```

### Manipular el estado

```jsx
const DeleteButtonThingy = () => {
  const { actions, selectedNodeId } = useEditor((state) => ({
    selectedNodeId: state.events.selected
  }));

  return (
    <div>
      <button onClick={() => actions.delete(selectedNodeId)}>
        Click me to delete the selected node
      </button>
    </div>
  )
}
```

### Queries

```jsx
const Sidebar = () => {
  const {query} = useEditor();
  return (
    <div>
      <a onClick={() => {
        console.log(query.deserialize());
      }}>Click me</a>
    </div>
  )
}
```

---

## Basic Tutorial

[Demo en vivo](https://prevwong.github.io/craft.js/examples/basic) | [Ver código](https://github.com/prevwong/craft.js/tree/master/packages/examples/basic)

### Instalación

```bash
yarn add @craftjs/core
# o con npm:
npm install --save @craftjs/core
```

### Componentes de Usuario

#### Text

```jsx
// components/user/Text.js
import React from "react";

export const Text = ({text, fontSize}) => {
  return (
    <div>
      <p style={{fontSize}}>{text}</p>
    </div>
  )
}
```

#### Button

```jsx
// components/user/Button.js
import React from "react";
import {Button as MaterialButton} from "@mui/material";

export const Button = ({size, variant, color, children}) => {
  return (
    <MaterialButton size={size} variant={variant} color={color}>
      {children}
    </MaterialButton>
  )
}
```

#### Container

```jsx
// components/user/Container.js
import React from "react";
import { Paper } from "@mui/material";

export const Container = ({background, padding = 0, children}) => {
  return (
    <Paper style={{margin: "5px 0", background, padding: `${padding}px`}}>
      {children}
    </Paper>
  )
}
```

#### Card (componente avanzado con regiones droppable)

```jsx
// components/user/Card.js
import React from "react";
import Text from "./Text";
import Button from "./Button";
import { Element, useNode } from "@craftjs/core";
import { Container } from "./Container";

export const CardTop = ({children}) => {
  const { connectors: {connect} } = useNode();
  return (
    <div ref={connect} className="text-only">
      {children}
    </div>
  )
}

CardTop.craft = {
  rules: {
    canMoveIn: (incomingNodes) => incomingNodes.every(n => n.data.type === Text)
  }
}

export const CardBottom = ({children}) => {
  const { connectors: {connect} } = useNode();
  return (
    <div ref={connect}>
      {children}
    </div>
  )
}

CardBottom.craft = {
  rules: {
    canMoveIn: (incomingNodes) => incomingNodes.every(n => n.data.type === Button)
  }
}

export const Card = ({background, padding = 20}) => {
  return (
    <Container background={background} padding={padding}>
      <Element id="text" is={CardTop} canvas>
        <Text text="Title" fontSize={20} />
        <Text text="Subtitle" fontSize={15} />
      </Element>
      <Element id="buttons" is={CardBottom} canvas>
        <Button size="small" text="Learn more" />
      </Element>
    </Container>
  )
}
```

### Setup del Editor

```jsx
// pages/index.js
import {Editor, Frame, Element} from "@craftjs/core";

export default function App() {
  return (
    <div>
      <Editor resolver={{Card, Button, Text, Container, CardTop, CardBottom}}>
        <Grid container spacing={3}>
          <Grid item xs>
            <Frame>
              <Element is={Container} padding={5} background="#eee" canvas>
                <Card />
                <Button size="small" variant="outlined">Click</Button>
                <Text size="small" text="Hi world!" />
                <Element is={Container} padding={2} background="#999" canvas>
                  <Text size="small" text="It's me again!" />
                </Element>
              </Element>
            </Frame>
          </Grid>
          <Grid item xs={3}>
            <Paper>
              <Toolbox />
              <SettingsPanel />
            </Paper>
          </Grid>
        </Grid>
      </Editor>
    </div>
  );
}
```

### Habilitando Drag and Drop

```jsx
// components/user/Text.js
export const Text = ({text, fontSize}) => {
  const { connectors: {connect, drag}, hasSelectedNode, actions: {setProp} } = useNode((state) => ({
    hasSelectedNode: state.events.selected,
    hasDraggedNode: state.events.dragged
  }));

  const [editable, setEditable] = useState(false);
  useEffect(() => { !hasSelectedNode && setEditable(false) }, [hasSelectedNode]);

  return (
    <div ref={ref => connect(drag(ref))} onClick={() => setEditable(true)}>
      <ContentEditable
        disabled={!editable}
        html={text}
        onChange={e =>
          setProp(props =>
            props.text = e.target.value.replace(/<\/?[^>]+(>|$)/g, "")
          )
        }
        tagName="p"
        style={{fontSize: `${fontSize}px`}}
      />
    </div>
  )
}

Text.craft = {
  props: { text: "Hi", fontSize: 20 },
  rules: {
    canDrag: (node) => node.data.props.text != "Drag"
  },
  related: {
    settings: TextSettings
  }
}
```

### Implementando el Toolbox

```jsx
// components/Toolbox.js
import { Element, useEditor } from "@craftjs/core";

export const Toolbox = () => {
  const { connectors, query } = useEditor();

  return (
    <Box px={2} py={2}>
      <Grid container direction="column" alignItems="center" spacing={1}>
        <Box pb={2}><Typography>Drag to add</Typography></Box>
        <Grid container direction="column" item>
          <MaterialButton ref={ref => connectors.create(ref, <Button text="Click me" size="small" />)} variant="contained">Button</MaterialButton>
        </Grid>
        <Grid container direction="column" item>
          <MaterialButton ref={ref => connectors.create(ref, <Text text="Hi world" />)} variant="contained">Text</MaterialButton>
        </Grid>
        <Grid container direction="column" item>
          <MaterialButton ref={ref => connectors.create(ref, <Element is={Container} padding={20} canvas />)} variant="contained">Container</MaterialButton>
        </Grid>
        <Grid container direction="column" item>
          <MaterialButton ref={ref => connectors.create(ref, <Card />)} variant="contained">Card</MaterialButton>
        </Grid>
      </Grid>
    </Box>
  )
};
```

### Settings Panel

```jsx
// components/SettingsPanel.js
import { useEditor } from "@craftjs/core";

export const SettingsPanel = () => {
  const { actions, selected } = useEditor((state, query) => {
    const [currentNodeId] = state.events.selected;
    let selected;

    if (currentNodeId) {
      selected = {
        id: currentNodeId,
        name: state.nodes[currentNodeId].data.name,
        settings: state.nodes[currentNodeId].related && state.nodes[currentNodeId].related.settings,
        isDeletable: query.node(currentNodeId).isDeletable()
      };
    }

    return { selected }
  });

  return selected ? (
    <Box bgcolor="rgba(0, 0, 0, 0.06)" mt={2} px={2} py={2}>
      <Grid container direction="column" spacing={0}>
        <Grid item>
          <Box pb={2}>
            <Grid container alignItems="center">
              <Grid item xs><Typography variant="subtitle1">Selected</Typography></Grid>
              <Grid item><Chip size="small" color="primary" label={selected.name} /></Grid>
            </Grid>
          </Box>
        </Grid>
        { selected.settings && React.createElement(selected.settings) }
        {
          selected.isDeletable ? (
            <MaterialButton
              variant="contained"
              color="default"
              onClick={() => { actions.delete(selected.id); }}
            >
              Delete
            </MaterialButton>
          ) : null
        }
      </Grid>
    </Box>
  ) : null
}
```

### Topbar

```jsx
// components/Topbar.js
import { useEditor } from "@craftjs/core";

export const Topbar = () => {
  const { actions, query, enabled } = useEditor((state) => ({
    enabled: state.options.enabled
  }));

  return (
    <Box px={1} py={1} mt={3} mb={1} bgcolor="#cbe8e7">
      <Grid container alignItems="center">
        <Grid item xs>
          <FormControlLabel
            control={<Switch checked={enabled} onChange={(_, value) => actions.setOptions(options => options.enabled = value)} />}
            label="Enable"
          />
        </Grid>
        <Grid item>
          <MaterialButton
            size="small"
            variant="outlined"
            color="secondary"
            onClick={() => { console.log(query.serialize()) }}
          >
            Serialize JSON to console
          </MaterialButton>
        </Grid>
      </Grid>
    </Box>
  )
};
```

---

## EditorState

### Propiedades

| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `nodes` | `Record<NodeId, Node>` | Mapa de todos los Nodes en el editor |
| `events.selected` | `Set<NodeId>` | Nodes actualmente seleccionados |
| `events.hovered` | `Set<NodeId>` | Nodes actualmente en hover |
| `events.dragged` | `Set<NodeId>` | Nodes actualmente siendo arrastrados |
| `options.resolver` | `Map<String, React.ComponentType>` | Mapa de User Components |
| `options.enabled` | `boolean?` | Si es false, deshabilita toda edición |
| `options.indicator.success` | `String` | Color cuando hover en zona droppable |
| `options.indicator.error` | `String` | Color cuando hover en zona no-droppable |
| `options.indicator.transition` | `string` | Transición CSS del indicador |
| `options.indicator.thickness` | `number` | Grosor del indicador |
| `options.onRender` | `React.ComponentType` | Componente custom para renderizar User Elements |
| `options.onNodesChange` | `() => void` | Callback cuando cambia algún Node |

> Las `options` se especifican como props en `<Editor />`.

---

## Node

Un Node es un objeto interno que representa y gestiona un User Element en el editor.

### Tipos de Nodes

- **Child Nodes**: Nodes referenciados en la propiedad `data.nodes` del Node padre. Se renderizan como `children` del User Component padre.
- **Linked Nodes**: Nodes vinculados a un Node padre mediante un id arbitrario. Se crean con `<Element id="..." />` dentro de un User Component.

---

## UserComponent

`UserComponent<T>` es un tipo TypeScript que extiende un React Component y expone la prop estática `craft`.

```typescript
type TextProps = { color: string; text: string; };

const TextComponent: UserComponent<TextProps> = ({color, text}) => {
  return (
    <h2 style={{color}}>{text}</h2>
  )
}

const TextSettings = () => {
  const {props, setProp} = useNode();
  return (
    <div>
      Text: <input type="text" value={props.text} onChange={e => setProp(props => props.text = e.target.value)} />
      Color: <input type="text" value={props.color} onChange={e => setProp(props => props.color = e.target.value)} />
    </div>
  )
}

TextComponent.craft = {
  displayName: "My Text Component",
  props: {
    color: "#000",
    text: "Hi"
  },
  rules: {
    canDrag: (self, helper) => true,
    canMoveIn: (incoming, self, helper) => true,
    canMoveOut: (outgoing, self, helper) => true
  },
  related: {
    settings: TextSettings
  }
}
```

### Reglas (`craft.rules`)

| Regla | Firma | Descripción |
|-------|-------|-------------|
| `canDrag` | `(self: Node, helper) => boolean` | Si el componente puede ser arrastrado (solo para hijos directos de Canvas) |
| `canDrop` | `(targetNode: Node, currentNode, helpers) => boolean` | Si el Node puede ser soltado en el target |
| `canMoveIn` | `(incoming: Node[], current: Node, helpers) => boolean` | Si los Nodes entrantes pueden ser soltados dentro del componente (solo Canvas) |
| `canMoveOut` | `(outgoing: Node[], current: Node, helpers) => boolean` | Si los hijos pueden salir del componente (solo Canvas) |

---

## NodeTree

Estructura de datos útil para representar el árbol de React Elements como Nodes.

```typescript
// Para este JSX:
<div>
  <h2>Hello</h2>
  <h2>World</h2>
</div>

// El NodeTree del div es:
{
  rootNodeId: "node-a",
  nodes: {
    "node-a": { data: { type: "div", nodes: ["node-b", "node-c"] } },
    "node-b": { data: { type: "h2", props: { children: "Hello" } } },
    "node-c": { data: { type: "h2", props: { children: "World" } } }
  }
}
```

---

## `<Editor />`

**Componente** — Crea el contexto que almacena el estado del editor.

### Props

| Prop | Tipo | Descripción |
|------|------|-------------|
| `resolver` | `Map<String, React.ComponentType>` | Mapa de User Components que se usarán en el editor |
| `enabled?` | `boolean` | Si es false, deshabilita todas las capacidades de edición |
| `indicator?` | `Record<"success" \| "error", String>` | Colores del indicador de drop |
| `onRender?` | `React.ComponentType<{element: React.ReactElement}>` | Componente custom para renderizar cada User Element |
| `onNodesChange?` | `(query: QueryMethods) => void` | Callback cuando los Nodes cambian |
| `handlers?` | `(store: EditorStore) => CoreEventHandlers` | Override de los event handlers por defecto |

### Ejemplos

#### Render personalizado de User Elements

```jsx
const RenderNode = ({element}) => {
  return (
    <div style={{background: "#000", padding: "5px"}}>
      {element}
    </div>
  )
}

const App = () => {
  return (
    <Editor onRender={RenderNode}>
      <Frame resolver={{Hero}}>
        <Element>
          <h1>Hi</h1>
          <Hero />
        </Element>
      </Frame>
    </Editor>
  )
}
```

#### Personalizar colores del indicador

```jsx
<Editor
  indicator={{
    'success': '#2d9d78',
    'error': '#e34850',
    'style': { boxShadow: '...' },
    'className': 'your-css-class'
  }}
>
  ...
</Editor>
```

#### Callback al cambiar Nodes

```jsx
<Editor
  onNodesChange={query => {
    const json = query.serialize();
    axios.post('/saveJSON', { json });
  }}
>
  ...
</Editor>
```

#### Override de event handlers

```jsx
import { DefaultEventHandlers, Editor, EditorStore, NodeId } from '@craftjs/core'

class CustomEventHandlers extends DefaultEventHandlers {
  handlers() {
    const defaultHandlers = super.handlers()
    return {
      ...defaultHandlers,
      hover: (el, id) => {
        const unbindDefault = defaultHandlers.hover(el, id)
        const unbindMouseleave = this.addCraftEventListener(el, 'mouseleave', (e) => {
          e.craft.stopPropagation()
          this.options.store.actions.setNodeEvent('hovered', '')
        })
        return () => { unbindDefault(); unbindMouseleave(); }
      }
    }
  }
}

const App = () => (
  <Editor handlers={(store) => new CustomEventHandlers({ store, isMultiSelectEnabled: () => false })}>
    ...
  </Editor>
)
```

---

## `<Frame />`

**Componente** — Define el área editable en tu editor de páginas. Se renderiza basándose en el estado interno del editor (es decir, los Nodes).

### Props

| Prop | Tipo | Descripción |
|------|------|-------------|
| `children?` | `React.ReactElement` | Crea la pantalla inicial usando React Elements. El elemento definido aquí será el Root Node |
| `data?` | `string \| SerializedNodes` | Carga el estado del editor desde JSON serializado (tiene precedencia sobre `children`) |

> **Nota:** Estas props son memoizadas — después del render inicial, los cambios no tendrán efecto. Si necesitas cargar un JSON diferente luego del render inicial, usa el método `deserialize` via el hook `useEditor`.

### Ejemplo

```jsx
import {Editor, Frame, Element} from "@craftjs/core";

const App = () => {
  return (
    <div>
      <Editor>
        <Frame data='{"ROOT":{"type":"div","isCanvas":true,"props":{},...}}'>
          <Element is={Container} canvas>
            <h2>Drag me around</h2>
            <MyComp text="You can drag me around too" />
          </Element>
        </Frame>
      </Editor>
    </div>
  )
}
```

---

## `<Element />`

**Componente** — Define el Node para un User Element dado.

### Uso dentro de `<Frame />`

Dado que `<Frame />` crea un Node automáticamente para todos sus elementos hijos, `<Element />` se puede usar para simplemente configurar los valores del Node que se está creando.

```jsx
import {Craft, Frame, Element} from "@craftjs/core";

const App = () => {
  return (
    <div>
      <Craft resolver={{MyComp}}>
        <Frame>
          <Element is="div" canvas>
            {/* Root Node, droppable */}
            <h2>Drag me around</h2>              {/* Node de tipo h2, draggable */}
            <MyComp text="Drag me too" />         {/* Node de tipo MyComp, draggable */}
            <Element is="div" style={{background: "#333"}} canvas>
              {/* Canvas Node de tipo div, draggable y droppable */}
              <p>Same here</p>                   {/* NO es un Node; no draggable */}
            </Element>
          </Element>
        </Frame>
      </Craft>
    </div>
  )
}
```

### Uso dentro de User Components

Cuando se usa dentro de un User Component, `<Element />` crea un **Linked Node** — un Node vinculado al Node del User Component contenedor mediante un `id` arbitrario:

```jsx
const Hero = () => {
  return (
    <div>
      <h3>I'm a Hero</h3>
      <Element id="drop" is={Container} canvas>
        <h3>Hi</h3>
      </Element>
    </div>
  )
}
```

> **`<Element />` dentro de un User Component debe especificar una prop `id`.**

### Custom Properties

Los User Components pueden consumir propiedades custom de su Node correspondiente:

```jsx
const Hero = () => {
  const { css } = useNode(node => ({ css: node.data.custom.css }));
  return (
    <div style={css}>
      <h3>I'm a Hero</h3>
      <Element id="drop" is={Container} canvas>
        <h3>Hi</h3>
      </Element>
    </div>
  )
}

Hero.craft = {
  custom: {
    css: { background: "#eee" }
  }
}
```

---

## `useEditor()`

**Hook** — Proporciona métodos e información de estado asociados con todo el editor.

```jsx
const { connectors, actions, query, ...collected } = useEditor(collector);
```

### Parámetros

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `collector` | `(state: EditorState, query: Query) => Collected` | Función que recolecta información del estado. El componente se re-renderiza cuando los valores retornados cambian. |

### Retorna

#### `connectors`

| Método | Firma | Descripción |
|--------|-------|-------------|
| `select` | `(dom, nodeId) => HTMLElement` | El DOM que al ser clickeado seleccionará el Node especificado |
| `hover` | `(dom, nodeId) => HTMLElement` | El DOM que al hacer hover activará el hover del Node especificado |
| `drag` | `(dom, nodeId) => HTMLElement` | El DOM que al arrastrarse moverá el Node especificado |
| `create` | `(dom, userElement) => HTMLElement` | El DOM que al arrastrarse creará una nueva instancia del User Element en la ubicación de drop |

#### `actions`

| Acción | Firma | Descripción |
|--------|-------|-------------|
| `add` | `(nodes, parentId?, index?) => void` | Agrega un Node al padre especificado en el índice dado |
| `addNodeTree` | `(tree, parentId?) => void` | Agrega un NodeTree al padre especificado |
| `clearEvents` | `() => void` | Resetea el estado de eventos del editor |
| `delete` | `(nodeID) => void` | Elimina el Node especificado |
| `deserialize` | `(data) => void` | Recrea Nodes desde un SerializedNodes object/JSON |
| `move` | `(nodeId, targetParentId, index) => void` | Mueve un Node al padre especificado en el índice dado |
| `setProp` | `(nodeId, update) => void` | Manipula los props del Node dado |
| `setCustom` | `(nodeId, update) => void` | Manipula las custom values del Node dado |
| `setHidden` | `(nodeId, bool) => void` | Oculta/muestra el User Component del Node especificado |
| `setOptions` | `(options) => void` | Actualiza las opciones del editor |
| `selectNode` | `(nodeId \| null) => void` | Selecciona el Node especificado |
| `history.undo` | `() => void` | Deshace la última acción registrada |
| `history.redo` | `() => void` | Rehace la última acción deshecha |
| `history.ignore` | `() => ActionMethods` | Ejecuta una acción sin registrarla en el historial |
| `history.throttle` | `(rate?) => ActionMethods` | Ejecuta una acción con throttle en el historial |
| `history.merge` | `() => ActionMethods` | Ejecuta una acción y la fusiona con la última entrada del historial |

#### `query`

| Método | Firma | Descripción |
|--------|-------|-------------|
| `getSerializedNodes` | `() => SerializedNodes` | Retorna los Nodes actuales en forma simplificada |
| `serialize` | `() => String` | Retorna `getSerializedNodes()` en JSON |
| `getOptions` | `() => Object` | Obtiene las opciones especificadas en `<Editor />` |
| `getDropPlaceholder` | `(sourceId, targetId, pos, nodesToDOM?) => ...` | Determina la mejor ubicación posible para soltar el Node fuente |
| `node` | `(id) => NodeHelpers` | Retorna los métodos helper para el Node especificado |
| `parseReactElement(el).toNodeTree(normalize?)` | `NodeTree` | Parsea un React element a NodeTree |
| `parseSerializedNode(node).toNode(normalize?)` | `Node` | Parsea un Node serializado a su forma completa |
| `parseFreshNode(node).toNode(normalize?)` | `Node` | Parsea un nuevo Node en su forma completa |
| `history.canUndo` | `() => boolean` | Retorna true si se puede deshacer |
| `history.canRedo` | `() => boolean` | Retorna true si se puede rehacer |

#### Otros retornos

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `inContext` | `boolean` | False si el componente se renderiza fuera de `<Editor />` |
| `...collected` | `Collected` | Los valores recolectados retornados desde el collector |

### Ejemplos

#### Recolectar información de estado

```jsx
const Example = () => {
  const { hoveredNodeId } = useEditor((state) => ({
    hoveredNodeId: state.events.hovered
  }));

  return <div>Hovered node ID: {hoveredNodeId}</div>
}
```

#### Actualizar props

```jsx
const Example = () => {
  const { selectedNodeId, actions: {setProp} } = useEditor((state) => ({
    selectedNodeId: state.events.selected
  }));

  return (
    <a onClick={_ => {
      setProp(selectedNodeId, props => {
        props.text = "new value";
      });
    }}>Update</a>
  )
}
```

#### Crear nuevos Nodes

```jsx
const Example = () => {
  const { query, actions } = useEditor();

  return (
    <div>
      <a onClick={() => {
        const nodeTree = query.parseReactElement(<h2>Hi</h2>).toNodeTree();
        actions.addNodeTree(nodeTree);
      }}>
        Add Node from React Element
      </a>

      <a onClick={() => {
        const freshNode = { data: { type: 'h1' } };
        const node = query.parseFreshNode(freshNode).toNode();
        actions.add(node, 'ROOT');
      }}>
        Add Node from Node object
      </a>
    </div>
  )
}
```

#### Historial (Undo/Redo)

```jsx
const Example = () => {
  const { canUndo, canRedo, actions } = useEditor((state, query) => ({
    canUndo: query.history.canUndo(),
    canRedo: query.history.canRedo()
  }));

  return (
    <div>
      {canUndo && <button onClick={() => actions.history.undo()}>Undo</button>}
      {canRedo && <button onClick={() => actions.history.redo()}>Redo</button>}

      <button onClick={() => {
        // Esta acción NO se registrará en el historial
        actions.history.ignore().setProp("ROOT", props => props.darkMode = !props.darkMode);
      }}>Toggle (sin historial)</button>

      <input type="text" onChange={e => {
        // Throttle para agrupar cambios rápidos
        actions.history.throttle().setProp("ROOT", props => props.text = e.target.value);
      }} />
    </div>
  )
}
```

### API Legacy (Class Components)

```jsx
import { connectEditor } from "@craftjs/core";

class SidebarInner extends React.Component {
  render() {
    const { actions, query, enabled, currentSelectedNodeId } = this.props;
    return (
      <div>
        <input type="checkbox" value={enabled} onChange={
          e => actions.setOptions(options => options.enabled = !enabled)
        } />
        <button onClick={() => console.log(query.serialize())}>
          Serialize JSON to console
        </button>
      </div>
    )
  }
}

export const Sidebar = connectEditor((state) => ({
  currentSelectedNodeId: state.events.selected
}))(SidebarInner);
```

---

## `useNode()`

**Hook** — Proporciona métodos e información de estado relacionados con el Node correspondiente que gestiona el componente actual.

```jsx
const { connectors, setProp, ...collected } = useNode(collector);
```

> **Nota:** Este hook solo puede usarse dentro de un User Component.

### Parámetros

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `collector` | `(node: Node) => Collected` | Función que recolecta información del Node correspondiente. El componente se re-renderiza cuando los valores retornados cambian. |

### Retorna

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | `NodeId` | El id del Node correspondiente |
| `related` | `boolean` | Identifica si el componente se usa como related component |
| `inNodeContext` | `boolean` | Útil para diferenciar si el componente se usa como User Component o como React Component ordinario |
| `connectors.connect` | `(dom) => HTMLElement` | Especifica el DOM que representa al User Component |
| `connectors.drag` | `(dom) => HTMLElement` | Especifica el DOM que debe ser draggable |
| `actions.setProp` | `(props, throttleRate?) => void` | Manipula los props del componente actual |
| `actions.setCustom` | `(custom, throttleRate?) => void` | Manipula las custom properties del componente actual |
| `actions.setHidden` | `(bool) => void` | Oculta/muestra el componente actual |
| `...collected` | `Collected` | Los valores recolectados del collector |

### Ejemplos

#### Recolectar información de estado

```jsx
import cx from "classnames";
import {useNode} from "@craftjs/core";

const Example = () => {
  const { isHovered, amIBeingDragged } = useNode((node) => ({
    isHovered: node.events.hovered,
    amIBeingDragged: node.events.drag,
  }));

  return (
    <div className={cx({
      "hovering": isHovered,
      "dragged": amIBeingDragged
    })}>
      Yo
    </div>
  )
}
```

#### Connectors

```jsx
const Example = () => {
  const { connectors: {connect, drag} } = useNode();

  return (
    <div ref={ref => connect(drag(ref))}>
      <div>Hi world</div>
    </div>
  )
}
```

#### Drag handler en elemento hijo

```jsx
const Example = () => {
  const { connectors: {connect, drag} } = useNode();

  return (
    <div ref={connect}>
      <div>Hi world</div>
      <a ref={drag}>Drag me to move this component</a>
    </div>
  )
}
```

#### Uso dentro de componentes hijos

```jsx
const CustomDragHandler = () => {
  const {drag} = useNode();
  return <a ref={drag}>Drag me to move this component</a>
};

const Example = () => {
  const { connectors: {connect} } = useNode();
  return (
    <div ref={connect}>
      <div>Hi world</div>
      <CustomDragHandler />
    </div>
  )
}
```

#### Manipular estado

```jsx
const Example = ({enabled, text}) => {
  const { connectors: {connect, drag}, actions: {setProp} } = useNode();

  return (
    <div ref={connect}>
      <a ref={drag}>Drag me</a>
      <button onClick={() => {
        setProp(props => { props.enabled = !props.enabled; });
      }}>Toggle</button>
      <input type="text" value={text} onChange={e => {
        setProp(props => { props.text = e.target.value; }, 500);
      }} />
    </div>
  )
}
```

### API Legacy (Class Components)

```jsx
import {connectNode} from "@craftjs/core";

class ButtonInner extends React.Component {
  render() {
    const { connectors: {connect, drag}, isHovered, ...compProps } = this.props;
    const { text, color } = compProps;
    return (
      <button ref={ref => connect(drag(ref))} style={{backgroundColor: color}}>
        {text}
        {isHovered ? "I'm being hovered" : null}
      </button>
    );
  }
}

export const Button = connectNode((node) => ({
  isHovered: node.events.hovered
}))(ButtonInner);
```

---

## NodeHelpers

Métodos que ayudan a describir un Node especificado.

### Acceso

#### Via `useEditor`

```jsx
import {useEditor} from "@craftjs/core";

const TextComponent = () => {
  const { id } = useNode();
  const { query: {node} } = useEditor();
  const isRoot = node(id).isRoot();
  const isDraggable = node(id).isDraggable();
  // ...
}
```

#### Via reglas de User Component

```jsx
MyComp.craft = {
  rules: {
    canDrag: (node, helper) => {
      const ancestors = helper(node.id).ancestors();
      // ...
    },
    canMoveIn: (incoming, self, helper) => {
      const isRoot = helper(self.id).isRoot();
      // ...
    },
    canMoveOut: (outgoing, self, helper) => {
      const isDeletable = helper(self.id).isDeletable();
      // ...
    }
  }
}
```

### Métodos

| Método | Retorna | Descripción |
|--------|---------|-------------|
| `get()` | `Node` | Obtiene el objeto Node |
| `descendants(deep?, includeOnly?)` | `NodeId[]` | Retorna todos los Nodes hijos. Si `deep=true`, obtiene todos los descendientes en niveles anidados |
| `ancestors()` | `NodeId[]` | Retorna un array de ids de todos los ancestros |
| `linkedNodes()` | `NodeId[]` | Retorna un array de linked Node ids |
| `childNodes()` | `NodeId[]` | Retorna un array de child Node ids |
| `isRoot()` | `boolean` | Retorna `true` si el Node es el Root Node |
| `isCanvas()` | `boolean` | Verifica si el Node es un Canvas |
| `isLinkedNode()` | `boolean` | Verifica si el Node está vinculado al padre mediante un id arbitrario |
| `isDeletable()` | `boolean` | Un Node es deletable si NO es Root Node ni Top-level Node |
| `isTopLevelNode()` | `boolean` | True si es Root Node o un Linked Node definido dentro de un User Component |
| `isParentOfTopLevelNode()` | `boolean` | True si el User Component del Node define un `<Element />` en su render |
| `isDraggable(onError?)` | `boolean` | True si el Node es hijo directo de Canvas y su regla `canDrag` lo permite |
| `isDroppable(targetId, onError?)` | `boolean` | Verifica si el Node puede ser soltado en el Node target |
| `toSerializedNode()` | `SerializedNode` | Obtiene el Node en su forma SerializedNode |
| `toNodeTree(includeOnly?)` | `NodeTree` | Obtiene el Node y sus descendientes en forma NodeTree |

### Ejemplo: `isDroppable`

```jsx
const MyCanvas = () => {
  const { id } = useNode();
  const { canWeAcceptTheSelectedNode } = useEditor((state, query) => ({
    canWeAcceptTheSelectedNode: state.events.selected && query.node(id).isDroppable(state.events.selected)
  }));
}
```

### Ejemplo: `isDeletable`

```jsx
// En la aplicación:
// <div>              → false (Root Node)
//   <div>Yo</div>   → true
//   <h2>It's me</h2> → true
//   <Element canvas> → true
//     <h3>Child</h3> → true
//   </Element>
// </div>

// En un Container:
// <Element id="main"> → false (Top-level linked Node)
//   <h2>Hi</h2>       → true
// </Element>
```

---

*Documentación compilada de [craft.js.org](https://craft.js.org) — Copyright © 2025 Prev Wong*