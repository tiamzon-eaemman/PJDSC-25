# SAGIP: Synchronizing Action through Geohazard Information Platform

[![GitHub license](https://img.shields.io/github/license/alexgaaranes/PJDSC-25?style=for-the-badge)](LICENSE)
[![GitHub contributors](https://img.shields.io/github/contributors/alexgaaranes/PJDSC-25?style=for-the-badge)](https://github.com/alexgaaranes/PJDSC-25/graphs/contributors)

A full-stack application for the PJDSC-25 project.

By harnessing data science and real-time geohazard maps, we synchronize rescuers, evacuees, and information onto one intuitive platform, building smarter, more resilient communities from the ground up

## Core Features

- **Intelligent Hazard Dashboard**
    - This feature replaces paper maps and guesswork with a dynamic, interactive geohazard map powered by official data sources like UP NOAH and Open Hazards PH.
- **AI-Powered Evacuation Prioritization**
    - This intelligent engine analyzes multiple risk factors to create a clear, actionable hierarchy for response efforts.
- **Citizen-Facing Emergency PWA**
    - A lightweight Progressive Web App (PWA) that ensures critical information is accessible to all citizens, even with limited or no internet connectivity.
- **Synchronized Alert & Response System**
    - This is the core innovation that transforms individual tools into a unified, coordinated ecosystem.



## Tech Stack

- **Backend:** Python, FastAPI, shapely, geopandas
- **Frontend:** TypeScript, NextJS, LeafletJS

### 1. Installation

```bash
# Clone
git clone https://github.com/alexgaaranes/PJDSC-25.git
cd PJDSC-25

# Backend
cd backend/
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt

# Frontend
cd ../frontend/
npm install
```

### 2. Execution

```bash
# Backend
cd backend/
node mock-server.js &

# Frontend
cd ../frontend/
npm run dev
```

Open `http://localhost:3000`