import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import certificateService from '../../services/certificateService';

const CertificateButton = ({ enrollment, overallProgress }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [certId, setCertId] = useState(enrollment?.certificate?.id || null);

  const isReady = overallProgress === 100;

  const handleClick = async () => {
    if (!isReady || loading) return;

    // Already have the cert id — just navigate, never re-generate
    if (certId) {
      navigate(`/student/certificates/${certId}`);
      return;
    }

    try {
      setLoading(true);
      // First time: trigger generation (creates cert + saves image URL)
      const cert = await certificateService.generateCertificate(enrollment.id);
      setCertId(cert.id);
      navigate(`/student/certificates/${cert.id}`);
    } catch (err) {
      console.error('Certificate generation failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={!isReady || loading}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition
        ${isReady
          ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 shadow-lg shadow-emerald-100 dark:shadow-none'
          : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
        }`}
    >
      {loading ? (
        <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
      ) : (
        <span>📜</span>
      )}
      {isReady ? 'View Certificate' : `Certificate (${overallProgress}%)`}
    </button>
  );
};

export default CertificateButton;