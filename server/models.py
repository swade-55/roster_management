from flask_sqlalchemy import SQLAlchemy
from sqlalchemy_serializer import SerializerMixin
from sqlalchemy import Time


db = SQLAlchemy()

class Associate(db.Model, SerializerMixin):
    __tablename__ = 'associates'
    id = db.Column(db.Integer, primary_key=True)
    first_name = db.Column(db.String)
    last_name = db.Column(db.String)
    dateofhire = db.Column(db.Date)
    department_id = db.Column(db.Integer, db.ForeignKey('departments.id'))
    jobclass_id = db.Column(db.Integer, db.ForeignKey('jobclasses.id'))
    department = db.relationship('Department', back_populates='associates')
    jobclass = db.relationship('JobClass', back_populates='associates')
    metrics = db.relationship('AssociateMetric', back_populates='associate')
    schedules = db.relationship('Schedule', back_populates='associate_in_schedule')
    
    serialize_rules = (
        '-department.associates',  
        '-jobclass.associates',    
        '-metrics',      
        '-schedules.associate_in_schedule', 
    )
class Day(db.Model, SerializerMixin):
    __tablename__ = 'days'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(50))

class Metric(db.Model, SerializerMixin):
    __tablename__ = 'metrics'
    id = db.Column(db.Integer, primary_key=True)
    metricname = db.Column(db.String(100))
    calculation = db.Column(db.String(255))
    
    associate_metrics = db.relationship('AssociateMetric', back_populates='metric')
    
    serialize_rules = (
        '-associate_metrics', 
    )

class AssociateMetric(db.Model, SerializerMixin):
    __tablename__ = 'associate_metrics'
    id = db.Column(db.Integer, primary_key=True)
    associate_id = db.Column(db.Integer, db.ForeignKey('associates.id'))
    metric_id = db.Column(db.Integer, db.ForeignKey('metrics.id'))
    metric_value = db.Column(db.Float)
    associate = db.relationship('Associate', back_populates='metrics')
    metric = db.relationship('Metric', back_populates='associate_metrics')
    
    serialize_rules = (
        '-associate',   
        '-metric', 
    )

class Schedule(db.Model, SerializerMixin):
    __tablename__ = 'schedules'
    id = db.Column(db.Integer, primary_key=True)
    associate_id = db.Column(db.Integer, db.ForeignKey('associates.id'))
    day_id = db.Column(db.Integer, db.ForeignKey('days.id'))
    
    day = db.relationship('Day', backref='schedules')
    
    serialize_rules = ('-associate.schedules',)

class Department(db.Model, SerializerMixin):
    __tablename__ = 'departments'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    
    associates = db.relationship('Associate', back_populates='department')
    
    serialize_rules = (
        '-associates', 
    )
    
class JobClass(db.Model, SerializerMixin):
    __tablename__ = 'jobclasses'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    
    associates = db.relationship('Associate', back_populates='jobclass')

    serialize_rules = (
        '-associates', 
    )
