import { useEditor, Element } from "@craftjs/core";
import React from "react";
import {
  Container,
  Text,
  Image,
  Hero,
  Cards,
  Gallery,
  Button,
  Spacer,
  Video,
  Form,
  Newsletter,
} from "../components";

interface ToolboxItem {
  name: string;
  icon: string;
  createComponent: () => React.ReactElement;
}

const toolboxItems: ToolboxItem[] = [
  { name: "Contenedor", icon: "pi pi-th-large", createComponent: () => <Element is={Container} canvas background="#ffffff" padding={20} /> },
  { name: "Texto", icon: "pi pi-font", createComponent: () => <Text text="Texto de ejemplo" tag="p" /> },
  { name: "Imagen", icon: "pi pi-image", createComponent: () => <Image src="https://placehold.co/600x400/e2e8f0/475569?text=Imagen" alt="Imagen" /> },
  { name: "Hero", icon: "pi pi-star", createComponent: () => <Hero title="Título Hero" /> },
  { name: "Tarjetas", icon: "pi pi-id-card", createComponent: () => <Cards columns={3} cards={[]} /> },
  { name: "Galería", icon: "pi pi-images", createComponent: () => <Gallery columns={3} images={[]} /> },
  { name: "Botón", icon: "pi pi-play", createComponent: () => <Button text="Click aquí" variant="primary" /> },
  { name: "Espaciador", icon: "pi pi-arrows-v", createComponent: () => <Spacer height={32} /> },
  { name: "Video", icon: "pi pi-video", createComponent: () => <Video url="" type="youtube" /> },
  { name: "Formulario", icon: "pi pi-envelope", createComponent: () => <Form fields={[]} submitText="Enviar" /> },
  { name: "Newsletter", icon: "pi pi-send", createComponent: () => <Newsletter title="Suscríbete" buttonText="Suscribirse" /> },
];

export const Toolbox = () => {
  const { connectors } = useEditor();

  return (
    <div className="w-64 bg-white shadow-lg">
      <div className="border-b border-gray-200 p-4">
        <h3 className="font-bold text-gray-800">Componentes</h3>
      </div>
      <div className="grid grid-cols-2 gap-2 p-4">
        {toolboxItems.map((item) => (
          <button
            key={item.name}
            ref={(ref) => {
              if (ref) {
                connectors.create(ref, item.createComponent() as React.ReactElement);
              }
            }}
            className="flex flex-col items-center gap-2 rounded-lg border border-gray-200 p-3 transition-colors hover:border-emerald-500 hover:bg-emerald-50"
          >
            <i className={`${item.icon} text-xl text-emerald-600`} />
            <span className="text-xs font-medium text-gray-700">{item.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
