import { useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';

export default function BarcodeScanner({ onScan, onClose }) {
    const scannerRef = useRef(null);

    useEffect(() => {
        const scanner = new Html5Qrcode('barcode-reader');

        scannerRef.current = scanner;

        scanner
            .start(
                { facingMode: 'environment' },
                {
                    fps: 60,
                    qrbox: {
                        width: 300,
                        height: 150,
                    },
                },
                async (decodedText) => {
                    // Stop immediately after successful scan
                    await scanner.stop();

                    onScan(decodedText);
                },
                () => {
                    // Ignore scanning failures
                }
            )
            .catch((error) => {
                console.error('Unable to start scanner:', error);
            });

        return () => {
            if (scannerRef.current?.isScanning) {
                scannerRef.current
                    .stop()
                    .catch(() => { });
            }
        };
    }, [onScan]);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">
                        Scan Book Barcode
                    </h2>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg px-3 py-2 text-gray-500 hover:bg-gray-100"
                    >
                        ✕
                    </button>
                </div>

                <div
                    id="barcode-reader"
                    className="overflow-hidden h-90 rounded-xl"
                />

                <p className="mt-4 text-center text-sm text-gray-500">
                    Position the book's ISBN barcode inside the scanner.
                </p>
            </div>
        </div>
    );
}