import React, { useState } from 'react';
import { VisitedBusiness, VisitStatus } from '../types';

interface HistoryListProps {
  history: VisitedBusiness[];
  onClearHistory: () => void;
  onExportReport: (date?: string) => void;
}

const statusLabels: Record<Exclude<VisitStatus, 'not-visited'>, string> = {
  'successful': 'Successful',
  'potential': 'Potential',
  'no-good': 'No Good',
};

const statusBadgeStyles: Record<Exclude<VisitStatus, 'not-visited'>, string> = {
    'successful': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    'potential': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    'no-good': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

const HistoryList: React.FC<HistoryListProps> = ({ history, onClearHistory, onExportReport }) => {
  const [selectedDate, setSelectedDate] = useState('');

  if (history.length === 0) {
    return (
      <div className="text-center py-10 px-6 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No Visit History</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">You haven't marked any locations as visited yet.</p>
      </div>
    );
  }

  const groupedHistory = history.reduce((acc, business) => {
    const dateKey = new Date(business.visitedDate).toISOString().split('T')[0];
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(business);
    return acc;
  }, {} as Record<string, VisitedBusiness[]>);

  const sortedDates = Object.keys(groupedHistory).sort((a, b) => b.localeCompare(a));

  const formatDate = (dateKey: string) => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const todayKey = today.toISOString().split('T')[0];
    const yesterdayKey = yesterday.toISOString().split('T')[0];

    if (dateKey === todayKey) return 'Today';
    if (dateKey === yesterdayKey) return 'Yesterday';
    
    const dateParts = dateKey.split('-').map(part => parseInt(part, 10));
    const date = new Date(Date.UTC(dateParts[0], dateParts[1] - 1, dateParts[2]));

    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'UTC',
    }).format(date);
  };

  return (
    <div className="space-y-6">
       <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Previously Visited Locations</h2>
            <button
                onClick={onClearHistory}
                className="px-4 py-2 text-sm font-medium text-red-600 bg-red-100 rounded-md hover:bg-red-200 dark:bg-red-900/50 dark:text-red-300 dark:hover:bg-red-900 transition-colors self-end sm:self-center"
                >
                Clear History
            </button>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 p-3 rounded-lg border bg-gray-50 dark:bg-gray-800/50 dark:border-gray-700">
             <p className="font-medium text-sm text-gray-700 dark:text-gray-300">Export Report</p>
             <div className="flex-grow h-px bg-gray-200 dark:bg-gray-700 sm:hidden"></div>
             <div className="flex items-center gap-2 flex-wrap justify-center sm:ml-auto">
                <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="px-2 py-1.5 text-sm border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 focus:ring-green-500 focus:border-green-500"
                    aria-label="Select date for export"
                />
                <button
                    onClick={() => { if (selectedDate) onExportReport(selectedDate) }}
                    disabled={!selectedDate}
                    className="px-3 py-1.5 text-sm font-medium text-green-700 bg-green-100 rounded-md hover:bg-green-200 dark:bg-green-900/50 dark:text-green-300 dark:hover:bg-green-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    For Date
                </button>
                 <button
                    onClick={() => onExportReport()}
                    disabled={history.length === 0}
                    className="px-3 py-1.5 text-sm font-medium text-green-700 bg-green-100 rounded-md hover:bg-green-200 dark:bg-green-900/50 dark:text-green-300 dark:hover:bg-green-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    All History
                </button>
             </div>
        </div>
    </div>

      <div className="space-y-6">
        {sortedDates.map(date => (
          <div key={date}>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2 pb-2 border-b border-gray-200 dark:border-gray-700">
              {formatDate(date)}
            </h3>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {groupedHistory[date].map((item, index) => (
                <div key={`${item.address}-${index}`} className="py-4 flex flex-col sm:flex-row items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-md font-medium text-gray-900 dark:text-white">{item.name}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{item.address}</p>
                        </div>
                        <div className="sm:hidden flex items-center gap-4">
                            {item.status !== 'not-visited' && (
                                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${statusBadgeStyles[item.status]}`}>
                                {statusLabels[item.status]}
                                </span>
                            )}
                        </div>
                    </div>
                    {item.phone && (
                      <div className="flex items-center gap-2 mt-1 text-sm text-gray-500 dark:text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                        </svg>
                        <a href={`tel:${item.phone}`} className="hover:text-green-700 dark:hover:text-green-400 transition-colors">
                          {item.phone}
                        </a>
                      </div>
                    )}
                    {item.notes && (
                        <div className="mt-3 p-3 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
                            <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Notes</p>
                            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{item.notes}</p>
                        </div>
                    )}
                  </div>
                  <div className="hidden sm:flex items-center gap-4">
                    {item.status !== 'not-visited' && (
                       <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${statusBadgeStyles[item.status]}`}>
                         {statusLabels[item.status]}
                       </span>
                    )}
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(item.address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-green-700 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300"
                      aria-label={`View ${item.name} on map`}
                    >
                      View on Map
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoryList;