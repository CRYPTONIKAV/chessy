import React from 'react';

type LevelProps = {
    id: string;
    title: string;
    description: string;
    icon: string;
    features: string[];
    color: string;
    isSelected: boolean;
    onClick: () => void;
};

export const LevelCard: React.FC<LevelProps> = ({
    title,
    description,
    icon,
    features,
    color,
    isSelected,
    onClick,
}) => {
    // Map color names/hex to tailwind classes for border/glow/text
    // Using dynamic styles based on the passed color string for flexibility
    // Assuming color is a valid CSS color or a tailwind utility suffix if configured, 
    // but here I'll use inline styles for the specific color values to ensure they match exact requirements
    // or define a map. Given the requirement "🟢🔵🟠🔴", I'll use specific hex/rgb values or tailwind colors.

    const getThemeStyles = (color: string) => {
        switch (color) {
            case 'green': return {
                border: 'border-green-500/50',
                bg: 'bg-green-500/5',
                glow: 'shadow-[0_0_30px_rgba(34,197,94,0.3)]',
                text: 'text-green-400',
                marker: 'text-green-500'
            };
            case 'blue': return {
                border: 'border-blue-500/50',
                bg: 'bg-blue-500/5',
                glow: 'shadow-[0_0_30px_rgba(59,130,246,0.3)]',
                text: 'text-blue-400',
                marker: 'text-blue-500'
            };
            case 'orange': return {
                border: 'border-orange-500/50',
                bg: 'bg-orange-500/5',
                glow: 'shadow-[0_0_30px_rgba(249,115,22,0.3)]',
                text: 'text-orange-400',
                marker: 'text-orange-500'
            };
            case 'red': return {
                border: 'border-red-600/50',
                bg: 'bg-red-600/5',
                glow: 'shadow-[0_0_30px_rgba(220,38,38,0.3)]',
                text: 'text-red-500', // Making red a bit more intense
                marker: 'text-red-500'
            };
            default: return {
                border: 'border-white/10',
                bg: 'bg-white/5',
                glow: '',
                text: 'text-white',
                marker: 'text-white'
            };
        }
    };

    const theme = getThemeStyles(color);

    return (
        <div
            onClick={onClick}
            role="radio"
            aria-checked={isSelected}
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    onClick();
                    e.preventDefault();
                }
            }}
            className={`
        relative group cursor-pointer p-6 rounded-2xl border transition-all duration-300 flex flex-col h-full
        ${isSelected
                    ? `${theme.bg} ${theme.border} ${theme.glow} scale-105`
                    : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10 hover:scale-102'}
      `}
        >
            {/* Selection Checkmark */}
            {isSelected && (
                <div className={`absolute top-4 right-4 w-6 h-6 rounded-full ${theme.bg.replace('/5', '')} border ${theme.border} flex items-center justify-center ${theme.text} text-xs font-bold animate-in zoom-in duration-300`}>
                    ✓
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col items-center mb-6">
                <div className="text-5xl mb-4 transform transition-transform group-hover:scale-110 duration-300 drop-shadow-lg">
                    {icon}
                </div>
                <h3 className={`text-2xl font-bold mb-2 ${isSelected ? theme.text : 'text-foreground'} tracking-wide`}>
                    {title}
                </h3>
                <p className="text-text-secondary text-sm text-center font-medium opacity-90">
                    {description}
                </p>
            </div>

            {/* Divider */}
            <div className={`w-full h-px ${isSelected ? theme.border : 'bg-white/10'} mb-6`} />

            {/* Features List */}
            <ul className="space-y-3 flex-grow">
                {features.map((feature, idx) => (
                    <li key={idx} className="flex items-start text-sm text-text-secondary/80">
                        <span className={`mr-2 mt-0.5 ${theme.marker}`}>•</span>
                        <span className="group-hover:text-foreground/90 transition-colors">{feature}</span>
                    </li>
                ))}
            </ul>

            {/* Decorative Glow on Hover */}
            <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br from-${color}-500/0 to-${color}-500/0 group-hover:from-${color}-500/5 group-hover:to-transparent pointer-events-none transition-all duration-500`} />
        </div>
    );
};
