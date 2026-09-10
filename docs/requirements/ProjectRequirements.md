# Project Instructions

## Project Overview

You will work as part of a development team to build a complete
full-stack web application.

Your application will consist of a Spring Boot REST API backend and a
React frontend that communicate through HTTP requests. The backend will
manage business logic, authentication, authorization, and data
persistence, while the frontend will provide a responsive and intuitive
user interface.

Your team is responsible for selecting the theme of the application. The
chosen theme should provide enough functionality to demonstrate
meaningful user interaction, secure authentication, CRUD operations, and
data relationships.

Examples include:

-   Project Management
-   Event Planning
-   E-Commerce
-   Social Media
-   Fitness Tracking
-   Learning Management
-   Inventory Management
-   Restaurant Ordering
-   Travel Planning
-   Library Management

***NOTE: You may NOT use any of the following themes***
- Banking Application (Project 1 Theme)
- Music (Project 2 Theme)
- Nasa (Project 2 Theme)
- Cryptocurrency (Project 2 Theme)
- Movie (Project 2 Theme)
- Finance (Project 2 Theme)

The application should demonstrate modern full-stack development
practices while emphasizing clean architecture, maintainable code,
security, and collaboration.

This project will be completed in development teams of seven (7) associates.
Team members should collaborate on the application's architecture, design,
implementation, testing, and documentation while using Git to manage
shared development.

## Team Assignments

### Team 1 | Restaurant Ordering
- **_Sergio Rodriguez_** | Team Lead
- Angel Jude Diones
- Frances Hogg
- Samuel Cheng
- Heriberto Alonso
- Michael Straus
- Conor Yosick

### Team 2 | Ticketmaster
- **_Winona Sharp_** | Team Lead
- Carlos Rivera
- Jonathan Banda
- Christopher Vi
- Bassem Michael
- Timmy Nguyen
- Anmoldeep Sandhu

## Tools and Technologies Used

### Required Technologies

-   Java
-   Spring Boot
-   Spring Web
-   Spring Data JPA
-   Spring Security
-   PostgreSQL
-   React
-   JavaScript (ES6+)
-   React Router
-   Axios or Fetch API
-   Maven
-   Git
-   GitHub

### Required Concepts

-   Object-Oriented Programming
-   RESTful APIs
-   Layered Architecture
-   Spring Dependency Injection
-   Entity Relationships
-   Authentication and Authorization
-   Password Hashing
-   CRUD Operations
-   React Components
-   React Hooks
-   Client-side Routing
-   Form Validation
-   State Management
-   API Integration
-   Unit Testing

## Suggested Architecture

### React Frontend

Responsibilities include: - Providing the application's user interface -
Managing navigation and routing - Managing client-side authentication
state - Consuming backend REST APIs - Validating user input - Displaying
application data and user feedback

### Controller Layer

Responsibilities include: - Exposing REST endpoints - Handling HTTP
requests and responses - Validating incoming requests - Delegating
business operations to the service layer - Returning appropriate HTTP
status codes

### Service Layer

Responsibilities include: - Implementing business logic - Managing
authentication and authorization - Validating application rules -
Coordinating multiple repository operations - Processing application
workflows

### Data Access Layer

Responsibilities include: - Managing data persistence using Spring Data
JPA - Creating repository interfaces - Retrieving and storing
application data - Managing entity relationships - Supporting CRUD
operations

### Model Layer

Responsibilities include: - Defining application entities - Managing
entity relationships - Representing business data - Supporting
persistence through JPA annotations

### Security Layer

Responsibilities include: - Authenticating users - Protecting secured
endpoints - Managing password hashing - Enforcing authorization rules -
Preventing unauthorized access

## Instructions

1.  **Plan the Application**\
    Work with your team to select an application theme, identify the
    core entities, define project scope, and assign responsibilities.

2.  **Set Up the Backend**\
    Create a Spring Boot application using Spring Web, Spring Data JPA,
    Spring Security, and PostgreSQL.

3.  **Design the Database**\
    Design a relational database that supports the application's
    entities and relationships.

4.  **Develop the REST API**\
    Implement REST endpoints that support authentication and CRUD
    operations for the application's primary resources.

5.  **Implement Authentication**\
    Secure the application using Spring Security. Passwords must be
    securely hashed before being stored in the database, and protected
    endpoints should require authentication.

6.  **Build the React Frontend**\
    Develop a responsive React application that communicates with the
    backend through REST APIs.

7.  **Integrate the Frontend and Backend**\
    Connect the React application to the Spring Boot API and ensure all
    functionality operates correctly across both applications.

8.  **Validate and Test the Application**\
    Validate user input, handle application errors gracefully, and
    create automated tests for critical backend functionality.

9.  **Document the Project**\
    Create a README describing the project overview, architecture,
    technologies used, database design, API endpoints, installation,
    execution, testing, and team member contributions.

## User Stories

### Authentication

-   US-01: As a user, I want to register for an account so that I can
    access the application.
-   US-02: As a user, I want to log in securely so that I can access
    protected features.
-   US-03: As a user, I want my password to be stored securely.
-   US-04: As a user, I want to log out so that my session ends
    securely.

### User Management

-   US-05: As a user, I want to manage my account information.
-   US-06: As a user, I want my personal information to be protected
    from unauthorized users.

### Application Features

-   US-07: As a user, I want to create new records within the
    application.
-   US-08: As a user, I want to view existing records.
-   US-09: As a user, I want to update records that I own or have
    permission to modify.
-   US-10: As a user, I want to delete records that I own or have
    permission to remove.

### User Experience

-   US-11: As a user, I want responsive navigation across pages.
-   US-12: As a user, I want clear validation and error messages
    whenever an operation fails.
-   US-13: As a user, I want the application to display loading
    indicators while requests are processing.

### Data Management

-   US-14: As a user, I want application data to persist between
    sessions.
-   US-15: As an application owner, I want data stored securely within a
    relational database.

## Project Requirements Checklist

-   Project is built as a full-stack application consisting of a Spring
    Boot backend and React frontend with a clean, maintainable
    architecture.
-   Backend implements layered architecture using Controllers, Services,
    Repositories, Models, and appropriate configuration.
-   Application uses Spring Data JPA with PostgreSQL to manage data
    persistence and entity relationships.
-   Application implements secure authentication and authorization using
    Spring Security, with passwords stored as hashed values.
-   React frontend integrates successfully with the backend REST API and
    provides a responsive, intuitive user experience.
-   Application implements all user stories while enforcing business
    rules, validation, exception handling, and appropriate HTTP
    responses.
-   Application demonstrates clean, maintainable, and well-documented
    code following Java, Spring, and React best practices.
-   Application includes a comprehensive suite of automated tests
    covering critical backend functionality.
-   Project includes a complete README with architecture, setup
    instructions, API documentation, database configuration, and team
    member responsibilities.
-   Project is maintained in a shared Git repository with meaningful
    commit history demonstrating consistent contributions from all team
    members.
