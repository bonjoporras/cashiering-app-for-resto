import React from 'react';
import { Sparkles } from 'lucide-react';

export const AISuggestionBadge: React.FC = () => {
  return (
    <div className="inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 text-xs font-bold rounded-full border border-amber-200 shadow-sm">
      <Sparkles size={12} />
      <span>AI Powered</span>
    </div>
  );
};
