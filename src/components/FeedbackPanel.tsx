import React from 'react';

interface FeedbackPanelProps {
  explanation?: string;
  details?: string[];
  tactics?: string[];
  calm?: boolean;
  grade?: string;
  isCollapsible?: boolean;
  defaultExpanded?: boolean;
}

const FeedbackPanel: React.FC<FeedbackPanelProps> = ({
  explanation,
  details = [],
  tactics = [],
  calm = true,
  grade,
  isCollapsible = false,
  defaultExpanded = true
}) => {
  const [isExpanded, setIsExpanded] = React.useState(defaultExpanded);

  // Auto-expand/collapse if defaultExpanded changes (e.g. when switching difficulties)
  React.useEffect(() => {
    setIsExpanded(defaultExpanded);
  }, [defaultExpanded]);

  const toggleExpand = () => {
    if (isCollapsible) {
      setIsExpanded(!isExpanded);
    }
  };

  const getGradeIcon = (g: string) => {
    switch (g) {
      case 'brilliant': return '💎';
      case 'good': return '✅';
      case 'inaccuracy': return '⚠️';
      case 'mistake': return '❌';
      case 'blunder': return '💀';
      default: return 'ℹ️';
    }
  };

  return (
    <div
      className={`glass rounded-xl mb-4 border-l-4 border-primary transition-all duration-300 hover:shadow-glow overflow-hidden ${isCollapsible ? 'cursor-pointer' : ''}`}
      onClick={toggleExpand}
    >
      <div className="p-4 flex items-center justify-between">
        <h3 className="text-sm font-bold text-primary flex items-center gap-2">
          {grade ? (
            <span className="text-lg">{getGradeIcon(grade)}</span>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          {grade ? <span className="capitalize">{grade}</span> : 'Feedback'}
        </h3>
        {isCollapsible && (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-4 w-4 text-primary transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        )}
      </div>

      <div className={`transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[500px] opacity-100 p-5 pt-0' : 'max-h-0 opacity-0 p-0'}`}>
        {explanation && (
          <div className="text-sm text-foreground/90 mb-3 font-medium leading-relaxed">
            {explanation}
          </div>
        )}

        {details.length > 0 && (
          <ul className="space-y-1 mb-3">
            {details.map((d, i) => (
              <li key={i} className="text-xs text-text-secondary flex items-start gap-2">
                <span className="mt-1 w-1 h-1 rounded-full bg-secondary shrink-0"></span>
                {d}
              </li>
            ))}
          </ul>
        )}

        {tactics.length > 0 && (
          <div className="text-xs bg-error/10 border border-error/20 rounded-lg p-3 mt-3 animate-pulse">
            <strong className="text-error mb-1 block flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Tactical Warning
            </strong>
            <ul className="space-y-1 pl-1">
              {tactics.map((t, i) => (
                <li key={i} className="text-error/80">{t}</li>
              ))}
            </ul>
          </div>
        )}

        {calm && (
          <div className="text-[10px] text-primary/60 mt-3 italic text-right border-t border-white/5 pt-2">
            &ldquo;Every move is a step towards mastery.&rdquo;
          </div>
        )}
      </div>
    </div>
  );
};

export default FeedbackPanel;
