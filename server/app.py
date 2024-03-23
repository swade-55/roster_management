from flask import request, jsonify
from models import db,Associate, Metric, AssociateMetric, Day, Schedule, JobClass, Department
from config import app
from pulp import *
import pulp
from itertools import chain, repeat
from scipy.optimize import minimize
import numpy as np
from collections import defaultdict
from datetime import datetime
from flask_cors import CORS


from routes.routes import * 

CORS(app, resources={r"/*": {"origins": "*"}})


from flask import jsonify


@app.route('/associates_details', methods=['GET'])
def get_associates_details():
    associates = Associate.query.all()
    associates_output = []

    for associate in associates:
        # Use to_dict() to serialize the associate and related entities
        associate_data = associate.to_dict()
        
        # Initialize an empty dictionary for schedules
        schedules_list = []
        # Populate the schedules_dict with schedule details
        for schedule in associate.schedules:
            schedules_list.append(schedule.day.title)
        
        # Add the schedules_dict under a 'schedules' key
        associate_data['schedules'] = schedules_list
        

        # Initialize an empty dictionary for metrics
        metrics_dict = {}
        # Populate the metrics_dict with metric details
        for metric in associate.metrics:
            if metric.metric:  # Assuming a 'metric' relationship exists in AssociateMetric
                metrics_dict[metric.metric.metricname] = metric.metric_value

        # Add the metrics_dict under a 'metrics' key
        associate_data['metrics'] = metrics_dict
        
        associates_output.append(associate_data)

    return jsonify(associates_output)

@app.route('/add_associate', methods=['POST'])
def add_associate():
    try:
        data = request.get_json()
        app.logger.info(f'Received data for new associate: {data}')

        # Handling Job Class
        job_class_id = data.get('jobClass_id')
        if job_class_id is not None:
            job_class_id = int(job_class_id)
            job_class = JobClass.query.get(job_class_id)
            if not job_class:
                app.logger.error(f'Job class with id {job_class_id} not found')
                return jsonify({'error': f'Job class with id {job_class_id} not found'}), 404
        else:
            return jsonify({'error': 'Job class ID is required'}), 400

        # Handling Department
        department_name = data.get('department')
        if department_name:
            department = Department.query.filter_by(name=department_name).first()
            if not department:
                app.logger.error(f'Department not found: {department_name}')
                return jsonify({'error': f'Department not found: {department_name}'}), 404
            department_id = department.id
        else:
            return jsonify({'error': 'Department name is required'}), 400

        # Handling Hire Date
        hire_date_str = data.get('hireDate')
        if hire_date_str:
            hire_date = datetime.strptime(hire_date_str, "%Y-%m-%d").date()
        else:
            return jsonify({'error': 'Hire date is required'}), 400

        # Creating or updating the Associate
        associate = Associate(
            first_name=data.get('firstName'),
            last_name=data.get('lastName'),
            jobclass_id=job_class_id,
            department_id=department_id,
            dateofhire=hire_date
        )
        db.session.add(associate)
        db.session.flush()

        # Process and save metrics
        for metric_data in data.get('metrics', []):
            metric_name = metric_data.get('name')
            metric_value = metric_data.get('value')

            if metric_value is not None:
                metric = Metric.query.filter_by(metricname=metric_name).first()
                if not metric:
                    app.logger.error(f'Metric name not found: {metric_name}')
                    continue

                associate_metric = AssociateMetric(
                    associate_id=associate.id,
                    metric_id=metric.id,
                    metric_value=metric_value
                )
                db.session.add(associate_metric)

        db.session.commit()
        return jsonify({'message': 'Associate added/updated successfully', 'associate_id': associate.id}), 200

    except Exception as e:
        db.session.rollback()
        app.logger.error(f'Error adding/updating associate: {e}')
        return jsonify({'error': str(e)}), 500

