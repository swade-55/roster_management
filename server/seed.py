from datetime import time
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
    # Delete existing data
    db.session.query(Associate).delete()
    db.session.query(Day).delete()
    db.session.query(Metric).delete()
    db.session.query(AssociateMetric).delete()
    db.session.query(Schedule).delete()
    db.session.query(Department).delete()
    db.session.query(JobClass).delete()

    # Commit the changes
    db.session.commit()

    # Seed Departments
    departments = ["Warehouse", "Logistics", "Administration", "Human Resources"]
    for dept_name in departments:
        department = Department(name=dept_name)
        db.session.add(department)
    db.session.commit()

    # Seed Metrics
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

    # Seed Job Classes
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

    # Map metrics to job classes
    metrics_map = {
        "Putaway Forklift": ["Pallets Per Hour", "Uptime", "Attendance"],
        "Selector": ["Cases Per Hour", "Uptime", "Attendance"],
        "Loader": ["Pallets Per Hour", "Uptime", "Attendance"],
        "Receiver": ["Cases Per Hour", "Uptime", "Attendance"],
        "Letdown Forklift": ["Pallets Per Hour", "Uptime", "Attendance"]
    }

    # Seed Associates and AssociateMetrics
    for job_class in JobClass.query.all():
        for _ in range(10):
            associate = Associate(
                first_name=fake.first_name(),
                last_name=fake.last_name(),
                dateofhire=fake.date_this_decade(),
                department_id=random.choice(Department.query.all()).id,
                jobclass_id=job_class.id
            )
            db.session.add(associate)
            db.session.commit()  # Commit to ensure `associate.id` is set

            # Assign metrics based on job class
            for metric_name in metrics_map[job_class.name]:
                metric = Metric.query.filter_by(metricname=metric_name).first()
                associate_metric = AssociateMetric(
                    associate_id=associate.id,
                    metric_id=metric.id,
                    metric_value=random.uniform(50.0, 100.0)  # Random metric value
                )
                db.session.add(associate_metric)
            db.session.commit()

    # Seed Days
    days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    for day in days:
        day_entry = Day(title=day)
        db.session.add(day_entry)
    db.session.commit()

    # Seed Schedules
    for associate in Associate.query.all():
        working_days = random.sample(days, 5)  # Choose 5 random working days
        for day in working_days:
            day_id = Day.query.filter_by(title=day).first().id
            schedule_entry = Schedule(
                associate_id=associate.id,
                day_id=day_id,
                shift_start=time(9, 0),  # Example start time: 9:00 AM
                shift_end=time(17, 0)    # Example end time: 5:00 PM
            )
            db.session.add(schedule_entry)
        db.session.commit()

# Print message upon successful seeding
print("Database seeded successfully.")
