import React, { useState } from 'react';
import Modal from 'react-modal';
import { useSelector, useDispatch } from 'react-redux';
import { setAssociates } from '../features/schedulesSlice';
import './AssociatesTable.css';

const AssociatesTable = () => {
  const dispatch = useDispatch();
  const associates = useSelector((state) => state.schedules.associates);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [currentAssociate, setCurrentAssociate] = useState(null);

  // Example mapping. This should be adapted based on your actual day IDs and shift times.
  const dayMapping = {
    "Monday": { day_id: 1, shift_start: "09:00:00", shift_end: "17:00:00" },
    "Tuesday": { day_id: 2, shift_start: "09:00:00", shift_end: "17:00:00" },
    "Wednesday": { day_id: 3, shift_start: "09:00:00", shift_end: "17:00:00" },
    "Thursday": { day_id: 4, shift_start: "09:00:00", shift_end: "17:00:00" },
    "Friday": { day_id: 5, shift_start: "09:00:00", shift_end: "17:00:00" },
    "Saturday": { day_id: 6, shift_start: "09:00:00", shift_end: "17:00:00" },
    "Sunday": { day_id: 7, shift_start: "09:00:00", shift_end: "17:00:00" },
  };

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:5555/associates_working_days');
        const data = await response.json();
        dispatch(setAssociates(data));
      } catch (error) {
        console.error("Fetching data error:", error);
      }
    };

    fetchData();
  }, [dispatch]);

  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  const openModal = (associate) => {
    setCurrentAssociate(associate);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setCurrentAssociate(null);
  };

  const handleCheckboxChange = (day) => {
    if (currentAssociate.working_days.includes(day)) {
      setCurrentAssociate({
        ...currentAssociate,
        working_days: currentAssociate.working_days.filter(d => d !== day)
      });
    } else {
      setCurrentAssociate({
        ...currentAssociate,
        working_days: [...currentAssociate.working_days, day]
      });
    }
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    const scheduleUpdates = currentAssociate.working_days.map(day => ({
      day_id: dayMapping[day].day_id,
      shift_start: dayMapping[day].shift_start,
      shift_end: dayMapping[day].shift_end
    }));

    try {
      const response = await fetch(`http://localhost:5555/update_schedule/${currentAssociate.associate_id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scheduleUpdates)
      });

      if (response.ok) {
        closeModal();
      } else {
        const data = await response.json();
        console.error(data.error);
      }
    } catch (error) {
      console.error("Submitting form error:", error);
    }
  };

  return (
    <div className="associates-table-container">
      <table className="ui definition table">
        <thead>
          <tr>
            <th>Name</th>
            {daysOfWeek.map((day) => (
              <th key={day}>{day}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {associates.map((associate) => (
            <tr key={associate.associate_id}>
              <td onClick={() => openModal(associate)} style={{ cursor: 'pointer' }}>{associate.name}</td>
              {daysOfWeek.map((day) => (
                <td key={day}>
                  {associate.working_days.includes(day) ? '✓' : 'X'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {currentAssociate && (
        <Modal
         isOpen={modalIsOpen} 
         onRequestClose={closeModal}
         style={{
          overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.75)'
          },
          content: {
            position: 'absolute',
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
            border: '1px solid #ccc',
            background: '#fff',
            overflow: 'auto',
            WebkitOverflowScrolling: 'touch',
            borderRadius: '4px',
            outline: 'none',
            padding: '20px'
          }
        }}
         >
          <h2>Editing schedule for {currentAssociate.name}</h2>
          <form onSubmit={handleFormSubmit}>
            {daysOfWeek.map((day) => (
              <div key={day}>
                <label>
                  <input
                    type="checkbox"
                    checked={currentAssociate.working_days.includes(day)}
                    onChange={() => handleCheckboxChange(day)}
                  />
                  {day}
                </label>
              </div>
            ))}
            <button type="submit">Save</button>
            <button type="button" onClick={closeModal}>Close</button>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default AssociatesTable;
