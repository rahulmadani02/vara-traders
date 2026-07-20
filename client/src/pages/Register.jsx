import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Register() {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(null);

  useEffect(() => {
    if (isLoggedIn) navigate('/account');
  }, [isLoggedIn, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email.trim() && !phone.trim()) {
      setError('Enter an email address or a phone number.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const { user } = await Api.register({ name: name.trim(), email: email.trim(), phone: phone.trim(), password });
      // NOTE: deliberately not auto-logging in — person confirms, then logs
      // in themselves, same as the original flow.
      setDone(user);
      setTimeout(() => navigate('/login'), 1800);
    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="container" style={{ padding: '56px 24px' }}>
        <div className="form-card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>✅</div>
          <h2 style={{ marginBottom: 10 }}>Account created!</h2>
          <p style={{ color: 'var(--ledger-soft)' }}>Welcome to Vara Traders, {done.name.split(' ')[0]}. Please log in to continue.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '56px 24px' }}>
      <div className="form-card">
        <h2 className="text-center" style={{ marginBottom: 22 }}>Create your account</h2>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Full name</label>
            <input type="text" id="name" required value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email <span style={{ fontWeight: 400, color: 'var(--ledger-soft)' }}>(or fill phone instead)</span></label>
            <input type="email" id="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="phone">Phone number <span style={{ fontWeight: 400, color: 'var(--ledger-soft)' }}>(or fill email instead)</span></label>
            <input type="tel" id="phone" placeholder="e.g. 087 123 4567" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input type="password" id="password" required minLength={6} autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
            {submitting ? 'Creating account…' : 'Create account'}
          </button>
        </form>
        <p className="form-note">Already have an account? <Link to="/login" style={{ color: 'var(--peacock)', fontWeight: 700 }}>Log in</Link></p>
      </div>
    </div>
  );
}
