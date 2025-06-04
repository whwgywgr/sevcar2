// Simple notification system for React (no external dependencies)
import React, { useState, useCallback, createContext, useContext } from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

const NotificationContext = createContext();

export function useNotification() {
    return useContext(NotificationContext);
}

export function NotificationProvider({ children }) {
    const [notifications, setNotifications] = useState([]);

    const showNotification = useCallback((message, type = 'info', duration = 2500) => {
        const id = Date.now() + Math.random();
        setNotifications((prev) => [...prev, { id, message, type, open: true }]);
        setTimeout(() => {
            setNotifications((prev) => prev.filter((n) => n.id !== id));
        }, duration);
    }, []);

    const handleClose = (id) => {
        setNotifications((prev) => prev.map(n => n.id === id ? { ...n, open: false } : n));
    };

    return (
        <NotificationContext.Provider value={showNotification}>
            {children}
            {notifications.map((n) => (
                <Snackbar
                    key={n.id}
                    open={n.open}
                    autoHideDuration={2000}
                    onClose={() => handleClose(n.id)}
                    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                >
                    <Alert severity={n.type} sx={{ width: '100%' }} onClose={() => handleClose(n.id)}>
                        {n.message}
                    </Alert>
                </Snackbar>
            ))}
        </NotificationContext.Provider>
    );
}
