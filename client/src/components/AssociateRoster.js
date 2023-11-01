import React from "react";
import AssociateCard from "./AssociateCard";
import { Card } from "semantic-ui-react";
import {useDispatch,useSelector} from 'react-redux'
import {deleteWorker} from '../features/workersSlice'

function AssociateRoster() {
  const dispatch = useDispatch();
  const workers = useSelector((state) => state.workers);
  const handleDelete = (workerId)=>{
    dispatch(deleteWorker(workerId))
  }
  const workersList = workers.map(worker=>{
        return <AssociateCard key={worker.id} worker={worker} handleDelete={handleDelete}/>
    })
  return (
    <Card.Group itemsPerRow={4}>
      {workersList}
    </Card.Group>
  );
}

export default AssociateRoster;