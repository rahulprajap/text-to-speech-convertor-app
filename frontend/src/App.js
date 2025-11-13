import React, { useState, useEffect, useRef } from 'react';
import './App.css';

function App() {
  const [text, setText] = useState('');
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const synthRef = useRef(null);
  const utteranceRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioContextRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    // Initialize speech synthesis
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
      
      // Set default voice (prefer English voices)
      if (availableVoices.length > 0 && !selectedVoice) {
        const defaultVoice = availableVoices.find(voice => 
          voice.lang.startsWith('en')
        ) || availableVoices[0];
        setSelectedVoice(defaultVoice);
      }
    };

    if ('speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
      loadVoices();
      
      // Some browsers load voices asynchronously
      if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = loadVoices;
      }
    } else {
      alert('Your browser does not support the Web Speech API. Please use a modern browser like Chrome, Firefox, or Edge.');
    }

    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePlay = () => {
    if (!text.trim()) {
      alert('Please enter some text to convert to speech.');
      return;
    }

    if (isPaused && utteranceRef.current) {
      // Resume if paused
      synthRef.current.resume();
      setIsPaused(false);
      setIsPlaying(true);
    } else {
      // Create new utterance
      const utterance = new SpeechSynthesisUtterance(text);
      
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
      
      utterance.rate = rate;
      utterance.pitch = pitch;
      
      utterance.onstart = () => {
        setIsPlaying(true);
        setIsPaused(false);
      };
      
      utterance.onend = () => {
        setIsPlaying(false);
        setIsPaused(false);
        utteranceRef.current = null;
      };
      
      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        setIsPlaying(false);
        setIsPaused(false);
        utteranceRef.current = null;
      };
      
      utteranceRef.current = utterance;
      synthRef.current.speak(utterance);
    }
  };

  const handlePause = () => {
    if (synthRef.current && isPlaying && !isPaused) {
      synthRef.current.pause();
      setIsPaused(true);
    }
  };

  const handleStop = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsPlaying(false);
      setIsPaused(false);
      utteranceRef.current = null;
    }
    // Stop recording if active
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleDownload = async () => {
    if (!text.trim()) {
      alert('Please enter some text to convert to speech.');
      return;
    }

    // Browser TTS download
    try {
      setIsRecording(true);
      audioChunksRef.current = [];

      // Request microphone permission to capture system audio
      // Note: This is a workaround - some browsers may require system audio capture
      let stream = null;
      
      try {
        // Try to get user media (for system audio capture in some browsers)
        stream = await navigator.mediaDevices.getUserMedia({ 
          audio: {
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false
          } 
        });
        mediaStreamRef.current = stream;
      } catch (err) {
        console.log('Could not get user media, trying alternative method...');
      }

      // Create audio context
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioContextRef.current = new AudioContext();

      let mediaRecorder;
      
      if (stream) {
        // Use the stream from getUserMedia
        mediaRecorder = new MediaRecorder(stream, {
          mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4'
        });
      } else {
        // Fallback: Create a destination stream
        const destination = audioContextRef.current.createMediaStreamDestination();
        mediaRecorder = new MediaRecorder(destination.stream, {
          mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4'
        });
      }

      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        if (audioChunksRef.current.length > 0) {
          const audioBlob = new Blob(audioChunksRef.current, { 
            type: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4' 
          });
          
          // Create download link
          const url = URL.createObjectURL(audioBlob);
          const a = document.createElement('a');
          a.href = url;
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          a.download = `voice-${timestamp}.${MediaRecorder.isTypeSupported('audio/webm') ? 'webm' : 'mp4'}`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        } else {
          alert('No audio was recorded. Please try again or use the Play button first to test the voice.');
        }
        
        setIsRecording(false);
        
        // Cleanup
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
        if (audioContextRef.current) {
          audioContextRef.current.close();
        }
      };

      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        setIsRecording(false);
        handleDownloadFallback();
      };

      // Start recording
      mediaRecorder.start(100); // Collect data every 100ms

      // Create utterance
      const utterance = new SpeechSynthesisUtterance(text);
      
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
      
      utterance.rate = rate;
      utterance.pitch = pitch;

      // Calculate approximate duration (rough estimate)
      const estimatedDuration = (text.length / 10) * 1000; // Rough estimate: 10 chars per second
      
      utterance.onend = () => {
        // Wait a bit longer to ensure all audio is captured
        setTimeout(() => {
          if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
          }
        }, 1000);
      };

      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop();
        }
        setIsRecording(false);
      };

      // Play the speech
      synthRef.current.speak(utterance);

      // Fallback timeout in case onend doesn't fire
      setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop();
        }
      }, estimatedDuration + 2000);

    } catch (error) {
      console.error('Error recording audio:', error);
      setIsRecording(false);
      handleDownloadFallback();
    }
  };

  const handleDownloadFallback = () => {
    // Fallback method: Create speech and provide instructions
    if (!text.trim()) {
      alert('Please enter some text to convert to speech.');
      return;
    }

    // Create utterance
    const utterance = new SpeechSynthesisUtterance(text);
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    
    utterance.rate = rate;
    utterance.pitch = pitch;

    // Play the speech
    synthRef.current.speak(utterance);
    
    // Show message
    alert('Audio download feature requires browser permissions. Please use Chrome or Edge for best results. Alternatively, you can use browser extensions or screen recording software to capture the audio.');
  };

  const handleVoiceSelect = (voice) => {
    setSelectedVoice(voice);
    setIsDropdownOpen(false);
    setSearchQuery('');
  };

  const getVoiceLabel = (voice) => {
    if (!voice) return '';
    const gender = voice.name.toLowerCase().includes('female') || 
                   voice.name.toLowerCase().includes('zira') ||
                   voice.name.toLowerCase().includes('samantha') ||
                   voice.name.toLowerCase().includes('karen') ||
                   voice.name.toLowerCase().includes('susan')
                   ? 'Female' 
                   : voice.name.toLowerCase().includes('male') ||
                     voice.name.toLowerCase().includes('david') ||
                     voice.name.toLowerCase().includes('mark')
                     ? 'Male'
                     : 'Unknown';
    return `${voice.name} (${voice.lang}) - ${gender}`;
  };

  const filteredVoices = voices.filter(voice => {
    const label = getVoiceLabel(voice).toLowerCase();
    return label.includes(searchQuery.toLowerCase());
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 py-8 px-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-400 rounded-2xl mb-4 shadow-2xl transform hover:scale-110 transition-transform duration-300">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-pink-200 to-blue-200 mb-3">
            Voice Generator
          </h1>
          <p className="text-blue-200 text-lg">
            Transform text into natural speech with AI-powered voices
          </p>
        </div>

        {/* Main Card */}
        <div className="backdrop-blur-xl bg-white/10 rounded-3xl shadow-2xl border border-white/20 p-6 md:p-10 mb-6">
          {/* Text Input Area */}
          <div className="mb-8">
            <label htmlFor="text-input" className="block text-sm font-semibold text-purple-200 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Enter or paste your text
            </label>
            <div className="relative">
              <textarea
                id="text-input"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type or paste your text here to convert it to speech..."
                className="w-full h-56 p-5 bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-2xl text-white placeholder-white/50 focus:border-purple-400 focus:ring-4 focus:ring-purple-400/30 outline-none resize-none transition-all duration-300 text-lg"
                disabled={isPlaying && !isPaused}
              />
              <div className="absolute bottom-4 right-4 text-xs text-white/60 bg-black/20 px-3 py-1 rounded-full backdrop-blur-sm">
                {text.length} characters
              </div>
            </div>
          </div>

          {/* Voice Selection - Searchable Dropdown */}
          <div className="mb-8">
            <label htmlFor="voice-select" className="block text-sm font-semibold text-purple-200 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
              Select Voice
            </label>
            <div className="relative" ref={dropdownRef}>
              {/* Selected Voice Display / Search Input */}
              <div
                onClick={() => !(isPlaying && !isPaused) && setIsDropdownOpen(!isDropdownOpen)}
                className={`w-full p-4 bg-white/10 backdrop-blur-sm border-2 ${
                  isDropdownOpen ? 'border-purple-400' : 'border-white/20'
                } rounded-2xl text-white focus-within:border-purple-400 focus-within:ring-4 focus-within:ring-purple-400/30 outline-none transition-all duration-300 cursor-pointer text-lg flex items-center justify-between ${
                  isPlaying && !isPaused ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isDropdownOpen ? (
                  <div className="flex items-center gap-2 w-full">
                    <svg className="w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      placeholder="Type to search voices..."
                      className="flex-1 bg-transparent text-white placeholder-white/50 outline-none text-lg"
                      autoFocus
                    />
                  </div>
                ) : (
                  <span className="text-white">
                    {selectedVoice ? getVoiceLabel(selectedVoice) : 'Select a voice...'}
                  </span>
                )}
                <svg
                  className={`w-6 h-6 text-white/60 transition-transform duration-300 ${
                    isDropdownOpen ? 'transform rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {/* Dropdown Options */}
              {isDropdownOpen && (
                <div className="absolute z-50 w-full mt-2 bg-gray-900 border-2 border-purple-500/50 rounded-2xl shadow-2xl max-h-80 overflow-hidden">
                  <div className="max-h-80 overflow-y-auto custom-scrollbar">
                    {filteredVoices.length > 0 ? (
                      filteredVoices.map((voice, index) => {
                        const isSelected = selectedVoice === voice;
                        const label = getVoiceLabel(voice);
                        
                        return (
                          <div
                            key={index}
                            onClick={() => handleVoiceSelect(voice)}
                            className={`p-4 cursor-pointer transition-all duration-200 ${
                              isSelected
                                ? 'bg-purple-600 text-white border-l-4 border-purple-400'
                                : 'text-white hover:bg-gray-800 hover:text-white'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-base font-medium">{label}</span>
                              {isSelected && (
                                <svg className="w-5 h-5 text-purple-400 ml-2" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              )}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="p-4 text-gray-400 text-center">
                        No voices found matching "{searchQuery}"
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Controls Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Speech Rate */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <label htmlFor="rate-slider" className="text-sm font-semibold text-purple-200 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Speech Rate
                </label>
                <span className="text-2xl font-bold text-white bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  {rate.toFixed(1)}x
                </span>
              </div>
              <input
                id="rate-slider"
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={rate}
                onChange={(e) => setRate(parseFloat(e.target.value))}
                className="w-full h-3 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                disabled={isPlaying && !isPaused}
              />
              <div className="flex justify-between text-xs text-white/50 mt-3">
                <span>Slow</span>
                <span>Normal</span>
                <span>Fast</span>
              </div>
            </div>

            {/* Pitch */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <label htmlFor="pitch-slider" className="text-sm font-semibold text-purple-200 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                  Pitch
                </label>
                <span className="text-2xl font-bold text-white bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  {pitch.toFixed(1)}
                </span>
              </div>
              <input
                id="pitch-slider"
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={pitch}
                onChange={(e) => setPitch(parseFloat(e.target.value))}
                className="w-full h-3 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                disabled={isPlaying && !isPaused}
              />
              <div className="flex justify-between text-xs text-white/50 mt-3">
                <span>Low</span>
                <span>Normal</span>
                <span>High</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 justify-center mb-6">
            <button
              onClick={handlePlay}
              disabled={!text.trim() || (isPlaying && !isPaused)}
              className="group relative px-10 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-bold text-lg shadow-2xl hover:shadow-purple-500/50 focus:outline-none focus:ring-4 focus:ring-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-110 active:scale-95 overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                {isPaused ? (
                  <>
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                    Resume
                  </>
                ) : (
                  <>
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                    </svg>
                    Play
                  </>
                )}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-700 to-pink-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
            
            <button
              onClick={handlePause}
              disabled={!isPlaying || isPaused}
              className="group relative px-10 py-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-2xl font-bold text-lg shadow-2xl hover:shadow-yellow-500/50 focus:outline-none focus:ring-4 focus:ring-yellow-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-110 active:scale-95 overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                Pause
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-600 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
            
            <button
              onClick={handleStop}
              disabled={!isPlaying && !isPaused}
              className="group relative px-10 py-4 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-2xl font-bold text-lg shadow-2xl hover:shadow-red-500/50 focus:outline-none focus:ring-4 focus:ring-red-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-110 active:scale-95 overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                </svg>
                Stop
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>

            <button
              onClick={handleDownload}
              disabled={!text.trim() || isRecording || isPlaying}
              className="group relative px-10 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl font-bold text-lg shadow-2xl hover:shadow-green-500/50 focus:outline-none focus:ring-4 focus:ring-green-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-110 active:scale-95 overflow-hidden"
            >
              <span className="relative z-10 flex items-center gap-2">
                {isRecording ? (
                  <>
                    <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Recording...
                  </>
                ) : (
                  <>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download
                  </>
                )}
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
          </div>

          {/* Status Indicator */}
          {(isPlaying || isPaused || isRecording) && (
            <div className="mt-6 text-center">
              <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-2xl backdrop-blur-sm border ${
                isRecording
                  ? 'bg-blue-500/20 border-blue-400/30 text-blue-200'
                  : isPaused 
                  ? 'bg-yellow-500/20 border-yellow-400/30 text-yellow-200' 
                  : 'bg-green-500/20 border-green-400/30 text-green-200'
              }`}>
                <div className={`w-3 h-3 rounded-full ${
                  isRecording 
                    ? 'bg-blue-400 animate-pulse' 
                    : isPaused 
                    ? 'bg-yellow-400' 
                    : 'bg-green-400 animate-pulse'
                }`}></div>
                <span className="font-semibold">
                  {isRecording ? 'Recording audio...' : isPaused ? 'Paused' : 'Playing...'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 text-blue-200">
            <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <span className="text-sm">Chrome and Edge offer the best voice selection</span>
          </div>
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 text-purple-200">
            <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span className="text-sm">Download feature: Click Download to record and save the audio file</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

