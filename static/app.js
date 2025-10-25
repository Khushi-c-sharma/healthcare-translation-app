// Web Speech API Setup
let recognition;
let isListening = false;
let currentTranscript = '';
let currentTranslation = '';

// DOM Elements
const startBtn = document.getElementById('startListening');
const stopBtn = document.getElementById('stopListening');
const originalTranscriptDiv = document.getElementById('originalTranscript');
const translatedTranscriptDiv = document.getElementById('translatedTranscript');
const sourceLanguageSelect = document.getElementById('sourceLanguage');
const targetLanguageSelect = document.getElementById('targetLanguage');
const speakBtn = document.getElementById('speakTranslation');
const clearOriginalBtn = document.getElementById('clearOriginal');
const statusIndicator = document.getElementById('statusIndicator');
const translationLoading = document.getElementById('translationLoading');
const browserSupport = document.getElementById('browserSupport');
const micIndicator = document.getElementById('micIndicator');
const debugInfo = document.getElementById('debugInfo');
const debugText = document.getElementById('debugText');

// Role selection elements
const patientBtn = document.getElementById('patientBtn');
const providerBtn = document.getElementById('providerBtn');
const roleIndicator = document.getElementById('roleIndicator');
const roleText = document.getElementById('roleText');
const swapLanguagesBtn = document.getElementById('swapLanguages');
const inputLanguageLabel = document.getElementById('inputLanguageLabel');
const outputLanguageLabel = document.getElementById('outputLanguageLabel');

// Enable debug mode (set to false in production)
const DEBUG_MODE = true;

// Current role
let currentRole = null;

function updateDebug(message) {
    if (DEBUG_MODE && debugText) {
        debugInfo.classList.remove('hidden');
        const timestamp = new Date().toLocaleTimeString();
        debugText.innerHTML += `<br>[${timestamp}] ${message}`;
        debugText.scrollTop = debugText.scrollHeight;
    }
    console.log(message);
}

function updateMicIndicator(active) {
    if (active) {
        micIndicator.classList.remove('bg-gray-300');
        micIndicator.classList.add('bg-green-500', 'animate-pulse');
    } else {
        micIndicator.classList.remove('bg-green-500', 'animate-pulse');
        micIndicator.classList.add('bg-gray-300');
    }
}

// Role selection functions
function selectPatientRole() {
    currentRole = 'patient';
    
    // Update button styles
    patientBtn.classList.add('active-patient');
    patientBtn.classList.remove('border-gray-300');
    providerBtn.classList.remove('active-provider');
    providerBtn.classList.add('border-gray-300');
    
    // Update role indicator
    roleIndicator.classList.remove('hidden', 'bg-green-50', 'text-green-800');
    roleIndicator.classList.add('bg-indigo-50', 'text-indigo-800');
    roleText.textContent = '👤 Patient Mode: You speak in your language, doctor hears in theirs';
    
    // Set default languages (Patient speaks their language, translated to English for provider)
    // This can be customized, but we'll keep current selections
    updateLanguageLabels('patient');
    
    updateDebug('👤 Patient mode activated');
}

function selectProviderRole() {
    currentRole = 'provider';
    
    // Update button styles
    providerBtn.classList.add('active-provider');
    providerBtn.classList.remove('border-gray-300');
    patientBtn.classList.remove('active-patient');
    patientBtn.classList.add('border-gray-300');
    
    // Update role indicator
    roleIndicator.classList.remove('hidden', 'bg-indigo-50', 'text-indigo-800');
    roleIndicator.classList.add('bg-green-50', 'text-green-800');
    roleText.textContent = '⚕️ Provider Mode: You speak in your language, patient hears in theirs';
    
    // Set default languages (Provider speaks English, translated to patient's language)
    updateLanguageLabels('provider');
    
    updateDebug('⚕️ Provider mode activated');
}

function updateLanguageLabels(role) {
    if (role === 'patient') {
        inputLanguageLabel.textContent = 'Your Language (What you speak)';
        outputLanguageLabel.textContent = 'Provider\'s Language (Translation for doctor)';
    } else {
        inputLanguageLabel.textContent = 'Your Language (What you speak)';
        outputLanguageLabel.textContent = 'Patient\'s Language (Translation for patient)';
    }
}

function swapLanguages() {
    // Swap the language selections
    const tempLang = sourceLanguageSelect.value;
    sourceLanguageSelect.value = targetLanguageSelect.value;
    targetLanguageSelect.value = tempLang;
    
    // Update recognition language
    if (recognition && !isListening) {
        recognition.lang = getWebSpeechLanguageCode(sourceLanguageSelect.value);
    }
    
    // Retranslate if there's existing text
    if (currentTranscript.trim()) {
        translateText(currentTranscript);
    }
    
    updateDebug('🔄 Languages swapped');
}

// Check browser support and microphone permission
async function checkPermissions() {
    try {
        // Check if speech recognition is supported
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            browserSupport.classList.remove('hidden');
            browserSupport.innerHTML = '<p class="text-yellow-700 text-sm">⚠️ Voice recognition is not supported in your browser. Please use Chrome, Edge, or Safari.</p>';
            startBtn.disabled = true;
            startBtn.classList.add('opacity-50', 'cursor-not-allowed');
            return false;
        }

        // Request microphone permission
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            stream.getTracks().forEach(track => track.stop()); // Stop immediately after permission check
            console.log('Microphone permission granted');
            initializeSpeechRecognition();
            return true;
        } catch (err) {
            console.error('Microphone permission denied:', err);
            browserSupport.classList.remove('hidden');
            browserSupport.innerHTML = '<p class="text-red-700 text-sm">🎤 Microphone access denied. Please enable microphone permissions in your browser settings.</p>';
            startBtn.disabled = true;
            startBtn.classList.add('opacity-50', 'cursor-not-allowed');
            return false;
        }
    } catch (error) {
        console.error('Permission check error:', error);
        return false;
    }
}

// Initialize on page load
checkPermissions();

function initializeSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    
    // Set initial language
    recognition.lang = getWebSpeechLanguageCode(sourceLanguageSelect.value);
    
    recognition.onstart = () => {
        console.log('Speech recognition started');
        updateDebug('✅ Recognition started successfully');
        updateMicIndicator(true);
        isListening = true;
        startBtn.classList.add('hidden');
        stopBtn.classList.remove('hidden');
        statusIndicator.textContent = 'Listening... Speak now!';
        statusIndicator.classList.add('text-green-600', 'font-semibold');
        statusIndicator.classList.remove('text-red-600');
    };
    
    recognition.onresult = (event) => {
        updateDebug(`📝 Got result (${event.results.length} results)`);
        let interimTranscript = '';
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            const confidence = event.results[i][0].confidence;
            
            updateDebug(`Result ${i}: "${transcript}" (confidence: ${confidence?.toFixed(2) || 'N/A'})`);
            
            if (event.results[i].isFinal) {
                finalTranscript += transcript + ' ';
                updateDebug(`✅ Final transcript: "${transcript}"`);
            } else {
                interimTranscript += transcript;
                updateDebug(`⏳ Interim transcript: "${transcript}"`);
            }
        }
        
        if (finalTranscript) {
            currentTranscript += finalTranscript;
            displayOriginalTranscript(currentTranscript);
            translateText(finalTranscript.trim());
        }
        
        // Show interim results
        if (interimTranscript) {
            displayOriginalTranscript(currentTranscript + interimTranscript, true);
        }
    };
    
    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        console.error('Error details:', event);
        
        let errorMessage = 'Error: ';
        switch(event.error) {
            case 'no-speech':
                errorMessage += 'No speech detected. Please speak louder or check your microphone.';
                break;
            case 'audio-capture':
                errorMessage += 'Microphone not found. Please check your device settings.';
                break;
            case 'not-allowed':
                errorMessage += 'Microphone permission denied. Please enable it in browser settings.';
                break;
            case 'network':
                errorMessage += 'Network error. Please check your internet connection.';
                break;
            case 'aborted':
                errorMessage += 'Speech recognition aborted.';
                break;
            default:
                errorMessage += event.error;
        }
        
        statusIndicator.textContent = errorMessage;
        statusIndicator.classList.add('text-red-600');
        statusIndicator.classList.remove('text-green-600', 'font-semibold');
        
        // Show alert for critical errors
        if (event.error === 'not-allowed' || event.error === 'audio-capture') {
            alert(errorMessage);
        }
        
        // Reset buttons
        setTimeout(() => {
            startBtn.classList.remove('hidden');
            stopBtn.classList.add('hidden');
        }, 100);
    };
    
    recognition.onend = () => {
        console.log('Speech recognition ended');
        updateDebug('⏹️ Recognition ended');
        updateMicIndicator(false);
        isListening = false;
        startBtn.classList.remove('hidden');
        stopBtn.classList.add('hidden');
        statusIndicator.textContent = 'Ready';
        statusIndicator.classList.remove('text-green-600', 'font-semibold', 'text-red-600');
    };
}

// Language code mapping for Web Speech API
function getWebSpeechLanguageCode(lang) {
    const mapping = {
        'en': 'en-US',
        'es': 'es-ES',
        'fr': 'fr-FR',
        'de': 'de-DE',
        'it': 'it-IT',
        'pt': 'pt-PT',
        'ru': 'ru-RU',
        'ja': 'ja-JP',
        'ko': 'ko-KR',
        'zh': 'zh-CN',
        'ar': 'ar-SA',
        'hi': 'hi-IN',
        'bn': 'bn-IN',
        'pa': 'pa-IN',
        'te': 'te-IN',
        'ta': 'ta-IN',
        'ur': 'ur-PK',
        'vi': 'vi-VN',
        'th': 'th-TH',
        'tr': 'tr-TR',
    };
    return mapping[lang] || 'en-US';
}

