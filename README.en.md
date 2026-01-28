# Teacher Video Club Frontend Project

## Project Overview

The Teacher Video Club is a frontend project designed for educational scenarios, serving as a video learning and communication platform. It provides functional modules including club management, video tasks, and learning progress tracking. This project is implemented using a pure frontend technology stack and interacts with backend API services to handle business logic.

## Main Features

### User Module
- **User Registration/Login**: Supports privacy agreement confirmation and password strength validation
- **Profile Management**: Complete personal information to earn points, including name, gender, age, school, and contact details
- **User Authentication**: Token-based authentication mechanism

### Club Module
- **Club List**: Displays all available clubs for joining
- **Create Club**: Set club name, description, membership criteria, etc.
- **Club Details**: View detailed club information
- **Join/Leave Club**: Submit membership applications or exit existing clubs
- **Club Management**: Edit club information, archive, or disband clubs

### Video Task Module
- **Task List**: View published learning tasks
- **Task Details**: View task requirements and unlock times
- **Task Completion Status**: Track progress on task completion

### Notification System
- **Message List**: View system notifications and approval messages
- **Membership Approval**: Process user join applications
- **Message Read Management**: Mark individual or all messages as read

## Project Structure

```
frontend/
├── .gitee/                  # Gitee platform configuration
│   ├── ISSUE_TEMPLATE.zh-CN.md
│   └── PULL_REQUEST_TEMPLATE.zh-CN.md
├── css/
│   └── styles.css           # Global stylesheet
├── js/
│   ├── api.js               # API interface encapsulation
│   ├── app.js               # Application entry and initialization
│   ├── auth.js              # Authentication-related logic
│   ├── clubs.js             # Club functionality module
│   ├── notifications.js     # Notification functionality module
│   ├── profile.js           # Profile module
│   ├── tasks.js             # Task management module
│   └── utils.js             # Utility functions
├── pages/
│   ├── home.html            # Homepage with club list
│   ├── login.html           # Login page
│   ├── register.html        # Registration page
│   ├── profile.html         # Profile page
│   ├── tasks.html           # Task list page
│   ├── video.html           # Video task page
│   └── notifications.html   # Notification messages page
├── index.html               # Main entry file
├── config.js                # Configuration file
└── api-doc.md               # Backend API documentation
```

## Technology Stack

- **HTML5**: Page structure
- **CSS3**: Styling, including responsive layouts
- **JavaScript (ES6+)**: Business logic implementation
- **Fetch API**: Network requests
- **Gitee**: Code hosting platform

## Quick Start

### Prerequisites

- Modern browser (Chrome, Firefox, Edge, etc.)
- Local server (for development environment)
- Backend API service (refer to `api-doc.md` for configuration)

### Local Setup

1. Clone the project locally:
```bash
git clone https://gitee.com/videoclub/frontend.git
```

2. Run using a local server (e.g., VS Code Live Server extension or Python's http.server)

3. Access the application in your browser at the corresponding address

### Configuration

Update the backend API endpoint in `config.js`:

```javascript
// API base URL configuration
const API_BASE_URL = 'your-api-server-address';
```

## Page Descriptions

| Page | Path | Description |
|------|------|-------------|
| Login | `/pages/login.html` | User login entry point |
| Register | `/pages/register.html` | New user registration |
| Home | `/pages/home.html` | Club list and join entry |
| Profile | `/pages/profile.html` | Personal information management |
| Tasks | `/pages/tasks.html` | List of learning tasks |
| Video | `/pages/video.html` | Video task details |
| Notifications | `/pages/notifications.html` | Message notifications and approvals |

## API Documentation

Complete backend API documentation is available in `api-doc.md`, covering the following modules:

- Authentication (registration, login)
- User (profile management, club list)
- Clubs (creation, editing, management)
- Video (upload, list, details)
- Comments (comment functionality)
- Tasks (publish, submit, list)
- Statistics (log reporting)
- In-App Messaging (message management)

## Browser Support

- Chrome (latest version)
- Firefox (latest version)
- Edge (latest version)
- Safari (latest version)

## Contribution Guidelines

1. Fork this project
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m 'Add some feature'`
4. Push to branch: `git push origin feature/your-feature`
5. Submit a Pull Request

When submitting a Pull Request, please follow the template in `.gitee/PULL_REQUEST_TEMPLATE.zh-CN.md` to provide relevant information.

## License

This project is intended solely for learning and communication purposes.

## Changelog

Refer to the changelog section in `api-doc.md`.