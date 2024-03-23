import os
from datetime import datetime
from faker import Faker
import random

from models import db, Associate, Day, Metric, AssociateMetric, Department, JobClass, Schedule
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
    db.session.commit()

    # Seed Departments
    for dept_name in ["Perishable", "Frozen", "Grocery"]:
        department = Department(name=dept_name)
        db.session.add(department)
    db.session.commit()

    # Seed Metrics
    metrics_data = [
        {"metricname": "PalletsPerHour", "calculation": "Calculation for Pallets Per Hour"},
        {"metricname": "Uptime", "calculation": "Calculation for Uptime"},
        {"metricname": "Attendance", "calculation": "Calculation for Attendance"},
        {"metricname": "CasesPerHour", "calculation": "Calculation for Cases Per Hour"}
    ]
    for metric_data in metrics_data:
        metric = Metric(**metric_data)
        db.session.add(metric)
    db.session.commit()

    # Seed Job Classes
    job_classes_data = [
        {"name": "Putaway Forklift"},
        {"name": "Selector"},
        {"name": "Loader"},
        {"name": "Receiver"},
        {"name": "Letdown Forklift"},
    ]
    for job_class_data in job_classes_data:
        job_class = JobClass(**job_class_data)
        db.session.add(job_class)
    db.session.commit()

    # Seed Days
    days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
    for day in days:
        day_entry = Day(title=day)
        db.session.add(day_entry)
    db.session.commit()
    
    metrics_map = {
        "Putaway Forklift": ["PalletsPerHour", "Uptime", "Attendance"],
        "Selector": ["CasesPerHour", "Uptime", "Attendance"],
        "Loader": ["PalletsPerHour", "Uptime", "Attendance"],
        "Receiver": ["CasesPerHour", "Uptime", "Attendance"],
        "Letdown Forklift": ["PalletsPerHour", "Uptime", "Attendance"]
    }

    # Seed Associates, AssociateMetrics, and Schedules
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
            db.session.commit()

            for metric_name in metrics_map[job_class.name]:
                metric = Metric.query.filter_by(metricname=metric_name).first()

                if metric is not None:
                    associate_metric = AssociateMetric(
                        associate_id=associate.id,
                        metric_id=metric.id,
                        metric_value=random.uniform(50.0, 100.0)
                    )
                    db.session.add(associate_metric)
                else:
                    print(f"Warning: Metric '{metric_name}' not found for associate {associate.id}. Skipping AssociateMetric creation.")

            # Assign random working days to each associate without specifying time
            working_days = random.sample(days, 5)  # Assume a 5-day workweek for simplicity
            for day_title in working_days:
                day = Day.query.filter_by(title=day_title).first()
                schedule_entry = Schedule(
                    associate_id=associate.id,
                    day_id=day.id
                )
                db.session.add(schedule_entry)

            db.session.commit()

# Print message upon successful seeding
print("Database seeded successfully.")
