import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

export default function ProfilePage() {
    const [user, setUser] = useState(null);
    const [error, setError] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [resetEmailSent, setResetEmailSent] = useState(false);

    useEffect(() => {
        supabase.auth.getUser().then(({ data, error }) => {
            if (error) setError(error.message);
            else setUser(data.user);
        });
    }, []);

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');
        const { error } = await supabase.auth.updateUser({ password });
        setLoading(false);
        if (error) setError(error.message);
        else setSuccess('Password updated successfully.');
        setPassword('');
    };

    const handleResetPassword = async () => {
        setLoading(true);
        setError('');
        setSuccess('');
        const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
            redirectTo: window.location.origin,
        });
        setLoading(false);
        if (error) setError(error.message);
        else setResetEmailSent(true);
    };

    if (!user) return <Typography align="center" sx={{ py: 6 }}>Loading...</Typography>;

    // Helper for avatar
    const getInitial = (email) => email ? email[0].toUpperCase() : '?';

    return (
        <Box minHeight="100vh" display="flex" alignItems="center" justifyContent="center" py={4}>
            <Paper elevation={6} sx={{ width: '100%', maxWidth: 420, borderRadius: 3, p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.light', color: 'primary.main', fontSize: 36, fontWeight: 'bold', mb: 2 }}>
                    {getInitial(user.email)}
                </Avatar>
                <Typography variant="h5" fontWeight={800} color="text.primary" mb={1}>Profile</Typography>
                <Typography color="text.secondary" mb={2}>{user.email}</Typography>
                <Box component="form" onSubmit={handleChangePassword} sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
                    <Typography fontWeight={600} color="text.primary">Change Password</Typography>
                    <TextField
                        type="password"
                        label="New Password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        fullWidth
                    />
                    <Button variant="contained" color="primary" type="submit" disabled={loading} fullWidth>
                        {loading ? 'Changing...' : 'Change Password'}
                    </Button>
                </Box>
                <Box width="100%" mb={2}>
                    <Typography fontWeight={600} color="text.primary">Reset Password</Typography>
                    <Button
                        variant="outlined"
                        color="warning"
                        onClick={handleResetPassword}
                        disabled={loading || resetEmailSent}
                        fullWidth
                        sx={{ mt: 1 }}
                    >
                        {resetEmailSent ? 'Reset Email Sent' : 'Send Password Reset Email'}
                    </Button>
                </Box>
                {error && <Typography color="error" sx={{ mb: 1 }}>{error}</Typography>}
                {success && <Typography color="success.main" sx={{ mb: 1 }}>{success}</Typography>}
            </Paper>
        </Box>
    );
}
