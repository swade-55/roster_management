import React from 'react';
import { useSelector } from 'react-redux';

const AllocationResults = () => {
  const allocation = useSelector(state => state.allocation.allocationData);

  const roundToTwo = (num) => {
    return +(Math.round(num + "e+2") + "e-2");
  };

  return (
    <div>
      {allocation.status === 'Optimal' ? (
        <div className="bg-success text-base-100 p-4 rounded">
          <h2>Allocation Results:</h2>
          {Object.entries(allocation.allocation).map(([dept, heads]) => (
            <p key={dept}>
              {dept}: {heads} heads allocated, 
              completion in {allocation.completion_times[dept]} hours
            </p>
          ))}
        </div>
      ) : (
        <div className="bg-error text-base-100 p-4 rounded">No allocation data or allocation is suboptimal.</div>
      )}
    </div>
  );
};

export default AllocationResults;
