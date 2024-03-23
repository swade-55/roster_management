// App.js
import React, { useEffect } from 'react';
import { useDispatch} from 'react-redux';
import MasterOperatingPlan from './MasterOperatingPlan';
import NavBar from './NavBar';
import { Route, Switch } from 'react-router-dom';
import About from './About';
import ExecutiveSummary from './ExecutiveSummary';
import AssociateForm from './AssociateForm';
import AllocationSummary from './AllocationSummary'
import ScheduleForm from './ScheduleForm';
import AssociatesTable from './AssociatesTable';
// import { fetchMetrics } from '../features/metricsSlice';
import { fetchWorkers } from '../features/workersSlice';

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    // dispatch(fetchMetrics());
    dispatch(fetchWorkers());
  }, [dispatch]);

  // Styles to add padding to the main content so it doesn't overlap with the sidebar
  const mainContentStyle = {
    marginLeft: '200px', // Should be the same as the width of the sidebar
    padding: '1rem',
  };

  return (
    <div className="app-container">
      <NavBar />
      <div className="main-content" style={mainContentStyle}>
        <Switch>
          <Route exact path="/executivesummary" component={ExecutiveSummary}/>
          <Route exact path="/about" component={About} />
          <Route exact path="/employeeform" component={AssociateForm} />
          <Route exact path="/" component={MasterOperatingPlan} />
          <Route exact path="/associatetable" component={AssociatesTable} />
          <Route exact path="/schedulebuilder" component={ScheduleForm} />
          <Route exact path="/allocationsummary" component={AllocationSummary} />
        </Switch>
      </div>
    </div>
  );
}

export default App;
