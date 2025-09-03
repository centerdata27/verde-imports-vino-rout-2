
import React from 'react';
import { Business, VisitStatus } from '../types';
import BusinessCard from './BusinessCard';

interface BusinessListProps {
  businesses: Business[];
  onSetStatus: (index: number, status: VisitStatus) => void;
  onUpdateNote: (index: number, note: string) => void;
}

const BusinessList: React.FC<BusinessListProps> = ({ businesses, onSetStatus, onUpdateNote }) => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Your Prospects</h2>
      {businesses.map((business, index) => (
        <BusinessCard
          key={`${business.name}-${index}`}
          business={business}
          onSetStatus={(status) => onSetStatus(index, status)}
          onUpdateNote={(note) => onUpdateNote(index, note)}
        />
      ))}
    </div>
  );
};

export default BusinessList;