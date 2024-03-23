import React from 'react';
import { useSelector } from 'react-redux';

function ExecutiveSummary() {
  const workers = useSelector(state => state.workers.workers);

  // Group workers by department and then by job class, including jobClassId
  const workersByDepartmentAndJobClass = workers.reduce((acc, worker) => {
    const deptName = worker.department.name;
    const jobClassKey = `${worker.jobclass.name}-${worker.jobclass.id}`; // Unique key for job class including ID

    if (!acc[deptName]) {
      acc[deptName] = {};
    }
    if (!acc[deptName][jobClassKey]) {
      acc[deptName][jobClassKey] = {
        workers: [],
        jobClassId: worker.jobclass.id, // Store jobClassId for later reference
        jobClassName: worker.jobclass.name // Store jobClassName for display
      };
    }

    acc[deptName][jobClassKey].workers.push(worker);
    return acc;
  }, {});

  // Calculate average uptime, attendance, and specific metric based on job class ID
  const calculateAverages = (workers, jobClassId) => {
    if (workers.length === 0) return { averageUptime: 0, averageAttendance: 0, specificMetric: 0 };

    const totals = workers.reduce((totals, worker) => {
      totals.uptime += worker.metrics.Uptime || 0;
      totals.attendance += worker.metrics.Attendance || 0;
      // Use jobClassId to determine which metric to use
      totals.specificMetric += (jobClassId === 2 || jobClassId === 4)? worker.metrics.CasesPerHour || 0 : worker.metrics.PalletsPerHour || 0;
      return totals;
    }, { uptime: 0, attendance: 0, specificMetric: 0 });

    return {
      averageUptime: totals.uptime / workers.length,
      averageAttendance: totals.attendance / workers.length,
      specificMetric: totals.specificMetric / workers.length
    };
  };

  const getAveragesByDepartmentAndJobClass = () => {
    return Object.entries(workersByDepartmentAndJobClass).map(([department, jobClasses]) => ({
      department,
      jobClasses: Object.entries(jobClasses).map(([jobClassKey, { workers, jobClassId, jobClassName }]) => {
        const { averageUptime, averageAttendance, specificMetric } = calculateAverages(workers, jobClassId);
        return {
          jobClassName,
          jobClassId,
          averageUptime,
          averageAttendance,
          specificMetric
        };
      })
    }));
  };

  const averagesData = getAveragesByDepartmentAndJobClass();

  // Function to round numbers to two decimal places
  const formatNumber = (num) => Math.round(num * 100) / 100;

  return (
    <div className="header-container">
      <h1>Capacity Planner</h1>

      <h2>Averages by Department and Job Class</h2>
      {averagesData.map(({ department, jobClasses }) => (
        <div key={department}>
          <h3>{department}</h3>
          <table className="ui celled table">
            <thead>
              <tr>
                <th>Job Class</th>
                <th>Average Uptime (%)</th>
                <th>Average Attendance (%)</th>
                <th>Specific Metric (CPH/PPH)</th>
              </tr>
            </thead>
            <tbody>
              {jobClasses.map(({ jobClassName, averageUptime, averageAttendance, specificMetric, jobClassId }) => ( // Ensure jobClassId is included here
                <tr key={jobClassName}>
                  <td>{jobClassName}</td>
                  <td>{formatNumber(averageUptime)}%</td>
                  <td>{formatNumber(averageAttendance)}%</td>
                  <td>{formatNumber(specificMetric)} {(jobClassId === 2 || jobClassId === 4)? "CPH" : "PPH"}</td> {/* Now correctly references jobClassId */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}

export default ExecutiveSummary;
