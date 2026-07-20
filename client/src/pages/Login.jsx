import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Login() {
  const { isLoggedIn, login } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirectTo = params.get('redirect');

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isLoggedIn) navigate('/account');
  }, [isLoggedIn, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const { token, user } = await Api.login({ identifier: identifier.trim(), password });
      login(token, user);
      if (redirectTo) navigate(redirectTo);
      else if (user.role === 'admin') navigate('/admin/dashboard');
      else navigate('/');
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  return (
    <div className="container" style={{ padding: '56px 24px' }}>
      <div className="form-card">
        <h2 className="text-center" style={{ marginBottom: 22 }}>Log in</h2>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="identifier">Email or phone number</label>
            <input type="text" id="identifier" required autoComplete="username" value={identifier} onChange={(e) => setIdentifier(e.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input type="password" id="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
            {submitting ? 'Logging in…' : 'Log in'}
          </button>
        </form>
        <p className="form-note">New here? <Link to="/register" style={{ color: 'var(--peacock)', fontWeight: 700 }}>Create an account</Link></p>
      </div>
    </div>
  );
}
