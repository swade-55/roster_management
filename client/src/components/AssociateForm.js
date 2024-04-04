import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage} from 'formik';
import { useDispatch } from 'react-redux';
import { addWorker} from '../features/workersSlice';
import * as Yup from 'yup';
import { useSelector } from 'react-redux';



function AssociateForm() {

  const dispatch = useDispatch();
  const [selectedJobClass, setSelectedJobClass] = useState('')
  const validationSchema = Yup.object({
    firstName: Yup.string().required('First name is required'),
    lastName: Yup.string().required('Last name is required'),
    jobClass_id: Yup.number().required('Job class is required'), 
    uptime: Yup.string().required('Uptime is required'),
    casesPerHour: Yup.string()
      .when('jobClass_id', {
        is: 2,
        then: (schema) => schema.required('Cases per hour is required'),
      }),
    palletsPerHour: Yup.string().when('JobClass_id', {
      is: 1 || 3 || 4 || 5,
      then: (schema) => schema.required('Pallets per hour is required'),
    }),
    attendance: Yup.string().required('Attendance is required'),
    department: Yup.string().required('Department is required'),
    hireDate: Yup.date().required('Hire date is required'),
  });



  const workers = useSelector(state => state.workers.workers);
  const uniqueDepartments = [...new Set(workers.filter(worker => worker.department).map(worker => worker.department.name))];
  const uniqueJobClasses = workers
  .map(worker => worker.jobclass) 
  .filter(jobclass => jobclass !== null && jobclass !== undefined) 
  .reduce((acc, jobclass) => {
    // Check if the jobclass id is already in the accumulator
    const exists = acc.some(item => item.id === jobclass.id);
    if (!exists) {
      // If it does not exist, add the jobclass to the accumulator
      acc.push(jobclass);
    }
    return acc;
  }, []); // Initialize the accumulator as an empty array
  console.log('uniqueJobClasses',uniqueJobClasses)
  

  // Initial values for the form
  const initialValues = {
    firstName: '',
    lastName: '',
    jobClass_id: '', 
    uptime: '', 
    casesPerHour: '',
    palletsPerHour: '',
    attendance: '',
    department: '',
    hireDate: '',
  };


  // onSubmit function with Redux dispatch
  const onSubmit = (values, { setSubmitting, resetForm }) => {
    console.log('Submitting Form with Values:', values); // Debug log

    // Prepare the metrics object
    let metrics = [];
    const metricNames = {
      uptime: 'Uptime',
      casesPerHour: 'CasesPerHour',
      palletsPerHour: 'PalletsPerHour',
      attendance: 'Attendance'
    };

    Object.keys(metricNames).forEach(key => {
      if (values[key]) {
        metrics.push({
          name: metricNames[key],
          value: values[key]
        });
      }
    });

    // Create the payload to send to the server
    const payload = {
      firstName: values.firstName,
      lastName: values.lastName,
      jobClass_id: parseInt(values.jobClass_id, 10), 
      metrics: metrics,
      department: values.department,
      hireDate: values.hireDate,
    };

    console.log('Attempting to submit form with values:', payload);


    dispatch(addWorker(payload))
  };


  return (
    <div className="p-4 bg-base-100">
      <h3 className="text-lg font-semibold">Add an Associate!</h3>
      <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={onSubmit}>
        {({ isSubmitting, setFieldValue }) => (
          <Form className="form-control w-full max-w-xs">
            <label className="label" htmlFor="jobClass_id">
            <span className="label-text">Job Class</span>
            </label>
            <Field as="select" name="jobClass_id" className="select select-bordered w-full max-w-xs" onChange={e => {
              const value = e.target.value;
              setFieldValue("jobClass_id", value);
              setSelectedJobClass(value);
            }}>
              <option value="">Select a Job Class</option>
              {uniqueJobClasses.map(jobClass => (
                <option key={jobClass.id} value={jobClass.id}>{jobClass.name}</option>
              ))}
            </Field>
            <ErrorMessage name="jobClass_id" component="div" className="text-error" />

            {/* Always visible fields */}
            <Field name="firstName" placeholder="First Name" className="select select-bordered w-full max-w-xs"/>
            <ErrorMessage name="firstName" component="div" className="text-error" />

            <Field name="lastName" placeholder="Last Name" className="select select-bordered w-full max-w-xs"/>
            <ErrorMessage name="lastName" component="div" className="text-error" />

            {/* Conditional Fields based on jobClass_id */}
            {selectedJobClass && (
              <>
                <Field name="uptime" placeholder="Uptime" className="select select-bordered w-full max-w-xs"/>
                <ErrorMessage name="uptime" component="div" className="text-error" />

                <Field name="attendance" placeholder="Attendance" className="select select-bordered w-full max-w-xs"/>
                <ErrorMessage name="attendance" component="div" className="text-error" />

                {selectedJobClass === '2' && (
                  <>
                    <Field name="casesPerHour" placeholder="Cases Per Hour" className="select select-bordered w-full max-w-xs"/>
                    <ErrorMessage name="casesPerHour" component="div" className="text-error" />
                  </>
                )}

                {['1', '3', '4', '5'].includes(selectedJobClass) && (
                  <>
                    <Field name="palletsPerHour" placeholder="Pallets Per Hour" className="select select-bordered w-full max-w-xs"/>
                    <ErrorMessage name="palletsPerHour" component="div" className="text-error" />
                  </>
                )}

                <Field as="select" name="department" className="select select-bordered w-full max-w-xs">
                  <option value="">Select a Department</option>
                  {uniqueDepartments.map((department, index) => (
                    <option key={index} value={department}>{department}</option>
                  ))}
                </Field>
                <ErrorMessage name="department" component="div" className="text-error" />

                <Field name="hireDate" type="date" className="select select-bordered w-full max-w-xs" />
                <ErrorMessage name="hireDate" component="div" className="text-error" />
              </>
            )}

            <button className="btn btn-primary mt-4" type="submit" disabled={isSubmitting}>Submit</button>
          </Form>
        )}
      </Formik>
    </div>
  );
}

export default AssociateForm;
