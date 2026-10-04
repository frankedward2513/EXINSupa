import React, { useState } from 'react';

import { supabase } from "../utils/supabase";
import type { UserRecord } from "../utils/supabase";

interface AuthProps {
  onSuccess?: (user: UserRecord) => void;
}

export const Auth: React.FC<AuthProps> = ({ onSuccess }) => {
  const [isSignUp, setIsSignUp] = useState<boolean>(false);
  const [message, setMessage] = useState<{
    text: string;
    isError: boolean;
  } | null>(null);

  // Form Fields
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [address, setAddress] = useState<string>('');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    // Fetch user matching email & password
    const { data, error } = await supabase
      .from('users')
      .select(
        'id, cus_name, cus_gmail, cus_password, cus_address, cus_role, created_at'
      )
      .eq('cus_gmail', email)
      .eq('cus_password', password)
      .single();

    if (error || !data) {
      setMessage({
        text: 'Invalid email or password.',
        isError: true,
      });
    } else {
      const loggedUser = data as UserRecord;

      setMessage({
        text: `Welcome back, ${loggedUser.cus_name}!`,
        isError: false,
      });

      if (onSuccess) {
        onSuccess(loggedUser);
      }
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    // Insert customer record
    const { error } = await supabase
      .from('users')
      .insert([
        {
          cus_name: name,
          cus_gmail: email,
          cus_password: password,
          cus_address: address,
        },
      ]);

    if (error) {
      if (error.code === '23505') {
        setMessage({
          text: 'Email is already registered.',
          isError: true,
        });
      } else {
        setMessage({
          text: error.message,
          isError: true,
        });
      }
    } else {
      setMessage({
        text: 'Account created! You can now sign in.',
        isError: false,
      });

      setIsSignUp(false);
      setPassword('');
    }
  };

  return (
    <div
      style={{
        maxWidth: '400px',
        margin: '40px auto',
        padding: '20px',
        border: '1px solid #ccc',
        borderRadius: '8px',
      }}
    >
      <h2>{isSignUp ? 'Create Account' : 'Welcome Back'}</h2>

      {message && (
        <div
          style={{
            color: message.isError ? 'red' : 'green',
            marginBottom: '10px',
          }}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={isSignUp ? handleSignUp : handleSignIn}>
        {isSignUp && (
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block' }}>Full Name</label>

            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
              }}
            />
          </div>
        )}

        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block' }}>Email</label>

          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
            }}
          />
        </div>

        <div style={{ marginBottom: '10px' }}>
          <label style={{ display: 'block' }}>Password</label>

          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
            }}
          />
        </div>

        {isSignUp && (
          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'block' }}>Address</label>

            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
              }}
            />
          </div>
        )}

        <button
          type="submit"
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: '#0070f3',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
          }}
        >
          {isSignUp ? 'Sign Up' : 'Sign In'}
        </button>
      </form>

      <div
        style={{
          marginTop: '15px',
          textAlign: 'center',
        }}
      >
        <button
          type="button"
          onClick={() => {
            setIsSignUp(!isSignUp);
            setMessage(null);
          }}
          style={{
            background: 'none',
            border: 'none',
            color: '#0070f3',
            cursor: 'pointer',
          }}
        >
          {isSignUp
            ? 'Already have an account? Sign In'
            : "Don't have an account? Sign Up"}
        </button>
      </div>
    </div>
  );
};