import React, { createContext, useContext, useState, useCallback } from 'react';
import Toast from '../components/Toast';
import ConfirmDialog from '../components/ConfirmDialog';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
    const [toasts, setToasts] = useState([]);
    const [confirmState, setConfirmState] = useState(null);

    const addToast = useCallback((message, type = 'info', duration) => {
        const id = Date.now() + Math.random();
        setToasts(prev => [...prev, { id, message, type, duration }]);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const notify = {
        success: (message, duration) => addToast(message, 'success', duration),
        error: (message, duration) => addToast(message, 'error', duration),
        info: (message, duration) => addToast(message, 'info', duration),
    };

    const confirmAction = useCallback((message, options = {}) => {
        return new Promise((resolve) => {
            setConfirmState({
                message,
                title: options.title,
                confirmLabel: options.confirmLabel || 'Oui',
                cancelLabel: options.cancelLabel || 'Non',
                danger: options.danger || false,
                resolve,
            });
        });
    }, []);

    const handleConfirm = () => {
        confirmState.resolve(true);
        setConfirmState(null);
    };

    const handleCancel = () => {
        confirmState.resolve(false);
        setConfirmState(null);
    };

    return (
        <NotificationContext.Provider value={{ notify, confirmAction }}>
            {children}
            <Toast toasts={toasts} removeToast={removeToast} />
            <ConfirmDialog
                open={!!confirmState}
                title={confirmState?.title}
                message={confirmState?.message}
                confirmLabel={confirmState?.confirmLabel}
                cancelLabel={confirmState?.cancelLabel}
                danger={confirmState?.danger}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
            />
        </NotificationContext.Provider>
    );
}

export function useNotification() {
    return useContext(NotificationContext);
}