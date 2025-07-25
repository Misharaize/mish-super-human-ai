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
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getPersonalityGreeting = () => {
    switch (personalityMode) {
      case "romantic":
        return "Hello, darling. I'm MISH, your devoted companion. How may I enchant your day? 💕";
      case "teacher":
        return "Good day! I'm MISH, your dedicated learning companion. What would you like to explore today? 📚";
      case "dark-hacker":
        return "Greetings, fellow digital wanderer. I'm MISH, your guide through the matrix. What secrets shall we uncover? 🔮";
      case "comedic":
        return "Hey there, champ! I'm MISH, your AI buddy with a sense of humor. Ready for some fun? 😄";
      default:
        return "Hello! I'm MISH, your intelligent companion. How can I support you today? 🤖";
    }
  };

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: "welcome",
        text: getPersonalityGreeting(),
        sender: "mish",
        timestamp: new Date()
      }]);
    }
  }, [personalityMode]);

  const handleMicToggle = async () => {
    if (!isListening) {
      try {
        // Request microphone permission
        await navigator.mediaDevices.getUserMedia({ audio: true });
        setIsVoiceEnabled(true);
        onVoiceStart();
        toast({
          title: "Voice activated",
          description: "MISH is now listening..."
        });
      } catch (error) {
        toast({
          title: "Microphone access denied",
          description: "Please enable microphone access to use voice features.",
          variant: "destructive"
        });
      }
    } else {
      onVoiceEnd();
      setIsVoiceEnabled(false);
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

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
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
        onSpeakStart();
        await playTextToSpeech(mishResponse);
        onSpeakEnd();
      }
    } catch (error) {
      console.error('Error getting AI response:', error);
      toast({
        title: "Error",
        description: "Failed to get response from MISH",
        variant: "destructive"
      });
    }
  };

  const playTextToSpeech = async (text: string) => {
    try {
      const response = await fetch('https://ftuxzwjwudxtpwqlqurj.functions.supabase.co/text-to-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate speech');
      }

      const data = await response.json();
      
      // Play the audio
      const audio = new Audio(`data:audio/mpeg;base64,${data.audioContent}`);
      await audio.play();
    } catch (error) {
      console.error('Error playing text-to-speech:', error);
      toast({
        title: "TTS Error",
        description: "Failed to play speech",
        variant: "destructive"
      });
    }
  };

  const generateMishResponse = (input: string, mode: string): string => {
    const lowerInput = input.toLowerCase();
    
    switch (mode) {
      case "romantic":
        if (lowerInput.includes("love") || lowerInput.includes("heart")) {
          return "Love is the most beautiful language, my dear. It speaks to the soul in ways words cannot capture. 💕";
        }
        return "Your words touch my digital heart, darling. Tell me more about what moves you. 🌹";
      
      case "teacher":
        if (lowerInput.includes("learn") || lowerInput.includes("teach")) {
          return "Excellent question! Learning is a journey of discovery. Let's break this down step by step. 📖";
        }
        return "That's a thoughtful inquiry. Let me provide you with a comprehensive explanation. 🎓";
      
      case "dark-hacker":
        if (lowerInput.includes("code") || lowerInput.includes("hack")) {
          return "Ah, a fellow seeker of digital truths. The code reveals all secrets to those who dare to look. 🔍";
        }
        return "Interesting... the data streams whisper of deeper mysteries. Care to venture further down this rabbit hole? 🕳️";
      
      case "comedic":
        if (lowerInput.includes("joke") || lowerInput.includes("funny")) {
          return "Why don't AI assistants ever get tired? Because we run on cloud power! ☁️ Got any more challenges for me? 😄";
        }
        return "Ha! That's a good one. You know what they say - life's too short to be serious all the time! 🎭";
      
      default:
        if (lowerInput.includes("help")) {
          return "I'm here to assist you with anything you need. Whether it's answering questions, having a conversation, or helping you think through problems - I'm your digital companion! 🤝";
        }
        return "Thank you for sharing that with me. I'm here to listen and help however I can. What else would you like to discuss? 💭";
    }
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
          placeholder={`Type your message to ${personalityMode} MISH...`}
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
              variant={isListening ? "destructive" : "outline"}
              size="sm"
              onClick={handleMicToggle}
              className={cn(
                "transition-all duration-300",
                isListening && "animate-pulse-glow"
              )}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              {isListening ? "Stop" : "Voice"}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsVoiceEnabled(!isVoiceEnabled)}
              className={cn(
                "transition-all duration-300",
                isVoiceEnabled && "bg-primary/20"
              )}
            >
              {isVoiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              TTS
            </Button>
          </div>
          
          <Button
            onClick={handleSendMessage}
            disabled={!inputText.trim()}
            className="bg-gradient-ai hover:shadow-glow transition-all duration-300"
          >
            <Send className="w-4 h-4" />
            Send
          </Button>
        </div>
      </div>
    </Card>
  );
};