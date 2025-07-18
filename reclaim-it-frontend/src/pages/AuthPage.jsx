// src/pages/AuthPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signIn, signUp } from '../api/auth';

export default function AuthPage() {

// helper to clear “touched” flags so inputs go back to neutral
  const resetTouched = () => {
    setFirstNameTouched(false);
    setLastNameTouched(false);
    setEmailTouched(false);
    setPasswordTouched(false);
    setConfirmTouched(false);
  };
  const [isSignIn, setIsSignIn]           = useState(true);
  const [firstName, setFirstName]         = useState('');
  const [lastName, setLastName]           = useState('');
  const [email, setEmail]                 = useState('');
  const [password, setPassword]           = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState('');
  const navigate                           = useNavigate();

  // Track “touched” state for each input
  const [firstNameTouched, setFirstNameTouched]   = useState(false);
  const [lastNameTouched, setLastNameTouched]     = useState(false);
  const [emailTouched, setEmailTouched]           = useState(false);
  const [passwordTouched, setPasswordTouched]     = useState(false);
  const [confirmTouched, setConfirmTouched]       = useState(false);

  // Validation
  const isSignInValid = email.trim() && password.trim();
  const isSignUpValid =
    firstName.trim() &&
    lastName.trim() &&
    email.trim() &&
    password.trim() &&
    confirmPassword.trim() &&
    password === confirmPassword;
  const isFormValid = isSignIn ? isSignInValid : isSignUpValid;

  // Per‑field invalid flags (only true if touched + invalid)
  const firstNameInvalid = firstNameTouched && firstName.trim() === '';
  const lastNameInvalid  = lastNameTouched  && lastName.trim() === '';
  const emailInvalid     = emailTouched     && email.trim() === '';
  const passwordInvalid  = passwordTouched  && password.trim() === '';
  const confirmInvalid   = confirmTouched   && 
    (confirmPassword.trim() === '' || confirmPassword !== password);

    
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid || loading) return;
    setLoading(true);
    setError('');

    try {
      if (isSignIn) {
        const res   = await signIn({ email, password });
        const token = res.data.access_token || res.data.session?.access_token;
        if (token) localStorage.setItem('token', token);
      } else {
        await signUp({ firstName, lastName, email, password });
        setIsSignIn(true);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        'Authentication failed'
      );
    } finally {
      setLoading(false);
    }
  };

  const styles = {
        container: {
        position: 'fixed',   // cover entire viewport
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #3b82f6 0%,rgb(116, 143, 233) 100%)',
        fontFamily: 'Inter, sans-serif',
    },
    card: {
      background: '#fff',
      borderRadius: '16px',
      padding: '2rem',
      boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
      width: '100%',
      maxWidth: '380px',
    },
    toggleContainer: {
      display: 'flex',
      background: '#f7f7f7',
      borderRadius: '999px',
      padding: '4px',
      marginBottom: '1.5rem',
    },
    toggleBtn: (active) => ({
      flex: 1,
      padding: '0.75rem 0',
      border: 'none',
      background: active ? '#fff' : 'transparent',
      color: active ? '#333' : '#888',
      borderRadius: '999px',
      boxShadow: active ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'all 0.2s',
    }),
    formGroup: {
      marginBottom: '1rem',
    },
    label: {
      display: 'block',
      marginBottom: '0.5rem',
      fontSize: '0.85rem',
      fontWeight: 500,
      color: '#444',
    },
    input: (invalid) => ({
      width: '100%',
      padding: '0.75rem',
      border: `1px solid ${invalid ? '#e53e3e' : '#ddd'}`,
      borderRadius: '8px',
      outline: 'none',
      boxShadow: invalid
        ? '0 0 0 3px rgba(229,62,62,0.2)'
        : '0 2px 5px rgba(0,0,0,0.05)',
      transition: 'border-color 0.2s, box-shadow 0.2s',
      marginBottom: '0.5rem',
    }),
    submitBtn: (enabled) => ({
      width: '100%',
      padding: '0.75rem',
      background: enabled ? '#667eea' : '#aac1f5',
      color: '#fff',
      border: 'none',
      borderRadius: '8px',
      fontSize: '1rem',
      fontWeight: 600,
      cursor: enabled ? 'pointer' : 'not-allowed',
      transition: 'background 0.2s',
    }),
    errorText: {
      color: '#e53e3e',
      marginBottom: '1rem',
      textAlign: 'center',
      fontWeight: 500,
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.toggleContainer}>
          <button
            type="button"
            style={styles.toggleBtn(isSignIn)}
            onClick={() => {
              setIsSignIn(true);
              setError('');
              resetTouched();
            }}
            disabled={loading}
          >
            Sign In
          </button>
          <button
            type="button"
            style={styles.toggleBtn(!isSignIn)}
            onClick={() => {
              setIsSignIn(false);
              setError('');
              resetTouched();
            }}
            disabled={loading}
          >
            Sign Up
          </button>
        </div>

        {error && <div style={styles.errorText}>{error}</div>}

        <form onSubmit={handleSubmit}>
          {!isSignIn && (
            <>
              <div style={styles.formGroup}>
                <label style={styles.label}>First Name</label>
                <input
                  type="text"
                  placeholder="John"
                  value={firstName}
                  onChange={e => setFirstName(e.target.value)}
                  onBlur={() => setFirstNameTouched(true)}
                  disabled={loading}
                  style={styles.input(firstNameInvalid)}
                />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Last Name</label>
                <input
                  type="text"
                  placeholder="Doe"
                  value={lastName}
                  onChange={e => setLastName(e.target.value)}
                  onBlur={() => setLastNameTouched(true)}
                  disabled={loading}
                  style={styles.input(lastNameInvalid)}
                />
              </div>
            </>
          )}

          <div style={styles.formGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onBlur={() => setEmailTouched(true)}
              disabled={loading}
              style={styles.input(emailInvalid)}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onBlur={() => setPasswordTouched(true)}
              disabled={loading}
              style={styles.input(passwordInvalid)}
            />
          </div>

          {!isSignIn && (
            <div style={styles.formGroup}>
              <label style={styles.label}>Confirm Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                onBlur={() => setConfirmTouched(true)}
                disabled={loading}
                style={styles.input(confirmInvalid)}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={!isFormValid || loading}
            style={styles.submitBtn(isFormValid && !loading)}
          >
            {loading
              ? isSignIn ? 'Signing In…' : 'Signing Up…'
              : isSignIn ? 'Sign In' : 'Sign Up'}
          </button>
        </form>
      </div>
    </div>
  );
}
