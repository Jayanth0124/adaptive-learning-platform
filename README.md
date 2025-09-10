
# Adaptive Quiz Application

## Project Description

This is a comprehensive adaptive quiz application built with React, TypeScript, and Firebase. It provides an intelligent learning platform that adapts quiz difficulty based on student performance, featuring role-based access for administrators, teachers, and students. The application uses machine learning principles to optimize learning experiences through dynamic question selection and performance analytics.

## Features

### Core Functionality
- **Adaptive Learning Engine**: Dynamically adjusts quiz difficulty based on student performance metrics
- **Role-Based Access Control**: Separate interfaces for Admin, Teacher, and Student roles
- **Real-time Performance Tracking**: Comprehensive analytics on student progress and quiz attempts
- **Intelligent Question Pool**: Categorized questions with difficulty levels (easy, medium, hard)
- **Notification System**: In-app notifications for important updates and achievements

### User Roles & Capabilities

#### Admin Features
- User management (create, update, delete users)
- System settings configuration
- Global analytics and performance monitoring
- Question pool management
- Teacher and student oversight

#### Teacher Features
- Student performance analytics
- Question management and creation
- Class progress monitoring
- Adaptive settings adjustment
- Student fit score analysis

#### Student Features
- Personalized quiz taking experience
- Performance dashboard with detailed statistics
- Progress tracking across categories
- Adaptive difficulty adjustment
- Achievement notifications

### Technical Features
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Real-time Data**: Firebase Firestore for live data synchronization
- **Type Safety**: Full TypeScript implementation
- **Modern Build Tools**: Vite for fast development and optimized builds
- **Component Architecture**: Modular React components with clean separation of concerns

## Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Backend/Database**: Firebase (Firestore)
- **Icons**: Lucide React
- **State Management**: React hooks with local state
- **Development Tools**: ESLint, PostCSS, Autoprefixer

## Prerequisites

Before running this application, ensure you have the following installed:

- **Node.js**: Version 16.0.0 or higher
- **npm** or **yarn**: Package manager
- **Git**: For version control
- **Firebase Account**: Google account for Firebase project setup

## Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd <project-directory>
   ```

2. **Install dependencies**:
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables** (see Firebase Setup section below)

4. **Start the development server**:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

The application will be available at `http://localhost:5173`

## Firebase Setup

### Step 1: Create a Firebase Project

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter your project name
4. Choose whether to enable Google Analytics (optional)
5. Click "Create project"

### Step 2: Enable Firestore Database

1. In your Firebase project console, navigate to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" for development (you can change security rules later)
4. Select a location for your database
5. Click "Done"

### Step 3: Get Firebase Configuration

1. In the Firebase console, click the gear icon → "Project settings"
2. Scroll down to "Your apps" section
3. Click the "</>" icon to add a web app
4. Register your app with a nickname
5. Copy the Firebase configuration object

### Step 4: Set Up Authentication (Optional but Recommended)

1. In Firebase console, go to "Authentication"
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable desired authentication providers (Email/Password, Google, etc.)

### Step 5: Configure Security Rules

For production, update Firestore security rules in the Firebase console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write for authenticated users
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Environment Variables

Create a `.env` file in the root directory of your project and add the following variables with your Firebase configuration:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

**Important Notes:**
- All environment variables must be prefixed with `VITE_` for Vite to expose them to the client-side code
- Never commit the `.env` file to version control
- Add `.env` to your `.gitignore` file

## Running the Application

### Development Mode
```bash
npm run dev
# or
yarn dev
```

This starts the Vite development server with hot module replacement.

### Production Build
```bash
npm run build
# or
yarn build
```

This creates an optimized production build in the `dist` directory.

### Preview Production Build
```bash
npm run preview
# or
yarn preview
```

This serves the production build locally for testing.

### Linting
```bash
npm run lint
# or
yarn lint
```

Runs ESLint to check for code quality issues.

## Usage

### First Time Setup
1. Ensure Firebase is properly configured with environment variables
2. Run the application in development mode
3. Create an admin user through the signup process
4. Use the admin account to create teacher and student accounts

