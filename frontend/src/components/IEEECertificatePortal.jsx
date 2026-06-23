import React, { useState, useEffect } from 'react';
import { certApi, BACKEND_URL } from '../services/api';
import axios from 'axios';

const IEEECertificatePortal = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [sapId, setSapId] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loadingMessage, setLoadingMessage] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');
  // Wake up the backend as soon as the portal loads
  useEffect(() => {
    if (!BACKEND_URL) return;

    axios.get(BACKEND_URL + '/')
      .then(() => {})
      .catch(() => {});
  }, []);
  // After OTP is sent the backend returns the resolved email (from DB)
  const [resolvedEmail, setResolvedEmail] = useState('');
  const [emailHint, setEmailHint] = useState('');

  // LinkedIn State
  const [showLinkedInPreview, setShowLinkedInPreview] = useState(false);
  const [linkedInText, setLinkedInText] = useState(
    "I am pleased to share that I successfully participated in the IEEE SPS Day 2026, organized by the IEEE Signal Processing Society at UPES \nThe event provided a valuable opportunity to engage with fellow students, explore advancements in signal processing, and learn from professionals in the field who are focused on innovation and professional development.\nProud to have received this Certificate showing my participation in the event \n#IEEE #IEEESPS #SPSDay2026 #IEEEUPES #SignalProcessing #ProfessionalDevelopment #Learning #Innovation #StudentCommunity #Engineering #UPES"
  );

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setLoadingMessage('');

    try {
      const res = await certApi.sendOtp(name, email, sapId);
      // Backend returns the actual DB email + a masked hint for display
      setResolvedEmail(res.data.email);
      setEmailHint(res.data.email_hint || res.data.email);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send OTP. Please check your details.');
    } finally {
      setLoading(false);
      setLoadingMessage('');
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // Use resolvedEmail (from DB) — critical when SAP ID was used to look up the participant
      const response = await certApi.generateCertificate(resolvedEmail, otp, 'IEEE Event', 'IEEE');
      setDownloadUrl(BACKEND_URL + response.data.data.download_url);
      setStep(3);
      setShowLinkedInPreview(false);
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

  const handleReset = () => {
    setStep(1);
    setName('');
    setEmail('');
    setSapId('');
    setOtp('');
    setResolvedEmail('');
    setEmailHint('');
    setShowLinkedInPreview(false);
    setError('');
  };

  return (
    <div className="ieee-portal-container">
      <div className="glass-card">
        <div className="ieee-header">
          <div className="ieee-logo">
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '6px' }}>
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
              <path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5" />
            </svg>
            IEEE
          </div>
          <h2>Certificate Portal</h2>
          <p>Access and verify your official participation certificate</p>
        </div>

        {error && (
          <div className="ieee-error fade-in">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            {error}
          </div>
        )}

        {/* ── Step 1: Identity Form ── */}
        {step === 1 && (
          <form onSubmit={handleSendOtp} className="ieee-form fade-in">
            {/* Full Name */}
            <div className="input-group">
              <label>Full Name</label>
              <div className="input-wrapper">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your registered name"
                  required
                />
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
            </div>

            {/* Email */}
            <div className="input-group">
              <label>Email Address</label>
              <div className="input-wrapper">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your registered email"
                  required
                />
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
              </div>
            </div>


            {/* SAP ID */}
            <div className="input-group">
              <label>SAP ID</label>
              <div className="input-wrapper">
                <input
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={12}
                  value={sapId}
                  onChange={(e) => setSapId(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter your SAP ID"
                  required
                />
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
              </div>
            </div>

            <button type="submit" disabled={loading} className="ieee-button primary-btn">
              {loading ? (
                <span className="loader"></span>
              ) : (
                <>
                  Send Verification OTP
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '6px' }}>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                  </svg>
                </>
              )}
            </button>
            {loadingMessage && (
              <p className="fade-in" style={{ textAlign: 'center', marginTop: '16px', color: '#00629B', fontWeight: '500', fontSize: '0.95rem' }}>
                {loadingMessage}
              </p>
            )}
          </form>
        )}

        {/* ── Step 2: OTP Verification ── */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="ieee-form fade-in">
            <div className="input-group">
              <label>Enter Verification Code</label>
              <p className="hint">
                We have sent a 6-digit code to <strong>{emailHint}</strong>
              </p>
              <div className="otp-input-wrapper">
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="••••••"
                  maxLength={6}
                  required
                />
              </div>
            </div>
            <div className="button-group">
              <button type="button" onClick={() => { setStep(1); setError(''); }} className="ieee-button secondary-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }}>
                  <line x1="19" y1="12" x2="5" y2="12"></line>
                  <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
                Back
              </button>
              <button type="submit" disabled={loading} className="ieee-button primary-btn">
                {loading ? <span className="loader"></span> : 'Verify & Generate'}
              </button>
            </div>
          </form>
        )}

        {/* ── Step 3: Certificate Ready ── */}
        {step === 3 && (
          <div className="success-container fade-in">
            <div className="success-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <h3>Certificate Ready!</h3>
            <p className="success-text">Your official IEEE event certificate has been generated successfully.</p>

            {/* Live Certificate Preview */}
            <div className="cert-mockup-frame">
              <div className="cert-mockup-header">
                <span className="cert-mockup-dot dot-red"></span>
                <span className="cert-mockup-dot dot-yellow"></span>
                <span className="cert-mockup-dot dot-green"></span>
              </div>
              <img src={downloadUrl} className="cert-mockup-image" alt="IEEE Certificate Preview" />
            </div>

            <div className="action-buttons-vertical">
              <a href={downloadUrl} className="ieee-button primary-btn download-btn" download>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                Download Certificate
              </a>

              {!showLinkedInPreview ? (
                <button onClick={() => setShowLinkedInPreview(true)} className="ieee-button linkedin-btn">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{ marginRight: '4px' }}>
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                  Share on LinkedIn
                </button>
              ) : (
                <div className="linkedin-preview-card fade-in">
                  <div className="preview-header">
                    <span className="preview-title">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                      </svg>
                      Post Preview
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
                    <div className="mockup-image-placeholder" style={{ padding: '4px' }}>
                      <img src={downloadUrl} className="cert-mockup-image" style={{ maxHeight: '130px', width: 'auto', margin: '0 auto' }} alt="LinkedIn post certificate preview" />
                    </div>
                  </div>
                  <button onClick={handleLinkedInShare} className="ieee-button linkedin-post-btn">
                    Post to LinkedIn
                  </button>
                </div>
              )}
            </div>

            <button onClick={handleReset} className="ieee-button text-btn mt-4">
              Generate Another Certificate
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default IEEECertificatePortal;
