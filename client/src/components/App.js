import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { BrowserRouter as Router, Route, Switch, Link } from 'react-router-dom';
import MasterOperatingPlan from './MasterOperatingPlan';
import About from './About';
import ExecutiveSummary from './ExecutiveSummary';
import AssociateForm from './AssociateForm';
import AllocationSummary from './AllocationSummary';
import ScheduleForm from './ScheduleForm';
import AssociatesTable from './AssociatesTable';
import { fetchWorkers } from '../features/workersSlice';
import '../index.css';

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchWorkers());
  }, [dispatch]);

  return (
    <Router>
      <div className="flex flex-col h-screen">
        {/* Navigation buttons styled similar to App1 */}
        <header className="navbar bg-base-100">
          <div className="flex-grow">
            <div className="flex items-center w-full px-4">
              <Link to="/" className="btn btn-primary btn-base">Roster</Link>
              <Link to="/about" className="btn btn-secondary btn-base">About</Link>
              <Link to="/employeeform" className="btn btn-accent btn-base">Add New Associate</Link>
              <Link to="/executivesummary" className="btn btn-accent btn-base">Executive Summary</Link>
              <Link to="/associatetable" className="btn btn-accent btn-base">Associate Schedules</Link>
              <Link to="/schedulebuilder" className="btn btn-accent btn-base">Schedule Builder</Link>
              <Link to="/allocationsummary" className="btn btn-accent btn-base">Allocation Summary</Link>

              {/* Add other navigation links here as needed */}
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-grow">
          <Switch>
            <Route exact path="/" component={MasterOperatingPlan} />
            <Route path="/about" component={About} />
            <Route path="/executivesummary" component={ExecutiveSummary} />
            <Route path="/employeeform" component={AssociateForm} />
            <Route path="/associatetable" component={AssociatesTable} />
            <Route path="/schedulebuilder" component={ScheduleForm} />
            <Route path="/allocationsummary" component={AllocationSummary} />
            {/* Add other routes here as needed */}
          </Switch>
        </main>

        {/* Footer */}
        <footer className="footer bg-base-300 text-base-content p-4">
          <div className="items-center grid-flow-col">
            <p>© 2023 Your Company Name</p>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
