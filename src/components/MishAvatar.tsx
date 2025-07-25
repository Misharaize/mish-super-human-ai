import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface MishAvatarProps {
  personalityMode: string;
  isListening: boolean;
  isSpeaking: boolean;
  className?: string;
}

export const MishAvatar = ({ personalityMode, isListening, isSpeaking, className }: MishAvatarProps) => {
  const [currentExpression, setCurrentExpression] = useState("neutral");

  useEffect(() => {
    if (isSpeaking) {
      setCurrentExpression("speaking");
    } else if (isListening) {
      setCurrentExpression("listening");
    } else {
      setCurrentExpression("neutral");
    }
  }, [isSpeaking, isListening]);

  const getAvatarStyle = () => {
    const baseStyles = "w-48 h-48 rounded-full border-4 transition-all duration-500";
    
    switch (personalityMode) {
      case "romantic":
        return `${baseStyles} bg-gradient-to-br from-pink-400/20 to-purple-600/20 border-pink-400 shadow-glow`;
      case "teacher":
        return `${baseStyles} bg-gradient-to-br from-blue-400/20 to-indigo-600/20 border-blue-400 shadow-ai`;
      case "dark-hacker":
        return `${baseStyles} bg-gradient-to-br from-green-400/20 to-cyan-600/20 border-green-400 shadow-neural`;
      case "comedic":
        return `${baseStyles} bg-gradient-to-br from-yellow-400/20 to-orange-600/20 border-yellow-400 shadow-glow`;
      default:
        return `${baseStyles} bg-gradient-ai border-primary shadow-ai`;
    }
  };

  const getExpressionClass = () => {
    if (isSpeaking) return "animate-neural-pulse";
    if (isListening) return "animate-pulse-glow";
    return "animate-float";
  };

  return (
    <div className={cn("flex flex-col items-center space-y-4", className)}>
      <div 
        className={cn(
          getAvatarStyle(),
          getExpressionClass(),
          "flex items-center justify-center relative overflow-hidden"
        )}
      >
        {/* Neural Network Background */}
        <div className="absolute inset-0 opacity-20">
          <div className="w-full h-full bg-gradient-neural animate-gradient-shift bg-[length:200%_200%]" />
        </div>
        
        {/* Central AI Core */}
        <div className="relative z-10 w-24 h-24 rounded-full bg-primary/30 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-primary animate-pulse-glow" />
        </div>

        {/* Expression Indicators */}
        {currentExpression === "speaking" && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-1 bg-primary rounded-full animate-pulse" />
          </div>
        )}
        
        {currentExpression === "listening" && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="flex space-x-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-2 h-8 bg-primary rounded-full animate-pulse"
                  style={{ animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Status Indicator */}
      <div className="text-center">
        <div className="text-sm font-medium text-primary mb-1">
          {personalityMode.charAt(0).toUpperCase() + personalityMode.slice(1)} MISH
        </div>
        <div className="text-xs text-muted-foreground">
          {isSpeaking ? "Speaking..." : isListening ? "Listening..." : "Ready"}
        </div>
      </div>
    </div>
  );
};