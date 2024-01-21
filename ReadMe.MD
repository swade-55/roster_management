# Workforce Management System

## Introduction
This Workforce Management System is designed to streamline operations in workforce planning and scheduling. It includes functionalities such as associate management, working day allocation, performance metrics tracking, and optimization of schedules and resources. The system is ideal for organizations seeking efficient staff allocation and operational optimization.

## Installation
To install this application, follow these steps:

```bash
git clone [your-repository-link]
cd [repository-name]
# Install required dependencies
pip install -r requirements.txt
# Run the application
python app.py
```

Replace `[your-repository-link]` and `[repository-name]` with your actual repository details.

## Usage
To use the application, start the server using `python app.py`. The server will start on the default port 5555. The application provides several endpoints for managing associates, schedules, and metrics.

### Key Endpoints:
- **Add Associate**: `POST /add_associate`
- **Update Associate**: `PATCH /update_associate`
- **Delete Associate**: `DELETE /associate_metrics/<int:associate_id>`
- **Get Associate Metrics**: `GET /associate_metrics`
- **Generate Schedule**: `POST /generate_schedule`
- **Allocate Heads**: `POST /allocate_heads`
- **Optimize Workforce**: `POST /optimize_workforce`
- **Get Associates Working Days**: `GET /associates_working_days`

### Example Usage:
```python
# Example: Add a new associate
response = requests.post('http://localhost:5555/add_associate', json={
    "firstName": "John",
    "lastName": "Doe",
    "jobClass_id": 1,
    "metrics": [{"name": "uptime", "value": 95}]
})
print(response.json())
```

## Features
- **Associate Management**: Add, update, and delete associates along with their metrics.
- **Scheduling**: Automatically generate optimal work schedules based on demand.
- **Resource Allocation**: Efficiently allocate resources across different departments.
- **Performance Metrics**: Track and manage various performance metrics of associates.

## Contributing
Contributions to this project are welcome. Please follow these steps to contribute:
1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Commit your changes and open a pull request.

## License
This project is licensed under the MIT License - see the LICENSE file for details.

## Contact
For any queries or further information, please reach out to samuelrcwade@gmail.com.

---