import React, { useState } from 'react';
import { certApi } from '../services/api';

const IEEECertificatePortal = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');

  // LinkedIn State
  const [showLinkedInPreview, setShowLinkedInPreview] = useState(false);
  const [linkedInText, setLinkedInText] = useState(
    "I'm thrilled to share that I've successfully participated in the IEEE Event! Check out my certificate! 🎓✨\n\n#IEEE #Achievement #Tech"
  );

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await certApi.sendOtp(name, email);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send OTP. Please check your email.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const response = await certApi.generateCertificate(email, otp, 'IEEE Event', 'IEEE');
      setDownloadUrl(response.data.data.download_url);
      setStep(3);
      setShowLinkedInPreview(false); // Reset preview state
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLinkedInShare = () => {
    const linkedInShareUrl = `https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(linkedInText)}`;
    window.open(linkedInShareUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="ieee-portal-container">
      <div className="glass-card">
        <div className="ieee-header">
          <div className="ieee-logo">IEEE</div>
          <h2>Certificate Portal</h2>
          <p>Securely access your participation certificate</p>
        </div>

        {error && <div className="ieee-error">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          {error}
        </div>}

        {step === 1 && (
          <form onSubmit={handleSendOtp} className="ieee-form fade-in">
            <div className="input-group">
              <label>Full Name</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="Enter your registered name"
                required 
              />
            </div>
            <div className="input-group">
              <label>Email Address</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="Enter your registered email"
                required 
              />
            </div>
            <button type="submit" disabled={loading} className="ieee-button primary-btn">
              {loading ? <span className="loader"></span> : 'Send OTP'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="ieee-form fade-in">
            <div className="input-group">
              <label>Enter Verification Code</label>
              <p className="hint">We've sent a 6-digit code to <strong>{email}</strong></p>
              <input 
                type="text" 
                value={otp} 
                onChange={(e) => setOtp(e.target.value)} 
                placeholder="• • • • • •"
                maxLength={6}
                className="otp-input"
                required 
              />
            </div>
            <div className="button-group">
              <button type="button" onClick={() => setStep(1)} className="ieee-button secondary-btn">
                Back
              </button>
              <button type="submit" disabled={loading} className="ieee-button primary-btn">
                {loading ? <span className="loader"></span> : 'Verify & Generate'}
              </button>
            </div>
          </form>
        )}

        {step === 3 && (
          <div className="success-container fade-in">
            <div className="success-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <h3>Certificate Ready!</h3>
            <p className="success-text">Your certificate has been generated and is ready for download.</p>
            
            <div className="action-buttons-vertical">
              <a href={downloadUrl} className="ieee-button primary-btn download-btn" download>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                Download Certificate
              </a>
              
              {!showLinkedInPreview ? (
                <button onClick={() => setShowLinkedInPreview(true)} className="ieee-button linkedin-btn">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                  Share on LinkedIn
                </button>
              ) : (
                <div className="linkedin-preview-card fade-in">
                  <div className="preview-header">
                    <span className="preview-title">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                      LinkedIn Post Preview
                    </span>
                    <button onClick={() => setShowLinkedInPreview(false)} className="close-preview">×</button>
                  </div>
                  
                  <div className="linkedin-mockup">
                    <div className="mockup-profile">
                      <div className="mockup-avatar"></div>
                      <div className="mockup-name-block">
                        <div className="mockup-name">You</div>
                        <div className="mockup-time">Just now • 🌐</div>
                      </div>
                    </div>
                    <textarea 
                      className="mockup-textarea"
                      value={linkedInText}
                      onChange={(e) => setLinkedInText(e.target.value)}
                      rows={4}
                    />
                    <div className="mockup-image-placeholder">
                      <div className="placeholder-content">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                        <span>Don't forget to attach your downloaded certificate here!</span>
                      </div>
                    </div>
                  </div>
                  
                  <button onClick={handleLinkedInShare} className="ieee-button linkedin-post-btn">
                    Post to LinkedIn
                  </button>
                </div>
              )}
            </div>

            <button onClick={() => {setStep(1); setName(''); setEmail(''); setOtp(''); setShowLinkedInPreview(false);}} className="ieee-button text-btn mt-4">
              Generate Another Certificate
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default IEEECertificatePortal;
