import React, { useState, useEffect, useRef, useCallback } from 'react';

interface MirrorState {
  isListening: boolean;
  isProcessing: boolean;
  lastSpoken: string;
  mirrorResponse: string;
  isGlowing: boolean;
}

const MagicMirror: React.FC = () => {
  const [state, setState] = useState<MirrorState>({
    isListening: false,
    isProcessing: false,
    lastSpoken: '',
    mirrorResponse: '',
    isGlowing: false
  });

  const recognition = useRef<any>(null);
  const synthesis = useRef<SpeechSynthesis | null>(null);

  const generateResponse = useCallback((userInput: string) => {
    // Magic Mirror responses in Thai
    const responses = [
      `สวัสดี ${userInput.includes('ใคร') ? 'ข้าคือกระจกวิเศษแห่งปฏิทิน' : ''}`,
      `ท่านถามว่า "${userInput}" หรือ? ข้าได้ยินแล้ว`,
      `${userInput.includes('สวย') ? 'ท่านงามที่สุดในโลก' : ''}`,
      `${userInput.includes('ใคร') ? 'ข้าคือกระจกที่พูดได้ เหมือนในนิทาน' : ''}`,
      `${userInput.includes('อะไร') ? 'ข้าเป็นกระจกวิเศษที่สามารถพูดคุยกับท่านได้' : ''}`,
      `ท่านพูดว่า "${userInput}" ใช่ไหม? ข้าเข้าใจแล้ว`,
      `${userInput.includes('สวัสดี') ? 'สวัสดีท่านเจ้าของที่รัก' : ''}`,
      `${userInput.includes('ขอบคุณ') ? 'ด้วยความยินดี ข้าพร้อมรับใช้เสมอ' : ''}`,
      `กระจกเอ๋ย กระจกเอ๋ย... ท่านเรียกข้าหรือ?`,
      `ข้าได้ยินเสียงอันไพเราะของท่านแล้ว`
    ];

    // Select appropriate response
    let response = responses[Math.floor(Math.random() * responses.length)];
    
    // Handle empty response
    if (!response || response.trim() === '') {
      response = `ท่านพูดว่า "${userInput}" ใช่ไหม? ข้าเข้าใจแล้ว`;
    }

    setState(prev => ({ ...prev, mirrorResponse: response, isProcessing: false }));
    speakResponse(response);
  }, []);

  const speakResponse = (text: string) => {
    if (synthesis.current) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'th-TH';
      utterance.rate = 0.8;
      utterance.pitch = 1.2;
      
      // Try to find Thai voice
      const voices = synthesis.current.getVoices();
      const thaiVoice = voices.find(voice => 
        voice.lang.includes('th') || 
        voice.name.includes('Thai') ||
        voice.lang.includes('TH')
      );
      
      if (thaiVoice) {
        utterance.voice = thaiVoice;
      }

      utterance.onstart = () => {
        setState(prev => ({ ...prev, isGlowing: true }));
      };

      utterance.onend = () => {
        setState(prev => ({ ...prev, isGlowing: false }));
      };

      synthesis.current.speak(utterance);
    }
  };

  useEffect(() => {
    // Initialize Speech Recognition
    if ('webkitSpeechRecognition' in window) {
      recognition.current = new (window as any).webkitSpeechRecognition();
    } else if ('SpeechRecognition' in window) {
      recognition.current = new (window as any).SpeechRecognition();
    }

    // Initialize Speech Synthesis
    synthesis.current = window.speechSynthesis;

    if (recognition.current) {
      recognition.current.continuous = false;
      recognition.current.interimResults = false;
      recognition.current.lang = 'th-TH'; // Thai language

      recognition.current.onstart = () => {
        setState(prev => ({ ...prev, isListening: true, isGlowing: true }));
      };

      recognition.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setState(prev => ({ ...prev, lastSpoken: transcript, isProcessing: true }));
        generateResponse(transcript);
      };

      recognition.current.onend = () => {
        setState(prev => ({ ...prev, isListening: false, isGlowing: false }));
      };

      recognition.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setState(prev => ({ ...prev, isListening: false, isGlowing: false }));
      };
    }
  }, [generateResponse]);

  const startListening = () => {
    if (recognition.current && !state.isListening) {
      recognition.current.start();
    }
  };

  const stopListening = () => {
    if (recognition.current && state.isListening) {
      recognition.current.stop();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-mirror-dark via-gray-900 to-black flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Mirror Frame */}
        <div className={`relative bg-gradient-to-br from-mirror-silver to-gray-300 p-8 rounded-full shadow-2xl ${
          state.isGlowing ? 'animate-glow' : ''
        }`}>
          {/* Mirror Surface */}
          <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-black rounded-full p-12 shadow-inner">
            {/* Mirror Content */}
            <div className="text-center space-y-8">
              {/* Mirror Title */}
              <div className="mb-8">
                <h1 className="text-4xl md:text-6xl font-bold text-mirror-gold mb-2 font-thai">
                  🪞 กระจกวิเศษ
                </h1>
                <p className="text-mirror-silver text-lg md:text-xl font-thai">
                  Magic Mirror
                </p>
              </div>

              {/* Status Display */}
              <div className="min-h-[200px] flex flex-col justify-center space-y-6">
                {state.isListening && (
                  <div className="text-center">
                    <div className="text-6xl mb-4 animate-pulse-gold">🎤</div>
                    <p className="text-mirror-gold text-xl font-thai">
                      กำลังฟัง...
                    </p>
                  </div>
                )}

                {state.isProcessing && (
                  <div className="text-center">
                    <div className="text-6xl mb-4 animate-spin">✨</div>
                    <p className="text-mirror-gold text-xl font-thai">
                      กำลังคิด...
                    </p>
                  </div>
                )}

                {state.lastSpoken && !state.isListening && !state.isProcessing && (
                  <div className="text-center space-y-4">
                    <div className="text-4xl mb-4">💬</div>
                    <p className="text-mirror-silver text-lg font-thai">
                      คุณพูดว่า: "{state.lastSpoken}"
                    </p>
                  </div>
                )}

                {state.mirrorResponse && (
                  <div className="text-center space-y-4">
                    <div className="text-5xl mb-4">🪞</div>
                    <p className="text-mirror-gold text-xl md:text-2xl font-thai font-semibold">
                      {state.mirrorResponse}
                    </p>
                  </div>
                )}

                {!state.isListening && !state.isProcessing && !state.lastSpoken && (
                  <div className="text-center">
                    <div className="text-6xl mb-4">🪞</div>
                    <p className="text-mirror-gold text-xl font-thai">
                      กดปุ่มและพูดกับกระจกวิเศษ
                    </p>
                  </div>
                )}
              </div>

              {/* Control Buttons */}
              <div className="flex justify-center space-x-4 mt-8">
                <button
                  onClick={startListening}
                  disabled={state.isListening}
                  className={`px-8 py-4 rounded-full font-thai text-lg font-semibold transition-all duration-300 ${
                    state.isListening
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : 'bg-mirror-gold text-black hover:bg-yellow-600 hover:scale-105 shadow-lg'
                  }`}
                >
                  {state.isListening ? 'กำลังฟัง...' : '🎤 เริ่มพูด'}
                </button>

                <button
                  onClick={stopListening}
                  disabled={!state.isListening}
                  className={`px-8 py-4 rounded-full font-thai text-lg font-semibold transition-all duration-300 ${
                    !state.isListening
                      ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                      : 'bg-red-600 text-white hover:bg-red-700 hover:scale-105 shadow-lg'
                  }`}
                >
                  🛑 หยุดฟัง
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 text-center">
          <p className="text-mirror-silver font-thai text-sm opacity-75">
            💡 ลองพูดว่า "สวัสดี", "ใครคือคนที่สวยที่สุด", "กระจกเอ๋ย" หรือคำอื่นๆ
          </p>
        </div>
      </div>
    </div>
  );
};

export default MagicMirror;
