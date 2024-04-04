import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateAssociateSchedule } from '../features/workersSlice';

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const AssociatesTable = () => {
  const [showModal, setShowModal] = useState(false);
  const [editingWorker, setEditingWorker] = useState(null);
  const dispatch = useDispatch();
  const workers = useSelector((state) => state.workers.workers);

  const handleClick = (worker) => {
    setEditingWorker(worker);
    setShowModal(true);
  };

  const saveSchedule = (workerId, selectedDays) => {
    dispatch(updateAssociateSchedule({ workerId, schedules: selectedDays }));
    setShowModal(false); 
  };

  

  return (
    <div>
      <div className="overflow-x-auto">
      <table className="table w-full">
        <thead>
          <tr>
            <th>Name</th>
            <th>Department</th>
            {daysOfWeek.map(day => (
              <th key={day}>{day}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {workers.map(worker => (
            <tr key={worker.id} onClick={() => handleClick(worker)}>
              <td>{worker.first_name} {worker.last_name}</td>
              <td>{worker.department ? worker.department.name : 'No Department'}</td>
              {daysOfWeek.map(day => (
                <td key={day}>
                  {worker.schedules.includes(day) ? '✓' : 'X'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      </div>
      {showModal && (
        <ScheduleModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSave={saveSchedule}
          initialDays={editingWorker?.schedules || []}
          workerId={editingWorker?.id}
        />
      )}
    </div>
  );
};

const ScheduleModal = ({ isOpen, onClose, onSave, initialDays = [], workerId }) => {
  const [selectedDays, setSelectedDays] = useState(initialDays);

  const handleDayChange = (day) => {
    setSelectedDays(currentDays =>
      currentDays.includes(day)
        ? currentDays.filter(d => d !== day)
        : [...currentDays, day]
    );
  };

  const handleSave = () => {
    onSave(workerId, selectedDays);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h2 className="font-bold text-lg">Edit Schedule</h2>
        <form>
          {daysOfWeek.map(day => (
            <div key={day} className="form-control">
              <label className="label cursor-pointer">
                <span className="label-text">{day}</span>
                <input
                  type="checkbox"
                  className="checkbox checkbox-primary"
                  checked={selectedDays.includes(day)}
                  onChange={() => handleDayChange(day)}
                />
              </label>
            </div>
          ))}
        </form>
        <div className="modal-action">
          <button className="btn btn-primary" onClick={handleSave}>Save</button>
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default AssociatesTable;
