import React from "react";
import AssociateCard from "./AssociateCard";
import { useDispatch, useSelector } from 'react-redux';
import { deleteWorker } from '../features/workersSlice';

function AssociateRoster() {
  const dispatch = useDispatch();
  const workers = useSelector((state) => state.workers.workers);
  const handleDelete = (workerId) => {
    dispatch(deleteWorker(workerId));
  };

  const workersByJobClass = workers.reduce((acc, worker) => {
    const jobClassKey = worker.jobclass.id; 
    if (!acc[jobClassKey]) {
      acc[jobClassKey] = {
        workers: [],
        jobClassName: worker.jobclass.name 
      };
    }
    acc[jobClassKey].workers.push(worker);
    return acc;
  }, {});

  console.log(workersByJobClass)

  return (
    <div>
      {Object.entries(workersByJobClass).map(([jobClassKey, { workers, jobClassName }]) => (
        <div key={jobClassKey}>
          <h2 className="text-3xl font-bold mb-5">{jobClassName}</h2>
          <div className="grid grid-cols-4 gap-4">
            {workers.map(worker => (
              <AssociateCard key={worker.id} worker={worker} handleDelete={() => handleDelete(worker.id)} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default AssociateRoster;
