// MasterOperatingPlan.js
import React, { useEffect} from 'react';
import { useDispatch } from 'react-redux';
import { setWorkers} from '../features/workersSlice';
import { updateMetrics } from '../features/metricsSlice';
import AssociateRoster from './AssociateRoster';
import Search from './Search';
import Header from './Header';
import { Container } from 'semantic-ui-react';

function MasterOperatingPlan() {

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