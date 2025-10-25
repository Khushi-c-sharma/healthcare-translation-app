# Healthcare Translation Web App

A real-time, multilingual translation application designed for healthcare settings, enabling seamless communication between patients and healthcare providers with role-based interfaces.

## Features

✅ **Role-Based Interface** - Separate modes for patients and healthcare providers  
✅ **Real-time Voice Recognition** - Convert spoken input to text using Web Speech API  
✅ **AI-Powered Translation** - Medical-focused translation using Groq's LLaMA 3.3 70B model  
✅ **Text-to-Speech Output** - Audio playback of translations using gTTS  
✅ **Quick Language Swap** - Instant language reversal for back-and-forth conversations  
✅ **20+ Languages Supported** - Including English, Spanish, French, German, Hindi, Arabic, Chinese, and more  
✅ **Mobile-First Design** - Responsive UI optimized for tablets and smartphones  
✅ **Privacy-Focused** - Automatic audio cleanup and secure processing  
✅ **Dual Transcript Display** - Side-by-side view of original and translated text  

## Tech Stack

- **Backend**: Flask (Python)
- **AI Translation**: Groq API (LLaMA 3.3 70B Versatile)
- **Text-to-Speech**: gTTS (Google Text-to-Speech)
- **Voice Recognition**: Web Speech API (browser-native)
- **Frontend**: HTML, TailwindCSS, Vanilla JavaScript
- **Deployment**: Compatible with Render, Railway, Vercel, PythonAnywhere

## Installation

### Prerequisites

