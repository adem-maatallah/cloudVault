'use client';

import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';

export default function SignUpPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await signUp(name, email, password);
    if (!result.success) {
      setError(result.message || 'Error during sign up');
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1>☁️ CloudVault</h1>
          <p>Create your new account</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              required
            />
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {error && <div className="form-error">{error}</div>}

          <button type="submit" className="btn-primary auth-btn" disabled={loading}>
            {loading ? 'Creating account...' : 'Get Started'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Already have an account? <Link href="/login">Log In</Link></p>
        </div>
      </div>
    </div>
  );
}
