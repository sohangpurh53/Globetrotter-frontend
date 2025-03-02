# Globetrotter Challenge Frontend

A React-based frontend for the Globetrotter Challenge travel guessing game, built with Vite, Chakra UI, and modern React practices.

## Features

- **Interactive Game Experience**: Guess famous destinations based on cryptic clues
- **Multiple Choice Options**: Choose from 4 destination options (1 correct, 3 random)
- **Visual Feedback**: Confetti animations for correct answers, sad-face animations for incorrect
- **Score Tracking**: Keep track of your correct guesses and total attempts
- **Challenge Friends**: Share your score and invite friends to play via WhatsApp
- **Responsive Design**: Optimized for both desktop and mobile devices

## Tech Stack

- **React 19**: Modern React with hooks for state management
- **Vite**: Next-generation frontend tooling for fast development
- **Chakra UI**: Component library for beautiful and accessible UI
- **Axios**: Promise-based HTTP client for API requests
- **React Confetti**: Visual celebration effects
- **HTML2Canvas**: For generating shareable game screenshots

## Project Structure

```
src/
├── assets/         # Static assets like images and icons
├── components/     # Reusable UI components
│   ├── ChallengeModal.jsx  # Modal for challenging friends
│   ├── GameBoard.jsx       # Main game interface
│   └── UserForm.jsx        # User registration/login form
├── utils/          # Utility functions and helpers
│   └── api.js      # API communication with backend
├── App.jsx         # Main application component
├── main.jsx        # Application entry point
└── index.css       # Global styles
```

## API Integration

The frontend communicates with the Django backend through the following endpoints:

- `GET /api/destinations/random/`: Fetch random destination with clues
- `POST /api/guess/`: Submit user guesses
- `POST /api/users/`: Register new users
- `GET /api/users/<username>/`: Fetch user profiles and scores

## Setup and Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm run dev
   ```
4. Build for production:
   ```
   npm run build
   ```

## Development

The project uses Vite's development server with hot module replacement for a smooth development experience. The proxy configuration in `vite.config.js` forwards API requests to the Django backend running on port 8000.

## Game Flow

1. **User Registration**: Players enter a username to start
2. **Game Play**: 
   - View clues about a destination
   - Select from multiple choice options
   - Receive immediate feedback on guesses
3. **Score Tracking**: Correct guesses increase the player's score
4. **Social Sharing**: Players can challenge friends by sharing their score

## Backend Communication

The `api.js` utility provides functions for all backend interactions:
- `fetchRandomDestination()`: Get a new destination with clues
- `submitGuess()`: Send the player's guess to the backend
- `createUser()`: Register a new player
- `fetchUserProfile()`: Get a player's score and history
- `loginOrCreateUser()`: Handle user authentication flow

