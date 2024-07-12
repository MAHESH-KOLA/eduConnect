import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Container, Typography, TextField, Button } from '@mui/material';

const RegisterPage = () => {
  const [firstname, setFirstname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otptext, setOTP] = useState('');
  const [loading, setLoading] = useState(false);
  const [redirect, setRedirect] = useState(false);
  const [error, setError] = useState('');
  const [verified, setVerified] = useState(false);

  const sendOTP = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:4000/sendotp', {
        method: 'POST',
        body: JSON.stringify({ email }),
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        setError(errorMessage || 'Failed to send OTP');
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      setError('Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:4000/verifyotp', {
        method: 'POST',
        body: JSON.stringify({ email, otptext }),
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (response.ok) {
        setVerified(true);
        alert('OTP verification successful');
      } else {
        const errorMessage = await response.text();
        setError(errorMessage || 'OTP verification failed');
      }
    } catch (error) {
      console.error('Error verifying OTP:', error);
      setError('OTP verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const register = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:4000/register', {
        method: 'POST',
        body: JSON.stringify({ firstname, email, password }),
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (response.ok) {
        alert('Registration successful');
        setRedirect(true);
      } else {
        const errorMessage = await response.text();
        setError(errorMessage || 'Registration failed');
      }
    } catch (error) {
      console.error('Error during registration:', error);
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (redirect) {
    return <Navigate to={'/login'} />;
  }

  return (
    <>
      <h1 className='loginheading'>EduConnect</h1>
      <Container maxWidth="sm" sx={{ paddingTop: 12 }}>
        <Typography variant="h4" gutterBottom>
          Register
        </Typography>
        {error && <Typography variant="body2" color="error">{error}</Typography>}
        <form onSubmit={register}>
        
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <TextField
              sx={{
                '& .MuiFormLabel-root':{
                  marginTop:'0px',
                },
              }}
              label="Email"
              type="email"
              fullWidth
              margin="normal"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button size="small" onClick={sendOTP} disabled={loading} variant="contained" color="primary" style={{ width: '30%', marginLeft: '10px' }}>
              Send OTP
            </Button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <TextField
              sx={{
                '& .MuiFormLabel-root':{
                  marginTop:'0px',
                },
              }}
              label="OTP"
              type="text"
              fullWidth
              margin="normal"
              value={otptext}
              onChange={(e) => setOTP(e.target.value)}
            />
            <Button size="small" onClick={verifyOTP} disabled={loading} variant="contained" color="primary" style={{ width: '30%',  marginLeft: '10px' }}>
              Verify OTP
            </Button>
          </div>
          <TextField
            sx={{
              '& .MuiFormLabel-root':{
                marginTop:'0px',
              },
            }}
            label="Username"
            fullWidth
            margin="normal"
            value={firstname}
            onChange={(e) => setFirstname(e.target.value)}
          />
          <TextField
            sx={{
              '& .MuiFormLabel-root':{
                marginTop:'0px',
              },
            }}
            label="Password"
            type="password"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
         
          <Button type="submit" variant="contained" color="primary" disabled={!verified || loading}>
            {loading ? 'Registering...' : 'Register'}
          </Button>
        </form>
        <Typography variant="body1" marginTop="20px">
          Already have an account? <Link to="/login">Login</Link>
        </Typography>
      </Container>
    </>
  );
};

export default RegisterPage;
