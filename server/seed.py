import os
from datetime import datetime
from faker import Faker
import random

from models import db, Associate, Day, Metric, AssociateMetric, Schedule, Department, JobClass
from app import app

# Create a Faker instance
fake = Faker()


# Create an application context
with app.app_context():

    # Create and commit Metric entries with actual values
    metrics_data = [
        {"metricname": "Pallets Per Hour", "calculation": "Calculation for Pallets Per Hour"},
        {"metricname": "Uptime", "calculation": "Calculation for Uptime"},
        {"metricname": "Attendance", "calculation": "Calculation for Attendance"},
        {"metricname": "Cases Per Hour", "calculation": "Calculation for Cases Per Hour"}
    ]

    for metric_data in metrics_data:
        metric = Metric(**metric_data)
        db.session.add(metric)
    db.session.commit()

    # Create and commit JobClass entries
    job_classes_data = [
        {"name": "Putaway Forklift", "DayOfWeek": "Monday"},
        {"name": "Selector", "DayOfWeek": "Wednesday"},
        {"name": "Loader", "DayOfWeek": "Friday"},
        {"name": "Receiver", "DayOfWeek": "Sunday"},
        {"name": "Letdown Forklift", "DayOfWeek": "Tuesday"},
    ]
    for job_class_data in job_classes_data:
        job_class = JobClass(**job_class_data)
        db.session.add(job_class)
    db.session.commit()

    # Metric mappings based on job class
    metrics_map = {
        "Incentive Selector": ["Cases Per Hour", "Uptime", "Attendance"],
        "Putaway Forklift": ["Pallets Per Hour", "Uptime", "Attendance"],
        "Loader": ["Pallets Per Hour", "Uptime", "Attendance"],
        "Letdown Forklift": ["Pallets Per Hour", "Uptime", "Attendance"],
        "Selector": ["Cases Per Hour", "Uptime", "Attendance"],
        "Receiver": ["Cases Per Hour", "Uptime", "Attendance"]
    }


    associate_id_counter = 1  # Counter for associate IDs

    # Create 10 associates for each job class
    # Create 10 associates for each job class
    for job_class in JobClass.query.all():
        for _ in range(10):
            associate = Associate(
                dateofhire=datetime.now(),
                first_name=fake.first_name(),
                last_name=fake.last_name(),
                department_id=1,
                jobclass_id=job_class.id,
            )
            db.session.add(associate)
            db.session.commit()  # Commit to ensure `associate.id` is set.

            # Assign appropriate metrics to associate based on job class
            job_class_metrics = metrics_map[job_class.name]
            for metric_name in job_class_metrics:
                metric = Metric.query.filter_by(metricname=metric_name).first()
                # Check if the metric has already been assigned to this associate
                existing_metric = AssociateMetric.query.filter_by(
                    associate_id=associate.id,
                    metric_id=metric.id
                ).first()

                # Only create a new AssociateMetric if it doesn't already exist
                if not existing_metric:
                    associate_metric = AssociateMetric(
                        associate_id=associate.id,
                        metric_id=metric.id,
                        metric_value=random.uniform(85.0, 100.0),
                    )
                    db.session.add(associate_metric)

            # Commit all metrics for the associate at once, outside the metrics loop.
            db.session.commit()


            associate_id_counter += 1

    # Create and commit 7 Day entries
    days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    for day in days:
        day_entry = Day(title=day)
        db.session.add(day_entry)
    db.session.commit()

    # Define working days for associates
    working_days = random.sample(days, 5)

    # Assign working days to associates in the Schedule table
    for associate_id in range(1, associate_id_counter):
        for day in working_days:
            day_id = Day.query.filter_by(title=day).first().id
            schedule_entry = Schedule(associate_id=associate_id, day_id=day_id)
            db.session.add(schedule_entry)
        db.session.commit()
