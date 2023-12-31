import React from 'react';
import { useSelector } from 'react-redux';

function Header() {
  const totalCapacity = useSelector(state => state.metrics.totalCapacity);
  const headCount = useSelector(state => state.metrics.headCount);
  const averageAttendance = useSelector(state => state.metrics.averageAttendance);
  const averageCPH = useSelector(state => state.metrics.averageCPH);
  const averageUptime = useSelector(state => state.metrics.averageUptime);

  // Function to round numbers to two decimal places
  const formatNumber = (num) => Math.round(num * 100) / 100;

  return (
    <div className="header-container">
      <h1 className="header-title">Your Company Metrics</h1>
      <table className="ui definition table">
        <thead>
          <tr>
            <th></th>
            <th>Metrics</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Total Capacity</td>
            <td>{formatNumber(totalCapacity)} Cases</td>
            <td>(average associate cases per hour * average uptime percentage) * 8 hour day</td>
          </tr>
          <tr>
            <td>Total Headcount</td>
            <td>{headCount} Workers</td>
            <td>Sums of total employees scheduled</td>
          </tr>
          <tr>
            <td>Average Attendance</td>
            <td>{formatNumber(averageAttendance)}% Attendance</td>
            <td>Average attendance of all employees</td>
          </tr>
          <tr>
            <td>Average Cases Per Hour</td>
            <td>{formatNumber(averageCPH)} Cases Per Hour</td>
            <td>Average cases per hour of all employees</td>
          </tr>
          <tr>
            <td>Average Uptime</td>
            <td>{formatNumber(averageUptime)}% Uptime</td>
            <td>Average uptime of all employees</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default Header;
