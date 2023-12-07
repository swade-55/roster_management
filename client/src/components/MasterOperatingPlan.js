// MasterOperatingPlan.js
import React from 'react';
import AssociateRoster from './AssociateRoster';
import Header from './Header';
import { Container } from 'semantic-ui-react';

function MasterOperatingPlan() {

    return (
        <Container>
          <br/>
          <Header/>
          <h1>Capacity Planner</h1>
          <br />
          <AssociateRoster/>
        </Container>
      );
}

export default MasterOperatingPlan;