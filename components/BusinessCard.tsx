import React, { useState } from 'react';
import { Business, VisitStatus } from '../types';

interface BusinessCardProps {
  business: Business;
  onSetStatus: (status: VisitStatus) => void;
  onUpdateNote: (note: string) => void;
}

const statusStyles: Record<VisitStatus, string> = {
  'successful': 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
  'potential': 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
  'no-good': 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
  'not-visited': 'bg-white dark:bg-gray-800 border-gray-200'
};

const statusLabels: Record<Exclude<VisitStatus, 'not-visited'>, string> = {
  'successful': 'Successful',
  'potential': 'Potential',
  'no-good': 'No Good',
};

const BusinessCard: React.FC<BusinessCardProps> = ({ business, onSetStatus, onUpdateNote }) => {
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [noteText, setNoteText] = useState(business.notes || '');
  
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(business.address)}`;

  const handleSaveNote = () => {
    onUpdateNote(noteText);
    setIsEditingNotes(false);
  };

  const handleCancelNote = () => {
    setNoteText(business.notes || '');
    setIsEditingNotes(false);
  };

  return (
    <div className={`p-5 rounded-lg border dark:border-gray-700 transition-all duration-300 ${statusStyles[business.status]}`}>
      <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h3 className={`text-lg font-bold text-gray-900 dark:text-white ${business.status !== 'not-visited' ? 'opacity-70' : ''}`}>
              {business.name}
            </h3>
            {business.previouslyVisited && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                Past Visit
              </span>
            )}
          </div>
           <div className="flex items-baseline gap-4 mt-1">
                <p className="text-sm text-gray-500 dark:text-gray-400">{business.address}</p>
                {business.distance !== undefined && (
                    <p className="text-xs font-medium text-green-700 dark:text-green-400 shrink-0">
                        {business.distance.toFixed(1)} mi away
                    </p>
                )}
            </div>
          {business.phone && (
            <div className="flex items-center gap-2 mt-2 text-sm text-gray-600 dark:text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
              <a href={`tel:${business.phone}`} className="hover:text-green-700 dark:hover:text-green-400 transition-colors">
                {business.phone}
              </a>
            </div>
          )}
          <p className="text-sm text-gray-700 dark:text-gray-300 mt-3 italic">
            <span className="font-semibold">Prospect Reason:</span> {business.prospectReason}
          </p>
        </div>
        <div className="flex flex-col items-stretch sm:items-end gap-3 shrink-0 w-full sm:w-auto">
          <div className="flex items-center justify-end gap-2">
            {business.status === 'not-visited' ? (
              <>
                <button onClick={() => onSetStatus('no-good')} className="px-3 py-1.5 text-xs font-medium rounded-md bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900/50 dark:text-red-300 dark:hover:bg-red-900 transition-colors">No Good</button>
                <button onClick={() => onSetStatus('potential')} className="px-3 py-1.5 text-xs font-medium rounded-md bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-300 dark:hover:bg-yellow-900 transition-colors">Potential</button>
                <button onClick={() => onSetStatus('successful')} className="px-3 py-1.5 text-xs font-medium rounded-md bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/50 dark:text-green-300 dark:hover:bg-green-900 transition-colors">Successful</button>
              </>
            ) : (
              <div className="flex items-center gap-3">
                 <span className={`px-3 py-1 text-xs font-bold rounded-md ${
                   {
                     'successful': 'bg-green-200 text-green-800 dark:bg-green-900 dark:text-green-200',
                     'potential': 'bg-yellow-200 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
                     'no-good': 'bg-red-200 text-red-800 dark:bg-red-900 dark:text-red-200',
                   }[business.status]
                 }`}>
                   {statusLabels[business.status]}
                 </span>
                <button onClick={() => onSetStatus('not-visited')} className="p-1.5 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" aria-label="Clear visit status">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600 dark:text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                </button>
              </div>
            )}
          </div>
           <a
            href={mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-green-700 bg-green-100 rounded-md hover:bg-green-200 dark:bg-green-900/50 dark:text-green-300 dark:hover:bg-green-900 transition-colors"
          >
             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M12 1.586l-4 4v12.828l4-4V1.586zM3.707 3.293A1 1 0 002 4v12a1 1 0 00.293.707L6 20.414V5.586L3.707 3.293zM17.707 5.293A1 1 0 0016 6v12a1 1 0 00.293.707L20 22.414V9.586L17.707 5.293z" clipRule="evenodd" /></svg>
            View on Map
          </a>
        </div>
      </div>
       <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
        {isEditingNotes ? (
          <div className="space-y-2">
            <label htmlFor={`notes-${business.address.replace(/\s/g, '-')}`} className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Edit Notes
            </label>
            <textarea
              id={`notes-${business.address.replace(/\s/g, '-')}`}
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              rows={4}
              className="w-full p-2 border border-gray-300 dark:border-gray-500 rounded-md bg-white dark:bg-gray-700 focus:ring-2 focus:ring-green-600 focus:border-green-600 transition"
              placeholder="Add contact info, next steps, etc."
            />
            <div className="flex justify-end gap-2">
              <button onClick={handleCancelNote} className="px-3 py-1.5 text-xs font-medium rounded-md bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 transition-colors">
                Cancel
              </button>
              <button onClick={handleSaveNote} className="px-3 py-1.5 text-xs font-medium rounded-md text-white bg-green-700 hover:bg-green-800 dark:bg-green-600 dark:hover:bg-green-700 transition-colors">
                Save Note
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Notes</h4>
              <button onClick={() => setIsEditingNotes(true)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md text-gray-700 dark:text-gray-300 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                    <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                </svg>
                <span>{business.notes ? 'Edit' : 'Add'}</span>
              </button>
            </div>
            {business.notes ? (
              <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{business.notes}</p>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 italic">No notes yet.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default BusinessCard;