import { useState } from 'react';

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    // NOTE: this form is UI-only for now — no backend email route wired up yet.
    setSent(true);
    setName('');
    setEmail('');
    setMessage('');
  }

  return (
    <>
      <div className="page-head container">
        <h2>Get in touch</h2>
        <p>Questions about an order, bulk pricing, or a product — we usually reply the same day.</p>
      </div>
      <div className="container" style={{ paddingBottom: 60 }}>
        <div className="form-card">
          {sent && <div className="alert alert-success">Thanks! This demo form doesn't send yet — we can wire it up to email or WhatsApp next if you'd like.</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group"><label htmlFor="name">Name</label><input type="text" id="name" required value={name} onChange={(e) => setName(e.target.value)} /></div>
            <div className="form-group"><label htmlFor="email">Email</label><input type="email" id="email" required value={email} onChange={(e) => setEmail(e.target.value)} /></div>
            <div className="form-group"><label htmlFor="message">Message</label><textarea id="message" rows={4} required value={message} onChange={(e) => setMessage(e.target.value)} /></div>
            <button type="submit" className="btn btn-primary btn-block">Send message</button>
          </form>
          <p className="form-note">Or reach us directly: 📞 +353 1 234 5678 &nbsp;·&nbsp; ✉️ orders@varatraders.ie</p>
        </div>
      </div>
    </>
  );
}
