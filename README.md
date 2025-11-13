# 🎤 Voice Generator - Text to Speech Web Application

A modern, responsive web application that converts text to speech using the browser's built-in Web Speech API. Built with React (frontend only - no backend required!).

## ✨ Features

- **Text Input**: Large text area for typing or pasting text
- **Play/Pause/Stop Controls**: Full control over speech playback
- **Searchable Voice Selection**: Choose from all available browser voices with search functionality
- **Gender Indicators**: Voices are labeled with gender (Male/Female)
- **Customizable Speech**: Adjustable speech rate (0.5x - 2.0x) and pitch (0.5 - 2.0)
- **Audio Download**: Download generated speech as WebM audio file
- **Modern UI**: Beautiful, responsive design using Tailwind CSS
- **Real-time Status**: Visual indicators for playing/paused states

## 🛠️ Tech Stack

### Frontend
- React 18
- Tailwind CSS 3
- Web Speech API (browser-native)

### Backend
- **None required!** This app runs entirely in the browser using the Web Speech API.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**

## 🚀 Getting Started

### 1. Clone or Download the Project

If you have the project files, navigate to the project directory:

```bash
cd voice-generator
```

### 2. Install Frontend Dependencies

Open a new terminal, navigate to the frontend directory, and install dependencies:

```bash
cd frontend
npm install
```

### 3. Run the Application

Navigate to the frontend directory and start the development server:

```bash
cd frontend
npm start
```

The frontend will automatically open in your browser at `http://localhost:3000`

**Note:** No backend server is needed! The app works entirely in your browser.

## 📖 Usage

1. **Enter Text**: Type or paste your text into the text area
2. **Select Voice**: Choose a voice from the searchable dropdown (voices are labeled with gender indicators)
3. **Adjust Settings**: Use the sliders to adjust speech rate and pitch
4. **Play**: Click the "Play" button to start speech synthesis
5. **Control**: Use "Pause" to pause and "Resume" to continue, or "Stop" to cancel
6. **Download**: Click "Download" to save the audio file as WebM

## 🌐 Browser Compatibility

The Web Speech API is supported in:
- ✅ Chrome/Edge (best support)
- ✅ Safari (iOS 7+, macOS)
- ✅ Firefox (limited support)
- ❌ Internet Explorer (not supported)

**Note**: Voice availability varies by browser and operating system. Chrome and Edge typically offer the best selection of voices.

## 📁 Project Structure

```
voice-generator/
├── frontend/
│   ├── public/
│   │   └── index.html     # HTML template
│   ├── src/
│   │   ├── App.js         # Main React component
│   │   ├── App.css        # Component styles
│   │   ├── index.js       # React entry point
│   │   └── index.css      # Global styles with Tailwind
│   ├── package.json       # Frontend dependencies
│   ├── tailwind.config.js # Tailwind configuration
│   └── postcss.config.js  # PostCSS configuration
├── vercel.json            # Vercel deployment configuration
├── package.json           # Root package.json (for Vercel)
├── .gitignore
└── README.md
```

## 🔧 Configuration

### Frontend Port
The React development server runs on port 3000 by default. If port 3000 is in use, it will prompt you to use another port.

You can change the port by setting the `PORT` environment variable:

```bash
PORT=3001 npm start
```

## 🎨 Customization

### Changing Colors
Edit `frontend/src/App.js` and modify the Tailwind CSS classes. The app uses:
- Primary: Indigo (`indigo-600`, `indigo-700`)
- Warning: Yellow (`yellow-500`, `yellow-600`)
- Danger: Red (`red-500`, `red-600`)

### Adding Features
The main component logic is in `frontend/src/App.js`. You can extend it with:
- Volume control
- Language selection
- Text highlighting during speech
- Export audio functionality

## 🐛 Troubleshooting

### Voices not loading
- Refresh the page
- Some browsers load voices asynchronously
- Try a different browser (Chrome/Edge recommended)

### Speech not working
- Ensure your browser supports the Web Speech API
- Check browser console for errors
- Make sure you've entered text before clicking Play

### Port already in use
- Change the port in the respective `package.json` or use environment variables
- Kill the process using the port

## 📝 License

This project is open source and available for personal and educational use.

## 🤝 Contributing

Feel free to fork this project and submit pull requests for any improvements!

## 📧 Support

If you encounter any issues or have questions, please check the browser console for error messages and ensure all dependencies are properly installed.

---

**Enjoy converting text to speech! 🎉**

