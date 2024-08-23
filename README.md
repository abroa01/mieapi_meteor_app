# Meteor API Integration App

## Table of Contents
1. [Introduction](#introduction)
2. [Features](#features)
3. [Technology Stack](#technology-stack)
4. [Project Structure](#project-structure)
5. [Prerequisites](#prerequisites)
6. [Installation](#installation)
7. [Running the Application](#running-the-application)
8. [Usage](#usage)
9. [Deployment](#deployment)
10. [Contributing](#contributing)
11. [Troubleshooting](#troubleshooting)
12. [Contact](#contact)

## Introduction

The Meteor API Integration App is a robust web application built with Meteor and React. It provides a user-friendly interface for authenticating users and interacting with external APIs. This application is designed to streamline the process of making GET and PUT requests to specified APIs, with built-in session management and logging capabilities.

## Features

- **User Authentication**: Secure login system with session management.
- **API Integration**: Seamless interaction with external APIs.
- **GET and PUT Requests**: Ability to perform GET and PUT operations on specified APIs.
- **React-based UI**: Modern, responsive user interface built with React.
- **Session Management**: Efficient handling of user sessions for improved security.
- **Logging System**: Comprehensive logging for tracking application events and errors.
- **Error Handling**: Robust error handling and user feedback mechanisms.

## Technology Stack

- **Framework**: Meteor
- **Frontend**: React
- **Authentication**: Custom implementation using bcrypt accounts-password account-base and meteor users
- **API Integration**: mieapi
- **Logging**: winston
- **Package Management**: npm

## Project Structure

```
meteor-app/
├── client/
│   ├── main.jsx         # Client entry point
│   └── main.css         # Main CSS file
├── imports/
│   ├── api/
│   │   └── links.js     # API endpoints
│   └── ui/
│       ├── App.jsx      # Main App component
│       ├── MainComponent.jsx  # Main routing component
│       ├── Login.jsx    # Login component
│       └── Home.jsx     # Home page component
├── server/
│   └── main.js          # Server entry point
├── public/              # Public assets
├── tests/               # Test files
├── package.json         # Project dependencies
└── README.md            # Project documentation
```

## Prerequisites

- Node.js (version 14 or later)
- Meteor (latest version)

## Installation

1. Install Meteor if you haven't already:
   ```
   curl https://install.meteor.com/ | sh
   ```

2. Clone the repository:
   ```
   git clone https://github.com/abroa01/mieapi_meteor_app.git
   cd meteor-app
   ```

3. Install dependencies:
   ```
   meteor npm install
   ```

2. Update the `apiUrl` and `secretKey` with your specific values.

## Running the Application

To start the application in development mode:

```
meteor run --settings settings.json
```

The application will be available at `http://localhost:3000` by default.

## Usage

1. **Home Page**: Enter your user handle on the home page.
2. **Login**: Use your credentials to log in.
3. **API Interaction**:
   - Enter the API name in the designated field.
   - For GET requests, click the "Get Api" button.
   - For PUT requests, enter the JSON payload in the text area and click the "Put Api" button.
4. **Logout**: Click the "Logout" button to end your session.

## Deployment

To deploy the application:

1. Set up your Meteor Up (mup) configuration.
2. Run `mup deploy` to deploy to your server.

Refer to the [Meteor deployment guide](https://guide.meteor.com/deployment.html) for more detailed instructions.

```
## Contributing

We welcome contributions to the Meteor API Integration App! Please follow these steps:

1. Fork the repository.
2. Create a new branch: `git checkout -b feature-branch-name`.
3. Make your changes and commit them: `git commit -m 'Add some feature'`.
4. Push to the branch: `git push origin feature-branch-name`.
5. Submit a pull request.

Please ensure your code adheres to our coding standards and includes appropriate tests.

## Troubleshooting

- If you encounter CORS issues, ensure your API server is configured to accept requests from your application's domain.
- For authentication problems, verify that you're using the correct credentials and that your session hasn't expired.
- If you experience performance issues, check your API response times and consider implementing caching mechanisms.


## Contact

For support or queries, please contact me at [abrol.anshul10gmail.com].
