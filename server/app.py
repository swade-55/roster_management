from flask import request, jsonify
from models import db,Associate, Metric, AssociateMetric, Day, Schedule, JobClass
from config import app
from pulp import *
import pulp
from itertools import chain, repeat
import pandas as pd
from itertools import cycle 
import traceback
from scipy.optimize import minimize
import numpy as np
from scipy.optimize import linprog
from collections import defaultdict
from datetime import datetime
from flask_cors import CORS




CORS(app, resources={r"/*": {"origins": "*"}})

@app.route('/associate_metrics/<int:associate_id>', methods=['DELETE'])
def delete_associate(associate_id):
    try:
        # Get the session
        session = db.session
        
        # Get the associate with the new session.get method
        associate = session.get(Associate, associate_id)
        if associate:
            # Delete related associate metrics first to handle foreign key constraints
            AssociateMetric.query.filter_by(associate_id=associate_id).delete()
            
            # Now delete the associate
            session.delete(associate)
            session.commit()
            return jsonify({'message': 'Associate deleted successfully'})
        else:
            return jsonify({'error': 'Associate not found'}), 404
    except Exception as e:
        # Roll back the session in case of an exception
        session.rollback()
        app.logger.error(f'Error deleting associate with id {associate_id}: {e}')
        return jsonify({'error': str(e)}), 500
        
@app.route('/associates_working_days', methods=['GET'])
def get_associates_working_days():
    try:
        # Fetch all days to have a reference of day titles
        all_days = Day.query.order_by(Day.id).all()
        day_id_to_name = {day.id: day.title for day in all_days}

        # Fetch all associates along with their schedules
        associates = Associate.query.all()

        # Initialize the data structure for the response
        associates_days = []

        for associate in associates:
            # Collect the unique day_ids the associate has a schedule for
            day_ids = {schedule.day_id for schedule in associate.schedules}

            # Translate day_ids to day titles
            working_days = [day_id_to_name[day_id] for day_id in day_ids]

            # Append the data to the associates_days list
            associates_days.append({
                'associate_id': associate.id,
                'name': f"{associate.first_name} {associate.last_name}",
                'working_days': working_days
            })

        # Return the result as JSON
        return jsonify(associates_days)

    except Exception as e:
        app.logger.error(f'Error retrieving associates working days: {str(e)}')
        return jsonify({'error': 'Internal Server Error', 'message': str(e)}), 500
    
@app.route('/associate_metrics', methods=['GET'])
def get_associate_metrics():
    try:
        # Fetch all associates
        associates = Associate.query.all()
        workers_list = []

        for associate in associates:
            worker_dict = {
                'id': associate.id,
                'first_name': associate.first_name,
                'last_name': associate.last_name,
                'job_class': associate.jobclass.name if associate.jobclass else 'No Job Class',
                'metrics': []
            }

            # Fetch metrics for this associate
            associate_metrics = AssociateMetric.query.filter_by(associate_id=associate.id).all()

            for associate_metric in associate_metrics:
                # Check if the metric object exists
                if associate_metric.metric:
                    metric_dict = {
                        'id': associate_metric.id, 
                        'metric_name': associate_metric.metric.metricname,
                        'value': associate_metric.metric_value
                    }
                    worker_dict['metrics'].append(metric_dict)

            workers_list.append(worker_dict)

        return jsonify(workers_list)

    except Exception as e:
        return jsonify({'error': str(e)})

@app.route('/add_associate', methods=['POST'])
def add_associate():
    try:
        print("adding associate")
        data = request.get_json()
        print("Received data:", data)
        app.logger.info(f'Received data for new associate: {data}')

        # Validate and convert job class ID
        job_class_id = data.get('jobClass_id')
        if job_class_id is not None:
            job_class_id = int(job_class_id)
        else:
            return jsonify({'error': 'Job class ID is required'}), 400

        # Validate job class
        job_class = JobClass.query.get(job_class_id)
        if not job_class:
            app.logger.error(f'Job class with id {job_class_id} not found')
            return jsonify({'error': f'Job class with id {job_class_id} not found'}), 404

        # Check if the Associate already exists
        associate_id = data.get('id')
        if associate_id:
            associate = Associate.query.get(associate_id)
            if not associate:
                app.logger.info(f'No associate found with id {associate_id}')
                return jsonify({'error': f'Associate with id {associate_id} not found'}), 404
        else:
            # Create new associate if no ID is providedcommand:~remote.forwardedPorts.focus
            associate = Associate(
                first_name=data.get('firstName'),
                last_name=data.get('lastName'),
                jobclass_id=job_class_id
            )
            db.session.add(associate)
            db.session.flush()  # This will populate 'associate.id' for new associates

            # Process and save metrics
        for metric_data in data.get('metrics', []):
            metric_name = metric_data.get('name')
            metric_value = metric_data.get('value')

            if metric_value is not None:
                metric = Metric.query.filter_by(metricname=metric_name).first()
                if not metric:
                    app.logger.error(f'Metric name not found: {metric_name}')
                    continue

                associate_metric = AssociateMetric.query.filter_by(
                    associate_id=associate.id,
                    metric_id=metric.id
                ).first()

                if not associate_metric:
                    app.logger.info(f'Creating new AssociateMetric for {metric_name}')
                    associate_metric = AssociateMetric(
                        associate_id=associate.id,
                        metric_id=metric.id,
                        metric_value=metric_value
                    )
                    db.session.add(associate_metric)
                else:
                    app.logger.info(f'Updating AssociateMetric for {metric_name}')
                    associate_metric.metric_value = metric_value
        print("Associate to be added/updated:", associate)
        print("Metrics to be added/updated:", associate.metrics)
        db.session.commit()
        return jsonify({'message': 'Associate added/updated successfully', 'associate_id': associate.id}), 200

    except Exception as e:
        return jsonify({'error': str(e)})
    
    
