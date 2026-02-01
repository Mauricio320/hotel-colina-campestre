import React from 'react';
import { Button } from 'primereact/button';
import { Room } from '@/types';

interface PageHeaderProps {
  title: string;
  selectedRoom?: Room | null;
  onBack: () => void;
  tabParam?: string | null;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  selectedRoom,
  onBack,
  tabParam
}) => {
  const handleBackClick = () => {
    onBack();
  };

  return (
    <div className="flex items-center gap-4 mb-8">
      <Button
        icon="pi pi-arrow-left"
        onClick={handleBackClick}
        className="p-button-text p-button-plain p-button-rounded text-gray-400"
      />
      <div>
        <h1 className="text-3xl font-black text-gray-800 tracking-tight">
          {title}
        </h1>
        <p className="text-gray-500 font-medium">
          {selectedRoom?.room_number ? (
            <>
              Habitación {selectedRoom.room_number} -{" "}
              {selectedRoom.observation || "Sin observación"}
            </>
          ) : (
            "Sin habitación seleccionada"
          )}
        </p>
      </div>
    </div>
  );
};

export default PageHeader;