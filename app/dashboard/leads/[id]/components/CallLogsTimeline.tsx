/**
 * Call Logs Timeline Component
 * Displays call history in a timeline format
 */

import { Phone, Clock, TrendingUp, MessageSquare } from 'lucide-react';

interface CallLog {
  id: string;
  direction: string;
  status: string;
  duration: number | null | undefined;
  outcome?: string | null;
  notes?: string | null;
  sentimentScore?: number | null;
  qualificationScore?: number | null;
  keyPoints?: string[] | null;
  createdAt: Date | string;
}

interface CallLogsTimelineProps {
  callLogs: CallLog[];
}

function formatDuration(seconds: number | null | undefined) {
  if (!seconds) return 'N/A';
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function getStatusColor(status: string) {
  const colors = {
    completed: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    failed: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    'no-answer': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
    busy: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
    initiated: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
  };
  return colors[status as keyof typeof colors] || colors.initiated;
}

export function CallLogsTimeline({ callLogs }: CallLogsTimelineProps) {
  if (!callLogs || callLogs.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <Phone className="h-12 w-12 mx-auto mb-3 opacity-50" />
        <p>No call history yet</p>
      </div>
    );
  }

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {callLogs.map((log, logIdx) => (
          <li key={log.id}>
            <div className="relative pb-8">
              {logIdx !== callLogs.length - 1 ? (
                <span
                  className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-700"
                  aria-hidden="true"
                />
              ) : null}
              <div className="relative flex space-x-3">
                <div>
                  <span className="h-8 w-8 rounded-full bg-blue-500 dark:bg-blue-600 flex items-center justify-center ring-8 ring-white dark:ring-gray-800">
                    <Phone className="h-4 w-4 text-white" />
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {log.direction === 'outbound' ? 'Outgoing Call' : 'Incoming Call'}
                      </p>
                      <span
                        className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${getStatusColor(
                          log.status
                        )}`}
                      >
                        {log.status}
                      </span>
                    </div>
                    <time className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(log.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </time>
                  </div>

                  <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-3">
                    {log.duration !== undefined && (
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <Clock className="h-4 w-4 mr-1" />
                        {formatDuration(log.duration)}
                      </div>
                    )}

                    {log.sentimentScore !== undefined && (
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <MessageSquare className="h-4 w-4 mr-1" />
                        Sentiment: {log.sentimentScore}
                      </div>
                    )}

                    {log.qualificationScore !== undefined && (
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <TrendingUp className="h-4 w-4 mr-1" />
                        Qual Score: {log.qualificationScore}
                      </div>
                    )}

                    {log.outcome && (
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Outcome: <span className="font-medium">{log.outcome}</span>
                      </div>
                    )}
                  </div>

                  {log.keyPoints && log.keyPoints.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Key Points:
                      </p>
                      <ul className="space-y-1">
                        {log.keyPoints.map((point, idx) => (
                          <li
                            key={idx}
                            className="text-xs text-gray-600 dark:text-gray-400 pl-4 relative before:content-['•'] before:absolute before:left-0"
                          >
                            {point}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {log.notes && (
                    <div className="mt-2">
                      <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Notes:
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{log.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