@app.route('/update_associate', methods=['PATCH'])
def update_associate():
    data = request.get_json()
    print("Received data:", data)
    associate_id = data['associateId']

    try:
        print("Fetching associate with ID:", associate_id)
        associate = Associate.query.get(associate_id)
        if not associate:
            print("Associate not found for ID:", associate_id)
            return jsonify({'error': 'Associate not found'}), 404

        print("Updating associate fields for ID:", associate_id)
        associate.first_name = data.get('firstName', associate.first_name)
        associate.last_name = data.get('lastName', associate.last_name)

        dateofhire_str = data.get('dateofhire')
        if dateofhire_str:
            print("Converting dateofhire from string to date object")
            associate.dateofhire = datetime.strptime(dateofhire_str, '%Y-%m-%d').date()

        associate.department_id = data.get('departmentId', associate.department_id)
        associate.jobclass_id = data.get('jobclassId', associate.jobclass_id)

        updated_metrics = data.get('metrics', [])
        print("Updating metrics for associate ID:", associate_id)
        for metric_data in updated_metrics:
            metric_id = metric_data.get('id')
            metric_value = metric_data.get('value')
            print(f"Updating metric ID {metric_id} with value {metric_value}")

            associate_metric = AssociateMetric.query.filter_by(
                id=metric_id
            ).first()
            if associate_metric:
                associate_metric.metric_value = metric_value
                print(f"Updated metric ID {metric_id}")
            else:
                print(f"No existing metric found for ID: {metric_id}, skipping update")

        updated_metrics_data = [
            {'id': metric.id, 'value': metric.metric_value}
            for metric in associate.metrics
        ]

        print("Committing changes to the database")
        db.session.commit()
        print("Update successful for associate ID:", associate_id)
        return jsonify({'message': 'Associate updated successfully', 'metrics': updated_metrics_data}), 200

    except Exception as e:
        print("Exception occurred:", e)
        db.session.rollback()
        app.logger.error(f'Exception updating associate: {e}')
        return jsonify({'error': 'Internal Server Error', 'message': str(e)}), 500



