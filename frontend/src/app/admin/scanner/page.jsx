"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Html5QrcodeScanner } from "html5-qrcode";
import { scanParticipantQRCode } from "@/services/api";
import "./scanner.css";

const AdminScanner = () => {
	const [scanHistory, setScanHistory] = useState([]);
	const [lastResult, setLastResult] = useState(null); // { type: 'success'|'error', message: '', participant: ... }
	const [isScannerReady, setIsScannerReady] = useState(false);

	// Refs for state that shouldn't trigger re-renders or needs immediate access in callbacks
	const isProcessingRef = useRef(false);
	const lastScannedCodeRef = useRef(null);
	const scannerRef = useRef(null);

	const router = useRouter();

	useEffect(() => {
		// Check admin auth
		const token = localStorage.getItem("adminToken");
		if (!token) {
			router.push("/admin/portfolios");
			return;
		}

		// Initialize scanner
		if (!scannerRef.current) {
			const timer = setTimeout(() => {
				const element = document.getElementById("reader");
				if (element) {
					// Check if scanner instance already exists in DOM (html5-qrcode quirk)
					try {
						const scanner = new Html5QrcodeScanner(
							"reader",
							{
								fps: 10,
								qrbox: { width: 250, height: 250 },
								aspectRatio: 1.0,
								showTorchButtonIfSupported: true,
								rememberLastUsedCamera: true,
							},
							false
						);

						scanner.render(onScanSuccess, onScanFailure);
						scannerRef.current = scanner;
						setIsScannerReady(true);
					} catch (e) {
						console.error("Scanner initialization error:", e);
					}
				}
			}, 500);
			return () => clearTimeout(timer);
		}

		// Cleanup function
		return () => {
			if (scannerRef.current) {
				try {
					scannerRef.current.clear().catch((err) => {
						console.warn("Failed to clear scanner", err);
					});
				} catch (e) {
					// ignore
				}
				scannerRef.current = null;
			}
		};
	}, []);

	const onScanSuccess = async (decodedText, decodedResult) => {
		// 1. Check locks
		if (isProcessingRef.current) return;
		if (lastScannedCodeRef.current === decodedText) return;

		// 2. Set locks
		isProcessingRef.current = true;
		lastScannedCodeRef.current = decodedText;

		// 3. UI Feedback - Processing
		setLastResult({ type: "processing", message: "Verifying..." });

		try {
			const response = await scanParticipantQRCode(decodedText);

			if (response.success) {
				// Success Logic
				const newScan = {
					id: Date.now(),
					participantName: response.data.name,
					participantId: response.data.id,
					category: response.data.category, // Assuming this comes back
					timestamp: new Date().toLocaleTimeString(),
					status: "success",
				};

				setScanHistory((prev) => [newScan, ...prev].slice(0, 20)); // Keep last 20
				setLastResult({
					type: "success",
					message: `Marked Present: ${response.data.name}`,
					participant: response.data,
				});
			} else {
				throw new Error(response.message || "Failed to mark attendance");
			}
		} catch (err) {
			// Error Logic
			console.error("Scan error:", err);
			setLastResult({
				type: "error",
				message: err.message || "Invalid Code or Server Error",
			});
		} finally {
			// 4. Release locks
			// Allow next scan processing after 2.5 seconds
			setTimeout(() => {
				isProcessingRef.current = false;
				setLastResult(null); // Clear the big banner result to show "Ready"
			}, 2500);

			// Allow RE-SCANNING the SAME code after 5 seconds (in case of accidental double scan prevention)
			setTimeout(() => {
				lastScannedCodeRef.current = null;
			}, 5000);
		}
	};

	const onScanFailure = (error) => {
		// Quiet failure for frame-by-frame errors
	};

	return (
		<div className="scanner-page-layout">
			<div className="scanner-main-column">
				<div className="scanner-header-compact">
					<h1>QR Scanner</h1>
					<button
						onClick={() => router.push("/admin/portfolios")}
						className="back-link"
					>
						Back to Dashboard
					</button>
				</div>

				<div className="scanner-viewport-wrapper">
					<div id="reader" className="scanner-viewport"></div>
					{!isScannerReady && <div className="loading-text">Initializing Camera...</div>}
					
					{/* Status Overlay */}
					{lastResult && (
						<div className={`scanner-overlay ${lastResult.type}`}>
							<div className="overlay-content">
								{lastResult.type === "processing" && (
									<div className="spinner"></div>
								)}
								{lastResult.type === "success" && (
									<span className="icon">✅</span>
								)}
								{lastResult.type === "error" && (
									<span className="icon">❌</span>
								)}
								<p className="message">{lastResult.message}</p>
							</div>
						</div>
					)}
				</div>

                <div className="scanner-instructions">
                    <p>Camera is active. Point at a QR code to scan automatically.</p>
                </div>
			</div>

			<div className="scanner-sidebar">
				<h2>Recent Scans</h2>
				<div className="scan-history-list">
					{scanHistory.length === 0 ? (
						<p className="empty-history">No scans yet this session.</p>
					) : (
						scanHistory.map((scan) => (
							<div key={scan.id} className="history-item success">
								<div className="history-time">{scan.timestamp}</div>
								<div className="history-details">
									<span className="history-name">{scan.participantName}</span>
									{/* <span className="history-id">{scan.participantId}</span> */}
								</div>
                                <div className="history-status">Present</div>
							</div>
						))
					)}
				</div>
			</div>
		</div>
	);
};

export default AdminScanner;