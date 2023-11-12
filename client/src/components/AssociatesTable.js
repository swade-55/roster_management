import React, {useState} from 'react';
import Modal from 'react-modal';
import { useSelector, useDispatch } from 'react-redux';
import { setAssociates } from '../features/schedulesSlice';
import './AssociatesTable.css'; // Optional, if you want to add styles

const AssociatesTable = () => {
  const dispatch = useDispatch();
  const associates = useSelector((state) => state.schedules.associates);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [currentAssociate, setCurrentAssociate] = useState(null);

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
    try {
      const response = await fetch(`http://localhost:5555/update_schedule/${currentAssociate.associate_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ working_days: currentAssociate.working_days })
      });
  
      if (response.ok) {
        // Update the Redux store and close the modal here
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
              <td onClick={()=> openModal(associate)} style={{cursor: 'pointer'}}>{associate.name}</td>
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
      <Modal isOpen={modalIsOpen} onRequestClose={closeModal}>
        <h2>Editing schedule for {currentAssociate.name}</h2>
          <form onSubmit={handleFormSubmit}>
            {daysOfWeek.map((day) => (
              <div key={day}>
                <label>
                  <input
                    type="checkbox"
                    checked={currentAssociate.working_days.includes(day)}
                    onChange={() => handleCheckboxChange(day)} // Connect the checkbox to the handler
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
