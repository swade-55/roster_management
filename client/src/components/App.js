// App.js
import React, { useEffect } from 'react';
import { useDispatch} from 'react-redux';
import MasterOperatingPlan from './MasterOperatingPlan';
import NavBar from './NavBar';
import { Route, Switch } from 'react-router-dom';
import About from './About';
import AssociateForm from './AssociateForm';
import AllocationSummary from './AllocationSummary'
import ScheduleForm from './ScheduleForm';
import AssociatesTable from './AssociatesTable';
import { fetchMetrics } from '../features/metricsSlice';
import { fetchWorkers } from '../features/workersSlice';

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    console.log('in use effect');
    dispatch(fetchMetrics());
    dispatch(fetchWorkers());
  }, [dispatch]);

  return (
    <div className="app-container">
      <NavBar />
      <div className="main-content">
        <Switch>
          <Route exact path="/about">
            <About />
          </Route>
          <Route exact path="/employeeform">
            <AssociateForm />
          </Route>
          <Route exact path="/">
            <MasterOperatingPlan/>
          </Route>
          <Route exact path="/associatetable">
            <AssociatesTable />
          </Route>
          <Route exact path="/schedulebuilder">
            <ScheduleForm />
          </Route>
          <Route exact path="/allocationsummary">
            <AllocationSummary />
          </Route>
        </Switch>
      </div>
    </div>
  );
}

export default App;
