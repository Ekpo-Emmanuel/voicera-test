# Webcam Face Recognition

A Next.js application that captures webcam feed and performs facial recognition to detect faces, facial landmarks, age, gender, and expressions in real-time.

## Features

- Webcam access with start/stop functionality
- Real-time face detection
- Facial landmarks display (68 points)
- Age and gender estimation
- Facial expression recognition
- Responsive design for desktop and mobile devices

## Tech Stack

- Next.js 15 with App Router
- TypeScript for type safety
- Redux for state management with Redux Toolkit
- Face-api.js for face detection and recognition
- Tailwind CSS for responsive UI

## Getting Started

### Prerequisites

- Node.js 18.0 or higher
- npm or yarn

### Installation

1. Clone the repository:

```bash
git clone https://github.com/Ekpo-Emmanuel/voicera-test
cd webcam-img
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Run the development server:

```bash
npm run dev
# or
yarn dev
```

4. Open your browser and navigate to [http://localhost:3000](http://localhost:3000)

## Usage

1. Allow camera access when prompted by your browser
2. Click the "Start Webcam" button to activate your camera
3. Click "Start Face Detection" to begin detecting faces
4. Position your face in view of the camera
5. The application will overlay information about detected faces
6. Click "Pause Face Detection" to stop detection without turning off the camera
7. Click "Stop Webcam" to completely turn off the camera feed

## Implementation Details

For detailed information about the implementation, please see [the implementation documentation](docs/implementation.md).