@app.route('/update_associate_schedule', methods=['PATCH'])
def update_associate_schedule():
    data = request.get_json()
    worker_id = data.get('workerId')
    new_schedule_days = set(data.get('schedules', []))

    # Fetch the associate
    associate = Associate.query.filter_by(id=worker_id).first()
    if not associate:
        return jsonify({'error': 'Associate not found'}), 404

    # Fetch all days to easily map titles to ids
    all_days = {day.title: day.id for day in Day.query.all()}

    # Filter out any days not recognized to avoid errors
    new_schedule_day_ids = {all_days[day] for day in new_schedule_days if day in all_days}

    # Remove existing schedules not in the new schedule
    for schedule in associate.schedules[:]:
        if schedule.day_id not in new_schedule_day_ids:
            db.session.delete(schedule)

    # Find which days are already scheduled to avoid duplicates
    existing_schedule_day_ids = {schedule.day_id for schedule in associate.schedules}

    # Add new schedules
    for day_id in new_schedule_day_ids - existing_schedule_day_ids:
        new_schedule = Schedule(associate_id=worker_id, day_id=day_id)  # Remove shift_start and shift_end
        db.session.add(new_schedule)

    try:
        db.session.commit()
        return jsonify(new_schedule.to_dict()), 200
    except Exception as e:
        breakpoint()
        db.session.rollback()
    
        return jsonify({'error': 'Could not update the schedule', 'details': str(e)}), 500

    
@app.route('/update_associate', methods=['PATCH'])
def update_associate():
    data = request.get_json()
    associate_id = data['associateId']

    try:
        associate = Associate.query.get(associate_id)
        if not associate:
            return jsonify({'error': 'Associate not found'}), 404

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
            metric_id = metric_data.get('metric_id')
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

        db.session.commit()
        return jsonify({'message': 'Associate updated successfully', 'metrics': updated_metrics_data}), 200

    except Exception as e:
        print("Exception occurred:", e)
        db.session.rollback()
        app.logger.error(f'Exception updating associate: {e}')
        return jsonify({'error': 'Internal Server Error', 'message': str(e)}), 500
    

@app.route('/allocate_heads', methods=['POST'])
def allocate_heads():
    try:
        data = request.get_json()

        if 'departments' not in data or 'total_heads' not in data:
            return jsonify({'error': 'Missing required data'}), 400

        departments = data['departments']
        total_heads = data['total_heads']

        def completion_time(heads, dept):
            return departments[dept]['total_cases'] / (heads * departments[dept]['cases_per_hour'])
        def objective(heads):
            times = [completion_time(heads[i], list(departments.keys())[i]) for i in range(len(heads))]
            return np.std(times)

        cons = ({'type': 'eq', 'fun': lambda heads: sum(heads) - total_heads})
        bounds = [(0, total_heads) for _ in departments]

        initial_guess = [total_heads / len(departments)] * len(departments)

        result = minimize(objective, initial_guess, bounds=bounds, constraints=cons)

        if not result.success:
            return jsonify({'status': 'Optimization failed', 'message': result.message}), 500

        allocation = {list(departments.keys())[i]: result.x[i] for i in range(len(departments))}
        completion_times = {dept: completion_time(allocation[dept], dept) for dept in departments}

        return jsonify({'status': 'Optimal', 'allocation': allocation, 'completion_times': completion_times})

    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': 'An unexpected error occurred: ' + str(e)}), 500


@app.route('/schedule', methods=['POST'])
def create_schedule():
    data = request.get_json()
    required_heads = data['required_heads']

    if len(required_heads) != 7:
        return "Invalid input: expected 7 values for each day of the week.", 400

    num_employees = sum(required_heads)
    problem = pulp.LpProblem("Employee_Scheduling", pulp.LpMinimize)

    x = pulp.LpVariable.dicts("schedule", (range(num_employees), range(7)), 0, 1, pulp.LpBinary)

    problem += pulp.lpSum(x[i][j] for i in range(num_employees) for j in range(7))

    for j in range(7):
        problem += pulp.lpSum([x[i][j] for i in range(num_employees)]) >= required_heads[j]

    for i in range(num_employees):
        problem += pulp.lpSum([x[i][j] for j in range(7)]) >= 4
        problem += pulp.lpSum([x[i][j] for j in range(7)]) <= 5

    problem.solve()

    if pulp.LpStatus[problem.status] != 'Optimal':
        return "No feasible solution found.", 400

    schedule_counts = defaultdict(int)
    for i in range(num_employees):
        schedule = tuple(x[i][j].varValue for j in range(7))
        if any(day > 0 for day in schedule):
            schedule_counts[schedule] += 1

    total_headcount_per_day = [sum(x[i][j].varValue for i in range(num_employees)) for j in range(7)]
    additional_resources = [total - required for total, required in zip(total_headcount_per_day, required_heads)]

    aggregated_schedules = {
        'Schedules': {f'Schedule_{idx}': {'schedule': schedule, 'count': count}
                      for idx, (schedule, count) in enumerate(schedule_counts.items())},
        'Additional Resources': additional_resources
    }

    return jsonify(aggregated_schedules)


if __name__=='__main__':
    app.run(port=5555,debug=True)