@app.route('/generate_schedule', methods=['POST'])
def generate_schedule():
    try:
        # Get the daily demand from the POST request JSON body
        daily_demand = request.get_json()
        
        # Validate the daily_demand
        if not isinstance(daily_demand, list) or len(daily_demand) != 7:
            raise ValueError("daily_demand must be a list of 7 integers.")

        # Create a circular list of days to handle the rolling schedule
        n_days_c = list(chain.from_iterable(repeat(tuple(range(7)), 3)))

        # Working days and off days lists
        list_in = [[n_days_c[j] for j in range(i, i + 5)] for i in range(7)]
        list_excl = [[n_days_c[j] for j in range(i + 1, i + 3)] for i in range(7)]

        # Initialize the model
        model = LpProblem("Minimize Staffing", LpMinimize)

        # Create variables
        x = LpVariable.dicts('shift_', range(7), lowBound=0, cat='Integer')

        # Define the objective function
        model += lpSum([x[i] for i in range(7)])

        # Add constraints for each day
        for d, l_excl, staff in zip(range(7), list_excl, daily_demand):
            model += lpSum([x[i] for i in range(7) if i not in l_excl]) >= staff

        # Solve the model
        model.solve()

        # Check if the solution is optimal
        if LpStatus[model.status] != 'Optimal':
            return jsonify({'status': LpStatus[model.status], 'schedule_table': 'Infeasible solution'}), 200

        # Prepare the schedule to match the desired format
        schedule_table = [{day: (x[(day_index + shift_index) % 7].value() if (day_index + shift_index) % 7 in list_in[shift_index] else 0)
                           for day_index, day in enumerate(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'])}
                          for shift_index in range(7)]

        # Construct the response data
        response_data = {
            'status': LpStatus[model.status],
            'schedule_table': schedule_table,
            'total_workers': value(model.objective)
        }

        return jsonify(response_data)

    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': 'An unexpected error occurred: ' + str(e)}), 500
    

@app.route('/allocate_heads', methods=['POST'])
def allocate_heads():
    try:
        data = request.get_json()

        # Validate data
        if 'departments' not in data or 'total_heads' not in data:
            return jsonify({'error': 'Missing required data'}), 400

        departments = data['departments']
        total_heads = data['total_heads']

        # Function to calculate completion time for a department
        def completion_time(heads, dept):
            return departments[dept]['total_cases'] / (heads * departments[dept]['cases_per_hour'])

        # Objective function: Minimize the standard deviation of completion times
        def objective(heads):
            times = [completion_time(heads[i], list(departments.keys())[i]) for i in range(len(heads))]
            return np.std(times)

        # Constraint: Total heads should not exceed the available heads
        cons = ({'type': 'eq', 'fun': lambda heads: sum(heads) - total_heads})
        bounds = [(0, total_heads) for _ in departments]

        # Initial guess: Even distribution of heads
        initial_guess = [total_heads / len(departments)] * len(departments)

        # Perform the optimization
        result = minimize(objective, initial_guess, bounds=bounds, constraints=cons)

        if not result.success:
            return jsonify({'status': 'Optimization failed', 'message': result.message}), 500

        # Constructing the response
        allocation = {list(departments.keys())[i]: result.x[i] for i in range(len(departments))}
        completion_times = {dept: completion_time(allocation[dept], dept) for dept in departments}

        return jsonify({'status': 'Optimal', 'allocation': allocation, 'completion_times': completion_times})

    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': 'An unexpected error occurred: ' + str(e)}), 500

@app.route('/update_schedule/<int:associate_id>', methods=['PATCH'])
def update_schedule(associate_id):
    try:
        # Get the data from the request
        data = request.get_json()
        print("Received data:", data)
        for schedule_update in data:
            # Parse only the time part
            schedule = Schedule.query.filter_by(
                associate_id=associate_id, 
                id=schedule_update['day_id']
            ).first()
            shift_start_time = datetime.strptime(schedule_update['shift_start'], '%H:%M:%S').time()
            shift_end_time = datetime.strptime(schedule_update['shift_end'], '%H:%M:%S').time()

            # Update the schedule if it exists
            if schedule:
                schedule.shift_start = shift_start_time
                schedule.shift_end = shift_end_time
            else:
                # If no existing schedule, create a new one
                new_schedule = Schedule(
                    associate_id=associate_id,
                    day_id=schedule_update['day_id'],
                    shift_start=shift_start_time,
                    shift_end=shift_end_time
                )
                db.session.add(new_schedule)

        # Commit the changes to the database
        db.session.commit()
        app.logger.debug(f'Successfully updated schedule for associate {associate_id}')
        return jsonify({'message': 'Schedule updated successfully'}), 200

    except Exception as e:
        db.session.rollback()
        app.logger.error(f'Error updating schedule for associate {associate_id}: {e}')
        return jsonify({'error': str(e)}), 500

@app.route('/schedule', methods=['POST'])
def create_schedule():
    data = request.get_json()
    required_heads = data['required_heads']

    if len(required_heads) != 7:
        return "Invalid input: expected 7 values for each day of the week.", 400

    # Starting with an estimate of the number of employees
    num_employees = sum(required_heads)
    problem = pulp.LpProblem("Employee_Scheduling", pulp.LpMinimize)

    # Decision Variables
    x = pulp.LpVariable.dicts("schedule", (range(num_employees), range(7)), 0, 1, pulp.LpBinary)

    # Objective Function: Minimize the total number of working days
    problem += pulp.lpSum(x[i][j] for i in range(num_employees) for j in range(7))

    # Constraints
    # a. Fulfill headcount requirement for each day
    for j in range(7):
        problem += pulp.lpSum([x[i][j] for i in range(num_employees)]) >= required_heads[j]

    # b. Each employee works at least 4 and at most 5 days a week
    for i in range(num_employees):
        problem += pulp.lpSum([x[i][j] for j in range(7)]) >= 4
        problem += pulp.lpSum([x[i][j] for j in range(7)]) <= 5

    # Solve the problem
    problem.solve()

    if pulp.LpStatus[problem.status] != 'Optimal':
        return "No feasible solution found.", 400

    # Aggregate schedules
    schedule_counts = defaultdict(int)
    for i in range(num_employees):
        schedule = tuple(x[i][j].varValue for j in range(7))
        if any(day > 0 for day in schedule):
            schedule_counts[schedule] += 1

    # Calculate additional resources
    total_headcount_per_day = [sum(x[i][j].varValue for i in range(num_employees)) for j in range(7)]
    additional_resources = [total - required for total, required in zip(total_headcount_per_day, required_heads)]

    # Format the aggregated schedules for output
    aggregated_schedules = {
        'Schedules': {f'Schedule_{idx}': {'schedule': schedule, 'count': count}
                      for idx, (schedule, count) in enumerate(schedule_counts.items())},
        'Additional Resources': additional_resources
    }

    return jsonify(aggregated_schedules)


if __name__=='__main__':
    app.run(port=5555,debug=True)