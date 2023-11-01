import React from 'react'
import {Card} from 'semantic-ui-react'
import {useDispatch} from 'react-redux'
import {deleteWorker} from '../features/workersSlice'

function AssociateCard({worker}) {
  const dispatch = useDispatch();

  function handleWorkerDelete(){
    fetch(`http://localhost:5555/selectors_metrics/${worker.id}`,{
      method:'DELETE'
    })
    .then(r=>r.json())
    .then(data=>{
      dispatch(deleteWorker(worker.id));
    })
  }

    return (
      <Card>
      <div>
        <div className="image">
          <img className="worker-avatar" src={worker.image}alt="" />
        </div>
        <div className="content">
          <div className="header">{worker.name}</div>
        </div>
        <div className="extra content">
          <span>
            <ul/>
            Uptime {worker.uptime}
            <ul/>
            Cases Per Hour {worker.casesPerHour}
            <ul/>
            Attendance {worker.attendance}
            <ul/>
            <button onClick={handleWorkerDelete}>🗑</button>
          </span>
          
        </div>
      </div>
    </Card>
    );
  }

  export default AssociateCard