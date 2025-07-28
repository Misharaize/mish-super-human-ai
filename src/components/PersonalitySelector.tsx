import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Heart, GraduationCap, Terminal, Laugh, Bot } from "lucide-react";

interface PersonalitySelectorProps {
  selectedMode: string;
  onModeChange: (mode: string) => void;
  className?: string;
}

const personalityModes = [
  {
    id: "default",
    name: "Default MISHARAIZE",
    description: "Supportive, humanlike assistant",
    icon: Bot,
    color: "primary",
    gradient: "from-primary/20 to-secondary/20"
  },
  {
    id: "romantic",
    name: "Romantic MISHARAIZE",
    description: "Gentle, poetic, soft-spoken",
    icon: Heart,
    color: "pink-400",
    gradient: "from-pink-400/20 to-purple-600/20"
  },
  {
    id: "teacher",
    name: "Teacher MISHARAIZE",
    description: "Calm, clear, and structured",
    icon: GraduationCap,
    color: "blue-400",
    gradient: "from-blue-400/20 to-indigo-600/20"
  },
  {
    id: "dark-hacker",
    name: "Dark Hacker MISHARAIZE",
    description: "Edgy, mysterious, tech-savvy",
    icon: Terminal,
    color: "green-400",
    gradient: "from-green-400/20 to-cyan-600/20"
  },
  {
    id: "comedic",
    name: "Comedic MISHARAIZE",
    description: "Witty, funny, quick with jokes",
    icon: Laugh,
    color: "yellow-400",
    gradient: "from-yellow-400/20 to-orange-600/20"
  }
];

export const PersonalitySelector = ({ selectedMode, onModeChange, className }: PersonalitySelectorProps) => {
  return (
    <Card className={cn("p-3 md:p-4 lg:p-6 bg-card/50 backdrop-blur-sm border-border/50", className)}>
      <h3 className="text-base md:text-lg font-semibold text-foreground mb-3 md:mb-4">Choose Personality Mode</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-2 md:gap-3">
        {personalityModes.map((mode) => {
          const IconComponent = mode.icon;
          const isSelected = selectedMode === mode.id;
          
          return (
            <Button
              key={mode.id}
              variant={isSelected ? "default" : "outline"}
              onClick={() => onModeChange(mode.id)}
              className={cn(
                "h-auto p-2 md:p-3 lg:p-4 flex flex-col items-center space-y-1 md:space-y-2 transition-all duration-300",
                "hover:scale-105 hover:shadow-ai text-xs md:text-sm",
                isSelected && "bg-gradient-ai border-primary shadow-glow"
              )}
            >
              <div className={cn(
                "p-1 md:p-2 rounded-full transition-colors",
                `bg-gradient-to-br ${mode.gradient}`
              )}>
                <IconComponent className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6" />
              </div>
              <div className="text-center">
                <div className="font-medium text-xs md:text-sm leading-tight">{mode.name}</div>
                <div className="text-xs opacity-70 mt-1 hidden md:block">{mode.description}</div>
              </div>
            </Button>
          );
        })}
      </div>
    </Card>
  );
};