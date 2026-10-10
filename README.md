Problem Statement

Every day across India, people face emergencies — road accidents, fires, medical crises, floods — in public spaces where bystanders either don’t know how to help or hesitate to act. There is no structured, fast, community-driven system to connect people in crisis with skilled volunteers nearby. Emergency services like 108 take time. Crisis Connect fills that gap.

What is Crisis Connect?

Crisis Connect is a full-stack web application built as a community-powered emergency response network. When someone faces a crisis they log in, describe the situation, pin their exact location on a live map, and send an alert. Every registered volunteer within the area receives an instant real-time notification and can choose to respond. The platform tracks the entire lifecycle of a crisis — from alert to resolution — with full transparency for all parties.

Key Features

For Requesters

Submit a crisis alert in under 30 seconds
Choose crisis type — Fire, Medical, Accident, Flood, Power Cut, Other
Set severity level — Critical, Moderate, Low
Pin exact location using an interactive Leaflet map with live coordinate tracking
Add landmarks for precise location description
View history of all past requests with status tracking

For Volunteers

Live crisis feed showing all open alerts near them
Filter alerts by severity
Real-time toast notifications via Socket.io when a new crisis is submitted
One-click response — marks them as en route
Toggle availability on and off
View personal response history

For Admins

Full command center dashboard
Live stats — total requests, open, assigned, resolved
Resolution rate progress bar
Searchable, filterable table of all requests
Update any request status directly from the dashboard
Auto-refreshes every 15 seconds
Tech Stack
Layer	Technology
Frontend	React.js, React Router, Axios
Styling	Custom CSS-in-JS dark theme
Maps	Leaflet.js + OpenStreetMap
Backend	Node.js, Express.js
Real-time	Socket.io
Database	MySQL
Auth	JWT + bcryptjs
Environment	dotenv
Database Design

The system uses a relational MySQL database with 6 core tables — users, crisis_requests, volunteer_responses, skills, volunteer_skills, and a notifications log. Key design decisions include storing precise GPS coordinates as DECIMAL(9,6) for accuracy, using ENUM types for role, severity and status fields for data integrity, and implementing the Haversine formula in SQL to find volunteers within a geographic radius.

Real-time Architecture

Socket.io powers the live alert system. When a requester submits a crisis, the backend emits a new_crisis event to all connected volunteer sockets. Volunteers who have joined the volunteers room receive an instant toast notification with crisis details without refreshing the page. This reduces response time significantly compared to polling-based systems.

Social Impact

Bystander apathy is a documented social phenomenon where people in a crowd are less likely to help someone in need. Crisis Connect breaks this by giving people a structured, low-friction way to respond. It also builds a verified volunteer network with skill tags — ensuring the right help reaches the right crisis.

What makes it unique
Precise GPS location pinning with reverse geocoding — volunteers know exactly where to go
Real-time Socket.io alerts — zero delay between crisis submission and volunteer notification
Severity-based prioritisation — critical alerts are visually distinct and respond-button turns red
Complete crisis lifecycle tracking — Open → Assigned → Resolved with timestamps
Role-based access — requesters, volunteers, and admins each see a different interface
Dark professional UI designed for high-stress emergency situations — readable at a glance
Future Scope
Mobile app with push notifications
Haversine-based nearby volunteer matching — only alert volunteers within 5km
Volunteer skill matching — medical emergencies routed to first-aid certified volunteers
SMS alerts via Twilio for offline volunteers
Government/NGO integration for large-scale disaster response
AI-based crisis severity auto-detection from description text
