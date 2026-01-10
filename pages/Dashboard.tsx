
import React, { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { getUserFiles } from '../services/fileService';
import { UserFile } from '../types';
import { Button } from '../components/Button';
import { Link } from 'react-router-dom';

export const Dashboard: React.FC = () => {
    const [files, setFiles] = useState<UserFile[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedFile, setSelectedFile] = useState<UserFile | null>(null);

    useEffect(() => {
        const fetchFiles = async () => {
            try {
                const data = await getUserFiles();
                setFiles(data || []);
            } catch (err) {
                console.error("Failed to load files", err);
            } finally {
                setLoading(false);
            }
        };
        fetchFiles();
    }, []);

    const openQR = (file: UserFile) => {
        setSelectedFile(file);
    };

    const closeQR = () => {
        setSelectedFile(null);
    };

    const downloadQR = () => {
        const svg = document.querySelector('#dashboard-qr-svg');
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
            downloadLink.download = `QR-${selectedFile?.file_name}.png`;
            downloadLink.href = pngFile;
            downloadLink.click();
        };

        img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6 flex flex-col items-center">
            <header className="w-full max-w-7xl flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                    <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                        <div className="bg-indigo-600 p-2 rounded-xl shadow-lg">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><rect width="5" height="5" x="3" y="3" rx="1" /><rect width="5" height="5" x="16" y="3" rx="1" /><rect width="5" height="5" x="3" y="16" rx="1" /><path d="M21 16h-3a2 2 0 0 0-2 2v3" /><path d="M21 21v.01" /><path d="M12 7v3a2 2 0 0 1-2 2H7" /><path d="M3 12h.01" /><path d="M12 3h.01" /><path d="M12 16v.01" /><path d="M16 12h1" /><path d="M21 12v.01" /><path d="M12 21v-1" /></svg>
                        </div>
                        <h1 className="text-2xl font-black text-slate-900 uppercase">QR-Drop</h1>
                    </Link>
                </div>
                <Link to="/">
                    <Button variant="outline">Back to Upload</Button>
                </Link>
            </header>

            <main className="w-full max-w-4xl bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8">
                <h2 className="text-3xl font-black text-slate-900 mb-6">My Dashboard</h2>

                {loading ? (
                    <div className="text-center py-12 text-slate-400 animate-pulse">Loading files...</div>
                ) : files.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                        <p className="mb-4">No files uploaded yet.</p>
                        <Link to="/">
                            <Button>Upload your first file</Button>
                        </Link>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-slate-400 text-sm border-b border-slate-100">
                                    <th className="py-3 font-semibold">File Name</th>
                                    <th className="py-3 font-semibold">Size</th>
                                    <th className="py-3 font-semibold">Type</th>
                                    <th className="py-3 font-semibold">Date</th>
                                    <th className="py-3 font-semibold text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {files.map((file) => (
                                    <tr key={file.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                                        <td className="py-4 pr-4 font-bold text-slate-700">
                                            <a href={file.public_url} target="_blank" rel="noreferrer" className="hover:text-indigo-600">{file.file_name}</a>
                                        </td>
                                        <td className="py-4 text-slate-500 text-sm">{(file.file_size / 1024).toFixed(2)} KB</td>
                                        <td className="py-4 text-slate-500 text-sm uppercase text-xs">{file.file_type.split('/')[1] || 'FILE'}</td>
                                        <td className="py-4 text-slate-500 text-sm">{new Date(file.created_at).toLocaleDateString()}</td>
                                        <td className="py-4 text-right">
                                            <Button size="sm" onClick={() => openQR(file)}>Get QR</Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>

            {/* QR Code Modal */}
            {selectedFile && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={closeQR}>
                    <div className="bg-white p-8 rounded-[2rem] shadow-2xl max-w-sm w-full animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-start mb-6">
                            <h3 className="font-bold text-slate-900 text-lg pr-4 truncate">{selectedFile.file_name}</h3>
                            <button onClick={closeQR} className="text-slate-400 hover:text-rose-500">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="m15 9-6 6" /><path d="m9 9 6 6" /></svg>
                            </button>
                        </div>

                        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-inner flex justify-center mb-6">
                            <QRCodeSVG
                                id="dashboard-qr-svg"
                                value={selectedFile.public_url}
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
                        </div>

                        <div className="space-y-3">
                            <Button onClick={downloadQR} className="w-full">
                                Download QR
                            </Button>
                            <a href={selectedFile.public_url} target="_blank" rel="noreferrer" className="block w-full">
                                <Button variant="outline" className="w-full">Open File</Button>
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
