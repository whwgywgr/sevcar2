import React, { useState } from 'react';
import { supabase } from './supabaseClient';
import { useNotification } from './Notification';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

export default function AuthPage({ onAuth }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isLogin, setIsLogin] = useState(true);
    const notify = useNotification();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        let result;
        if (isLogin) {
            result = await supabase.auth.signInWithPassword({ email, password });
        } else {
            result = await supabase.auth.signUp({ email, password });
        }
        setLoading(false);
        if (result.error) {
            setError(result.error.message);
            notify(result.error.message, 'error');
        } else if (result.data.session || result.data.user) {
            onAuth();
            notify(isLogin ? 'Login successful' : 'Registration successful', 'success');
        } else {
            setError('Check your email for confirmation.');
            notify('Check your email for confirmation.', 'info');
        }
    };

    return (
        <Box minHeight="80vh" display="flex" alignItems="center" justifyContent="center" bgcolor="#e0e7ff">
            <Paper elevation={6} sx={{ p: 4, maxWidth: 370, width: '100%', borderRadius: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Box sx={{ width: 54, height: 54, borderRadius: '50%', bgcolor: 'primary.light', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 'bold', color: 'primary.main', mb: 2, boxShadow: 2 }} aria-label="Car Logo">
                    🚗
                </Box>
                <Typography variant="h5" fontWeight={800} color="text.primary" mb={2} align="center">
                    {isLogin ? 'Login' : 'Register'}
                </Typography>
                <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                        label="Email"
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        fullWidth
                        size="medium"
                    />
                    <TextField
                        label="Password"
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        fullWidth
                        size="medium"
                    />
                    {error && <Typography color="error" sx={{ mt: 1 }}>{error}</Typography>}
                    <Button
                        variant="contained"
                        color="primary"
                        type="submit"
                        disabled={loading}
                        fullWidth
                        sx={{ mt: 1, fontWeight: 600 }}
                    >
                        {loading ? 'Loading...' : isLogin ? 'Login' : 'Register'}
                    </Button>
                </Box>
                <Button
                    color="primary"
                    variant="text"
                    onClick={() => setIsLogin(!isLogin)}
                    sx={{ mt: 2, textDecoration: 'underline', fontSize: '1rem' }}
                >
                    {isLogin ? 'No account? Register' : 'Have an account? Login'}
                </Button>
            </Paper>
        </Box>
    );
}
