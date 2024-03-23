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




  const selectors = workers.workers.filter(selector=>selector.jobclass_id===2)
  const selectorList = selectors.map(selector=>{
         return <AssociateCard key = {selector.id} worker={selector} handleDelete={handleDelete}/>
     })
  const putForks = workers.workers.filter(forklift=>forklift.jobclass_id===1)
  const putForkCards = putForks.map(forklift=>{
     return <AssociateCard key = {forklift.id} worker={forklift} handleDelete={handleDelete}/>
   })
   const letForks = workers.workers.filter(forklift=>forklift.jobclass_id===5)
   const letForkCards = letForks.map(forklift=>{
     return <AssociateCard key={forklift.id} worker={forklift} handleDelete={handleDelete}/>
   })
   const loaders = workers.workers.filter(loader=>loader.jobclass_id===3)
   const loaderCards = loaders.map(loader=>{
     return <AssociateCard key={loader.id} worker={loader} handleDelete={handleDelete}/>
   })
   const receivers = workers.workers.filter(worker=>worker.jobclass_id===4)
   const receiverCards = receivers.map(receiver=>{
     return <AssociateCard key={receiver.id} worker={receiver} handleDelete={handleDelete}/>
   })



  return (
    <div>
    <h2>Selectors</h2>
    <Card.Group itemsPerRow={4}>
      {selectorList}
    </Card.Group>
     <h2>Letdown Forklifts</h2>
    <Card.Group itemsPerRow={4}>
      {letForkCards}
    </Card.Group>
    <h2>Putaway Forklifts</h2>
    <Card.Group itemsPerRow={4}>
      {putForkCards}
    </Card.Group>
    <h2>Loaders</h2>
    <Card.Group itemsPerRow={4}>
      {loaderCards}
    </Card.Group>
    <h2>Receivers</h2>
    <Card.Group itemsPerRow={4}>
      {receiverCards}
    </Card.Group>
    
    </div>
  );
}

export default AssociateRoster;
