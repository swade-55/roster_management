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
    
@app.route('/workers_metrics', methods=['GET'])
def get_workers_metrics():
    try:
        associates = Associate.query.all()

        workers_list = []

        for associate in associates:
            worker_dict = {}
            worker_dict['id'] = associate.id
            worker_dict['name'] = associate.first_name + " " + associate.last_name
            # Assuming you have added 'image_path' to your Associate model as previously discussed
            worker_dict['associate_image'] = associate.image_path

            # Fetch the job class of the associate to determine the specific metric
            job_class = JobClass.query.get(associate.jobclass_id)

            metrics_map = {
                "Incentive Selector": ["Cases Per Hour", "Uptime", "Attendance"],
                "Putaway Forklift": ["Pallets Per Hour", "Uptime", "Attendance"],
                "Loader": ["Pallets Per Hour", "Uptime", "Attendance"],
                "Letdown Forklift": ["Pallets Per Hour", "Uptime", "Attendance"],
                "Trainee Selector": ["Cases Per Hour", "Uptime", "Attendance"],
                "Team Selector": ["Cases Per Hour", "Uptime", "Attendance"]
            }

            metrics = metrics_map.get(job_class.name, [])

            for metric_name in metrics:
                metric_record = db.session.query(AssociateMetric, Metric).join(Metric, AssociateMetric.metric_id == Metric.id).filter(AssociateMetric.associate_id == associate.id, Metric.metricname == metric_name).first()
                if metric_record:
                    worker_dict[metric_name] = metric_record.AssociateMetric.metric_value
                else:
                    worker_dict[metric_name] = None  # or a default value

            workers_list.append(worker_dict)

        return jsonify({'workers': workers_list})

    except Exception as e:
        return jsonify({'error': str(e)})
    
    
@app.route('/associates/schedules', methods=['GET'])
def get_associates_schedules():
    # Create a list to hold all the associates and their schedules
    associates_schedules = []

    # Query all associates
    associates = Associate.query.all()

    # Iterate over each associate to get their schedule
    for associate in associates:
        # Query the schedule for the associate
        schedules = Schedule.query.join(Day, Schedule.day_id == Day.id).filter(Schedule.associate_id == associate.id).all()
        
        # Create a list of days from the schedules
        days = [schedule.day.title for schedule in schedules]
        
        # Append the associate's information and their schedule to the list
        associates_schedules.append({
            "associate_id": associate.id,
            "first_name": associate.first_name,
            "last_name": associate.last_name,
            "schedule": days
        })

    return jsonify(associates_schedules)



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
            worker_dict['image'] = associate.image_path  # Change 'associate_image' to 'image'

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
    
@app.route('/selectors_metrics/<int:associate_id>',methods=['DELETE'])
def delete_associate(associate_id):
    try:
        associate = Associate.query.get(associate_id)
        if associate:
            db.session.delete(associate)
            db.session.commit()
            return jsonify({'message':'Associate deleted successfully'})
        else:
            return jsonify({'error':'Associate not found'}),404
    except Exception as e:
        db.session.rollback()
        return jsonify({'error':str(e)}),500

if __name__=='__main__':
    app.run(port=5555)

    