
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { Business, VisitedBusiness, VisitStatus } from './types';
import { fetchBusinessesForRoute } from './services/geminiService';
import { getVisitedBusinesses, addVisitedBusiness, removeVisitedBusiness, clearAllVisitedBusinesses } from './services/storageService';
import { getCurrentUser, signOut } from './services/authService';
import Header from './components/Header';
import LocationInput from './components/LocationInput';
import BusinessList from './components/BusinessList';
import Loader from './components/Loader';
import ProgressBar from './components/ProgressBar';
import HistoryList from './components/HistoryList';
import AuthPage from './components/AuthPage';

const getDistanceInMiles = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    if ((lat1 === lat2) && (lon1 === lon2)) {
      return 0;
    }
    const radlat1 = Math.PI * lat1 / 180;
    const radlat2 = Math.PI * lat2 / 180;
    const theta = lon1 - lon2;
    const radtheta = Math.PI * theta / 180;
    let dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    if (dist > 1) {
      dist = 1;
    }
    dist = Math.acos(dist);
    dist = dist * 180 / Math.PI;
    dist = dist * 60 * 1.1515; // miles
    return dist;
};

const locationPermissionErrorText = `Location permission was denied. Please try these steps:

1.  **Check Browser Permissions:** In your browser's address bar, look for a location icon (usually a small pin or lock). Click it and ensure location access is set to "Allow" for this site.
2.  **Check OS/System Permissions:**
    • **Windows:** Go to Settings > Privacy & security > Location and ensure your browser has permission.
    • **macOS:** Go to System Settings > Privacy & Security > Location Services and ensure your browser is checked.
3.  **Check for Conflicts:** VPNs, proxies, or firewalls can sometimes interfere with location services. Try temporarily disabling them.`;

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<string | null>(() => getCurrentUser());
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'route' | 'history'>('route');
  const [visitedHistory, setVisitedHistory] = useState<VisitedBusiness[]>([]);
  const [isSortingByDistance, setIsSortingByDistance] = useState<boolean>(false);

  useEffect(() => {
    if (currentUser) {
      setVisitedHistory(getVisitedBusinesses(currentUser));
    }
  }, [currentUser]);

  const resetStateForSignOut = () => {
    setBusinesses([]);
    setIsLoading(false);
    setError(null);
    setView('route');
    setVisitedHistory([]);
  };

  const handleSignInSuccess = (username: string) => {
    setCurrentUser(username);
  };

  const handleSignOut = () => {
    signOut();
    setCurrentUser(null);
    resetStateForSignOut();
  };

  const handleGenerateRoute = useCallback(async (location: string) => {
    if (!currentUser) return;
    if (!location) {
      setError('Please enter a location.');
      return;
    }
    if (!isLoading) setIsLoading(true);
    setError(null);
    setBusinesses([]);

    try {
      const fetchedBusinesses = await fetchBusinessesForRoute(location);
      const currentVisited = getVisitedBusinesses(currentUser);
      const businessesWithStatus = fetchedBusinesses.map(b => {
        const pastVisit = currentVisited.find(vb => vb.address === b.address);
        return {
          ...b,
          status: pastVisit ? pastVisit.status : 'not-visited',
          previouslyVisited: !!pastVisit,
          notes: pastVisit?.notes || '',
        };
      });
      setBusinesses(businessesWithStatus);
      setView('route');
    } catch (err) {
      setError(err instanceof Error ? `Failed to generate route: ${err.message}` : 'An unknown error occurred.');
      setBusinesses([]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, currentUser]);

  const handleLocateAndGenerate = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setBusinesses([]);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        handleGenerateRoute(`${latitude}, ${longitude}`);
      },
      (err) => {
        let errorMessage = "Could not get your location.";
        switch (err.code) {
          case err.PERMISSION_DENIED:
            if (!window.isSecureContext) {
              errorMessage = "Location access requires a secure (HTTPS) connection. Please ensure you are accessing this site over HTTPS.";
            } else {
              errorMessage = locationPermissionErrorText;
            }
            break;
          case err.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable.";
            break;
          case err.TIMEOUT:
            errorMessage = "The request to get your location timed out.";
            break;
        }
        setError(errorMessage);
        setIsLoading(false);
      }
    );
  }, [handleGenerateRoute]);


  const handleSetVisitStatus = useCallback((index: number, status: VisitStatus) => {
    if (!currentUser) return;
    setBusinesses(prevBusinesses =>
      prevBusinesses.map((business, i) => {
        if (i === index) {
          if (status === 'not-visited') {
            removeVisitedBusiness(business.address, currentUser);
          } else {
            addVisitedBusiness({
              name: business.name,
              address: business.address,
              phone: business.phone,
              status: status,
              notes: business.notes,
            }, currentUser);
          }
          setVisitedHistory(getVisitedBusinesses(currentUser));
          return { ...business, status: status };
        }
        return business;
      })
    );
  }, [currentUser]);

  const handleUpdateNote = useCallback((index: number, note: string) => {
    if (!currentUser) return;
    const updatedBusinesses = businesses.map((business, i) => {
      if (i === index) {
        const updatedBusiness = { ...business, notes: note };
        if (updatedBusiness.status !== 'not-visited') {
          addVisitedBusiness({
            name: updatedBusiness.name,
            address: updatedBusiness.address,
            phone: updatedBusiness.phone,
            status: updatedBusiness.status,
            notes: updatedBusiness.notes,
          }, currentUser);
          setVisitedHistory(getVisitedBusinesses(currentUser));
        }
        return updatedBusiness;
      }
      return business;
    });
    setBusinesses(updatedBusinesses);
  }, [businesses, currentUser]);
  
  const handleClearHistory = useCallback(() => {
    if (!currentUser) return;
    clearAllVisitedBusinesses(currentUser);
    setVisitedHistory([]);
    setBusinesses(prev => prev.map(b => ({...b, previouslyVisited: false, status: 'not-visited' })));
  }, [currentUser]);

  const handleExportReport = useCallback((date?: string) => {
    if (!currentUser) return;

    const historyToExport = date
        ? visitedHistory.filter(item => item.visitedDate.startsWith(date))
        : visitedHistory;

    if (historyToExport.length === 0) {
        alert(date ? "No visits recorded for the selected date." : "No history to export.");
        return;
    }

    const statusLabels: Record<Exclude<VisitStatus, 'not-visited'>, string> = {
      'successful': 'Successful',
      'potential': 'Potential',
      'no-good': 'No Good',
    };

    const groupedHistory = historyToExport.reduce((acc, business) => {
        const dateKey = new Date(business.visitedDate).toISOString().split('T')[0];
        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(business);
        return acc;
    }, {} as Record<string, VisitedBusiness[]>);

    const sortedDates = Object.keys(groupedHistory).sort((a, b) => b.localeCompare(a));

    const formatDateForReport = (dateKey: string) => {
      const dateParts = dateKey.split('-').map(part => parseInt(part, 10));
      const date = new Date(Date.UTC(dateParts[0], dateParts[1] - 1, dateParts[2]));
      return new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'UTC',
      }).format(date);
    };

    const divider = "========================================\n";
    let reportContent = "Verde Imports Vino Rout - Sales Report\n";
    reportContent += divider;
    reportContent += `Generated for: ${currentUser}\n`;
    reportContent += `Date Generated: ${new Date().toLocaleDateString()}\n`;
     if (date) {
        reportContent += `Report for Date: ${formatDateForReport(date)}\n`;
    }
    reportContent += divider + "\n";

    sortedDates.forEach(dateKey => {
        reportContent += `--- Visited on: ${formatDateForReport(dateKey)} ---\n\n`;
        groupedHistory[dateKey].forEach((item, index) => {
            reportContent += `Business:      ${item.name}\n`;
            reportContent += `Address:       ${item.address}\n`;
            if (item.phone) {
                reportContent += `Phone:         ${item.phone}\n`;
            }
            reportContent += `Status:        ${statusLabels[item.status as Exclude<VisitStatus, 'not-visited'>]}\n`;
            reportContent += `Notes:\n${item.notes ? item.notes.trim() : 'No notes provided.'}\n`;
            
            if (index < groupedHistory[dateKey].length - 1) {
                reportContent += '\n----------------------------------------\n\n';
            }
        });
        reportContent += '\n\n';
    });
    
    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const reportDate = new Date().toISOString().split('T')[0];
    const fileNameDate = date || reportDate;
    link.download = `vino-rout-report-${fileNameDate}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

  }, [visitedHistory, currentUser]);

  const handleSortByDistance = useCallback(() => {
    if (!navigator.geolocation) {
        setError("Geolocation is not supported by your browser.");
        return;
    }

    setIsSortingByDistance(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            
            const businessesWithDistance = businesses.map(business => ({
                ...business,
                distance: getDistanceInMiles(latitude, longitude, business.latitude, business.longitude)
            }));

            const sortedBusinesses = [...businessesWithDistance].sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
            
            setBusinesses(sortedBusinesses);
            setIsSortingByDistance(false);
        },
        (err) => {
            let errorMessage = "Could not get your location to sort by distance.";
            switch (err.code) {
                case err.PERMISSION_DENIED:
                    if (!window.isSecureContext) {
                        errorMessage = "Sorting by distance requires a secure (HTTPS) connection to access your location. Please ensure you are accessing this site over HTTPS.";
                    } else {
                        errorMessage = locationPermissionErrorText;
                    }
                    break;
                case err.POSITION_UNAVAILABLE:
                    errorMessage = "Location information is unavailable. Could not sort by distance.";
                    break;
                case err.TIMEOUT:
                    errorMessage = "The request to get your location timed out. Could not sort by distance.";
                    break;
            }
            setError(errorMessage);
            setIsSortingByDistance(false);
        }
    );
  }, [businesses]);

  const visitedCount = useMemo(() => businesses.filter(b => b.status !== 'not-visited').length, [businesses]);
  const totalCount = businesses.length;

  if (!currentUser) {
    return <AuthPage onSignInSuccess={handleSignInSuccess} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 font-sans">
      <Header currentUser={currentUser} onSignOut={handleSignOut} />
      <main className="container mx-auto p-4 md:p-8">
        <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 md:p-8 space-y-6">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">Your Optimized Sales Route</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Plan your route, discover new clients, and track your visits.</p>
          </div>

          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-6" aria-label="Tabs">
              <button
                onClick={() => setView('route')}
                className={`${
                  view === 'route'
                    ? 'border-green-600 text-green-700 dark:text-green-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-500'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
              >
                Current Route
              </button>
              <button
                onClick={() => { 
                    setView('history');
                    if (currentUser) {
                        setVisitedHistory(getVisitedBusinesses(currentUser)); 
                    }
                }}
                className={`${
                  view === 'history'
                    ? 'border-green-600 text-green-700 dark:text-green-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-500'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                aria-current={view === 'history' ? 'page' : undefined}
              >
                Visit History
              </button>
            </nav>
          </div>
          
          {view === 'route' && (
            <>
              <LocationInput onGenerate={handleGenerateRoute} onLocate={handleLocateAndGenerate} isLoading={isLoading} />

              {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert">
                <p className="font-bold">Error</p>
                <p className="mt-1 whitespace-pre-wrap">{error}</p>
              </div>}
              
              {isLoading && <Loader />}

              {totalCount > 0 && !isLoading && (
                <div className="space-y-4">
                  <ProgressBar current={visitedCount} total={totalCount} />
                   <div className="flex justify-end -mt-2 mb-2">
                     <button
                        onClick={handleSortByDistance}
                        disabled={isSortingByDistance}
                        className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {isSortingByDistance ? (
                             <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M5 12a1 1 0 102 0V6.414l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L5 6.414V12zM15 8a1 1 0 10-2 0v5.586l-1.293-1.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L15 13.586V8z" />
                            </svg>
                        )}
                        <span>{isSortingByDistance ? 'Sorting...' : 'Sort by Distance'}</span>
                    </button>
                </div>
                  <BusinessList businesses={businesses} onSetStatus={handleSetVisitStatus} onUpdateNote={handleUpdateNote} />
                </div>
              )}

              {!isLoading && totalCount === 0 && !error && (
                <div className="text-center py-10 px-6 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V7.618a1 1 0 01.553-.894L9 4l6 3.106A1 1 0 0116 8.028v8.354a1 1 0 01-.553.894L9 20z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12l-6 3.106" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No Route Generated</h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Get started by entering a location above.</p>
                </div>
              )}
            </>
          )}

          {view === 'history' && (
            <HistoryList history={visitedHistory} onClearHistory={handleClearHistory} onExportReport={handleExportReport} />
          )}

        </div>
      </main>
      <footer className="text-center py-4 text-sm text-gray-500 dark:text-gray-400">
        <p>Verde Imports Vino Rout &copy; {new Date().getFullYear()}</p>
        <p>Developed by Kevin De La Cruz</p>
      </footer>
    </div>
  );
};

export default App;
