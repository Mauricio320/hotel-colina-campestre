import React from "react";
import { useParams } from "react-router-dom";

const CleaningTaskPage: React.FC = () => {
  const { stayId } = useParams<{ stayId: string }>();

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">Limpieza</h1>
      <p className="text-gray-600">Stay ID: {stayId}</p>
    </div>
  );
};

export default CleaningTaskPage;
