# Student Monitoring System

## Overview

This project provides a computational framework for detecting and analyzing students' continuous emotions in a real-time online classroom environment.  
It features a video conferencing system developed using **WebRTC**, combined with a **Convolutional Neural Network (CNN)** model to predict emotional valence and arousal values of students.  
These predicted values are further mapped to five key emotional states — **neutral**, **bored**, **confused**, **hopeful**, and **curious** — that are crucial in the context of online learning environments.

<br/>

![architecture](https://github.com/innocentmchry/studentmonitoring/blob/main/New%20System%20Arch.png)

---

## Results

Below are some screenshots of the real-time student emotion monitoring dashboard developed as part of this project:

### Real-Time Monitoring

- Displays live emotional states of each student.
- Tracks continuous valence and arousal values per participant.
- Reports five learning centered emotional states: **Neutral**, **Bored**, **Confused**, **Hopeful**, **Curious**.

![dashboard](https://github.com/innocentmchry/studentmonitoring/blob/ad2e5f6f6aa592aa315d6227ce3ae2937b268768/image1.png)

### Summary View

- Aggregates emotional states across all students.
- Provides overall classroom emotion trends during the session.
- Useful for instructors to assess collective engagement and adjust teaching strategies.

![summary](https://github.com/innocentmchry/studentmonitoring/blob/ad2e5f6f6aa592aa315d6227ce3ae2937b268768/image2.png)

---

The dashboard is designed to assist online instructors by offering both **individual real-time tracking** and **aggregate session analysis** to better understand students' emotions during classes.


## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/innocentmchry/studentmonitoring.git
   cd studentmonitoring
   ```

2. Create a virtual environment (recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows use: venv\Scripts\activate
   ```

3. Install the project dependencies:
   ```bash
   pip install -r requirements.txt
   ```

---

## Running the Project

### 1. Development Server (for testing locally)

Start the Django development server:
```bash
python manage.py runserver
```
By default, it runs on `http://127.0.0.1:8000/`.

> Make sure you are inside the directory containing `manage.py` when you run this.

---

### 2. Production Server (using Gunicorn)

First, ensure Gunicorn is installed.

Then, run the project using Gunicorn:
```bash
gunicorn studentmonitoring.wsgi:application --bind 0.0.0.0:8000 --workers 3
```

- `studentmonitoring` is the Django project folder name.
- `--workers 3` suggests using 3 worker processes (you can adjust based on CPU cores).
- `--bind 0.0.0.0:8000` makes the server available publicly if deployed on a remote machine.

You can combine it with **Nginx** for reverse proxying and **Supervisor** for process management for production environments (optional).

---

## Deployment Notes

- Set `DEBUG = False` in your Django `settings.py` during production.
- Set up `ALLOWED_HOSTS` properly in `settings.py`.
- Collect static files:
  ```bash
  python manage.py collectstatic
  ```
- Use a production-grade database (e.g., PostgreSQL) if scaling beyond local use.
- Configure SSL if deploying publicly.

---

## How to Cite

If you use this code or build upon it, please cite the following:

```bibtex
@ARTICLE{10969593,

  author={Mochahari, Innocent Dengkhw and Brahma, Sanjiu Raja and Maity, Ranjan},

  journal={Complex System Modeling and Simulation}, 

  title={An approach to detect and analyze continuous emotions in a real-time online classroom}, 

  year={2025},

  volume={},

  number={},

  pages={1-16},

  keywords={Real-time systems;Face recognition;Videoconferences;Electronic learning;Education;Computational modeling;Analytical models;Streaming media;Feature extraction;Face detection;Real-time emotion analysis;Dimensional emotion analysis;Classroom analytics;Post-class summary;Emotion-aware video conferencing},

  doi={10.23919/CSMS.2025.0008}}

```
