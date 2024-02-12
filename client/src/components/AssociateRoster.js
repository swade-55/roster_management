import React from "react";
import AssociateCard from "./AssociateCard";
import { Card } from "semantic-ui-react";
import {useDispatch,useSelector} from 'react-redux'
import {deleteWorker} from '../features/workersSlice'
import Header from './Header';

function AssociateRoster() {
  const dispatch = useDispatch();
  const workers = useSelector((state) => state.workers);
  const handleDelete = (workerId)=>{
    dispatch(deleteWorker(workerId))
  }

  const stickyHeaderStyle = {
    position: 'sticky',
    top: '0', // This determines how far from the top the item will "stick"
    backgroundColor: 'white', // Background color to cover the content behind it
    zIndex: '10', // Ensure the header is above other content
    boxShadow: '0 2px 2px -1px rgba(0,0,0,0.4)', // Optional: adds a shadow to the header
    padding: '10px', // Optional: for better spacing
  };


  const selectors = workers.filter(selector=>selector.job_class==='Selector')
  const selectorList = selectors.map(selector=>{
        return <AssociateCard key={selector.id} worker={selector} handleDelete={handleDelete}/>
    })
  const putForks = workers.filter(forklift=>forklift.job_class==='Putaway Forklift')
  const putForkCards = putForks.map(forklift=>{
    return <AssociateCard key = {forklift.id} worker={forklift} handleDelete={handleDelete}/>
  })
  const letForks = workers.filter(forklift=>forklift.job_class==='Letdown Forklift')
  const letForkCards = letForks.map(forklift=>{
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
    <h2 style={stickyHeaderStyle}>Selectors</h2>
    <Header/>
    <Card.Group itemsPerRow={4}>
      {selectorList}
    </Card.Group>
     <h2 style={stickyHeaderStyle}>Letdown Forklifts</h2>
    <Card.Group itemsPerRow={4}>
      {letForkCards}
    </Card.Group>
    <h2 style={stickyHeaderStyle}>Putaway Forklifts</h2>
    <Card.Group itemsPerRow={4}>
      {putForkCards}
    </Card.Group>
    <h2 style={stickyHeaderStyle}>Loaders</h2>
    <Card.Group itemsPerRow={4}>
      {loaderCards}
    </Card.Group>
    <h2 style={stickyHeaderStyle}>Receivers</h2>
    <Card.Group itemsPerRow={4}>
      {receiverCards}
    </Card.Group>
    
    </div>
  );
}

export default AssociateRoster;
