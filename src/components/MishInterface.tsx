import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MishAvatar } from "./MishAvatar";
import { PersonalitySelector } from "./PersonalitySelector";
import { VoiceInterface } from "./VoiceInterface";
import { cn } from "@/lib/utils";
import { Brain, Mic, Volume2, Languages } from "lucide-react";

export const MishInterface = () => {
  const [personalityMode, setPersonalityMode] = useState("default");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleVoiceStart = () => setIsListening(true);
  const handleVoiceEnd = () => setIsListening(false);
  const handleSpeakStart = () => setIsSpeaking(true);
  const handleSpeakEnd = () => setIsSpeaking(false);

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <div className="p-4 md:p-6 text-center border-b border-border/20">
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold bg-gradient-ai bg-clip-text text-transparent mb-2">
          MISHARAIZE
        </h1>
        <p className="text-base md:text-lg text-muted-foreground mb-4">
          Multimodal Interactive Super Human
        </p>
        
        {/* Feature Badges */}
        <div className="flex flex-wrap justify-center gap-1 md:gap-2">
          <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30 text-xs md:text-sm">
            <Brain className="w-3 h-3 mr-1" />
            <span className="hidden sm:inline">AI Powered</span>
            <span className="sm:hidden">AI</span>
          </Badge>
          <Badge variant="secondary" className="bg-secondary/20 text-secondary border-secondary/30 text-xs md:text-sm">
            <Mic className="w-3 h-3 mr-1" />
            <span className="hidden sm:inline">Voice Input</span>
            <span className="sm:hidden">Voice</span>
          </Badge>
          <Badge variant="secondary" className="bg-ai-neural/20 text-ai-neural border-ai-neural/30 text-xs md:text-sm">
            <Volume2 className="w-3 h-3 mr-1" />
            <span className="hidden sm:inline">TTS Output</span>
            <span className="sm:hidden">TTS</span>
          </Badge>
          <Badge variant="secondary" className="bg-accent/20 text-accent border-accent/30 text-xs md:text-sm">
            <Languages className="w-3 h-3 mr-1" />
            <span className="hidden sm:inline">Multi-language</span>
            <span className="sm:hidden">Multi</span>
          </Badge>
        </div>
      </div>

      <div className="container mx-auto px-2 md:px-4 py-4 md:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
          {/* Left Column - Avatar & Personality */}
          <div className="space-y-4 md:space-y-6">
            {/* Avatar */}
            <Card className="p-4 md:p-6 lg:p-8 bg-card/30 backdrop-blur-sm border-border/50 text-center">
              <MishAvatar 
                personalityMode={personalityMode}
                isListening={isListening}
                isSpeaking={isSpeaking}
              />
            </Card>

            {/* Personality Selector */}
            <PersonalitySelector
              selectedMode={personalityMode}
              onModeChange={setPersonalityMode}
            />
          </div>

          {/* Right Column - Voice Interface */}
          <div className="lg:col-span-2">
            <VoiceInterface
              personalityMode={personalityMode}
              onVoiceStart={handleVoiceStart}
              onVoiceEnd={handleVoiceEnd}
              onSpeakStart={handleSpeakStart}
              onSpeakEnd={handleSpeakEnd}
              isListening={isListening}
              isSpeaking={isSpeaking}
              className="h-full min-h-[500px] md:min-h-[600px]"
            />
          </div>
        </div>

        {/* Footer Info */}
        <Card className="mt-4 md:mt-8 p-3 md:p-6 bg-card/20 backdrop-blur-sm border-border/30">
          <div className="text-center text-xs md:text-sm text-muted-foreground">
            <p className="mb-2">
              <strong>MISHARAIZE Features:</strong> Voice Recognition • Text-to-Speech • Emotional Responses • Multi-language Support
            </p>
            <p className="hidden md:block">
              Switch between personality modes to experience different communication styles. 
              Use voice or text to interact naturally with your AI companion.
            </p>
            <p className="md:hidden">
              Switch personality modes and interact with voice or text.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};