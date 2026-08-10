import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const C = {
    primary: '#E8756A',
    brown: '#4A2C24',
    beige: '#FDF5F0',
};

export default function Messages() {
    const { user } = useAuth();
    const [conversations, setConversations] = useState([]);
    const [selectedConv, setSelectedConv] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const messagesEndRef = useRef(null);
    const intervalRef = useRef(null);

    useEffect(() => {
        fetchConversations();
        return () => clearInterval(intervalRef.current);
    }, []);

    useEffect(() => {
        if (selectedConv) {
            fetchMessages(selectedConv);
            intervalRef.current = setInterval(() => fetchMessages(selectedConv), 5000);
        }
        return () => clearInterval(intervalRef.current);
    }, [selectedConv]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const fetchConversations = async () => {
        setLoading(true);
        try {
            const res = await api.get('/messages');
            // Grouper les messages par conversation (avec qui)
            const convMap = {};
            res.data.forEach(msg => {
                const otherId = msg.expediteur_id === user?.id ? msg.destinataire_id : msg.expediteur_id;
                const other = msg.expediteur_id === user?.id ? msg.destinataire : msg.expediteur;
                if (!convMap[otherId]) {
                    convMap[otherId] = {
                        userId: otherId,
                        user: other,
                        lastMessage: msg,
                        unread: 0,
                    };
                } else {
                    if (new Date(msg.created_at) > new Date(convMap[otherId].lastMessage.created_at)) {
                        convMap[otherId].lastMessage = msg;
                    }
                }
                if (!msg.est_lu && msg.destinataire_id === user?.id) {
                    convMap[otherId].unread++;
                }
            });
            setConversations(Object.values(convMap).sort((a, b) =>
                new Date(b.lastMessage.created_at) - new Date(a.lastMessage.created_at)
            ));
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    const fetchMessages = async (otherId) => {
        try {
            const res = await api.get('/messages');
            const filtered = res.data.filter(msg =>
                (msg.expediteur_id === user?.id && msg.destinataire_id === otherId) ||
                (msg.destinataire_id === user?.id && msg.expediteur_id === otherId)
            ).sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
            setMessages(filtered);
        } catch (err) { console.error(err); }
    };

    const sendMessage = async () => {
        if (!newMessage.trim() || !selectedConv) return;
        setSending(true);
        try {
            await api.post('/messages', {
                destinataire_id: selectedConv,
                contenu: newMessage.trim(),
            });
            setNewMessage('');
            fetchMessages(selectedConv);
            fetchConversations();
        } catch (err) { console.error(err); }
        setSending(false);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const formatTime = (dateStr) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = now - date;
        if (diff < 60000) return 'À l\'instant';
        if (diff < 3600000) return `${Math.floor(diff / 60000)} min`;
        if (diff < 86400000) return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
    };

    const selectedUser = conversations.find(c => c.userId === selectedConv)?.user;

    return (
        <div style={{padding: '24px', height: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column'}}>
            <h2 style={{fontSize: '24px', fontWeight: '800', color: C.brown, marginBottom: '20px', flexShrink: 0}}>
                💬 Messages
            </h2>

            <div style={{display: 'flex', gap: '20px', flex: 1, overflow: 'hidden', minHeight: 0}}>

                {/* Liste des conversations */}
                <div style={{width: '300px', flexShrink: 0, background: 'white', borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', overflow: 'hidden', display: 'flex', flexDirection: 'column'}}>
                    <div style={{padding: '16px', borderBottom: '1px solid #f5f5f5'}}>
                        <p style={{fontWeight: '700', color: C.brown, margin: 0, fontSize: '15px'}}>Conversations</p>
                    </div>

                    {loading ? (
                        <div style={{padding: '20px', textAlign: 'center', color: '#aaa'}}>⏳ Chargement...</div>
                    ) : conversations.length === 0 ? (
                        <div style={{padding: '32px 16px', textAlign: 'center', color: '#aaa'}}>
                            <div style={{fontSize: '40px', marginBottom: '8px'}}>💬</div>
                            <p style={{fontSize: '14px', margin: 0}}>Aucune conversation</p>
                        </div>
                    ) : (
                        <div style={{flex: 1, overflowY: 'auto'}}>
                            {conversations.map(conv => (
                                <div key={conv.userId}
                                    onClick={() => setSelectedConv(conv.userId)}
                                    style={{
                                        padding: '14px 16px', cursor: 'pointer',
                                        background: selectedConv === conv.userId ? '#FFF0EE' : 'white',
                                        borderLeft: selectedConv === conv.userId ? `3px solid ${C.primary}` : '3px solid transparent',
                                        borderBottom: '1px solid #f5f5f5',
                                        transition: 'all 0.2s'
                                    }}>
                                    <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                                        <div style={{width: '40px', height: '40px', borderRadius: '50%', background: C.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '16px', flexShrink: 0}}>
                                            {conv.user?.prenom?.[0] || '?'}
                                        </div>
                                        <div style={{flex: 1, minWidth: 0}}>
                                            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                                <p style={{fontWeight: '700', color: C.brown, margin: 0, fontSize: '14px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap'}}>
                                                    {conv.user?.prenom} {conv.user?.nom}
                                                </p>
                                                <span style={{color: '#aaa', fontSize: '11px', flexShrink: 0, marginLeft: '8px'}}>
                                                    {formatTime(conv.lastMessage.created_at)}
                                                </span>
                                            </div>
                                            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                                <p style={{color: '#888', fontSize: '12px', margin: 0, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '160px'}}>
                                                    {conv.lastMessage.expediteur_id === user?.id ? 'Vous : ' : ''}
                                                    {conv.lastMessage.contenu}
                                                </p>
                                                {conv.unread > 0 && (
                                                    <span style={{background: C.primary, color: 'white', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', flexShrink: 0}}>
                                                        {conv.unread}
                                                    </span>
                                                )}
                                            </div>
                                            <p style={{color: '#aaa', fontSize: '11px', margin: '2px 0 0', textTransform: 'capitalize'}}>
                                                {conv.user?.role}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Zone de chat */}
                <div style={{flex: 1, background: 'white', borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', overflow: 'hidden'}}>
                    {!selectedConv ? (
                        <div style={{flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#aaa'}}>
                            <div style={{fontSize: '60px', marginBottom: '16px'}}>💬</div>
                            <p style={{fontSize: '16px', fontWeight: '600', color: C.brown, marginBottom: '8px'}}>Sélectionnez une conversation</p>
                            <p style={{fontSize: '14px', margin: 0}}>Choisissez une conversation dans la liste à gauche</p>
                        </div>
                    ) : (
                        <>
                            {/* Header conversation */}
                            <div style={{padding: '16px 20px', borderBottom: '1px solid #f5f5f5', display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0}}>
                                <div style={{width: '40px', height: '40px', borderRadius: '50%', background: C.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', fontSize: '16px'}}>
                                    {selectedUser?.prenom?.[0] || '?'}
                                </div>
                                <div>
                                    <p style={{fontWeight: '700', color: C.brown, margin: 0, fontSize: '15px'}}>
                                        {selectedUser?.prenom} {selectedUser?.nom}
                                    </p>
                                    <p style={{color: '#888', fontSize: '12px', margin: 0, textTransform: 'capitalize'}}>
                                        {selectedUser?.role} • {selectedUser?.ville || 'N/A'}
                                    </p>
                                </div>
                            </div>

                            {/* Messages */}
                            <div style={{flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px'}}>
                                {messages.length === 0 ? (
                                    <div style={{textAlign: 'center', color: '#aaa', marginTop: '40px'}}>
                                        <p style={{fontSize: '14px'}}>Commencez la conversation !</p>
                                    </div>
                                ) : (
                                    messages.map(msg => {
                                        const isMine = msg.expediteur_id === user?.id;
                                        return (
                                            <div key={msg.id} style={{display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start'}}>
                                                <div style={{
                                                    maxWidth: '70%',
                                                    padding: '10px 14px',
                                                    borderRadius: isMine ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                                                    background: isMine ? C.primary : C.beige,
                                                    color: isMine ? 'white' : C.brown,
                                                    fontSize: '14px',
                                                    lineHeight: '1.5',
                                                    boxShadow: '0 1px 4px rgba(0,0,0,0.08)'
                                                }}>
                                                    <p style={{margin: '0 0 4px'}}>{msg.contenu}</p>
                                                    <p style={{margin: 0, fontSize: '11px', opacity: 0.7, textAlign: 'right'}}>
                                                        {formatTime(msg.created_at)}
                                                        {isMine && <span style={{marginLeft: '4px'}}>{msg.est_lu ? ' ✓✓' : ' ✓'}</span>}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                                <div ref={messagesEndRef}/>
                            </div>

                            {/* Input message */}
                            <div style={{padding: '16px 20px', borderTop: '1px solid #f5f5f5', flexShrink: 0}}>
                                <div style={{display: 'flex', gap: '10px', alignItems: 'flex-end'}}>
                                    <textarea
                                        value={newMessage}
                                        onChange={e => setNewMessage(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        placeholder="Écrivez votre message... (Entrée pour envoyer)"
                                        rows={1}
                                        style={{
                                            flex: 1, border: '1.5px solid #e0d5d0', borderRadius: '12px',
                                            padding: '10px 14px', fontSize: '14px', outline: 'none',
                                            resize: 'none', boxSizing: 'border-box',
                                            fontFamily: 'inherit', maxHeight: '100px', overflowY: 'auto'
                                        }}
                                        onInput={e => {
                                            e.target.style.height = 'auto';
                                            e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';
                                        }}
                                    />
                                    <button onClick={sendMessage} disabled={!newMessage.trim() || sending}
                                        style={{
                                            background: newMessage.trim() ? C.primary : '#e0d5d0',
                                            color: 'white', border: 'none', borderRadius: '12px',
                                            width: '44px', height: '44px', cursor: newMessage.trim() ? 'pointer' : 'not-allowed',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            fontSize: '18px', flexShrink: 0, transition: 'background 0.2s'
                                        }}>
                                        {sending ? '⏳' : '➤'}
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}