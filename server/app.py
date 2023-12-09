from flask import Flask,request, make_response, jsonify
from flask_migrate import Migrate
from models import db,Associate, Metric, AssociateMetric, Day, Schedule, JobClass
from config import app
from pulp import pulp
from pulp import LpProblem, LpMinimize, LpVariable, lpSum, LpStatus
from itertools import chain, repeat
import pandas as pd

from flask_cors import CORS

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///roster_management.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

migrate = Migrate(app,db)

db.init_app(app)

# CORS(app)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

# Define the route to fetch associates and their metrics
        
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
            associate_metrics = AssociateMetric.query \
                .join(Metric, AssociateMetric.metric_id == Metric.id) \
                .filter(AssociateMetric.associate_id == associate.id) \
                .all()

            # Track added metrics to ensure uniqueness
            added_metrics = set()

            for associate_metric in associate_metrics:
                if associate_metric.metric.metricname not in added_metrics:
                    # Add the metric name to the set
                    added_metrics.add(associate_metric.metric.metricname)
                    
                    # Create a metric dictionary and append to the worker's metrics
                    metric_dict = {
                        'metric_name': associate_metric.metric.metricname,
                        'value': associate_metric.metric_value
                    }
                    worker_dict['metrics'].append(metric_dict)

            workers_list.append(worker_dict)

        return jsonify(workers_list)  # Return list directly without embedding inside a dictionary

    except Exception as e:
        return jsonify({'error': str(e)})

@app.route('/add_associate', methods=['POST'])
def add_associate():
    try:
        print("adding associate")
        data = request.get_json()
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
        for metric_name, metric_value in data.get('metrics', {}).items():
            if metric_value in [None, '']:
                app.logger.info(f'Metric value for {metric_name} is empty or null, skipping.')
                continue

            try:
                metric_value = float(metric_value)
            except ValueError:
                app.logger.error(f'Invalid metric value: {metric_value} for {metric_name}')
                continue

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

        db.session.commit()
        return jsonify({'message': 'Associate added/updated successfully', 'associate_id': associate.id}), 200

    except Exception as e:
        db.session.rollback()
        app.logger.error(f'Unhandled exception: {e}')
        return jsonify({'error': 'Internal Server Error', 'message': str(e)}), 500
    
@app.route('/update_associate', methods=['POST'])
def update_associate():
    data = request.get_json()
    app.logger.info(f'Updating associate with data: {data}')
    associate_id = data['associateId']

    try:
        associate = Associate.query.get(associate_id)
        if not associate:
            return jsonify({'error': 'Associate not found'}), 404

        associate.first_name = data['firstName']
        associate.last_name = data['lastName']
        updated_metrics = data.get('metrics', [])

        for metric_data in updated_metrics:
            metric_id = metric_data.get('id')
            metric_value = metric_data.get('value')

            if metric_id is not None and metric_value is not None:
                associate_metric = AssociateMetric.query.filter_by(
                    associate_id=associate_id, metric_id=metric_id
                ).first()
                if associate_metric:
                    associate_metric.metric_value = metric_value
                else:
                    # If the metric doesn't exist, create a new one
                    new_metric = AssociateMetric(
                        associate_id=associate_id,
                        metric_id=metric_id,
                        metric_value=metric_value
                    )
                    db.session.add(new_metric)

        db.session.commit()
        return jsonify({'message': 'Associate updated successfully'}), 200
    except Exception as e:
        db.session.rollback()
        app.logger.error(f'Exception updating associate: {e}')
        return jsonify({'error': 'Internal Server Error', 'message': str(e)}), 500
    
@app.route('/generate_schedule', methods=['POST'])
def generate_schedule():
    try:
        # Extract user input from the request's JSON payload
        data = request.get_json()

        # Create a DataFrame for staff demands based on user input
        jours = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
        n_staff = [data.get(day.lower(), 0) for day in jours]
        df_staff = pd.DataFrame({'Days': jours, 'Staff Demand': n_staff})
        # Run the optimization to get the initial schedule results
        initial_schedule = run_optimization(data)
        print('Initial schedule:', initial_schedule)

        # Now let's process the results to get the daily schedule and demand vs. supply
        schedule_results, total_staff = process_schedule_results(initial_schedule['schedule'])
        print('Processed schedule:', schedule_results)

        # Return the processed schedule along with the initial optimization results
        return jsonify({
            'initial_schedule': initial_schedule,
            'schedule_results': schedule_results,
            'total_staff': total_staff
        })
    except Exception as e:
        app.logger.error(f"Error in generate_schedule: {e}", exc_info=True)
        return jsonify({'error': str(e)}), 500
    
def run_optimization(user_input):
    print('Starting optimization with user input:', user_input)
    days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
    n_staff = [user_input.get(day.lower(), 0) for day in days]

    jours = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']

    # Create a circular list of days for the scheduling problem
    n_days = list(range(6))
    n_days_c = list(chain.from_iterable(repeat(n_days, 2)))

    # Define working days and days off based on the circular list
    list_in = [[n_days_c[j] for j in range(i, i + 4)] for i in n_days_c]
    list_excl = [[n_days_c[j] for j in range(i + 1, i + 3)] for i in n_days_c]

    # Initialize the optimization problem
    model = LpProblem("Minimize Staffing", LpMinimize)

    # Create decision variables for each day
    x = LpVariable.dicts('shift', n_days, lowBound=0, cat='Integer')

    # Objective function: Minimize the total number of staff
    model += lpSum([x[i] for i in n_days])

    # Constraints: Ensure enough staff for each day while considering days off
    for d, l_excl, staff in zip(n_days, list_excl, n_staff):
        model += lpSum([x[i] for i in n_days if i not in l_excl]) >= staff

    # Solve the model
    model.solve()

    # Extract the results
    schedule_results = {f"Shift for {jours[day]}": x[day].value() for day in n_days}
    print('Optimization results:', schedule_results)

    # Additional information like model status and total staff can also be returned
    return {
        "schedule": {str(k): int(v) for k, v in schedule_results.items()},
        "status": str(LpStatus[model.status]),
        "total_staff": int(pulp.value(model.objective))
    }

def process_schedule_results(schedule):
    jours = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
    # Convert schedule to dataframe
    df_sch = pd.DataFrame(schedule.items(), columns=['Day', 'Staff']).set_index('Day')
    df_sch = df_sch.reindex(jours).fillna(0).T
    
    # Assume df_staff is already defined or passed in with staff demands per day
    # Calculate the total staff and extra resources
    total_staff = df_sch.sum(axis=1).iloc[0]
    df_supp = df_staff.set_index('Days')
    df_supp['Staff Supply'] = df_sch.sum()
    df_supp['Extra_Resources'] = df_supp['Staff Supply'] - df_supp['Staff Demand']
    
    # Convert the results back to a dictionary for JSON serialization
    schedule_results = {
        'schedule_by_day': df_sch.to_dict('records')[0],
        'demand_vs_supply': df_supp.to_dict('index')
    }
    return schedule_results, total_staff



    
if __name__=='__main__':
    app.run(port=5555)