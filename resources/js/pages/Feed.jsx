import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const C = {
    primary: '#E8756A',
    brown: '#4A2C24',
    beige: '#FDF5F0',
};

export default function Feed() {
    const { user } = useAuth();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ contenu: '', type: 'texte' });
    const [showForm, setShowForm] = useState(false);
    const [editingPost, setEditingPost] = useState(null);
    const [editContenu, setEditContenu] = useState('');
    const [commentInputs, setCommentInputs] = useState({});
    const [showComments, setShowComments] = useState({});

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const res = await api.get('/posts');
            setPosts(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/posts', form);
            setForm({ contenu: '', type: 'texte' });
            setShowForm(false);
            fetchPosts();
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    };

    const handleLike = async (postId) => {
        try {
            await api.put(`/posts/${postId}`, { likes: posts.find(p => p.id === postId).likes + 1 });
            fetchPosts();
        } catch (err) {
            console.error(err);
        }
    };

    const handleEdit = async (post) => {
        try {
            await api.put(`/posts/${post.id}`, { contenu: editContenu });
            setEditingPost(null);
            fetchPosts();
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (postId) => {
        if (!window.confirm('Supprimer ce post ?')) return;
        try {
            await api.delete(`/posts/${postId}`);
            fetchPosts();
        } catch (err) {
            console.error(err);
        }
    };

    const handleComment = async (postId) => {
        const contenu = commentInputs[postId];
        if (!contenu?.trim()) return;
        try {
            await api.post('/commentaires', { post_id: postId, contenu });
            setCommentInputs({...commentInputs, [postId]: ''});
            fetchPosts();
        } catch (err) {
            console.error(err);
        }
    };

    const handleShare = (post) => {
        const text = `${post.auteur?.prenom} : ${post.contenu}`;
        if (navigator.share) {
            navigator.share({ title: 'PawNella', text });
        } else {
            navigator.clipboard.writeText(text);
            alert('✅ Post copié dans le presse-papier !');
        }
    };

    return (
        <div style={{padding: '24px'}}>
            <h2 style={{fontSize: '24px', fontWeight: '800', color: C.brown, marginBottom: '24px'}}>📝 Feed</h2>

            {/* Nouveau post */}
            <div style={{background: 'white', borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', padding: '16px', marginBottom: '24px', cursor: 'pointer'}}
                onClick={() => setShowForm(!showForm)}>
                <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                    <div style={{width: '40px', height: '40px', borderRadius: '50%', background: C.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700'}}>
                        {user?.prenom?.[0]}
                    </div>
                    <div style={{flex: 1, background: C.beige, borderRadius: '20px', padding: '10px 16px', color: '#aaa', fontSize: '14px'}}>
                        Quoi de neuf avec votre animal ? 🐾
                    </div>
                </div>
            </div>

            {/* Formulaire nouveau post */}
            {showForm && (
                <div style={{background: 'white', borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', padding: '24px', marginBottom: '24px'}}>
                    <form onSubmit={handleSubmit}>
                        <textarea value={form.contenu} onChange={e => setForm({...form, contenu: e.target.value})}
                            style={{width: '100%', border: '1.5px solid #e0d5d0', borderRadius: '10px', padding: '12px 16px', fontSize: '14px', outline: 'none', resize: 'none', boxSizing: 'border-box', marginBottom: '16px'}}
                            rows={4} placeholder="Partagez un moment avec votre animal..." required/>
                        <div style={{display: 'flex', justifyContent: 'flex-end', gap: '12px'}}>
                            <button type="button" onClick={() => setShowForm(false)}
                                style={{background: '#f5f5f5', color: '#666', padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer'}}>
                                Annuler
                            </button>
                            <button type="submit" disabled={loading}
                                style={{background: C.primary, color: 'white', padding: '8px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '600', opacity: loading ? 0.7 : 1}}>
                                {loading ? 'Publication...' : 'Publier'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Liste posts */}
            {posts.length === 0 ? (
                <div style={{textAlign: 'center', padding: '64px 0', color: '#aaa'}}>
                    <div style={{fontSize: '64px', marginBottom: '16px'}}>📝</div>
                    <p style={{fontSize: '18px', marginBottom: '8px', color: C.brown, fontWeight: '600'}}>Aucun post pour le moment</p>
                    <p style={{fontSize: '14px'}}>Soyez le premier à partager !</p>
                </div>
            ) : (
                <div style={{display: 'flex', flexDirection: 'column', gap: '16px'}}>
                    {posts.map(post => (
                        <div key={post.id} style={{background: 'white', borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', padding: '20px'}}>
                            
                            {/* Header post */}
                            <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px'}}>
                                <div style={{width: '42px', height: '42px', borderRadius: '50%', background: C.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: '700', flexShrink: 0}}>
                                    {post.auteur?.prenom?.[0] || '?'}
                                </div>
                                <div style={{flex: 1}}>
                                    <p style={{fontWeight: '700', color: C.brown, margin: '0 0 2px', fontSize: '14px'}}>
                                        {post.auteur?.prenom} {post.auteur?.nom}
                                    </p>
                                    <p style={{fontSize: '12px', color: '#aaa', margin: 0}}>
                                        {new Date(post.created_at).toLocaleDateString('fr-FR', {day: 'numeric', month: 'long', year: 'numeric'})}
                                    </p>
                                </div>
                                {/* Options si c'est le post de l'utilisateur */}
                                {post.auteur?.id === user?.id && (
                                    <div style={{display: 'flex', gap: '8px'}}>
                                        <button onClick={() => { setEditingPost(post.id); setEditContenu(post.contenu); }}
                                            style={{background: C.beige, border: 'none', borderRadius: '8px', padding: '6px 10px', cursor: 'pointer', fontSize: '13px', color: C.brown}}>
                                            ✏️
                                        </button>
                                        <button onClick={() => handleDelete(post.id)}
                                            style={{background: '#FFF0EE', border: 'none', borderRadius: '8px', padding: '6px 10px', cursor: 'pointer', fontSize: '13px', color: C.primary}}>
                                            🗑️
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Contenu post */}
                            {editingPost === post.id ? (
                                <div style={{marginBottom: '16px'}}>
                                    <textarea value={editContenu} onChange={e => setEditContenu(e.target.value)}
                                        style={{width: '100%', border: '1.5px solid #e0d5d0', borderRadius: '10px', padding: '10px', fontSize: '14px', outline: 'none', resize: 'none', boxSizing: 'border-box', marginBottom: '8px'}}
                                        rows={3}/>
                                    <div style={{display: 'flex', gap: '8px'}}>
                                        <button onClick={() => handleEdit(post)}
                                            style={{background: C.primary, color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '13px'}}>
                                            Sauvegarder
                                        </button>
                                        <button onClick={() => setEditingPost(null)}
                                            style={{background: '#f5f5f5', color: '#666', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px'}}>
                                            Annuler
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <p style={{color: '#555', lineHeight: '1.7', marginBottom: '16px', fontSize: '15px'}}>{post.contenu}</p>
                            )}

                            {/* Actions */}
                            <div style={{display: 'flex', gap: '8px', paddingTop: '12px', borderTop: '1px solid #f5f5f5', marginBottom: showComments[post.id] ? '16px' : '0'}}>
                                <button onClick={() => handleLike(post.id)}
                                    style={{flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px', borderRadius: '10px', border: 'none', cursor: 'pointer', background: '#FFF0EE', color: C.primary, fontWeight: '600', fontSize: '13px'}}>
                                    ❤️ {post.likes || 0}
                                </button>
                                <button onClick={() => setShowComments({...showComments, [post.id]: !showComments[post.id]})}
                                    style={{flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px', borderRadius: '10px', border: 'none', cursor: 'pointer', background: C.beige, color: C.brown, fontWeight: '600', fontSize: '13px'}}>
                                    💬 {post.commentaires?.length || 0}
                                </button>
                                <button onClick={() => handleShare(post)}
                                    style={{flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px', borderRadius: '10px', border: 'none', cursor: 'pointer', background: '#E8F5E9', color: '#2e7d32', fontWeight: '600', fontSize: '13px'}}>
                                    🔗 Partager
                                </button>
                            </div>

                            {/* Commentaires */}
                            {showComments[post.id] && (
                                <div>
                                    {post.commentaires?.map(c => (
                                        <div key={c.id} style={{display: 'flex', gap: '10px', marginBottom: '10px'}}>
                                            <div style={{width: '32px', height: '32px', borderRadius: '50%', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', flexShrink: 0}}>
                                                {c.auteur?.prenom?.[0] || '?'}
                                            </div>
                                            <div style={{background: C.beige, borderRadius: '12px', padding: '8px 12px', flex: 1}}>
                                                <p style={{fontWeight: '600', color: C.brown, fontSize: '13px', margin: '0 0 2px'}}>{c.auteur?.prenom}</p>
                                                <p style={{color: '#555', fontSize: '13px', margin: 0}}>{c.contenu}</p>
                                            </div>
                                        </div>
                                    ))}
                                    <div style={{display: 'flex', gap: '8px', marginTop: '12px'}}>
                                        <input
                                            value={commentInputs[post.id] || ''}
                                            onChange={e => setCommentInputs({...commentInputs, [post.id]: e.target.value})}
                                            placeholder="Écrire un commentaire..."
                                            style={{flex: 1, border: '1.5px solid #e0d5d0', borderRadius: '20px', padding: '8px 16px', fontSize: '13px', outline: 'none'}}
                                            onKeyPress={e => e.key === 'Enter' && handleComment(post.id)}
                                        />
                                        <button onClick={() => handleComment(post.id)}
                                            style={{background: C.primary, color: 'white', border: 'none', borderRadius: '20px', padding: '8px 16px', cursor: 'pointer', fontWeight: '600', fontSize: '13px'}}>
                                            →
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}