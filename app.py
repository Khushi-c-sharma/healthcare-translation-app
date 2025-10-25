from flask import Flask, render_template, request, jsonify, send_file
from flask_cors import CORS
import os
from dotenv import load_dotenv
from groq import Groq
from gtts import gTTS
import uuid
from datetime import datetime
import logging

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Groq client
GROQ_API_KEY = os.environ.get('GROQ_API_KEY')
if not GROQ_API_KEY:
    logger.warning("GROQ_API_KEY not found in environment variables")
    client = None
else:
    try:
        client = Groq(api_key=GROQ_API_KEY)
        logger.info("Groq client initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize Groq client: {str(e)}")
        client = None

# Create audio directory if it doesn't exist
AUDIO_DIR = 'audio_files'
os.makedirs(AUDIO_DIR, exist_ok=True)

# Language codes mapping for gTTS
LANGUAGE_CODES = {
    'en': 'en',
    'es': 'es',
    'fr': 'fr',
    'de': 'de',
    'it': 'it',
    'pt': 'pt',
    'ru': 'ru',
    'ja': 'ja',
    'ko': 'ko',
    'zh': 'zh-cn',
    'ar': 'ar',
    'hi': 'hi',
    'bn': 'bn',
    'pa': 'pa',
    'te': 'te',
    'ta': 'ta',
    'ur': 'ur',
    'vi': 'vi',
    'th': 'th',
    'tr': 'tr',
    'pl': 'pl',
    'nl': 'nl',
    'sv': 'sv',
    'he': 'he',
}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/translate', methods=['POST'])
def translate():
    try:
        data = request.json
        text = data.get('text', '')
        source_lang = data.get('source_lang', 'en')
        target_lang = data.get('target_lang', 'es')
        
        if not text:
            return jsonify({'error': 'No text provided'}), 400
        
        if not client:
            return jsonify({'error': 'Groq API key not configured'}), 500
        
        # Enhanced prompt for medical translation
        prompt = f"""You are a professional medical translator. Translate the following text from {source_lang} to {target_lang}.
        
Important instructions:
- Maintain medical terminology accuracy
- Keep the tone professional and empathetic
- Preserve all medical terms and their meanings
- If there are medical abbreviations, translate appropriately
- Return ONLY the translated text, no explanations

Text to translate: {text}"""
        
        # Call Groq API for translation
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert medical translator with knowledge of healthcare terminology in multiple languages."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            model="llama-3.3-70b-versatile",
            temperature=0.3,
            max_tokens=1000,
        )
        
        translated_text = chat_completion.choices[0].message.content.strip()
        
        logger.info(f"Translation successful: {source_lang} -> {target_lang}")
        
        return jsonify({
            'translated_text': translated_text,
            'source_lang': source_lang,
            'target_lang': target_lang
        })
        
    except Exception as e:
        logger.error(f"Translation error: {str(e)}")
        return jsonify({'error': f'Translation failed: {str(e)}'}), 500

@app.route('/speak', methods=['POST'])
def speak():
    try:
        data = request.json
        text = data.get('text', '')
        lang = data.get('lang', 'en')
        
        if not text:
            return jsonify({'error': 'No text provided'}), 400
        
        # Map language code to gTTS compatible code
        gtts_lang = LANGUAGE_CODES.get(lang, 'en')
        
        # Generate unique filename
        filename = f"{uuid.uuid4()}.mp3"
        filepath = os.path.join(AUDIO_DIR, filename)
        
        # Generate speech
        tts = gTTS(text=text, lang=gtts_lang, slow=False)
        tts.save(filepath)
        
        logger.info(f"Audio generated: {filename} for lang: {lang}")
        
        return jsonify({
            'audio_url': f'/audio/{filename}',
            'filename': filename
        })
        
    except Exception as e:
        logger.error(f"TTS error: {str(e)}")
        return jsonify({'error': f'Audio generation failed: {str(e)}'}), 500

@app.route('/audio/<filename>')
def serve_audio(filename):
    try:
        filepath = os.path.join(AUDIO_DIR, filename)
        return send_file(filepath, mimetype='audio/mpeg')
    except Exception as e:
        logger.error(f"Audio serving error: {str(e)}")
        return jsonify({'error': 'Audio file not found'}), 404

# Cleanup old audio files (optional)
@app.route('/cleanup', methods=['POST'])
def cleanup_audio():
    try:
        count = 0
        for filename in os.listdir(AUDIO_DIR):
            filepath = os.path.join(AUDIO_DIR, filename)
            # Remove files older than 1 hour
            if os.path.isfile(filepath):
                file_age = datetime.now().timestamp() - os.path.getmtime(filepath)
                if file_age > 3600:  # 1 hour
                    os.remove(filepath)
                    count += 1
        
        return jsonify({'message': f'Cleaned up {count} old audio files'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # For production, use HTTPS
    # app.run(debug=True, host='0.0.0.0', port=5000, ssl_context='adhoc')
    
    # For local development (localhost works without HTTPS)
    app.run(debug=True, host='0.0.0.0', port=5000)

# Vercel serverless function handler
app = app