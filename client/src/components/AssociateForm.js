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


  const handleJobClassChange = (setFieldValue, value) => {
    console.log('Selected Job Class:', value); // Debug log
    setFieldValue("jobClass_id", value);
    setSelectedJobClass(value);
  }

  const workers = useSelector(state => state.workers.workers);
  const uniqueDepartments = [...new Set(workers.filter(worker => worker.department).map(worker => worker.department.name))];
  console.log('unique departments', uniqueDepartments);
  // const uniqueJobClasses = [...new Set(workers.filter(worker => worker.jobclass).map(worker => worker.jobclass.name))];
  const uniqueJobClasses = workers
  .map(worker => worker.jobclass) // Get all jobclass objects
  .filter(jobclass => jobclass !== null && jobclass !== undefined) // Filter out null/undefined jobclass
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
      .unwrap()
      .then(addedWorker => {
        console.log('Form submission successful, added worker:', addedWorker);
        resetForm();
      })
      .catch(error => {
        console.error('Form submission error:', error);
      })
      .finally(() => {
        setSubmitting(false);
      });
  };


  return (
    <div>
      <h3>Add an Associate!</h3>
      <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={onSubmit}>
        {({ isSubmitting, setFieldValue }) => (
          <Form>
            <label htmlFor="jobClass_id">Job Class</label>
            <Field as="select" name="jobClass_id" onChange={e => {
              const value = e.target.value;
              setFieldValue("jobClass_id", value);
              setSelectedJobClass(value);
            }}>
              <option value="">Select a Job Class</option>
              {uniqueJobClasses.map(jobClass => (
                <option key={jobClass.id} value={jobClass.id}>{jobClass.name}</option>
              ))}
            </Field>
            <ErrorMessage name="jobClass_id" component="div" className="error" />

            {/* Always visible fields */}
            <Field name="firstName" placeholder="First Name" />
            <ErrorMessage name="firstName" component="div" className="error" />

            <Field name="lastName" placeholder="Last Name" />
            <ErrorMessage name="lastName" component="div" className="error" />

            {/* Conditional Fields based on jobClass_id */}
            {selectedJobClass && (
              <>
                <Field name="uptime" placeholder="Uptime" />
                <ErrorMessage name="uptime" component="div" className="error" />

                <Field name="attendance" placeholder="Attendance" />
                <ErrorMessage name="attendance" component="div" className="error" />

                {selectedJobClass === '2' && (
                  <>
                    <Field name="casesPerHour" placeholder="Cases Per Hour" />
                    <ErrorMessage name="casesPerHour" component="div" className="error" />
                  </>
                )}

                {['1', '3', '4', '5'].includes(selectedJobClass) && (
                  <>
                    <Field name="palletsPerHour" placeholder="Pallets Per Hour" />
                    <ErrorMessage name="palletsPerHour" component="div" className="error" />
                  </>
                )}

                <Field as="select" name="department">
                  <option value="">Select a Department</option>
                  {uniqueDepartments.map((department, index) => (
                    <option key={index} value={department}>{department}</option>
                  ))}
                </Field>
                <ErrorMessage name="department" component="div" className="error" />

                <Field name="hireDate" type="date" />
                <ErrorMessage name="hireDate" component="div" className="error" />
              </>
            )}

            <button type="submit" disabled={isSubmitting}>Submit</button>
          </Form>
        )}
      </Formik>
    </div>
  );
}

export default AssociateForm;