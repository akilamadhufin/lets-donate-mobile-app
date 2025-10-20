import React, { createContext, useState, useEffect, useContext } from 'react';
import databaseService from '../database/DatabaseService';
import syncService from '../database/SyncService';

const DatabaseContext = createContext();

export const DatabaseProvider = ({ children }) => {
  const [dbInitialized, setDbInitialized] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    initializeDatabase();
    
    // Listen to sync events
    const unsubscribe = syncService.addSyncListener((event, data) => {
      if (event === 'sync_start') {
        setIsSyncing(true);
      } else if (event === 'sync_complete' || event === 'sync_error') {
        setIsSyncing(false);
      }
    });

    // Check online status time to time
    const checkOnline = async () => {
      const online = await syncService.checkOnlineStatus();
      setIsOnline(online);
    };
    
    checkOnline();
    const interval = setInterval(checkOnline, 10000); // Check every 10 seconds if it is online

    return () => {
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const initializeDatabase = async () => {
    try {
      console.log('Initializing database...');
      await databaseService.init();
      setDbInitialized(true);
      console.log('Database initialized successfully');
      
      // Initial sync if online
      const online = await syncService.checkOnlineStatus();
      if (online) {
        syncService.syncAll();
      }
    } catch (error) {
      console.error('Failed to initialize database:', error);
    }
  };

  const triggerSync = async () => {
    await syncService.syncAll();
  };

  return (
    <DatabaseContext.Provider value={{ 
      dbInitialized, 
      isOnline, 
      isSyncing,
      triggerSync
    }}>
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDatabase = () => {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
};
