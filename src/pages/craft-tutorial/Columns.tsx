import { useNode, useEditor, Element } from "@craftjs/core";
import { Container } from "./Container";
interface ColumnsProps {
  columns: "2" | "3" | "4" | "3/7";
}

export const Columns = ({ columns }: ColumnsProps) => {
  const config = {
    "2": [50, 50],
    "3": [33, 33, 33],
    "4": [25, 25, 25, 25],
    "3/7": [30, 70],
  };

  const columnsConfig = config[columns] ?? [];

  return (
    <Element
      id="col-8956454"
      is={Container}
      padding={20}
      canvas
      flexDirection="row"
      classChildren="p-4 bg-red-500 relative"
      gap={5}
    >
      {columnsConfig.map((width, index) => (
        <Element
          id={`col-${index * 15}`}
          is={Container}
          padding={20}
          styleContent={{ width: `${width}%` }}
          canvas
          classChildren="bg-gray-500"
          flexDirection="column"
        />
      ))}
    </Element>
  );
};
