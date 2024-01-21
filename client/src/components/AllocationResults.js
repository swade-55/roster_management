import React from 'react';
import { useSelector } from 'react-redux';
import './App.css'

const AllocationResults = () => {
  const allocation = useSelector(state => state.allocation.allocationData);

  const roundToTwo = (num) => {
    return +(Math.round(num + "e+2") + "e-2");
  };

  return (
    <div className="streamlit-form">
      {allocation.status === 'Optimal' ? (
        <div className="allocation-results">
          <h2>Allocation Results:</h2>
          {Object.entries(allocation.allocation).map(([dept, heads]) => (
            <p key={dept}>
              {dept}: {roundToTwo(heads)} heads allocated, 
              completion in {roundToTwo(allocation.completion_times[dept])} hours
            </p>
          ))}
        </div>
      ) : (
        <div>No allocation data or allocation is suboptimal.</div>
      )}
    </div>
  );
};

export default AllocationResults;
