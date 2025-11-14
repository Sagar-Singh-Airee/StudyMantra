# StudyMantra

StudyMantra is a simple AI-assisted study platform where users can upload PDFs, extract text, generate quizzes, track study sessions, and collaborate with others through real-time video calls using Agora.

This project was developed as part of a collaboration with **Agora**.

---

## Features

### PDF Upload & Extraction
- Upload PDFs from the system
- Extract text using PDF.js
- Stores extracted content locally

### Quiz Generator
- Generates MCQs from extracted PDF text
- Each question includes options and a correct answer
- Works even without internet (fallback logic)

### Study Sessions
- Built-in study timer
- Tracks total study time
- Saves session data

### Analytics Dashboard
- Shows quiz accuracy
- Study time statistics
- Quiz history
- Exportable reports

### Video Calling (Powered by Agora)
- Real-time audio/video
- Camera on/off
- Mic mute/unmute
- Screen sharing
- Device switching (camera/mic)
- Network quality indicators
- Auto reconnection
- Grid layout for multiple users

---

## Technologies Used

- React (Vite)
- Tailwind CSS
- Agora RTC Web SDK (for real-time video)
- PDF.js
- Lucide Icons
- Framer Motion

---

## Project Structure

```
src/
├── assets/
├── components/
│   ├── VideoCall/
│   ├── PDFUpload/
│   ├── Quiz/
│   ├── Timer/
│   ├── Analytics/
│   └── PageWrapper.jsx
│
├── pages/
│   ├── Home.jsx
│   ├── UploadPDF.jsx
│   ├── StudySession.jsx
│   ├── Quiz.jsx
│   ├── Analytics.jsx
│   └── VideoRoom.jsx
│
├── context/
├── utils/
│   ├── pdfExtractor.js
│   ├── quizGenerator.js
│   └── agoraConfig.js
│
└── App.jsx
```

---

## Environment Variables

Create a `.env` file in the project root:

```
VITE_AGORA_APP_ID=your_agora_app_id
VITE_AGORA_TOKEN=
VITE_AGORA_CHANNEL=studymantra-room
```

Do **not** commit this file. Make sure `.gitignore` includes:

```
.env
.env.local
```

---

## Installation

```
npm install
npm run dev
```

Project runs at:

```
http://localhost:5173
```

---

## Deployment

### Vercel (recommended)

1. Push project to GitHub  
2. Import project on Vercel  
3. Add the environment variables:
   - VITE_AGORA_APP_ID  
   - VITE_AGORA_TOKEN  
   - VITE_AGORA_CHANNEL  
4. Deploy

---

## Acknowledgment

Special thanks to **Agora** for providing the real-time video API used in this project.

---

## License

MIT License.
