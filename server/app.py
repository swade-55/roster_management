from flask import Flask,request, make_response, jsonify
from flask_migrate import Migrate
from models import db,Associate, Metric, AssociateMetric, Day, Schedule, JobClass
from config import app

from flask_cors import CORS



app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///roster_management.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

migrate = Migrate(app,db)

db.init_app(app)

CORS(app)
# Define the route to fetch associates and their metrics



@app.route('/selectors_metrics', methods=['GET'])
def get_selectors_metrics():
    try:
        # Desired job classes
        desired_job_classes = ["Selector"]

        # Fetch all associates that belong to the desired job classes
        associates = Associate.query.join(JobClass, Associate.jobclass_id == JobClass.id).filter(JobClass.name.in_(desired_job_classes)).all()

        workers_list = []

        for associate in associates:
            worker_dict = {}
            worker_dict['id'] = associate.id
            worker_dict['name'] = associate.first_name + " " + associate.last_name

            # Fetch the job class of the associate to determine the specific metric
            job_class = JobClass.query.get(associate.jobclass_id)

            metrics_map = {
                "Selector": {
                    "Cases Per Hour": "casesPerHour", 
                    "Uptime": "uptime",
                    "Attendance": "attendance"
                },
            }

            for metric_name, json_key in metrics_map[job_class.name].items():
                metric_record = db.session.query(AssociateMetric, Metric).join(Metric, AssociateMetric.metric_id == Metric.id).filter(AssociateMetric.associate_id == associate.id, Metric.metricname == metric_name).first()
                if metric_record:
                    worker_dict[json_key] = metric_record.AssociateMetric.metric_value
                else:
                    worker_dict[json_key] = None  # or a default value

            workers_list.append(worker_dict)

        return jsonify(workers_list)  # Return list directly without embedding inside a dictionary

    except Exception as e:
        return jsonify({'error': str(e)})
    
    
@app.route('/selectors_metrics/<int:associate_id>', methods=['DELETE'])
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


@app.route('/update_schedule/<int:associate_id>', methods=['PUT'])
def update_schedule(associate_id):
    try:
        data = request.get_json()
        
        # Fetch the associate
        #associate = Associate.query.get(associate_id)
        associate = db.session.get(Associate, associate_id)
        
        if associate:
            # Clear old schedules
            Schedule.query.filter_by(associate_id=associate_id).delete()
            
            # Add new schedules
            for day_name in data['working_days']:
                day = Day.query.filter_by(title=day_name).first()
                if day:
                    new_schedule = Schedule(associate_id=associate_id, day_id=day.id)
                    db.session.add(new_schedule)
            
            db.session.commit()
            return jsonify({'message': 'Schedule updated successfully'})
        else:
            return jsonify({'error': 'Associate not found'}), 404
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
    
@app.route('/workers', methods=['GET'])
def get_workers_by_job_class():
    job_classes = JobClass.query.all()  # Fetch all job classes
    workers_data = {}

    for job_class in job_classes:
        associates = Associate.query.filter_by(jobclass_id=job_class.id).all()
        workers_data[job_class.name] = []

        for associate in associates:
            # Here you build your workers' data structure including metrics
            metrics_data = []
            associate_metrics = AssociateMetric.query.filter_by(associate_id=associate.id).all()
            for am in associate_metrics:
                metric = Metric.query.get(am.metric_id)
                metrics_data.append({
                    'metric_id': am.metric_id,
                    'metric_name': metric.metricname,
                    'metric_value': am.metric_value
                })

            workers_data[job_class.name].append({
                'id': associate.id,
                'name': f"{associate.first_name} {associate.last_name}",
                'metrics': metrics_data
            })

    return jsonify(workers_data)

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
                'job_class': associate.jobclass.name,  # Include the job class name
                'metrics': []  # Initialize an empty array for metrics
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



if __name__=='__main__':
    app.run(port=5555)