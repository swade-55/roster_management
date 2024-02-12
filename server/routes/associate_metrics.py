from flask import request, jsonify
from models import db,Associate, Metric, AssociateMetric, Day, Schedule, JobClass
from config import app
from pulp import *
import pulp
from itertools import chain, repeat
import pandas as pd
from itertools import cycle 
import traceback
from scipy.optimize import minimize
import numpy as np
from scipy.optimize import linprog
from collections import defaultdict
from datetime import datetime
from flask_cors import CORS


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