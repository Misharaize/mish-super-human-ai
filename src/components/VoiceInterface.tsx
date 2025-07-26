import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Mic, MicOff, Volume2, VolumeX, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface VoiceInterfaceProps {
  personalityMode: string;
  onVoiceStart: () => void;
  onVoiceEnd: () => void;
  onSpeakStart: () => void;
  onSpeakEnd: () => void;
  isListening: boolean;
  isSpeaking: boolean;
  className?: string;
}

export const VoiceInterface = ({
  personalityMode,
  onVoiceStart,
  onVoiceEnd,
  onSpeakStart,
  onSpeakEnd,
  isListening,
  isSpeaking,
  className
}: VoiceInterfaceProps) => {
  const [inputText, setInputText] = useState("");
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [messages, setMessages] = useState<Array<{id: string, text: string, sender: 'user' | 'mish', timestamp: Date}>>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getPersonalityGreeting = () => {
    switch (personalityMode) {
      case "romantic":
        return "Hello, darling. I'm MISHARAIZE, your devoted companion. How may I enchant your day? 💕";
      case "teacher":
        return "Good day! I'm MISHARAIZE, your dedicated learning companion. What would you like to explore today? 📚";
      case "dark-hacker":
        return "Greetings, fellow digital wanderer. I'm MISHARAIZE, your guide through the matrix. What secrets shall we uncover? 🔮";
      case "comedic":
        return "Hey there, champ! I'm MISHARAIZE, your AI buddy with a sense of humor. Ready for some fun? 😄";
      default:
        return "Hello! I'm MISHARAIZE, your intelligent companion. How can I support you today? 🤖";
    }
  };

  useEffect(() => {
    if (messages.length === 0) {
      const greeting = getPersonalityGreeting();
      setMessages([{
        id: "welcome",
        text: greeting,
        sender: "mish",
        timestamp: new Date()
      }]);
      
      // Auto-speak greeting if TTS is enabled
      if (isVoiceEnabled) {
        playTextToSpeech(greeting);
      }
    }
  }, [personalityMode, isVoiceEnabled]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setAudioChunks(prev => [...prev, event.data]);
        }
      };
      
      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        await processVoiceInput(audioBlob);
        setAudioChunks([]);
      };
      
      setMediaRecorder(recorder);
      recorder.start();
      setIsRecording(true);
      onVoiceStart();
      
      toast({
        title: "Recording started",
        description: "MISHARAIZE is listening to you..."
      });
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Microphone error",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      onVoiceEnd();
      
      toast({
        title: "Processing speech",
        description: "Converting your speech to text..."
      });
    }
  };

  const processVoiceInput = async (audioBlob: Blob) => {
    try {
      // Convert audio to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Audio = (reader.result as string).split(',')[1];
        
        // Send to speech-to-text service
        const response = await fetch('https://ftuxzwjwudxtpwqlqurj.functions.supabase.co/speech-to-text', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ audio: base64Audio }),
        });

        if (!response.ok) {
          throw new Error('Failed to transcribe speech');
        }

        const data = await response.json();
        const transcription = data.text || "Voice input received";
        
        setInputText(transcription);
        toast({
          title: "Speech recognized",
          description: `You said: "${transcription}"`
        });
      };
      reader.readAsDataURL(audioBlob);
    } catch (error) {
      console.error('Error processing voice input:', error);
      toast({
        title: "Speech processing error",
        description: "Could not process your speech. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleMicToggle = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      text: inputText,
      sender: "user" as const,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputText;
    setInputText("");

    try {
      console.log('Sending message to AI:', currentInput);
      
      // Get AI response
      const response = await fetch('https://ftuxzwjwudxtpwqlqurj.functions.supabase.co/chat-ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: currentInput,
          personalityMode
        }),
      });

      console.log('AI response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('AI response error:', errorText);
        throw new Error(`Failed to get AI response: ${response.status}`);
      }

      const data = await response.json();
      console.log('AI response data:', data);
      
      const mishResponse = data.response;
      
      const mishMessage = {
        id: (Date.now() + 1).toString(),
        text: mishResponse,
        sender: "mish" as const,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, mishMessage]);
      
      // Text-to-speech if enabled
      if (isVoiceEnabled) {
        await playTextToSpeech(mishResponse);
      }
    } catch (error) {
      console.error('Error getting AI response:', error);
      toast({
        title: "Error",
        description: "Failed to get response from MISHARAIZE. Please try again.",
        variant: "destructive"
      });
    }
  };

  const playTextToSpeech = async (text: string) => {
    try {
      // Stop any currently playing audio
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }

      onSpeakStart();
      
      console.log('Generating TTS for:', text);
      
      const response = await fetch('https://ftuxzwjwudxtpwqlqurj.functions.supabase.co/text-to-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      console.log('TTS response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('TTS response error:', errorText);
        throw new Error(`Failed to generate speech: ${response.status}`);
      }

      const data = await response.json();
      console.log('TTS response received');
      
      // Create and play audio
      const audioBlob = new Blob([
        Uint8Array.from(atob(data.audioContent), c => c.charCodeAt(0))
      ], { type: 'audio/mpeg' });
      
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      currentAudioRef.current = audio;
      
      audio.onended = () => {
        onSpeakEnd();
        URL.revokeObjectURL(audioUrl);
        currentAudioRef.current = null;
      };
      
      audio.onerror = (e) => {
        console.error('Audio playback error:', e);
        onSpeakEnd();
        URL.revokeObjectURL(audioUrl);
        currentAudioRef.current = null;
        throw new Error('Audio playback failed');
      };
      
      await audio.play();
      
    } catch (error) {
      console.error('Error playing text-to-speech:', error);
      onSpeakEnd();
      toast({
        title: "TTS Error",
        description: "Failed to play speech. Please check your connection.",
        variant: "destructive"
      });
    }
  };

  const toggleTTS = () => {
    setIsVoiceEnabled(!isVoiceEnabled);
    
    // Stop any currently playing audio when disabling TTS
    if (isVoiceEnabled && currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
      onSpeakEnd();
    }
    
    toast({
      title: isVoiceEnabled ? "TTS Disabled" : "TTS Enabled",
      description: isVoiceEnabled ? "MISHARAIZE will no longer speak responses" : "MISHARAIZE will now speak responses"
    });
  };

  return (
    <Card className={cn("p-6 bg-card/50 backdrop-blur-sm border-border/50", className)}>
      {/* Messages */}
      <div className="h-64 overflow-y-auto mb-4 space-y-3 scrollbar-thin">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex",
              message.sender === "user" ? "justify-end" : "justify-start"
            )}
          >
            <div
              className={cn(
                "max-w-[80%] p-3 rounded-lg",
                message.sender === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              <p className="text-sm">{message.text}</p>
              <span className="text-xs opacity-70 mt-1 block">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="space-y-3">
        <Textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={`Type your message to ${personalityMode} MISHARAIZE...`}
          className="min-h-[80px] bg-background/50"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
        />
        
        <div className="flex justify-between items-center">
          <div className="flex space-x-2">
            <Button
              variant={isRecording ? "destructive" : "outline"}
              size="sm"
              onClick={handleMicToggle}
              className={cn(
                "transition-all duration-300",
                isRecording && "animate-pulse-glow"
              )}
              disabled={isSpeaking}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              {isRecording ? "Stop" : "Voice"}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={toggleTTS}
              className={cn(
                "transition-all duration-300",
                isVoiceEnabled && "bg-primary/20"
              )}
            >
              {isVoiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              TTS {isVoiceEnabled ? "On" : "Off"}
            </Button>
          </div>
          
          <Button
            onClick={handleSendMessage}
            disabled={!inputText.trim() || isSpeaking}
            className="bg-gradient-ai hover:shadow-glow transition-all duration-300"
          >
            <Send className="w-4 h-4" />
            {isSpeaking ? "Speaking..." : "Send"}
          </Button>
        </div>
        
        {/* Status indicators */}
        <div className="flex justify-center space-x-4 text-xs text-muted-foreground">
          {isRecording && (
            <span className="flex items-center space-x-1 animate-pulse">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span>Recording...</span>
            </span>
          )}
          {isSpeaking && (
            <span className="flex items-center space-x-1 animate-pulse">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>MISHARAIZE is speaking...</span>
            </span>
          )}
          {isVoiceEnabled && !isSpeaking && !isRecording && (
            <span className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Voice ready</span>
            </span>
          )}
        </div>
      </div>
    </Card>
  );
};