// components/AssociatesTable.js
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchAssociates } from '../features/associatesSlice';

const AssociatesTable = () => {
  const dispatch = useDispatch();
  const associates = useSelector((state) => state.associates.entities);
  const loading = useSelector((state) => state.associates.loading);

  useEffect(() => {
    dispatch(fetchAssociates());
  }, [dispatch]);

  // Group associates by jobClass
  const groupedAssociates = associates.reduce((acc, associate) => {
    (acc[associate.jobClass] = acc[associate.jobClass] || []).push(associate);
    return acc;
  }, {});

  if (loading === 'loading') return <div>Loading...</div>;

  return (
    <div>
      {Object.keys(groupedAssociates).map((jobClass) => (
        <div key={jobClass}>
          <h3>{jobClass}</h3>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                {/* Add other headers here */}
              </tr>
            </thead>
            <tbody>
              {groupedAssociates[jobClass].map((associate) => (
                <tr key={associate.id}>
                  <td>{associate.name}</td>
                  {/* Add other associate details here */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};

export default AssociatesTable;
