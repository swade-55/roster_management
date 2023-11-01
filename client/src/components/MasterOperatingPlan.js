// MasterOperatingPlan.js
import React, { useEffect} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setWorkers} from '../features/workersSlice';
import { updateMetrics } from '../features/metricsSlice';
import AssociateRoster from './AssociateRoster';
import Search from './Search';
import Header from './Header';
import { Container } from 'semantic-ui-react';

function MasterOperatingPlan() {
  const dispatch = useDispatch();
  const workers = useSelector((state) => state.workers);
  // const [searchTerm, setSearchTerm] = useState('');
//http://localhost:3001/workers
//http://localhost:5555/selectors_metrics
  useEffect(() => {
    fetch('http://localhost:5555/selectors_metrics') // Adjust the path accordingly
      .then((response) => response.json())
      .then((data) => {
        dispatch(setWorkers(data));
        dispatch(updateMetrics(data)); // Dispatch the action to update metrics
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  }, [dispatch]);

    return (
        <Container>
          <br/>
          <Search/>
          <Header/>
          <h1>Capacity Planner</h1>
          <br />
          <AssociateRoster/>
        </Container>
      );
}

export default MasterOperatingPlan;