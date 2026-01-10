
import React, { useState, useCallback, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Link, useNavigate } from 'react-router-dom';
import { FileUploader } from '../components/FileUploader';
import { Button } from '../components/Button';
import { uploadFile } from '../services/fileService';
import { getFileInsights } from '../services/geminiService';
import { ShareResult, FileInsights } from '../types';

export const Home: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [shareResult, setShareResult] = useState<ShareResult | null>(null);
    const [insights, setInsights] = useState<FileInsights | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const isLoggedIn = !!localStorage.getItem('token');

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const handleFileSelect = useCallback(async (selectedFile: File) => {
        if (!navigator.onLine) {
            setError("Internet connection is required to upload files. Please reconnect and try again.");
            return;
        }

        setFile(selectedFile);
        setIsUploading(true);
        setError(null);
        setShareResult(null);
        setInsights(null);

        try {
            // Parallelize: get Gemini insights while uploading to file storage
            const [uploadResponse, geminiResponse] = await Promise.all([
                uploadFile(selectedFile),
                getFileInsights(selectedFile.name, selectedFile.type, selectedFile.size)
            ]);

            setShareResult(uploadResponse);
            setInsights(geminiResponse);
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred during upload.');
            console.error(err);
        } finally {
            setIsUploading(false);
        }
    }, []);

    const reset = () => {
        setFile(null);
        setShareResult(null);
        setInsights(null);
        setError(null);
    };

    const copyToClipboard = () => {
        if (shareResult?.url) {
            navigator.clipboard.writeText(shareResult.url);
            alert('Link copied to clipboard!');
        }
    };

    const downloadQR = () => {
        const svg = document.querySelector('#qr-code-svg');
        if (!svg) return;

        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx?.drawImage(img, 0, 0);
            const pngFile = canvas.toDataURL('image/png');
            const downloadLink = document.createElement('a');
            downloadLink.download = `QR-Drop-${file?.name || 'file'}.png`;
            downloadLink.href = pngFile;
            downloadLink.click();
        };

        img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    };

    return (
        <div className="min-h-screen flex flex-col items-center bg-slate-50 selection:bg-indigo-100">
            {/* Offline Banner */}
            {!isOnline && (
                <div className="w-full bg-amber-500 text-white py-2 px-4 text-center text-sm font-bold animate-pulse sticky top-0 z-50 flex items-center justify-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m19 19-4-4" /><path d="m5 5 4 4" /><path d="M12 7v5" /><path d="M12 16v.01" /><path d="M17 12h.01" /><path d="M7 12h.01" /><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12s4.48 10 10 10 10-4.48 10-10z" /><path d="m15 9-6 6" /></svg>
                    You are currently offline. Some features may be unavailable.
                </div>
            )}

            {/* Header */}
            <header className="w-full max-w-7xl px-6 py-8 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="bg-indigo-600 p-2 rounded-xl shadow-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <rect width="5" height="5" x="3" y="3" rx="1" /><rect width="5" height="5" x="16" y="3" rx="1" /><rect width="5" height="5" x="3" y="16" rx="1" /><path d="M21 16h-3a2 2 0 0 0-2 2v3" /><path d="M21 21v.01" /><path d="M12 7v3a2 2 0 0 1-2 2H7" /><path d="M3 12h.01" /><path d="M12 3h.01" /><path d="M12 16v.01" /><path d="M16 12h1" /><path d="M21 12v.01" /><path d="M12 21v-1" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase">QR-Drop</h1>
                </div>
                <div className="flex items-center gap-4">
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${isOnline ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                        <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                        {isOnline ? 'ONLINE' : 'OFFLINE'}
                    </div>
                    {isLoggedIn ? (
                        <div className="flex gap-2">
                            <Link to="/dashboard">
                                <Button variant="outline" className="text-sm">My Dashboard</Button>
                            </Link>
                            <Button variant="outline" onClick={handleLogout} className="text-sm">Logout</Button>
                        </div>
                    ) : (
                        <Link to="/login">
                            <Button variant="primary" className="text-sm">Login</Button>
                        </Link>
                    )}
                </div>
            </header>

            <main className="flex-1 w-full max-w-4xl px-6 py-12 flex flex-col items-center justify-center">
                {!shareResult && !isUploading ? (
                    <section className="w-full text-center space-y-8">
                        <div className="space-y-4">
                            <h2 className="text-4xl md:text-6xl font-black text-slate-900 leading-tight">
                                Share files <span className="text-indigo-600">instantly</span> via QR code.
                            </h2>
                            <p className="text-xl text-slate-500 max-w-2xl mx-auto">
                                No accounts. No signups. Just drop a file and get a secure, ephemeral QR code for anyone to scan and download.
                            </p>
                        </div>

                        <div className={!isOnline ? 'opacity-75 cursor-not-allowed grayscale' : ''}>
                            {isLoggedIn ? (
                                <>
                                    <FileUploader
                                        onFileSelect={handleFileSelect}
                                        isLoading={isUploading || !isOnline}
                                    />
                                    {!isOnline && (
                                        <p className="mt-4 text-rose-500 font-semibold flex items-center justify-center gap-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v10" /><path d="M18.42 15.61a8 8 0 1 1-12.84 0" /></svg>
                                            Connect to the internet to upload files.
                                        </p>
                                    )}
                                </>
                            ) : (
                                <div className="max-w-md mx-auto p-8 bg-white/50 backdrop-blur rounded-2xl border-2 border-dashed border-indigo-200 flex flex-col items-center gap-4">
                                    <div className="p-4 bg-indigo-50 rounded-full text-indigo-600">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-800">Login to Share Files</h3>
                                    <p className="text-slate-500 text-sm max-w-xs">
                                        You must be logged in to generate secure QR codes for your files.
                                    </p>
                                    <Link to="/login" className="w-full">
                                        <Button className="w-full">Login to Upload</Button>
                                    </Link>
                                    <p className="text-xs text-slate-400">
                                        Don't have an account? <Link to="/signup" className="text-indigo-600 hover:underline font-bold">Sign up</Link>
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center justify-center gap-8 py-8 border-t border-slate-200">
                            <div className="flex items-center gap-2 text-slate-500">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                                <span className="text-sm font-medium">End-to-end ephemeral</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-500">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                                <span className="text-sm font-medium">Auto-expires in 24h</span>
                            </div>
                        </div>
                    </section>
                ) : (
                    <section className="w-full grid md:grid-cols-2 gap-12 bg-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl shadow-slate-200 border border-slate-100">
                        {/* Left Column: QR and Actions */}
                        <div className="flex flex-col items-center gap-8">
                            <div className="relative bg-white p-8 rounded-[2rem] shadow-inner border-2 border-slate-50">
                                {isUploading ? (
                                    <div className="w-[200px] h-[200px] flex flex-col items-center justify-center gap-4">
                                        <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                                        <p className="text-slate-400 font-medium animate-pulse">Generating...</p>
                                    </div>
                                ) : (
                                    <QRCodeSVG
                                        id="qr-code-svg"
                                        value={shareResult?.url || ''}
                                        size={200}
                                        level="H"
                                        includeMargin={false}
                                        imageSettings={{
                                            src: "https://api.dicebear.com/7.x/shapes/svg?seed=qr-drop",
                                            x: undefined,
                                            y: undefined,
                                            height: 40,
                                            width: 40,
                                            excavate: true,
                                        }}
                                    />
                                )}
                            </div>

                            <div className="w-full space-y-3">
                                <Button onClick={downloadQR} className="w-full" disabled={isUploading}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>
                                    Save QR Code
                                </Button>
                                <Button variant="outline" onClick={copyToClipboard} className="w-full" disabled={isUploading}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg>
                                    Copy URL
                                </Button>
                                <Button variant="outline" onClick={reset} className="w-full border-dashed border-slate-300">
                                    Upload another
                                </Button>
                            </div>
                        </div>

                        {/* Right Column: File Info and Insights */}
                        <div className="flex flex-col justify-center gap-6">
                            {error ? (
                                <div className="p-6 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600">
                                    <h4 className="font-bold flex items-center gap-2 mb-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                                        Error Occurred
                                    </h4>
                                    <p className="text-sm">{error}</p>
                                    <Button variant="danger" className="mt-4 w-full" onClick={reset}>Try Again</Button>
                                </div>
                            ) : (
                                <>
                                    <div className="space-y-1">
                                        <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-black rounded-full uppercase tracking-wider">
                                            {insights?.category || 'Ready to share'}
                                        </span>
                                        <h3 className="text-3xl font-black text-slate-900 leading-tight">
                                            {insights?.title || file?.name}
                                        </h3>
                                    </div>

                                    <p className="text-slate-500 text-lg italic">
                                        "{insights?.description || 'Your file is ready for one-time secure sharing.'}"
                                    </p>

                                    <div className="p-6 bg-slate-50 rounded-2xl space-y-4">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-400 font-medium">Original Name</span>
                                            <span className="text-slate-900 font-bold truncate max-w-[150px]">{file?.name}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-400 font-medium">Size</span>
                                            <span className="text-slate-900 font-bold">{(file?.size || 0) > 1024 * 1024 ? `${((file?.size || 0) / (1024 * 1024)).toFixed(2)} MB` : `${((file?.size || 0) / 1024).toFixed(2)} KB`}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-slate-400 font-medium">Status</span>
                                            <span className={`flex items-center gap-1.5 font-bold ${isOnline ? 'text-emerald-600' : 'text-slate-400'}`}>
                                                <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`}></span>
                                                {isOnline ? 'Live' : 'Cached (Offline)'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="text-xs text-slate-400 text-center flex items-center justify-center gap-1">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" /></svg>
                                        File storage is ephemeral and auto-deletes in 24 hours.
                                    </div>
                                </>
                            )}
                        </div>
                    </section>
                )}
            </main>

            <footer className="w-full border-t border-slate-200 py-8 px-6 bg-white">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-slate-400 text-sm font-medium">
                    <p>© 2024 QR-Drop. Built for privacy and speed.</p>
                    <div className="flex gap-6">
                        <a href="#" className="hover:text-indigo-600 transition-colors">Documentation</a>
                        <a href="#" className="hover:text-indigo-600 transition-colors">Privacy</a>
                        <a href="#" className="hover:text-indigo-600 transition-colors">Contact</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};
