import React from 'react';
import { TaskCompletionForm } from '@/components/tasks/TaskCompletionForm';

interface RoomStatusFormProps {
  onSubmit: () => void;
  onObservationChange: (value: string) => void;
  onEmployeeChange: (value: string) => void;
  selectedEmployeeId: string;
  observation: string;
  employees: any[];
  placeholder: string;
  submitLabel: string;
  actionColor: string;
}

export const RoomStatusForm: React.FC<RoomStatusFormProps> = ({
  onSubmit,
  onObservationChange,
  onEmployeeChange,
  selectedEmployeeId,
  observation,
  employees,
  placeholder,
  submitLabel,
  actionColor,
}) => {
  return (
    <TaskCompletionForm
      onSubmit={onSubmit}
      onObservationChange={onObservationChange}
      onEmployeeChange={onEmployeeChange}
      selectedEmployeeId={selectedEmployeeId}
      observation={observation}
      employees={employees}
      placeholder={placeholder}
      submitLabel={submitLabel}
      actionColor={actionColor}
    />
  );
};