function displayOriginalTranscript(text, isInterim = false) {
    if (text.trim()) {
        originalTranscriptDiv.innerHTML = text;
        if (isInterim) {
            originalTranscriptDiv.innerHTML += '<span class="text-gray-400"> ...</span>';
        }
        originalTranscriptDiv.scrollTop = originalTranscriptDiv.scrollHeight;
    }
}

function displayTranslation(text) {
    if (text.trim()) {
        currentTranslation = text;
        translatedTranscriptDiv.innerHTML = text;
        translatedTranscriptDiv.scrollTop = translatedTranscriptDiv.scrollHeight;
        speakBtn.disabled = false;
    }
}

async function translateText(text) {
    if (!text.trim()) return;
    
    try {
        translationLoading.classList.remove('hidden');
        
        const response = await fetch('/translate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text: text,
                source_lang: sourceLanguageSelect.value,
                target_lang: targetLanguageSelect.value,
            }),
        });
        
        const data = await response.json();
        
        if (response.ok) {
            displayTranslation(data.translated_text);
        } else {
            console.error('Translation error:', data.error);
            translatedTranscriptDiv.innerHTML = `<span class="text-red-600">Translation error: ${data.error}</span>`;
        }
    } catch (error) {
        console.error('Network error:', error);
        translatedTranscriptDiv.innerHTML = '<span class="text-red-600">Network error. Please check your connection.</span>';
    } finally {
        translationLoading.classList.add('hidden');
    }
}

async function speakTranslation() {
    if (!currentTranslation.trim()) return;
    
    try {
        speakBtn.disabled = true;
        speakBtn.innerHTML = `
            <svg class="animate-spin w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Speaking...
        `;
        
        const response = await fetch('/speak', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                text: currentTranslation,
                lang: targetLanguageSelect.value,
            }),
        });
        
        const data = await response.json();
        
        if (response.ok) {
            const audio = new Audio(data.audio_url);
            audio.play();
            
            audio.onended = () => {
                resetSpeakButton();
            };
            
            audio.onerror = () => {
                console.error('Audio playback error');
                resetSpeakButton();
            };
        } else {
            console.error('TTS error:', data.error);
            alert('Audio generation failed: ' + data.error);
            resetSpeakButton();
        }
    } catch (error) {
        console.error('Network error:', error);
        alert('Network error. Please check your connection.');
        resetSpeakButton();
    }
}

function resetSpeakButton() {
    speakBtn.disabled = false;
    speakBtn.innerHTML = `
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"></path>
        </svg>
        Speak
    `;
}

function clearTranscripts() {
    currentTranscript = '';
    currentTranslation = '';
    originalTranscriptDiv.innerHTML = '<p class="text-gray-400 italic">Your speech will appear here...</p>';
    translatedTranscriptDiv.innerHTML = '<p class="text-gray-400 italic">Translation will appear here...</p>';
    speakBtn.disabled = true;
}

// Event Listeners
startBtn.addEventListener('click', async () => {
    if (recognition) {
        try {
            console.log('Starting speech recognition...');
            console.log('Source language:', sourceLanguageSelect.value);
            
            // Update language
            recognition.lang = getWebSpeechLanguageCode(sourceLanguageSelect.value);
            console.log('Recognition language set to:', recognition.lang);
            
            // Clear previous transcripts
            if (!currentTranscript.trim()) {
                clearTranscripts();
            }
            
            // Start recognition
            recognition.start();
            console.log('Recognition started successfully');
        } catch (error) {
            console.error('Error starting recognition:', error);
            statusIndicator.textContent = 'Error: ' + error.message;
            statusIndicator.classList.add('text-red-600');
            
            // If already running, stop and restart
            if (error.message.includes('already started')) {
                recognition.stop();
                setTimeout(() => {
                    recognition.start();
                }, 100);
            }
        }
    } else {
        alert('Speech recognition is not initialized. Please reload the page.');
    }
});

stopBtn.addEventListener('click', () => {
    if (recognition && isListening) {
        recognition.stop();
    }
});

speakBtn.addEventListener('click', speakTranslation);

clearOriginalBtn.addEventListener('click', clearTranscripts);

// Update recognition language when source language changes
sourceLanguageSelect.addEventListener('change', () => {
    if (recognition && !isListening) {
        recognition.lang = getWebSpeechLanguageCode(sourceLanguageSelect.value);
    }
});

// Retranslate when target language changes
targetLanguageSelect.addEventListener('change', () => {
    if (currentTranscript.trim()) {
        translateText(currentTranscript);
    }
});

// Role selection event listeners
patientBtn.addEventListener('click', selectPatientRole);
providerBtn.addEventListener('click', selectProviderRole);
swapLanguagesBtn.addEventListener('click', swapLanguages);