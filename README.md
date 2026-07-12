# Transitops-smart-transport-operations-platform
# TransitOps - Smart Transport Operations Platform

## Overview

TransitOps is a centralized fleet and transport management platform designed to digitize and automate logistics operations. The platform manages the complete lifecycle of transport operations including vehicle management, driver management, trip dispatching, maintenance tracking, fuel logging, expense monitoring, and operational analytics.

The system eliminates dependency on spreadsheets and manual records by providing real-time visibility into fleet activities and enforcing business rules automatically.

---

## Problem Statement

Many transport and logistics companies still rely on manual processes to manage their operations, which often leads to:

* Scheduling conflicts
* Underutilized vehicles
* Missed maintenance schedules
* Expired driver licenses
* Incorrect expense tracking
* Poor operational visibility

TransitOps addresses these challenges through a unified digital platform.

---

## Features

### Authentication & Authorization

* Secure Login using JWT Authentication
* Role-Based Access Control (RBAC)
* Protected Routes

Supported Roles:

* Fleet Manager
* Dispatcher
* Safety Officer
* Financial Analyst

---

### Dashboard

* Active Vehicles
* Available Vehicles
* Vehicles in Maintenance
* Active Trips
* Pending Trips
* Drivers On Duty
* Fleet Utilization Percentage
* Operational Cost Overview

---

### Vehicle Management

* Vehicle Registration
* Vehicle Status Tracking
* Odometer Monitoring
* Load Capacity Management
* Acquisition Cost Tracking

Vehicle Status:

* Available
* On Trip
* In Shop
* Retired

---

### Driver Management

* Driver Profiles
* License Validation
* Safety Score Tracking
* Driver Availability Monitoring

Driver Status:

* Available
* On Trip
* Off Duty
* Suspended

---

### Trip Management

* Trip Creation
* Vehicle Assignment
* Driver Assignment
* Cargo Validation
* Distance Tracking
* Trip Lifecycle Management

Trip States:

* Draft
* Dispatched
* Completed
* Cancelled

---

### Maintenance Management

* Maintenance Scheduling
* Service History Tracking
* Vehicle Downtime Monitoring
* Automatic Status Updates

---

### Fuel & Expense Tracking

* Fuel Log Management
* Toll Tracking
* Maintenance Expenses
* Operational Cost Calculation

---

### Reports & Analytics

* Fuel Efficiency
* Fleet Utilization
* Operational Cost Analysis
* Vehicle ROI Calculation
* CSV Export
* PDF Export

---

## Business Rules

* Vehicle registration number must be unique.
* Vehicles marked as Retired or In Shop cannot be assigned to trips.
* Drivers with expired licenses cannot be assigned to trips.
* Suspended drivers cannot be assigned to trips.
* Vehicles already on a trip cannot be assigned again.
* Drivers already on a trip cannot be assigned again.
* Cargo weight cannot exceed vehicle capacity.
* Dispatching a trip automatically updates vehicle and driver status to On Trip.
* Completing a trip restores vehicle and driver status to Available.
* Maintenance automatically moves vehicles to In Shop status.

---

## Technology Stack

### Frontend

* React.js
* Vite
* Tailwind CSS

* React Router DOM

* Recharts

### Backend

* Node.js
* Express.js
* JWT Authentication
*

### Database

* MongoDB Atlas
* Mongoose ODM

### Deployment

* Vercel
* Render

---

## Project Structure

```text
TransitOps
│
├── frontend
│   ├── components
│   ├── pages
│   ├── services
│   ├── hooks
│   ├── context
│   └── utils
│
├── backend
│   ├── models
│   ├── routes
│   ├── controllers
│   ├── middleware
│   ├── config
│   └── server.js
│
└── README.md
```

---

## Installation

### Clone Repository

```bash
git clone <repository-url>
```

### Backend Setup

```bash
cd backend
npm install
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

## Environment Variables

Backend:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
```

Frontend:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## Sample Indian Dataset

### Vehicle Examples

* MH12AB4589 - Tata Ace Gold
* MH14CX9021 - Tata 407 Gold
* KA01MN4421 - Eicher Pro 2049

### Driver Examples

* Ramesh Patil
* Suresh Shinde
* Rahul Chavan
* Amit Jadhav

### Sample Routes

* Pune → Mumbai
* Mumbai → Nashik
* Bengaluru → Chennai
* Delhi → Jaipur

---

## Future Enhancements

* AI-based route optimization
* Predictive maintenance
* GPS tracking integration
* Driver behavior analysis
* Mobile application
* IoT-based fuel monitoring

---

## Contributors

## Contributors

This project was developed as part of a Hackathon project focused on smart logistics and fleet digitization.

### Team Members

#### Aditya Kadwade

* Role: Full Stack Developer
* Email: [adityakadwade6@gmail.com](mailto:adityakadwade6@gmail.com)

#### Pushkar Jawale

* Role: Full Stack Developer
* Email: [pushkarjawale25@gmail.com](mailto:pushkarjawale25@gmail.com)

---

Developed with dedication towards building smarter and more efficient transport operations for the Indian logistics industry.


---

## License

This project is developed for educational and hackathon purposes.## Demo Credentials

Use the following credentials to access the application during demonstration:

### Fleet Manager Account

| Field    | Value                                               |
| -------- | --------------------------------------------------- |
| Email    | [fleet@transitops.com](mailto:fleet@transitops.com) |
| Password | Fleet@123                                           |
| Role     | Fleet Manager                                       |

> These credentials are provided for demonstration and hackathon evaluation purposes only.
