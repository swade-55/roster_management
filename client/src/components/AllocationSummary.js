import React from 'react';
import DepartmentForm from './DepartmentForm';
import AllocationResults from './AllocationResults';
import './App.css'

function AllocationSummary() {
  return (
    <div className="App streamlit-form">
      <h1>Head Allocation Optimizer</h1>
      <DepartmentForm />
      <AllocationResults />
    </div>
  );
}

export default AllocationSummary;
