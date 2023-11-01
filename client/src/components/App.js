// App.js
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import MasterOperatingPlan from './MasterOperatingPlan';
import NavBar from './NavBar';
import { Route, Switch } from 'react-router-dom';
import About from './About';
import AssociateForm from './AssociateForm';
import AssociatesTable from './AssociatesTable';
import { addWorker,setWorkers } from '../features/workersSlice';

function App() {
  const dispatch = useDispatch();
  const workers = useSelector((state) => state.workers);

  useEffect(() => {
    console.log('in use effect');
    fetch(`http://localhost:5555/selectors_metrics`)
      .then((r) => r.json())
      .then((data) => dispatch(setWorkers(data)));
  }, [dispatch]);

  function handleAddWorkers(newWorker) {
    // Dispatch the addWorker action
    dispatch(addWorker(newWorker));
  }

  return (
    <div className="app-container">
      <NavBar />
      <div className="main-content">
        <Switch>
          <Route exact path="/about">
            <About />
          </Route>
          <Route exact path="/employeeform">
            <AssociateForm onAddWorker={handleAddWorkers} />
          </Route>
          <Route exact path="/">
            <MasterOperatingPlan workers={workers} />
          </Route>
          <Route exact path="/associatetable">
            <AssociatesTable />
          </Route>
        </Switch>
      </div>
    </div>
  );
}

export default App;
