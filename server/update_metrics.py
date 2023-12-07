from app import app # Import the Flask app and db from app.py
from models import db, Metric  # Import the Metric model

# Define the update function
def update_metric_names():
    with app.app_context():  # Use the app context to access the database
        # Perform the updates
        db.session.query(Metric).filter(Metric.metricname == 'Uptime').update({'metricname': 'uptime'})
        db.session.query(Metric).filter(Metric.metricname == 'Attendance').update({'metricname': 'attendance'})
        db.session.query(Metric).filter(Metric.metricname == 'Cases Per Hour').update({'metricname': 'casesPerHour'})
        db.session.query(Metric).filter(Metric.metricname == 'Pallets Per Hour').update({'metricname': 'palletsPerHour'})
        db.session.commit()  # Commit the changes to the database

# Check if the script is run directly
if __name__ == '__main__':
    update_metric_names()  # Call the update function
