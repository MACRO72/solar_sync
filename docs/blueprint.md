# **App Name**: SolarIntel

## Core Features:

- Real-Time Monitoring: Display real-time data for system efficiency, energy output, dust index, temperature, and overall system health score.
- Device Management: Show ESP32 node statuses with live telemetry, geographical location on a map, and maintenance schedules.
- Predictive Maintenance: Employ AI to predict efficiency drops and schedule maintenance, using sensor data and historical trends. AI is used as a tool for assisting in detecting important patterns in sensor data.
- Historical Data Analysis: Present interactive charts showing actual vs. predicted performance over time.
- Alerting and Notifications: Configure Firebase Cloud Messaging to deliver real-time alerts for AI-detected events and maintenance reminders.
- Data Ingestion: Accept REST API calls with sensor data originating from IOT devices, persist that data in a Firebase database for further processing and analysis.
- User Authentication: Implement Firebase Authentication for secure user and role management, controlling access to sensitive data and functions.

## Style Guidelines:

- Primary color: Deep blue (#3F51B5) to reflect reliability and technological precision, contrasting with the semi-transparent glass morphism.
- Background color: Dark blue-gray (#263238) providing a sophisticated, unobtrusive backdrop for data visualization, in a dark scheme.
- Accent color: Cyan (#00BCD4) to highlight interactive elements and alerts, ensuring visibility against the dark background.
- Body and headline font: 'Inter' for a modern and neutral design that is easy to read.
- Use flat, line-style icons that are colour-coded to represent the status of devices and severity of alerts.
- Employ glass morphism for cards/sections, creating a modern look with semi-transparent backgrounds, backdrop blur, and subtle glowing borders.
- Use smooth transitions and animations to provide feedback on user interactions and data updates.