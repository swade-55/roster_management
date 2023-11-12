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


  const selectors = workers.filter(selector=>selector.job_class==='Selector')
  const selectorList = selectors.map(selector=>{
        return <AssociateCard key={selector.id} worker={selector} handleDelete={handleDelete}/>
    })
  const letForks = workers.filter(forklift=>forklift.job_class==='Putaway Forklift')
  const letForkCards = letForks.map(forklift=>{
    return <AssociateCard key = {forklift.id} worker={forklift} handleDelete={handleDelete}/>
  })
  const putForks = workers.filter(forklift=>forklift.job_class==='Letdown Forklift')
  const putForkCards = putForks.map(forklift=>{
    return <AssociateCard key={forklift.id} worker={forklift} handleDelete={handleDelete}/>
  })
  const loaders = workers.filter(loader=>loader.job_class==='Loader')
  const loaderCards = loaders.map(loader=>{
    return <AssociateCard key={loader.id} worker={loader} handleDelete={handleDelete}/>
  })
  const receivers = workers.filter(worker=>worker.job_class==='Receiver')
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