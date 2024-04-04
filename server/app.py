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
        associate_data = associate.to_dict()

        # Simplify schedules to a list of day titles
        schedules_list = [schedule.day.title for schedule in associate.schedules]
        associate_data['schedules'] = schedules_list

        # Convert metrics to a dictionary with metric names as keys
        metrics_dict = {metric.metric.metricname: metric.metric_value for metric in associate.metrics}
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
        job_class = None
        if job_class_id:
            job_class = JobClass.query.get(job_class_id)
            if not job_class:
                return jsonify({'error': 'Job class not found'}), 404
        else:
            return jsonify({'error': 'Job class ID is required'}), 400

        # Handling Department
        department_name = data.get('department')
        department = Department.query.filter_by(name=department_name).first()
        if not department:
            return jsonify({'error': 'Department not found'}), 404

        # Handling Hire Date
        hire_date_str = data.get('hireDate')
        hire_date = datetime.strptime(hire_date_str, "%Y-%m-%d").date() if hire_date_str else None
        if not hire_date:
            return jsonify({'error': 'Invalid or missing hire date'}), 400

        # Creating or updating the Associate
        associate = Associate(
            first_name=data.get('firstName'),
            last_name=data.get('lastName'),
            jobclass=job_class,
            department=department,
            dateofhire=hire_date
        )
        db.session.add(associate)
        db.session.commit()

        # Constructing metrics dictionary
        metrics_dict = {}
        for metric_data in data.get('metrics', []):
            metric_name = metric_data.get('name')
            metric = Metric.query.filter_by(metricname=metric_name).first()
            if metric:
                metrics_dict[metric.metricname] = metric_data.get('value')
                associate_metric = AssociateMetric(associate_id=associate.id, metric_id=metric.id, metric_value=metric_data.get('value'))
                db.session.add(associate_metric)
        
        db.session.commit()

        # Fetching department and job class again to ensure they are refreshed
        department = Department.query.get(associate.department_id)
        job_class = JobClass.query.get(associate.jobclass_id)

        response_data = {
            "dateofhire": associate.dateofhire.strftime("%Y-%m-%d"),
            "department": {
                "id": department.id,
                "name": department.name
            },
            "department_id": department.id,
            "first_name": associate.first_name,
            "id": associate.id,
            "jobclass": {
                "id": job_class.id,
                "name": job_class.name
            },
            "jobclass_id": job_class.id,
            "last_name": associate.last_name,
            "metrics": metrics_dict,
            "schedules": []  # Assuming schedules need to be fetched or defined
        }

        return jsonify(response_data), 200

    except Exception as e:
        db.session.rollback()
        app.logger.error(f'Error processing request: {e}')
        return jsonify({'error': 'Server error'}), 500
    


@app.route('/update_associate_schedule', methods=['PATCH'])
def update_associate_schedule():
    data = request.get_json()
    worker_id = data.get('workerId')
    new_schedule_days = set(data.get('schedules', []))

    # Fetch the associate
    associate = Associate.query.get(worker_id)
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
        new_schedule = Schedule(associate_id=worker_id, day_id=day_id)
        db.session.add(new_schedule)

    try:
        db.session.commit()
        
        # Construct the detailed response
        updated_associate = Associate.query.get(worker_id)
        response_data = {
        "dateofhire": associate.dateofhire.strftime("%Y-%m-%d"),
        "department": {
            "id": associate.department.id,
            "name": associate.department.name
        },
        "department_id": associate.department_id,
        "first_name": associate.first_name,
        "id": associate.id,
        "jobclass": {
            "id": associate.jobclass.id,
            "name": associate.jobclass.name
        },
        "jobclass_id": associate.jobclass_id,
        "last_name": associate.last_name,
        "metrics": {metric.metric.metricname: metric.metric_value for metric in associate.metrics},
        "schedules": [schedule.day.title for schedule in associate.schedules]
    }
        return jsonify(response_data), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Could not update the schedule', 'details': str(e)}), 500

    

@app.route('/update_associate/<int:associate_id>', methods=['PATCH'])
def update_associate(associate_id):
    data = request.get_json()

    try:
        # Retrieve the associate to be updated
        associate = Associate.query.get(associate_id)
        if not associate:
            return jsonify({'error': 'Associate not found'}), 404

        # Update basic associate details if provided
        if 'firstName' in data:
            associate.first_name = data['firstName']
        if 'lastName' in data:
            associate.last_name = data['lastName']

        # Example for updating metrics (detailed logic for updating or handling metrics goes here)
        if 'metrics' in data:
            for metric_update in data['metrics']:
                metric_id = metric_update.get('metric_id')
                new_value = metric_update.get('value')

                associate_metric = AssociateMetric.query.filter_by(associate_id=associate_id, metric_id=metric_id).first()
                if associate_metric:
                    associate_metric.metric_value = new_value
                else:
                    # Logic for handling non-existent metric updates
                    print(f'Metric with ID {metric_id} not found for associate {associate_id}, skipping.')

        # Commit changes to the database
        db.session.commit()

        # Serialize the associate using to_dict(), excluding backrefs to avoid circular references
        associate_data = associate.to_dict(rules=[
            '-metrics.associate',  # Exclude backrefs from metrics
            '-schedules.associate',  # Exclude backrefs from schedules
        ])

        # Manually adjust metrics and schedules in the serialized data
        metrics_dict = {metric.metric.metricname: metric.metric_value for metric in associate.metrics}
        schedules_list = [schedule.day.title for schedule in associate.schedules]

        # Update the serialized data with custom formats for metrics and schedules
        associate_data['metrics'] = metrics_dict
        associate_data['schedules'] = schedules_list

        # Return the custom serialized data as JSON
        return jsonify(associate_data), 200

    except Exception as e:
        # Handle any exceptions that occur during the process
        return jsonify({'error': str(e)}), 500

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