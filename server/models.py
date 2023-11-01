from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Associate(db.Model):
    __tablename__ = 'associates'
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String)
    last_name = db.Column(db.String)
    dateofhire = db.Column(db.Date)
    department_id = db.Column(db.Integer, db.ForeignKey('departments.id'))
    jobclass_id = db.Column(db.Integer, db.ForeignKey('jobclasses.id'))
    department = db.relationship('Department', backref='associates')
    jobclass = db.relationship('JobClass', backref='associates')
    metrics = db.relationship('Metric', secondary='associate_metrics', back_populates='associates')
    associate_image = db.Column(db.BLOB)  # Column to store image data as binary
    image_path = db.Column(db.String, nullable=True)
    schedules = db.relationship('Schedule', backref='associate')

class Day(db.Model):
    __tablename__ = 'days'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(50))

class Metric(db.Model):
    __tablename__ = 'metrics'
    id = db.Column(db.Integer, primary_key=True)
    metricname = db.Column(db.String(100))
    calculation = db.Column(db.String(255))
    associates = db.relationship('Associate', secondary='associate_metrics', back_populates='metrics')

class AssociateMetric(db.Model):
    __tablename__ = 'associate_metrics'
    id = db.Column(db.Integer, primary_key=True)
    associate_id = db.Column(db.Integer, db.ForeignKey('associates.id'))
    metric_id = db.Column(db.Integer, db.ForeignKey('metrics.id'))
    metric_value = db.Column(db.Float)

class Schedule(db.Model):
    __tablename__ = 'schedules'
    id = db.Column(db.Integer, primary_key=True)
    associate_id = db.Column(db.Integer, db.ForeignKey('associates.id'))
    day_id = db.Column(db.Integer, db.ForeignKey('days.id'))
    shift_start = db.Column(db.DateTime)
    shift_end = db.Column(db.DateTime)

class Department(db.Model):
    __tablename__ = 'departments'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))

class JobClass(db.Model):
    __tablename__ = 'jobclasses'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    DayOfWeek = db.Column(db.String(50))
