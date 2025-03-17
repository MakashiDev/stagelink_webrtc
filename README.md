# Stage Link

Real-time stage monitoring system for stage crews.

## Overview

Stage Link is a web-based application designed to provide real-time video monitoring for theater productions. It allows stage managers, directors, and crew members to view live camera feeds from backstage or remote locations, ensuring everyone stays coordinated during performances.

## Features

- **Live Video Streaming**: Real-time video feed with minimal latency
- **Host Control Panel**: Manage camera settings and show information
- **Viewer Interface**: Clean, responsive design for watching the stream
- **Chat System**: Built-in chat functionality for communication between crew members
- **Stream Statistics**: Monitor FPS, resolution, quality, and latency
- **Password Protection**: Secure access to host controls
- **Responsive Design**: Works on various devices and screen sizes
- **Theme Customization**: Multiple color themes to choose from

## Technology Stack

- **Frontend**: HTML, CSS (Tailwind CSS), JavaScript
- **Backend**: Node.js with Express
- **Real-time Communication**: Socket.IO
- **Video Streaming**: WebRTC with PeerJS
- **Runtime**: Bun

## Installation

### Prerequisites

- [Bun](https://bun.sh/) runtime installed or Node.js (We recommend Bun for its performance benefits)
- Web camera for hosting

### Setup

1. Clone the repository

```bash
git clone [repository-url]
cd stage-link
```

2. Install dependencies

```bash
bun install
npm i
```

3. Build the CSS (if needed)

```bash
bunx tailwindcss -i ./public/css/input.css -o ./public/css/output.css
npx tailwindcss -i./public/css/input.css -o./public/css/output.css
```

4. Start the server

```bash
bun start
node server.js
```

The application will be available at `http://localhost:3000` by default.

## Usage

### Host Mode

1. Navigate to `/host.html` in your browser
2. Enter the host password (default: "stagelink123")
3. Configure your camera and show settings
4. Start the stream

### Viewer Mode

1. Navigate to `/viewer.html` in your browser
2. Enter a username for the chat (optional)
3. View the live stream and use the chat functionality

## Configuration

You can modify the following settings:

- Host password in `host.html`
- PeerJS server configuration in both `host.html` and `viewer.html`
- Theme options in `css/input.css`

## Development

To run the application in development mode with automatic restarts:

```bash
bun dev
// idk that the node.js one is 😭
```

## License

MIT

## Author

Created by Christian Furr for Oquirrh Hills Middle School (2023-2025)