### User Workflow

#### Admin User
1. **Login** with admin credentials
2. **User Management**: Create teachers and students
3. **Settings**: Configure adaptive learning parameters
4. **Analytics**: Monitor overall system performance
5. **Question Management**: Add/edit quiz questions

#### Teacher User
1. **Login** with teacher credentials
2. **Student Analytics**: View performance data for all students
3. **Question Oversight**: Review and manage question pool
4. **Settings Adjustment**: Fine-tune adaptive parameters

#### Student User
1. **Login** with student credentials
2. **Take Quiz**: Start adaptive quiz session
3. **View Dashboard**: Check personal performance metrics
4. **Track Progress**: Monitor improvement over time

### Adaptive Learning System

The application uses an intelligent algorithm that:
- Analyzes student performance patterns
- Adjusts question difficulty dynamically
- Balances question categories
- Calculates "fit scores" for optimal learning paths
- Provides personalized feedback

## Project Structure

```
<project-directory>/
├── public/                 # Static assets
├── src/
│   ├── components/         # React components
│   │   ├── AdminDashboard.tsx
│   │   ├── TeacherDashboard.tsx
│   │   ├── StudentHome.tsx
│   │   ├── QuizInterface.tsx
│   │   ├── LoginPage.tsx
│   │   └── ...
│   ├── services/           # Business logic services
│   │   ├── authService.ts
│   │   ├── quizService.ts
│   │   ├── performanceService.ts
│   │   ├── adaptiveEngine.ts
│   │   └── ...
│   ├── types/              # TypeScript type definitions
│   │   └── index.ts
│   ├── data/               # Static data files
│   │   ├── users.ts
│   │   └── questionPool.ts
│   ├── hooks/              # Custom React hooks
│   │   └── useLocalStorage.ts
│   ├── firebase.ts         # Firebase configuration
│   ├── App.tsx             # Main application component
│   ├── main.tsx            # Application entry point
│   └── index.css           # Global styles
├── package.json            # Dependencies and scripts
├── vite.config.ts          # Vite configuration
├── tailwind.config.js      # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
└── README.md               # This file
```

## Key Components Explanation

### Services Layer
- **AuthService**: Handles user authentication and authorization
- **QuizService**: Manages quiz generation and question selection
- **PerformanceService**: Tracks and analyzes student performance
- **AdaptiveEngine**: Core algorithm for adaptive learning
- **SettingsService**: Manages application configuration
- **NotificationService**: Handles in-app notifications

### Component Architecture
- **Role-based Components**: Separate UIs for different user types
- **Reusable Components**: Modular design for maintainability
- **State Management**: Local state with React hooks
- **Responsive Design**: Mobile-first with Tailwind CSS

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Use functional components with hooks
- Maintain consistent code formatting
- Add proper error handling
- Write clear commit messages
- Test thoroughly before submitting PRs

## Troubleshooting

### Common Issues

1. **Firebase Connection Issues**
   - Verify environment variables are correctly set
   - Check Firebase project configuration
   - Ensure Firestore security rules allow access

2. **Build Errors**
   - Clear node_modules: `rm -rf node_modules && npm install`
   - Check TypeScript errors: `npm run lint`
   - Verify all dependencies are installed

3. **Authentication Problems**
   - Confirm Firebase Authentication is enabled
   - Check user roles in Firestore
   - Verify login credentials

4. **Performance Issues**
   - Check browser console for errors
   - Verify Firebase queries are optimized
   - Monitor network requests

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Create an issue in the GitHub repository
- Check the troubleshooting section above
- Review Firebase documentation for backend issues

## Future Enhancements

- [ ] Real-time collaborative quizzes
- [ ] Advanced analytics with data visualization
- [ ] Mobile app development (React Native)
- [ ] Integration with learning management systems
- [ ] AI-powered question generation
- [ ] Multi-language support
- [ ] Offline quiz capabilities

---

**Note**: This application is designed for educational purposes and demonstrates modern web development practices with adaptive learning concepts.
