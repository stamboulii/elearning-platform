import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import certificateService from '../../services/certificateService';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const CertificateView = () => {
    const { id } = useParams();
    const [certificate, setCertificate] = useState(null);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);
    const certificateRef = useRef(null);

    useEffect(() => {
        fetchCertificate();
    }, [id]);

    const fetchCertificate = async () => {
        try {
            setLoading(true);
            const data = await certificateService.getCertificate(id);
            setCertificate(data.data.certificate);
        } catch (error) {
            console.error('Error fetching certificate:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async () => {
        if (!certificateRef.current) return;

        try {
            setDownloading(true);
            const canvas = await html2canvas(certificateRef.current, {
                scale: 3, // Higher resolution
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff'
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'px',
                format: [canvas.width, canvas.height]
            });

            pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
            pdf.save(`Certificate-${certificate.certificateNumber}.pdf`);
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Failed to download certificate. Please try again.');
        } finally {
            setDownloading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!certificate) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <p className="text-gray-600 mb-4">Certificate not found</p>
                    <Link to="/" className="text-blue-600 hover:underline">Go Home</Link>
                </div>
            </div>
        );
    }

    const { enrollment, certificateNumber, issuedAt } = certificate;
    const { user, course } = enrollment;

    return (
        <div className="min-h-screen bg-gray-100 py-12 px-4">
            <div className="max-w-5xl mx-auto">
                <div className="flex justify-between items-center mb-8 no-print">
                    <h1 className="text-2xl font-bold text-gray-800">Your Certificate</h1>
                    <div className="flex gap-4">
                        <button
                            onClick={handleDownload}
                            disabled={downloading}
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50"
                        >
                            {downloading ? 'Generating PDF...' : '⬇️ Download PDF'}
                        </button>
                        <Link
                            to="/student/dashboard"
                            className="bg-white text-gray-700 px-6 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition"
                        >
                            Back to Dashboard
                        </Link>
                    </div>
                </div>

                {/* CERTIFICATE DESIGN */}
                <div
                    ref={certificateRef}
                    className="bg-white shadow-2xl overflow-hidden relative"
                    style={{ width: '100%', aspectRatio: '1.414/1' }} // A4 Landscape ratio
                >
                    {/* Decorative Borders */}
                    <div className="absolute inset-0 border-[20px] border-blue-900 m-4 pointer-events-none"></div>
                    <div className="absolute inset-0 border-[2px] border-blue-400 m-8 pointer-events-none"></div>

                    {/* Background Elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full -mr-32 -mt-32 opacity-50"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-50 rounded-full -ml-32 -mb-32 opacity-50"></div>

                    {/* Content */}
                    <div className="relative z-10 h-full flex flex-col items-center justify-center p-20 text-center">
                        <div className="mb-8">
                            <span className="text-4xl">🎓</span>
                            <h2 className="text-blue-900 text-5xl font-black uppercase tracking-widest mt-4">Certificate of Completion</h2>
                            <div className="w-48 h-1 bg-yellow-500 mx-auto mt-4"></div>
                        </div>

                        <p className="text-gray-500 text-xl font-medium mb-6 italic">This is to certify that</p>

                        <h3 className="text-gray-900 text-6xl font-serif font-black mb-8 border-b-2 border-gray-100 pb-4 px-12 inline-block">
                            {user.firstName} {user.lastName}
                        </h3>

                        <p className="text-gray-500 text-xl font-medium mb-6">has successfully completed the course</p>

                        <h4 className="text-blue-800 text-3xl font-black mb-12">
                            {course.title}
                        </h4>

                        <div className="grid grid-cols-2 w-full max-w-3xl mt-12">
                            <div className="flex flex-col items-center">
                                <div className="w-48 border-b border-gray-400 mb-2"></div>
                                <p className="text-gray-900 font-bold">{course.instructor.firstName} {course.instructor.lastName}</p>
                                <p className="text-gray-500 text-sm">Course Instructor</p>
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="w-48 border-b border-gray-400 mb-2"></div>
                                <p className="text-gray-900 font-bold">{new Date(issuedAt).toLocaleDateString()}</p>
                                <p className="text-gray-500 text-sm">Issue Date</p>
                            </div>
                        </div>

                        {/* Seal/Badge */}
                        <div className="absolute bottom-20 right-20 w-32 h-32">
                            <div className="w-full h-full bg-yellow-400 rounded-full flex items-center justify-center border-8 border-yellow-200 shadow-xl transform rotate-12">
                                <div className="text-yellow-900 font-black text-center text-xs leading-tight">
                                    OFFICIAL<br />SEAL<br />CERTIFIED
                                </div>
                            </div>
                        </div>

                        <div className="absolute bottom-10 left-0 right-0 text-center">
                            <p className="text-[10px] text-gray-400 font-mono">
                                Certificate Number: {certificateNumber} | Issued by Antigravity LMS
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CertificateView;
