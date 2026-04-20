# Chapter III: Methodology

This section outlines the systematic approach followed in the design, development, and deployment of the AgriMarket platform, prioritizing scalability, security, and data accuracy.

## 3.1 Research & Requirement Gathering
The development process began with an in-depth analysis of existing agricultural supply chain inefficiencies. Key requirements were identified, including the need for a direct farmer-consumer bridge, automated soil health diagnostics, and a robust role-based authentication system.

## 3.2 System Architecture
A modular **MVC (Model-View-Controller)** pattern was adopted for the backend to ensure a clean separation of concerns. The system is divided into:
- **Client Tier**: A responsive React SPA for dynamic user interaction.
- **Application Tier**: A Node.js/Express server handling business logic and API routing.
- **Data Tier**: A MongoDB database for flexible, document-based storage.
- **AI Microservice**: A specialized Python/FastAPI service for processing machine learning requests.

## 3.3 Technological Framework (MERN Stack)
The **MERN Stack** was selected for its high performance and unified JavaScript environment:
- **MongoDB**: Used for its ability to handle complex and evolving product and user schemas.
- **Express.js & Node.js**: Provided a scalable environment for asynchronous server-side operations.
- **React.js**: Enabled the creation of a high-speed, interactive frontend using reusable components.

## 3.4 Machine Learning Pipeline
The ML methodology involved:
- **Data Acquisition**: Utilizing agricultural datasets containing N-P-K and pH soil parameters.
- **Modeling**: Training a multiclass classification model using **TensorFlow/Keras** to predict crop suitability.
- **Integration**: Deploying the model behind a REST API for real-time inference from the main backend.

## 3.5 Security & Integrity
Security measures were integrated throughout the development lifecycle:
- **Authentication**: Implementing JWT (JSON Web Tokens) with refresh token rotation.
- **Sanitization**: Using middleware to prevent NoSQL injection and XSS attacks.
- **Financial Safety**: Integrated Razorpay's secure SDK with server-side HMAC signature verification to prevent transaction tampering.

## 3.6 Testing & Deployment
The platform underwent iterative testing, focusing on API endpoints, state management consistency, and ML prediction accuracy. Deployment was executed using a combination of **Vercel** for the frontend and **AWS/PM2** for the backend to ensure high availability.
