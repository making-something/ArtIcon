"use client";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Html5Qrcode } from "html5-qrcode";
import { scanParticipantQRCode } from "@/services/api";
import "./scanner.css";

const AdminScanner = () => {
	const [scanHistory, setScanHistory] = useState([]);
	const [lastResult, setLastResult] = useState(null); // { type: 'success'|'error', message: '', participant: ... }
	const [scanMode, setScanMode] = useState("file"); // 'camera' or 'file'

	// Refs for state that shouldn't trigger re-renders or needs immediate access in callbacks
	const isProcessingRef = useRef(false);
	const lastScannedCodeRef = useRef(null);
	const html5QrCodeRef = useRef(null);
	const fileInputRef = useRef(null);

	const router = useRouter();

	useEffect(() => {
		// Check admin auth
		const token = localStorage.getItem("adminToken");
		if (!token) {
			router.push("/admin/portfolios");
			return;
		}

		// Initialize Html5Qrcode instance for file scanning
		if (!html5QrCodeRef.current) {
			try {
				html5QrCodeRef.current = new Html5Qrcode("reader");
			} catch (e) {
				console.error("QR Code initialization error:", e);
			}
		}

		// Cleanup function
		return () => {
			if (html5QrCodeRef.current) {
				try {
					html5QrCodeRef.current.clear().catch((err) => {
						console.warn("Failed to clear QR scanner", err);
					});
				} catch (e) {
					// ignore
				}
			}
		};
	}, [router]);

	const onScanSuccess = async (decodedText, decodedResult) => {
		// Check locks
		if (isProcessingRef.current) return;
		if (lastScannedCodeRef.current === decodedText) return;

		// Set lock
		isProcessingRef.current = true;
		setLastResult({ type: "processing", message: "Verifying..." });

		// Process the QR code
		await processQRCode(decodedText);
	};

	const onScanFailure = (error) => {
		// Quiet failure for frame-by-frame errors
	};

	// Handle file upload for QR scanning
	const handleFileUpload = async (event) => {
		const file = event.target.files?.[0];
		if (!file) return;

		// Check locks
		if (isProcessingRef.current) {
			setLastResult({
				type: "error",
				message: "Please wait, processing previous scan...",
			});
			return;
		}

		isProcessingRef.current = true;
		setLastResult({ type: "processing", message: "Scanning QR code..." });

		try {
			if (!html5QrCodeRef.current) {
				throw new Error("Scanner not initialized");
			}

			// Scan the uploaded file
			const decodedText = await html5QrCodeRef.current.scanFile(file, false);

			// Process the scanned QR code
			await processQRCode(decodedText);
		} catch (error) {
			console.error("File scan error:", error);
			setLastResult({
				type: "error",
				message: error.message || "Failed to scan QR code from image",
			});

			setTimeout(() => {
				isProcessingRef.current = false;
				setLastResult(null);
			}, 2500);
		}

		// Reset file input
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	// Process QR code data (shared between camera and file upload)
	const processQRCode = async (decodedText) => {
		// Check if already processed
		if (lastScannedCodeRef.current === decodedText) {
			setLastResult({
				type: "error",
				message: "This QR code was just scanned",
			});
			setTimeout(() => {
				isProcessingRef.current = false;
				setLastResult(null);
			}, 2500);
			return;
		}

		lastScannedCodeRef.current = decodedText;

		try {
			// Parse QR code data
			let participantData;
			try {
				participantData = JSON.parse(decodedText);
			} catch (e) {
				// If not JSON, assume it's just the participant ID
				participantData = { id: decodedText };
			}

			const participantId = participantData.id;
			if (!participantId) {
				throw new Error("Invalid QR code: No participant ID found");
			}

			// Call API to mark attendance
			const response = await scanParticipantQRCode(participantId);

			if (response.success) {
				// Success Logic
				const newScan = {
					id: Date.now(),
					participantName: response.data.name,
					participantId: response.data.id,
					category: response.data.category,
					timestamp: new Date().toLocaleTimeString(),
					status: "success",
				};

				setScanHistory((prev) => [newScan, ...prev].slice(0, 20));
				setLastResult({
					type: "success",
					message: `Marked Present: ${response.data.name}`,
					participant: response.data,
				});
			} else {
				throw new Error(response.message || "Failed to mark attendance");
			}
		} catch (err) {
			console.error("QR processing error:", err);
			setLastResult({
				type: "error",
				message: err.message || "Invalid QR Code or Server Error",
			});
		} finally {
			// Release locks
			setTimeout(() => {
				isProcessingRef.current = false;
				setLastResult(null);
			}, 2500);

			// Allow re-scanning same code after 5 seconds
			setTimeout(() => {
				lastScannedCodeRef.current = null;
			}, 5000);
		}
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
					<div id="reader" className="scanner-viewport">
						{/* File Upload UI */}
						<div className="file-upload-container">
							<input
								type="file"
								ref={fileInputRef}
								onChange={handleFileUpload}
								accept="image/*"
								style={{ display: "none" }}
							/>
							<button
								onClick={() => fileInputRef.current?.click()}
								className="upload-button"
								disabled={isProcessingRef.current}
							>
								<svg
									width="48"
									height="48"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
								>
									<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
									<polyline points="17 8 12 3 7 8" />
									<line x1="12" y1="3" x2="12" y2="15" />
								</svg>
								<span>Upload QR Code Image</span>
							</button>
							<p className="upload-hint">
								Click to select a QR code image from your device
							</p>
						</div>
					</div>

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
					<p>Upload a QR code image to mark participant attendance.</p>
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
