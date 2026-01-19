
# Elderly Care App

A React Native application built with Expo for managing elderly care tasks and resident information.

## Features

- **Authentication**: Secure login via Supabase
- **Home Dashboard**: Overview of care activities
- **Task Management**: Track and manage daily tasks
- **Upcoming Tasks**: View scheduled tasks
- **Resident Management**: Add and manage resident profiles
- **Settings**: User preferences and configuration

## Tech Stack

- **React Native** with Expo
- **Navigation**: React Navigation (Stack & Bottom Tab)
- **Backend**: Supabase
- **UI Icons**: Material Icons
- **Notifications**: React Native Toast Message
- **Safe Area**: Safe Area Context

## Getting Started

### Prerequisites
- Node.js and npm
- Expo CLI

### Installation

```bash
npm install
npx expo start
```

### Project Structure

```
├── screens/
│   ├── LoginScreen.js
│   ├── HomeScreen.js
│   ├── TasksScreen.js
│   ├── UpcomingTasksScreen.js
│   ├── SettingsScreen.js
│   └── AddResidentScreen.js
├── supabase/
│   └── supabaseClient.js
├── App.js
└── app.json
```

## Navigation

- **Login**: Authentication entry point
- **MainTabs**: Home, Tasks, and Upcoming tabs
- **Settings**: User settings screen
- **AddResident**: Resident management screen