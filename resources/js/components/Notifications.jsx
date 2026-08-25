import React, { useState, useEffect } from 'react';
import api from '../services/api';

const C = {
    primary: '#E8756A',
    brown: '#4A2C24',
    beige: '#FDF5F0',
};

export default function Notifications({ userId }) {
    const [notifications, setNotifications] = useState([]);
    const [unread, setUnread] = useState(0);
    const [showPanel, setShowPanel] = useState(false);
    const [permission, setPermission] = useState(Notification.permission);

    useEffect(() => {
        requestPermission();
        fetchNotifications();
        // Polling toutes les 30 secondes
        const interval = setInterval(fetchNotifications, 10000);        return () => clearInterval(interval);
    }, []);

    const requestPermission = async () => {
        if (Notification.permission === 'default') {
            const perm = await Notification.requestPermission();
            setPermission(perm);
        }
    };

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/notifications');
            setNotifications(res.data);
            setUnread(res.data.filter(n => !n.est_lue).length);
        } catch (err) {
            console.error(err);
        }
    };

    const sendBrowserNotification = (title, body) => {
        if (Notification.permission === 'granted') {
            new Notification(title, {
                body,
                icon: '/images/logo_PAWNELLA.jpeg',
            });
        }
    };

    const markAsRead = async (id) => {
        try {
            await api.put(`/notifications/${id}`, { est_lue: true });
            fetchNotifications();
        } catch (err) {
            console.error(err);
        }
    };

    const markAllRead = async () => {
        try {
            await Promise.all(
                notifications.filter(n => !n.est_lue).map(n =>
                    api.put(`/notifications/${n.id}`, { est_lue: true })
                )
            );
            fetchNotifications();
        } catch (err) {
            console.error(err);
        }
    };

    const getIcon = (type) => {
        switch(type) {
            case 'reservation': return '📅';
            case 'message': return '💬';
            case 'adoption': return '❤️';
            case 'animal': return '🐾';
            case 'validation': return '✅';
            default: return '🔔';
        }
    };

    return (
        <div style={{position: 'relative'}}>
            {/* Bouton cloche */}
            <button onClick={() => setShowPanel(!showPanel)}
                style={{position: 'relative', background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', padding: '4px'}}>
                🔔
                {unread > 0 && (
                    <span style={{
                        position: 'absolute', top: '-4px', right: '-4px',
                        background: C.primary, color: 'white',
                        borderRadius: '50%', width: '18px', height: '18px',
                        fontSize: '11px', fontWeight: '700',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        {unread > 9 ? '9+' : unread}
                    </span>
                )}
            </button>

            {/* Panel notifications */}
            {showPanel && (
                <>
                    {/* Overlay */}
                    <div onClick={() => setShowPanel(false)}
                        style={{position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 199}}/>
                    
                    <div style={{
                        position: 'absolute', right: 0, top: '40px',
                        width: '360px', background: 'white',
                        borderRadius: '16px', boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                        zIndex: 200, overflow: 'hidden'
                    }}>
                        {/* Header */}
                        <div style={{padding: '16px 20px', borderBottom: '1px solid #f5f5f5', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                            <h3 style={{color: C.brown, fontWeight: '700', fontSize: '16px', margin: 0}}>
                                Notifications {unread > 0 && <span style={{color: C.primary}}>({unread})</span>}
                            </h3>
                            {unread > 0 && (
                                <button onClick={markAllRead}
                                    style={{background: 'none', border: 'none', color: C.primary, fontSize: '13px', cursor: 'pointer', fontWeight: '600'}}>
                                    Tout lire
                                </button>
                            )}
                        </div>

                        {/* Permission */}
                        {permission !== 'granted' && (
                            <div style={{padding: '12px 20px', background: '#FFF8E1', borderBottom: '1px solid #f5f5f5'}}>
                                <p style={{color: '#F57F17', fontSize: '13px', margin: '0 0 8px'}}>
                                    🔔 Activez les notifications pour ne rien manquer !
                                </p>
                                <button onClick={requestPermission}
                                    style={{background: C.primary, color: 'white', border: 'none', padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600'}}>
                                    Activer
                                </button>
                            </div>
                        )}

                        {/* Liste */}
                        <div style={{maxHeight: '400px', overflowY: 'auto'}}>
                            {notifications.length === 0 ? (
                                <div style={{padding: '40px 20px', textAlign: 'center', color: '#aaa'}}>
                                    <div style={{fontSize: '48px', marginBottom: '12px'}}>🔔</div>
                                    <p style={{fontSize: '14px', margin: 0}}>Aucune notification</p>
                                </div>
                            ) : (
                                notifications.map(notif => (
                                    <div key={notif.id}
                                       onClick={() => {
                                            markAsRead(notif.id);
                                            setShowPanel(false);
                                            if (notif.type === 'reservation') window.location.href = '/reservations';
                                            else if (notif.type === 'message') window.location.href = '/messages';
                                            else if (notif.type === 'adoption') window.location.href = '/adoption';
                                        }}
                                        style={{
                                            padding: '14px 20px',
                                            borderBottom: '1px solid #f5f5f5',
                                            cursor: 'pointer',
                                            background: notif.est_lue ? 'white' : '#FFF0EE',
                                            display: 'flex', gap: '12px', alignItems: 'flex-start',
                                            transition: 'background 0.2s'
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.background = C.beige}
                                        onMouseLeave={e => e.currentTarget.style.background = notif.est_lue ? 'white' : '#FFF0EE'}
                                    >
                                        <span style={{fontSize: '24px', flexShrink: 0}}>{getIcon(notif.type)}</span>
                                        <div style={{flex: 1}}>
                                            <p style={{color: C.brown, fontSize: '13px', margin: '0 0 4px', fontWeight: notif.est_lue ? '400' : '600'}}>
                                                {notif.message}
                                            </p>
                                            <p style={{color: '#aaa', fontSize: '11px', margin: 0}}>
                                                {new Date(notif.created_at).toLocaleDateString('fr-FR', {
                                                    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                        {!notif.est_lue && (
                                            <div style={{width: '8px', height: '8px', borderRadius: '50%', background: C.primary, flexShrink: 0, marginTop: '4px'}}/>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}