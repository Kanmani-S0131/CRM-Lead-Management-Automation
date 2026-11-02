import React, { useState } from 'react';
import { useCRM } from '../context/CRMContext';
import { Activity, ChevronDown, ChevronUp, Zap, Clock, ExternalLink } from 'lucide-react';

export const LiveActivityFeed: React.FC = () => {
  const { activityStream, setSelectedLeadId } = useCRM();
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <aside aria-label="Real-time Activity Stream" className="fixed bottom-4 right-4 z-30 max-w-sm w-full">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl overflow-hidden transition-all">
        {/* Toggle Bar */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <Activity className="w-3.5 h-3.5 text-slate-500" />
            <span>Live Automation Activity Stream</span>
            <span className="font-mono tabular-nums text-[10px] px-1.5 py-0.2 bg-slate-200 dark:bg-slate-800 rounded text-slate-600 dark:text-slate-400">
              {activityStream.length}
            </span>
          </div>
          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </button>

        {/* Collapsible List */}
        {isExpanded && (
          <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/80 p-2 text-xs space-y-1">
            {activityStream.length === 0 ? (
              <div className="py-6 text-center text-slate-400 text-xs">
                Listening for inbound events...
              </div>
            ) : (
              activityStream.map((event) => (
                <div
                  key={event.id}
                  onClick={() => setSelectedLeadId(event.leadId)}
                  className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                      {event.action} · {event.name}
                    </span>
                    <span className="font-mono tabular-nums text-[10px] text-slate-400 shrink-0 ml-2">
                      {event.timestamp}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                    {event.details}
                  </p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </aside>
  );
};
