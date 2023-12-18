import React,{useState} from 'react';
import { Formik, Form, useField } from 'formik';
import { useDispatch} from 'react-redux';
import { addWorker,fetchWorkers } from '../features/workersSlice';
import * as Yup from 'yup';




// Define the MySelect component
const MySelect = ({ label, ...props }) => {
  const [field, meta] = useField(props);
  return (
    <>
      <label htmlFor={props.id || props.name}>{label}</label>
      <select {...field} {...props} />
      {meta.touched && meta.error ? <div className="error">{meta.error}</div> : null}
    </>
  );
};

// Define the jobClasses array
const jobClasses = [
  { id: 1, name: 'Putaway Forklift' },
  { id: 2, name: 'Selector' },
  { id: 3, name: 'Loader' },
  { id: 4, name: 'Receiver' },
  { id: 5, name: 'Letdown Forklift' },
  // ... other job classes ...
];

// Custom Input component for Formik
const MyTextInput = ({ label, ...props }) => {
  const [field] = useField(props);
  return (
    <>
      <label htmlFor={props.id || props.name}>{label}</label>
      <input {...field} {...props} />
    </>
  );
};

function AssociateForm() {
  const dispatch = useDispatch();
  const [selectedJobClass,setSelectedJobClass] = useState('')
  const validationSchema = Yup.object({
    firstName: Yup.string().required('First name is required'),
    lastName: Yup.string().required('Last name is required'),
    jobClass_id: Yup.number().required('Job class is required'), // Changed to number if IDs are numeric
    uptime: Yup.string().required('Uptime is required'),
    casesPerHour: Yup.string()
      .when('jobClass_id',{
        is: 2,
        then: (schema) => schema.required('Cases per hour is required'),
      }),
    palletsPerHour: Yup.string().when('JobClass_id',{
      is: 1 || 3 || 4 || 5,
      then: (schema) => schema.required('Pallets per hour is required'),
    }),
    attendance: Yup.string().required('Attendance is required'),
  });
  

  const handleJobClassChange = (setFieldValue,value) =>{
    console.log('Selected Job Class:', value); // Debug log
    setFieldValue("jobClass_id",value);
    setSelectedJobClass(value);
  }
// why is associate not aworking?

  // Initial values for the form
  const initialValues = {
    firstName: '',
    lastName: '',
    jobClass_id: '', // Ensure this is a string as expected by your <MySelect> component
    uptime: '', // Add initial values for all metrics fields you will use
    casesPerHour: '',
    palletsPerHour: '',
    attendance: '',
  };
  

  // onSubmit function with Redux dispatch
  const onSubmit = (values, { setSubmitting, resetForm }) => {
    console.log('Submitting Form with Values:', values); // Debug log
    // Prepare the metrics object
    const metrics = {
      uptime: values.uptime,
      casesPerHour: values.casesPerHour,
      palletsPerHour: values.palletsPerHour,
      attendance: values.attendance
    };

    // Remove any empty metric entries
    Object.keys(metrics).forEach(key => metrics[key] === '' && delete metrics[key]);

    // Create the payload to send to the server
    const payload = {
      firstName: values.firstName,
      lastName: values.lastName,
      jobClass_id: parseInt(values.jobClass_id, 10), // Convert jobClass_id to an integer
      metrics: metrics
    };

    console.log('Attempting to submit form with values:', payload);
    
    // Dispatching the action with form data
    dispatch(addWorker(payload))
      .unwrap()
      .then(addedWorker => {
        console.log('Form submission successful, added worker:', addedWorker);
        dispatch(fetchWorkers())
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
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={onSubmit}
      >
        {({ isSubmitting, setFieldValue, values,errors, handleChange }) => (
          <Form>
            <MySelect label="Job Class" name="jobClass_id" onChange={(e) => handleJobClassChange(setFieldValue, e.target.value)}>
              <option value="">Select a Job Class</option>
              {jobClasses.map(jobClass => (
                <option key={jobClass.id} value={jobClass.id}> 
                  {jobClass.name}
                </option>
              ))}
            </MySelect>


            {selectedJobClass === '1' && (
              <>
                <MyTextInput label="First Name" name="firstName" type="text" onChange={handleChange}/>
                <MyTextInput label="Last Name" name="lastName" type="text" onChange={handleChange}/>
                <MyTextInput label="Uptime" name="uptime" type="text" onChange={handleChange}/>
                <MyTextInput label="Attendance" name="attendance" type="text" onChange={handleChange}/>
                <MyTextInput label="Pallets Per Hour" name="palletsPerHour" type="text" onChange={handleChange}/>
              </>
            )}
            {errors.firstName && errors.lastName && errors.uptime && errors.attendance && errors.palletsPerHour}
            {selectedJobClass === '2' && (
              <>
                <MyTextInput label="First Name" name="firstName" type="text" onChange={handleChange}/>
                <MyTextInput label="Last Name" name="lastName" type="text" onChange={handleChange}/>
                <MyTextInput label="Uptime" name="uptime" type="text" onChange={handleChange}/>
                <MyTextInput label="Attendance" name="attendance" type="text" onChange={handleChange}/>
                <MyTextInput label="Cases Per Hour" name="casesPerHour" type="text" onChange={handleChange}/>
              </>
            )}
            {errors.firstName && errors.lastName && errors.uptime && errors.attendance && errors.casesPerHour}
            {selectedJobClass === '3' && (
              <>
                <MyTextInput label="First Name" name="firstName" type="text" onChange={handleChange}/>
                <MyTextInput label="Last Name" name="lastName" type="text" onChange={handleChange}/>
                <MyTextInput label="Uptime" name="uptime" type="text" onChange={handleChange}/>
                <MyTextInput label="Attendance" name="attendance" type="text" onChange={handleChange}/>
                <MyTextInput label="Pallets Per Hour" name="palletsPerHour" type="text" onChange={handleChange}/>
              </>
            )}
            {errors.firstName && errors.lastName && errors.uptime && errors.attendance && errors.palletsPerHour}            
            {selectedJobClass === '4' && (
              <>
                <MyTextInput label="First Name" name="firstName" type="text" onChange={handleChange}/>
                <MyTextInput label="Last Name" name="lastName" type="text" onChange={handleChange}/>
                <MyTextInput label="Uptime" name="uptime" type="text" onChange={handleChange}/>
                <MyTextInput label="Attendance" name="attendance" type="text" onChange={handleChange}/>
                <MyTextInput label="Pallets Per Hour" name="palletsPerHour" type="text" onChange={handleChange}/>
              </>
            )}
            {errors.firstName && errors.lastName && errors.uptime && errors.attendance && errors.palletsPerHour}
            {selectedJobClass === '5' && (
              <>
                <MyTextInput label="First Name" name="firstName" type="text" onChange={handleChange}/>
                <MyTextInput label="Last Name" name="lastName" type="text" onChange={handleChange}/>
                <MyTextInput label="Uptime" name="uptime" type="text" onChange={handleChange}/>
                <MyTextInput label="Attendance" name="attendance" type="text" onChange={handleChange}/>
                <MyTextInput label="Pallets Per Hour" name="palletsPerHour" type="text" onChange={handleChange}/>
              </>
            )}
            {errors.firstName && errors.lastName && errors.uptime && errors.attendance && errors.palletsPerHour}
            
            {/* Conditional rendering for other job classes can be added here */}
            
            <button type="submit" disabled={isSubmitting}>
              Submit
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
}

export default AssociateForm;