- Python 3.8+
- Groq API Key ([Get it here](https://console.groq.com/keys))

### Local Setup

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd healthcare-translation-app
```

2. **Create virtual environment**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env and add your GROQ_API_KEY
```

5. **Create required directories**
```bash
mkdir templates static audio_files
```

6. **Move files to correct locations**
```
healthcare-translation-app/
├── app.py
├── requirements.txt
├── .env
├── .gitignore
├── templates/
│   └── index.html
├── static/
│   └── app.js
└── audio_files/
```

7. **Run the application**
```bash
python app.py
```

Visit `http://localhost:5000` in your browser.

## Project Structure

```
.
├── app.py                 # Flask backend with API endpoints
├── requirements.txt       # Python dependencies
├── vercel.json           # Vercel deployment configuration
├── .env                   # Environment variables (not in git)
├── .env.example          # Example environment file
├── .gitignore            # Git ignore rules
├── README.md             # This file
├── DEPLOYMENT_GUIDE.md   # Comprehensive deployment instructions
├── QUICKSTART.md         # 5-minute quick start guide
├── templates/
│   └── index.html        # Frontend HTML template
├── static/
│   └── app.js           # Frontend JavaScript
└── audio_files/          # Temporary audio storage (auto-created)
```

## How to Use

### For Patients:

1. **Select Role**: Click the "**Patient**" button
2. **Choose Languages**:
   - **Your Language**: Select the language you speak
   - **Provider's Language**: Select your doctor's language (usually English)
3. **Start Speaking**: Click "Start Speaking" and speak clearly
4. **View Translation**: Your doctor can read and hear the translation
5. **Listen to Provider**: When your doctor speaks, hear their message in your language

### For Healthcare Providers:

1. **Select Role**: Click the "**Healthcare Provider**" button
2. **Choose Languages**:
   - **Your Language**: Select the language you speak (usually English)
   - **Patient's Language**: Select your patient's language
3. **Start Speaking**: Click "Start Speaking" and speak medical instructions
4. **View Translation**: Your patient can read and hear the translation
5. **Switch Roles**: Use "Swap Languages" for quick role reversal

### Additional Features:

- **Swap Languages**: Click the swap button to reverse language directions instantly
- **Clear Transcripts**: Click the trash icon to start a new conversation
- **Speak Button**: Click "Speak" to hear the translated text out loud
- **Continuous Listening**: The app captures speech continuously until you click "Stop"

## API Endpoints

### `POST /translate`
Translates text using Groq API with medical context awareness.

**Request:**
```json
{
  "text": "I have a headache",
  "source_lang": "en",
  "target_lang": "es"
}
```

**Response:**
```json
{
  "translated_text": "Tengo dolor de cabeza",
  "source_lang": "en",
  "target_lang": "es"
}
```

### `POST /speak`
Generates audio file from text using gTTS.

**Request:**
```json
{
  "text": "Tengo dolor de cabeza",
  "lang": "es"
}
```

**Response:**
```json
{
  "audio_url": "/audio/unique-id.mp3",
  "filename": "unique-id.mp3"
}
```

### `GET /audio/<filename>`
Serves generated audio files.

### `POST /cleanup`
Removes audio files older than 1 hour.

## Deployment

### Quick Deploy to Vercel (Recommended - FREE)

1. **Push to GitHub**:
```bash
git init
git add .
git commit -m "Healthcare Translation App"
git remote add origin https://github.com/YOUR_USERNAME/healthcare-translation-app.git
git push -u origin main
```

2. **Deploy on Vercel**:
   - Go to [vercel.com](https://vercel.com) and sign in
   - Click "Add New Project"
   - Import your repository
   - Add environment variable: `GROQ_API_KEY`
   - Click "Deploy"
   - Done! Your app is live with HTTPS ✅

For detailed deployment instructions, see **DEPLOYMENT_GUIDE.md**

For a quick 5-minute guide, see **QUICKSTART.md**

## Supported Languages

- English (en)
- Spanish (es)
- French (fr)
- German (de)
- Italian (it)
- Portuguese (pt)
- Russian (ru)
- Japanese (ja)
- Korean (ko)
- Chinese (zh)
- Arabic (ar)
- Hindi (hi)
- Bengali (bn)
- Punjabi (pa)
- Telugu (te)
- Tamil (ta)
- Urdu (ur)
- Vietnamese (vi)
- Thai (th)
- Turkish (tr)

## Browser Compatibility

- ✅ Chrome/Edge (Best experience - Full speech recognition support)
- ✅ Safari (iOS and macOS - Good speech recognition support)
- ⚠️ Firefox (Limited speech recognition support)
- ❌ Internet Explorer (Not supported)

**Note**: Web Speech API requires HTTPS (except on localhost)

## Security & Privacy

- All audio files are automatically cleaned up after 1 hour
- No conversation data is permanently stored
- API keys are kept secure in environment variables
- HTTPS recommended for production deployment
- Patient confidentiality protected through secure processing
- No personal data retention

## Use Cases

### **Scenario 1: Emergency Room**
- Patient speaks Spanish, doctor speaks English
- Patient selects "Patient" mode and Spanish
- Says: "Me duele el pecho y no puedo respirar"
- Doctor immediately sees: "My chest hurts and I can't breathe"
- Doctor responds in English, patient hears Spanish translation

### **Scenario 2: Routine Checkup**
- Patient speaks Hindi, nurse speaks English
- Quick role switching for back-and-forth conversation
- Both can review transcript history
- Audio playback ensures understanding

### **Scenario 3: Medication Instructions**
- Pharmacist speaks English, patient speaks Mandarin
- Provider mode explains dosage instructions
- Patient hears clear audio in their language
- Transcript available for reference

## Troubleshooting

**Voice recognition not working?**
- Ensure you're using Chrome, Edge, or Safari
- Check browser permissions for microphone access
- Make sure you're on HTTPS (required for Web Speech API)
- Grant microphone permission when prompted

**Translation errors?**
- Verify your Groq API key is correct in the .env file
- Check your internet connection
- Ensure you haven't exceeded API rate limits
- Check browser console (F12) for detailed error messages

**Audio playback issues?**
- Check browser audio permissions
- Verify gTTS supports your target language
- Ensure speakers/headphones are connected
- Clear browser cache and reload

**Role buttons not responding?**
- Refresh the page
- Check browser console for JavaScript errors
- Ensure all files are in correct directories

## Development

### Debug Mode

The app includes a debug panel for troubleshooting:
- Set `DEBUG_MODE = true` in `app.js` (enabled by default)
- View real-time speech recognition events
- Monitor translation requests
- Track audio generation

Set `DEBUG_MODE = false` for production deployment.

### Adding New Languages

1. Add language code to `LANGUAGE_CODES` in `app.py`
2. Add language option to dropdowns in `index.html`
3. Add mapping in `getWebSpeechLanguageCode()` in `app.js`

### Customizing Translation Prompt

Edit the prompt in the `/translate` endpoint in `app.py` to adjust medical terminology handling or translation style.

### Customizing UI Colors

Role colors can be customized in the CSS:
- Patient mode: Indigo theme (`.active-patient`)
- Provider mode: Green theme (`.active-provider`)

## Performance Optimization

- Audio files auto-cleanup every hour
- Efficient API calls with error handling
- Lazy loading for audio playback
- Optimized for mobile networks
- Serverless deployment for scalability

## Roadmap

### Planned Features:
- [ ] Conversation history with timestamps
- [ ] Multiple language presets (quick select common pairs)
- [ ] Voice activity detection (automatic start/stop)
- [ ] Offline mode with cached translations
- [ ] Medical terminology dictionary
- [ ] Print transcript feature
- [ ] Multi-user rooms for group consultations
- [ ] Integration with EHR systems

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly (both roles, multiple languages)
5. Submit a pull request

## License

This project is open-source and available for educational and healthcare purposes.

## Credits

- **Groq** - AI translation powered by LLaMA 3.3 70B
- **gTTS** - Google Text-to-Speech
- **Web Speech API** - Browser-native voice recognition
- **TailwindCSS** - UI styling
- **Flask** - Python web framework

## Support

For issues or questions:
- Open an issue on GitHub
- Check DEPLOYMENT_GUIDE.md for deployment help
- Check QUICKSTART.md for quick setup
- Review browser console for technical errors

## Acknowledgments

Built with ❤️ for better healthcare communication. Special thanks to healthcare workers who bridge language barriers every day.

---

**Version**: 2.0  
**Last Updated**: 2025  
**Status**: Production Ready ✅

## API Endpoints

### `POST /translate`
Translates text using Groq API with medical context awareness.

**Request:**
```json
{
  "text": "I have a headache",
  "source_lang": "en",
  "target_lang": "es"
}
```

**Response:**
```json
{
  "translated_text": "Tengo dolor de cabeza",
  "source_lang": "en",
  "target_lang": "es"
}
```

### `POST /speak`
Generates audio file from text using gTTS.

**Request:**
```json
{
  "text": "Tengo dolor de cabeza",
  "lang": "es"
}
```

**Response:**
```json
{
  "audio_url": "/audio/unique-id.mp3",
  "filename": "unique-id.mp3"
}
```

### `GET /audio/<filename>`
Serves generated audio files.

### `POST /cleanup`
Removes audio files older than 1 hour.

## Deployment

### Deploy to Render

1. Create a new Web Service on [Render](https://render.com)
2. Connect your GitHub repository
3. Use these settings:
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app`
   - **Environment Variables**: Add `GROQ_API_KEY`

### Deploy to Railway

1. Create a new project on [Railway](https://railway.app)
2. Connect your GitHub repository
3. Add `GROQ_API_KEY` to environment variables
4. Railway will auto-detect Flask and deploy

### Deploy to PythonAnywhere

1. Upload your code to PythonAnywhere
2. Create a new web app with Flask
3. Set up virtual environment and install requirements
4. Configure WSGI file to point to your app
5. Add `GROQ_API_KEY` to environment variables

## Supported Languages

- English (en)
- Spanish (es)
- French (fr)
- German (de)
- Italian (it)
- Portuguese (pt)
- Russian (ru)
- Japanese (ja)
- Korean (ko)
- Chinese (zh)
- Arabic (ar)
- Hindi (hi)
- Bengali (bn)
- Punjabi (pa)
- Telugu (te)
- Tamil (ta)
- Urdu (ur)
- Vietnamese (vi)
- Thai (th)
- Turkish (tr)

## Browser Compatibility

- ✅ Chrome/Edge (Best experience)
- ✅ Safari (iOS and macOS)
- ⚠️ Firefox (Limited speech recognition support)
- ❌ Internet Explorer (Not supported)

## Security & Privacy

- All audio files are automatically cleaned up after 1 hour
- No conversation data is permanently stored
- API keys are kept secure in environment variables
- HTTPS recommended for production deployment

## Troubleshooting

**Voice recognition not working?**
- Ensure you're using Chrome, Edge, or Safari
- Check browser permissions for microphone access
- Make sure you're on HTTPS (required for Web Speech API)

**Translation errors?**
- Verify your Groq API key is correct
- Check your internet connection
- Ensure you haven't exceeded API rate limits

**Audio playback issues?**
- Check browser audio permissions
- Verify gTTS supports your target language
- Clear browser cache

## Development

### Adding New Languages

1. Add language code to `LANGUAGE_CODES` in `app.py`
2. Add language option to dropdowns in `index.html`
3. Add mapping in `getWebSpeechLanguageCode()` in `app.js`

### Customizing Translation Prompt

Edit the prompt in the `/translate` endpoint in `app.py` to adjust medical terminology handling or translation style.

## License

This project is open-source and available for educational and healthcare purposes.

## Credits

- **Groq** - AI translation powered by LLaMA 3.3 70B
- **gTTS** - Google Text-to-Speech
- **Web Speech API** - Browser-native voice recognition
- **TailwindCSS** - UI styling

## Support

For issues or questions, please open an issue on GitHub or contact the development team.

---

Built with ❤️ for better healthcare communication
