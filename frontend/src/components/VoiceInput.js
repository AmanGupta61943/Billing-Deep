import React, { useEffect, useRef, useState } from 'react';
import './VoiceInput.css';

// Convert spoken number words to digits
const WORD_MAP = {
  zero:0,one:1,two:2,three:3,four:4,five:5,
  six:6,seven:7,eight:8,nine:9,ten:10,
  eleven:11,twelve:12,thirteen:13,fourteen:14,fifteen:15,
  sixteen:16,seventeen:17,eighteen:18,nineteen:19,twenty:20,
  'twenty one':21,'twenty two':22,'twenty five':25,'twenty seven':27,
  'thirty':30,'forty':40,'fifty':50,'hundred':100,
};

function wordsToNumber(word) {
  const w = word.toLowerCase().trim();
  if (!isNaN(w) && w !== '') return parseInt(w, 10);
  if (WORD_MAP[w] !== undefined) return WORD_MAP[w];
  return null;
}

// Parse "2 milk", "milk 2", "two milk", "milk two"
function parseVoiceCommand(text) {
  const tokens = text.toLowerCase().trim().split(/\s+/);
  // Try first token as quantity
  const firstNum = wordsToNumber(tokens[0]);
  if (firstNum !== null && tokens.length > 1) {
    return { quantity: firstNum, name: tokens.slice(1).join(' ') };
  }
  // Try last token as quantity
  const lastNum = wordsToNumber(tokens[tokens.length - 1]);
  if (lastNum !== null && tokens.length > 1) {
    return { quantity: lastNum, name: tokens.slice(0, -1).join(' ') };
  }
  // No quantity found — assume 1
  return { quantity: 1, name: text.toLowerCase().trim() };
}

/**
 * VoiceInput — uses Web Speech API to parse spoken product commands.
 * Speaks → searches backend → adds to bill. Zero external dependency.
 */
function VoiceInput({ onProductFound, onClose, axiosClient }) {
  const [status, setStatus]       = useState('listening'); // listening | processing | success | error | unsupported
  const [transcript, setTranscript] = useState('');
  const [message, setMessage]     = useState('');
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setStatus('unsupported');
      setMessage('Voice input is not supported in this browser. Use Chrome or Brave.');
      return;
    }

    const recognition = new SR();
    recognitionRef.current = recognition;
    recognition.lang        = 'en-IN';
    recognition.interimResults = true;
    recognition.continuous  = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (e) => {
      const text = Array.from(e.results)
        .map(r => r[0].transcript)
        .join(' ')
        .trim();
      setTranscript(text);
      if (e.results[e.results.length - 1].isFinal) {
        handleFinalTranscript(text);
      }
    };

    recognition.onerror = (e) => {
      if (e.error === 'no-speech') {
        setStatus('error');
        setMessage('No speech detected. Please speak clearly.');
      } else {
        setStatus('error');
        setMessage(`Voice error: ${e.error}`);
      }
    };

    recognition.onend = () => {
      // only restart if still in listening mode (not processing/success/error)
    };

    recognition.start();

    return () => {
      recognition.abort();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFinalTranscript = async (text) => {
    setStatus('processing');
    setMessage('Searching for product…');

    const { quantity, name } = parseVoiceCommand(text);
    console.log('[Voice] parsed:', { quantity, name });

    try {
      const res = await axiosClient.get(`/api/products/search?q=${encodeURIComponent(name)}`);
      const products = res.data;

      if (!products || products.length === 0) {
        setStatus('error');
        setMessage(`"${name}" not found in stock. Try adding it first.`);
        return;
      }

      const product = products[0]; // take best match
      setStatus('success');
      setMessage(`✅ ${quantity} × ${product.name} added!`);
      onProductFound(product, quantity);

      // Auto-close after 1 second
      setTimeout(() => onClose(), 1000);
    } catch (err) {
      setStatus('error');
      setMessage('Network error. Check your connection.');
      console.error('[Voice] search error:', err);
    }
  };

  const handleRetry = () => {
    setStatus('listening');
    setTranscript('');
    setMessage('');
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SR && recognitionRef.current) {
      try { recognitionRef.current.start(); } catch (_) {}
    }
  };

  return (
    <div className="vi-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="vi-card">
        {/* Header */}
        <div className="vi-header">
          <span className="vi-title">🎤 Voice Add</span>
          <button className="vi-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {/* Mic animation */}
        <div className={`vi-mic ${status === 'listening' ? 'vi-mic--pulse' : ''} ${status === 'success' ? 'vi-mic--success' : ''} ${status === 'error' ? 'vi-mic--error' : ''}`}>
          {status === 'processing' ? '⏳' : status === 'success' ? '✅' : status === 'error' ? '❌' : status === 'unsupported' ? '🚫' : '🎤'}
        </div>

        {/* Status label */}
        <p className="vi-status-label">
          {status === 'listening'    && 'Listening…'}
          {status === 'processing'   && 'Processing…'}
          {status === 'success'      && 'Added!'}
          {status === 'error'        && 'Not found'}
          {status === 'unsupported'  && 'Not supported'}
        </p>

        {/* Transcript */}
        {transcript && (
          <div className="vi-transcript">
            "{transcript}"
          </div>
        )}

        {/* Message */}
        {message && <p className="vi-message">{message}</p>}

        {/* Examples */}
        {status === 'listening' && !transcript && (
          <div className="vi-examples">
            <span>Say: "1 milk" · "two banana" · "rice 3"</span>
          </div>
        )}

        {/* Retry button */}
        {(status === 'error') && (
          <button className="vi-retry" onClick={handleRetry}>🎤 Try Again</button>
        )}
      </div>
    </div>
  );
}

export default VoiceInput;
