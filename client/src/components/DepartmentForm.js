// ... other imports
import { useDispatch } from 'react-redux';
import { fetchAllocation } from '../features/allocationSlice';
import {useState} from 'react'
import './App.css'

const DepartmentForm = () => {
  const [departmentData, setDepartmentData] = useState({ departments: {}, total_heads: 0 });
  const dispatch = useDispatch();

  const handleDepartmentChange = (e, deptName) => {
    const value = e.target.value;
    const name = e.target.name;

    setDepartmentData(prevState => ({
      ...prevState,
      departments: {
        ...prevState.departments,
        [deptName]: {
          ...prevState.departments[deptName],
          [name]: name === 'total_cases' ? parseInt(value, 10) : parseFloat(value)
        }
      }
    }));
  };

  const handleHeadsChange = (e) => {
    setDepartmentData(prevState => ({
      ...prevState,
      total_heads: parseInt(e.target.value, 10)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // The structure the backend expects
    const payload = {
      departments: departmentData.departments, // this should be an object of objects
      total_heads: departmentData.total_heads, // this should be a number
    };
    dispatch(fetchAllocation(payload));
    
  };
  
  // Render form elements for each department dynamically
  // For simplicity, let's assume you have a static list of departments: DeptA, DeptB, DeptC
  return (
    <form onSubmit={handleSubmit} className="streamlit-form">
      {['DeptA', 'DeptB', 'DeptC'].map(deptName => (
        <div key={deptName}>
          <h2>{deptName}</h2>
          <div>
            <label>Total Cases for {deptName}:</label>
            <input
              type="number"
              name="total_cases"
              value={departmentData.departments[deptName]?.total_cases || ''}
              onChange={e => handleDepartmentChange(e, deptName)}
            />
          </div>
          <div>
            <label>Cases Per Hour for {deptName}:</label>
            <input
              type="number"
              name="cases_per_hour"
              value={departmentData.departments[deptName]?.cases_per_hour || ''}
              onChange={e => handleDepartmentChange(e, deptName)}
            />
          </div>
        </div>
      ))}
      <div>
        <label>Total Heads:</label>
        <input
          type="number"
          value={departmentData.total_heads}
          onChange={handleHeadsChange}
        />
      </div>
      <button type="submit" className="streamlit-button">Calculate Allocation</button>
    </form>
  );
};

export default DepartmentForm;
