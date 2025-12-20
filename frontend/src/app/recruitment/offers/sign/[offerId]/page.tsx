"use client";

import { use, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { recruitmentApi } from '../../../services';
import { OfferWithDetails } from '../../../types';

// Dynamically import DocuSeal form to avoid SSR issues
const DocusealForm = dynamic(
  () => import('@docuseal/react').then((mod) => mod.DocusealForm),
  { ssr: false, loading: () => <div style={{ padding: '2rem', textAlign: 'center' }}>Loading signature form...</div> }
);

interface PageProps {
  params: Promise<{
    offerId: string;
  }>;
}

interface SigningData {
  offer: OfferWithDetails;
  embedUrl: string;
  submissionId: number;
  candidateEmail: string;
  candidateName: string;
}

export default function OfferSigningPage({ params }: PageProps) {
  const { offerId } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [signingData, setSigningData] = useState<SigningData | null>(null);
  const [signatureCompleted, setSignatureCompleted] = useState(false);
  const [processingCompletion, setProcessingCompletion] = useState(false);

  useEffect(() => {
    loadOfferForSigning();
  }, [offerId]);

  const loadOfferForSigning = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get the offer details
      const offer = await recruitmentApi.getOfferById(offerId);
      
      // Check if offer is approved and ready for signing
      if (offer.finalStatus !== 'approved') {
        throw new Error('This offer has not been approved yet');
      }

      // Check if already signed
      if (offer.applicantResponse === 'accepted') {
        setSignatureCompleted(true);
        setSigningData({
          offer,
          embedUrl: '',
          submissionId: 0,
          candidateEmail: offer.candidateId?.personalEmail || '',
          candidateName: offer.candidateId?.fullName || offer.candidateId?.firstName || 'Candidate',
        });
        setLoading(false);
        return;
      }

      // Get candidate details
      const candidateEmail = offer.candidateId?.personalEmail || '';
      const candidateName = offer.candidateId?.fullName || 
        `${offer.candidateId?.firstName || ''} ${offer.candidateId?.lastName || ''}`.trim() || 
        'Candidate';

      // Create a DocuSeal submission (generates signing link)
      const result = await recruitmentApi.createDocuSealSubmission(offerId);
      if (result.embedUrl) {
        setSigningData({
          offer,
          embedUrl: result.embedUrl,
          submissionId: result.submissionId,
          candidateEmail,
          candidateName,
        });
      } else {
        throw new Error('Failed to create signature submission');
      }
    } catch (err) {
      console.error('Error loading offer for signing:', err);
      setError(err instanceof Error ? err.message : 'Failed to load offer');
    } finally {
      setLoading(false);
    }
  };

  const handleSignatureComplete = useCallback(async (data: any) => {
    console.log('=== DocuSeal onComplete TRIGGERED ===');
    console.log('Signature completed data:', JSON.stringify(data, null, 2));
    setProcessingCompletion(true);
    
    try {
      // Update the offer with signature completion - mark as accepted
      await recruitmentApi.completeDocuSealSignature(offerId, {
        submissionId: signingData?.submissionId || data?.submission_id || data?.id || 0,
        documentUrl: data?.documents?.[0]?.url,
      });
      
      setSignatureCompleted(true);
    } catch (err) {
      console.error('Error processing signature completion:', err);
      setError('Signature was captured but there was an error updating the system. Please contact HR.');
    } finally {
      setProcessingCompletion(false);
    }
  }, [offerId, signingData]);

  const handleFormInit = useCallback(() => {
    console.log('=== DocuSeal onInit TRIGGERED ===');
  }, []);

  const handleFormLoad = useCallback((data: any) => {
    console.log('=== DocuSeal onLoad TRIGGERED ===');
    console.log('Form loaded data:', JSON.stringify(data, null, 2));
  }, []);

  // Listen for postMessage events from DocuSeal iframe (backup for onComplete)
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      console.log('=== Window postMessage received ===');
      console.log('Message origin:', event.origin);
      console.log('Message data:', JSON.stringify(event.data, null, 2));
      
      // DocuSeal sends messages when signing is completed
      if (event.data && (
        event.data.type === 'completed' || 
        event.data.status === 'completed' || 
        event.data.event === 'completed' ||
        event.data.event === 'form.completed'
      )) {
        console.log('DocuSeal completion message detected!');
        if (!signatureCompleted && !processingCompletion) {
          await handleSignatureComplete(event.data);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [signatureCompleted, processingCompletion, handleSignatureComplete]);

  const handleDecline = useCallback(async (data: any) => {
    console.log('Signature declined:', data);
    
    try {
      // Update the offer with decline status
      if (signingData?.offer.candidateId?._id) {
        await recruitmentApi.candidateRejectOffer(
          offerId,
          signingData.offer.candidateId._id,
          data.decline_reason || 'Declined via signature form'
        );
      }
      
      router.push('/recruitment/my-applications?declined=true');
    } catch (err) {
      console.error('Error processing decline:', err);
      setError('There was an error processing your decline. Please contact HR.');
    }
  }, [offerId, signingData, router]);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-secondary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid var(--border-light)',
            borderTopColor: 'var(--recruitment)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem',
          }} />
          <p style={{ color: 'var(--text-secondary)' }}>Loading offer letter...</p>
        </div>
        <style jsx>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-secondary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '12px',
          boxShadow: 'var(--shadow-md)',
          textAlign: 'center',
          maxWidth: '500px',
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            backgroundColor: '#FEE2E2',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            fontSize: '28px',
          }}>
            ⚠️
          </div>
          <h2 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            Unable to Load Offer
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            {error}
          </p>
          <button
            onClick={() => router.push('/recruitment/my-applications')}
            style={{
              backgroundColor: 'var(--recruitment)',
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            Back to Applications
          </button>
        </div>
      </div>
    );
  }

  if (signatureCompleted) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-secondary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '3rem',
          borderRadius: '16px',
          boxShadow: 'var(--shadow-lg)',
          textAlign: 'center',
          maxWidth: '600px',
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            backgroundColor: '#D1FAE5',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 2rem',
            fontSize: '40px',
          }}>
            ✓
          </div>
          <h1 style={{
            color: 'var(--text-primary)',
            fontSize: '1.75rem',
            fontWeight: 700,
            marginBottom: '1rem',
          }}>
            Offer Accepted!
          </h1>
          <p style={{
            color: 'var(--text-secondary)',
            fontSize: '1.1rem',
            marginBottom: '0.5rem',
          }}>
            Congratulations, {signingData?.candidateName}!
          </p>
          <p style={{
            color: 'var(--text-secondary)',
            marginBottom: '2rem',
          }}>
            You have successfully signed and accepted the offer for the position of{' '}
            <strong>{signingData?.offer.role}</strong>.
          </p>
          <div style={{
            backgroundColor: '#F0FDF4',
            border: '1px solid #86EFAC',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '2rem',
          }}>
            <p style={{ color: '#166534', margin: 0 }}>
              📧 A confirmation email with the signed offer letter will be sent to{' '}
              <strong>{signingData?.candidateEmail}</strong>
            </p>
          </div>
          <p style={{
            color: 'var(--text-muted)',
            fontSize: '0.875rem',
            marginBottom: '2rem',
          }}>
            Our HR team will be in touch soon with next steps for your onboarding.
          </p>
          <button
            onClick={() => router.push('/recruitment/my-applications')}
            style={{
              backgroundColor: 'var(--recruitment)',
              color: 'white',
              border: 'none',
              padding: '1rem 2rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '1rem',
            }}
          >
            View My Applications
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-secondary)' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, var(--recruitment) 0%, #7C3AED 100%)',
        padding: '2rem 1.5rem',
        color: 'white',
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            Sign Your Offer Letter
          </h1>
          <p style={{ opacity: 0.9 }}>
            Position: <strong>{signingData?.offer.role}</strong>
          </p>
        </div>
      </div>

      {/* Offer Summary */}
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '1.5rem' }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '1.5rem',
          marginBottom: '1.5rem',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <h2 style={{
            fontSize: '1.125rem',
            fontWeight: 600,
            color: 'var(--text-primary)',
            marginBottom: '1rem',
          }}>
            Offer Summary
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
          }}>
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                Position
              </p>
              <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                {signingData?.offer.role}
              </p>
            </div>
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                Annual Salary
              </p>
              <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                {signingData?.offer.grossSalary?.toLocaleString('en-US', {
                  style: 'currency',
                  currency: 'USD',
                })}
              </p>
            </div>
            {signingData?.offer.signingBonus && (
              <div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                  Signing Bonus
                </p>
                <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                  {signingData.offer.signingBonus.toLocaleString('en-US', {
                    style: 'currency',
                    currency: 'USD',
                  })}
                </p>
              </div>
            )}
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                Response Deadline
              </p>
              <p style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                {signingData?.offer.deadline
                  ? new Date(signingData.offer.deadline).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : 'N/A'}
              </p>
            </div>
          </div>
          {signingData?.offer.benefits && signingData.offer.benefits.length > 0 && (
            <div style={{ marginTop: '1rem' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                Benefits
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {signingData.offer.benefits.map((benefit, index) => (
                  <span
                    key={index}
                    style={{
                      backgroundColor: '#EEF2FF',
                      color: '#4F46E5',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.875rem',
                    }}
                  >
                    {benefit}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* DocuSeal Signing Form */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-sm)',
        }}>
          <div style={{
            padding: '1rem 1.5rem',
            borderBottom: '1px solid var(--border-light)',
            backgroundColor: '#F9FAFB',
          }}>
            <h2 style={{
              fontSize: '1.125rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
              margin: 0,
            }}>
              📝 Review and Sign
            </h2>
            <p style={{
              color: 'var(--text-secondary)',
              fontSize: '0.875rem',
              margin: '0.25rem 0 0 0',
            }}>
              Please review the offer letter below and sign to accept
            </p>
          </div>
          
          {processingCompletion ? (
            <div style={{ padding: '4rem', textAlign: 'center' }}>
              <div style={{
                width: '48px',
                height: '48px',
                border: '4px solid var(--border-light)',
                borderTopColor: 'var(--recruitment)',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 1rem',
              }} />
              <p style={{ color: 'var(--text-secondary)' }}>
                Processing your signature...
              </p>
            </div>
          ) : signingData?.embedUrl ? (
            <>
              {/* Manual confirmation button at TOP for visibility */}
              <div style={{
                padding: '1rem 1.5rem',
                borderBottom: '1px solid var(--border-light)',
                backgroundColor: '#FEF3C7',
                textAlign: 'center',
              }}>
                <p style={{ color: '#92400E', fontSize: '0.875rem', marginBottom: '0.75rem', fontWeight: 500 }}>
                  ⚠️ After signing below, if the page doesn&apos;t update automatically, click this button:
                </p>
                <button
                  onClick={() => handleSignatureComplete({ manual: true })}
                  style={{
                    backgroundColor: '#059669',
                    color: 'white',
                    border: 'none',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '1rem',
                  }}
                >
                  ✓ I Have Signed - Confirm Completion
                </button>
              </div>
              <div style={{ minHeight: '600px' }}>
                <DocusealForm
                  src={signingData.embedUrl}
                  email={signingData.candidateEmail}
                  name={signingData.candidateName}
                  onInit={handleFormInit}
                  onLoad={handleFormLoad}
                  onComplete={handleSignatureComplete}
                  onDecline={handleDecline}
                  withTitle={false}
                  withDownloadButton={true}
                  withSendCopyButton={true}
                  allowToResubmit={false}
                />
              </div>
            </>
          ) : (
            <div style={{ padding: '4rem', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-secondary)' }}>
                Unable to load signature form. Please try refreshing the page.
              </p>
              <button
                onClick={loadOfferForSigning}
                style={{
                  marginTop: '1rem',
                  backgroundColor: 'var(--recruitment)',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                Retry
              </button>
            </div>
          )}
        </div>

        {/* Help Section */}
        <div style={{
          marginTop: '1.5rem',
          padding: '1rem',
          backgroundColor: '#FEF3C7',
          borderRadius: '8px',
          border: '1px solid #FCD34D',
        }}>
          <p style={{ color: '#92400E', margin: 0, fontSize: '0.875rem' }}>
            <strong>Need help?</strong> If you have questions about this offer or encounter any issues,
            please contact HR at <a href="mailto:hr@company.com" style={{ color: '#92400E' }}>hr@company.com</a>
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
