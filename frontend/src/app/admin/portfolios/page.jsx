"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
	approveParticipant,
	rejectParticipant,
	exportParticipantsCSV,
	logout,
	getAdminDashboardStats,
} from "@/services/api";
import "./portfolios.css";

export default function AdminPortfolios() {
	const router = useRouter();
	const [participants, setParticipants] = useState([]);
	const [stats, setStats] = useState(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [filters, setFilters] = useState({
		category: "",
		approval_status: "all",
		search: "",
	});
	const [selectedParticipant, setSelectedParticipant] = useState(null);

	const API_URL =
		process.env.NEXT_PUBLIC_API_URL || "https://api.articon.multiicon.in";

	useEffect(() => {
		fetchParticipants();
		fetchStats();
	}, [filters]);

	const fetchStats = async () => {
		try {
			const response = await getAdminDashboardStats();
			if (response.success) {
				setStats(response.data);
			}
		} catch (error) {
			console.error("Failed to fetch stats", error);
		}
	};

	const fetchParticipants = async () => {
		try {
			setLoading(true);
			const token = localStorage.getItem("adminToken");

			if (!token) {
				router.push("/registration"); // Redirect to unified login
				return;
			}

			const queryParams = new URLSearchParams({
				category: filters.category,
				approval_status: filters.approval_status,
				...(filters.search && { search: filters.search }),
			});

			const response = await fetch(
				`${API_URL}/api/admin/participants/portfolios?${queryParams}`,
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);

			if (response.status === 401 || response.status === 403) {
				logout();
				router.push("/registration");
				return;
			}

			if (!response.ok) {
				throw new Error("Failed to fetch participants");
			}

			const data = await response.json();
			setParticipants(data.data);
			setError(null);
		} catch (err) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	const handleCategoryChange = (category) => {
		setFilters({ ...filters, category });
	};

	const handleSearchChange = (e) => {
		const search = e.target.value;
		setFilters({ ...filters, search });
	};

	const handleApprovalStatusChange = (approval_status) => {
		setFilters({ ...filters, approval_status });
	};

	const handleApprove = async (participantId, adminNotes = "") => {
		if (!confirm("Are you sure you want to approve this participant?")) return;
		try {
			setLoading(true);
			const result = await approveParticipant(participantId, adminNotes);

			if (result.success) {
				await fetchParticipants();
				fetchStats(); // Refresh stats
			} else {
				alert("Failed to approve participant");
			}
		} catch (error) {
			console.error("Error approving participant:", error);
			alert("Error approving participant");
		} finally {
			setLoading(false);
		}
	};

	const handleReject = async (participantId, adminNotes = "") => {
		const notes =
			adminNotes || prompt("Please enter rejection reason (optional):");
		if (notes === null) return;

		try {
			setLoading(true);
			const result = await rejectParticipant(participantId, notes);

			if (result.success) {
				await fetchParticipants();
				fetchStats(); // Refresh stats
			} else {
				alert("Failed to reject participant");
			}
		} catch (error) {
			console.error("Error rejecting participant:", error);
			alert("Error rejecting participant");
		} finally {
			setLoading(false);
		}
	};

	const handleExportCSV = async () => {
		try {
			await exportParticipantsCSV(filters.category, filters.approval_status);
		} catch (error) {
			console.error("Error exporting CSV:", error);
			alert("Error exporting CSV");
		}
	};

	const handleLogout = () => {
		logout();
		router.push("/registration");
	};

	const getCategoryLabel = (category) => {
		const labels = {
			video: "Video Editing",
			ui_ux: "UI/UX Design",
			graphics: "Graphic Design",
			all: "All",
		};
		return labels[category] || category;
	};

	const getPortfolioLink = (participant) => {
		if (participant.portfolio_file_path) {
			return `${API_URL}${participant.portfolio_file_path}`;
		}
		if (participant.portfolio_url) {
			if (participant.portfolio_url.startsWith("http")) {
				return participant.portfolio_url;
			} else {
				return `https://${participant.portfolio_url}`;
			}
		}
		return null;
	};

	return (
		<div className="admin-page">
			<header className="admin-header">
				<div className="page-title">
					Admin <span className="cursive-accent">Dashboard</span>
				</div>
				<div className="header-actions">
					<button
						className="scanner-btn"
						onClick={() => router.push("/admin/scanner")}
					>
						QR Scanner
					</button>
					<button
						className="scanner-btn"
						onClick={() => router.push("/admin/updates")}
					>
						Send Updates
					</button>
					<button className="logout-btn" onClick={handleLogout}>
						Logout
					</button>
				</div>
			</header>

			{/* Stats Section */}
			{stats && (
				<div className="stats-dashboard">
					<div className="stat-card">
						<h3>Total</h3>
						<div className="value">{stats.totalParticipants}</div>
					</div>
					<div className="stat-card">
						<h3>Present</h3>
						<div className="value">{stats.presentParticipants}</div>
					</div>
					<div className="stat-card">
						<h3>Submitted</h3>
						<div className="value">{stats.totalSubmissions}</div>
					</div>
				</div>
			)}

			<div className="admin-controls">
				<div className="filters-row">
					<div className="filter-group">
						<button
							className={`filter-btn ${
								filters.category === "" ? "active" : ""
							}`}
							onClick={() => handleCategoryChange("")}
						>
							View All
						</button>
						<button
							className={`filter-btn ${
								filters.category === "video" ? "active" : ""
							}`}
							onClick={() => handleCategoryChange("video")}
						>
							Video
						</button>
						<button
							className={`filter-btn ${
								filters.category === "ui_ux" ? "active" : ""
							}`}
							onClick={() => handleCategoryChange("ui_ux")}
						>
							UI/UX
						</button>
						<button
							className={`filter-btn ${
								filters.category === "graphics" ? "active" : ""
							}`}
							onClick={() => handleCategoryChange("graphics")}
						>
							Graphics
						</button>
						<button
							className={`filter-btn ${
								filters.category === "all" ? "active" : ""
							}`}
							onClick={() => handleCategoryChange("all")}
						>
							All Cat
						</button>
					</div>

					<div className="filter-group">
						<button
							className={`filter-btn ${
								filters.approval_status === "all" ? "active" : ""
							}`}
							onClick={() => handleApprovalStatusChange("all")}
						>
							Any Status
						</button>
						<button
							className={`filter-btn ${
								filters.approval_status === "pending" ? "active" : ""
							}`}
							onClick={() => handleApprovalStatusChange("pending")}
						>
							Pending
						</button>
						<button
							className={`filter-btn ${
								filters.approval_status === "approved" ? "active" : ""
							}`}
							onClick={() => handleApprovalStatusChange("approved")}
						>
							Approved
						</button>
						<button
							className={`filter-btn ${
								filters.approval_status === "rejected" ? "active" : ""
							}`}
							onClick={() => handleApprovalStatusChange("rejected")}
						>
							Rejected
						</button>
					</div>
				</div>

				<div className="action-bar">
					<div className="search-box">
						<input
							type="text"
							placeholder="SEARCH PARTICIPANTS..."
							value={filters.search}
							onChange={handleSearchChange}
						/>
					</div>
					<button className="export-btn" onClick={handleExportCSV}>
						Export CSV
					</button>
				</div>
				<div className="results-count">
					Showing {participants.length} participants
				</div>
			</div>

			<div className="table-container">
				{loading && participants.length === 0 ? (
					<div className="loading-state">Loading Data...</div>
				) : error ? (
					<div className="empty-state">Error: {error}</div>
				) : participants.length === 0 ? (
					<div className="empty-state">No participants found.</div>
				) : (
					<table className="admin-table">
						<thead>
							<tr>
								<th>Name</th>
								<th>Category</th>
								<th>City</th>
								<th>Present</th>
								<th>Status</th>
								<th>Portfolio</th>
								<th>Actions</th>
							</tr>
						</thead>
						<tbody>
							{participants.map((participant) => (
								<tr
									key={participant.id}
									onClick={() => setSelectedParticipant(participant)}
									className="clickable-row"
								>
									<td>
										<div style={{ fontWeight: "bold" }}>{participant.name}</div>
										<div
											style={{
												fontSize: "0.85rem",
												color: "var(--base-300)",
											}}
										>
											{participant.email}
										</div>
									</td>
									<td>{getCategoryLabel(participant.category)}</td>
									<td>{participant.city}</td>
									<td>
										<span
											className={`badge ${
												participant.is_present ? "present" : "absent"
											}`}
										>
											{participant.is_present ? "Yes" : "No"}
										</span>
									</td>
									<td>
										<span className={`badge ${participant.approval_status}`}>
											{participant.approval_status}
										</span>
									</td>
									<td>
										<a
											href={getPortfolioLink(participant)}
											target="_blank"
											rel="noopener noreferrer"
											className="btn-view action-btn"
											onClick={(e) => e.stopPropagation()}
										>
											View
										</a>
									</td>
									<td onClick={(e) => e.stopPropagation()}>
										{participant.approval_status === "pending" && (
											<>
												<button
													className="action-btn btn-approve"
													onClick={() => handleApprove(participant.id)}
												>
													✓
												</button>
												<button
													className="action-btn btn-reject"
													onClick={() => handleReject(participant.id)}
												>
													✗
												</button>
											</>
										)}
										{participant.approval_status !== "pending" && (
											<span
												style={{
													color: "var(--base-300)",
													fontSize: "0.9rem",
												}}
											>
												—
											</span>
										)}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				)}
			</div>

			{/* Participant Details Popup */}
			{selectedParticipant && (
				<div
					className="popup-overlay"
					onClick={() => setSelectedParticipant(null)}
				>
					<div className="popup-container" onClick={(e) => e.stopPropagation()}>
						<button
							className="popup-close"
							onClick={() => setSelectedParticipant(null)}
						>
							×
						</button>
						<h2 className="popup-title">Participant Details</h2>
						<div className="popup-content">
							<div className="detail-row">
								<span className="detail-label">Name</span>
								<span className="detail-value">{selectedParticipant.name}</span>
							</div>
							<div className="detail-row">
								<span className="detail-label">Email</span>
								<span className="detail-value">
									{selectedParticipant.email}
								</span>
							</div>
							<div className="detail-row">
								<span className="detail-label">WhatsApp</span>
								<span className="detail-value">
									{selectedParticipant.whatsapp_no || "—"}
								</span>
							</div>
							<div className="detail-row">
								<span className="detail-label">City</span>
								<span className="detail-value">{selectedParticipant.city}</span>
							</div>
							<div className="detail-row">
								<span className="detail-label">Category</span>
								<span className="detail-value">
									{getCategoryLabel(selectedParticipant.category)}
								</span>
							</div>
							<div className="detail-row">
								<span className="detail-label">Role</span>
								<span className="detail-value">
									{selectedParticipant.role || "—"}
								</span>
							</div>
							<div className="detail-row">
								<span className="detail-label">Experience</span>
								<span className="detail-value">
									{selectedParticipant.experience || "—"}
								</span>
							</div>
							<div className="detail-row">
								<span className="detail-label">Organization</span>
								<span className="detail-value">
									{selectedParticipant.organization || "—"}
								</span>
							</div>
							<div className="detail-row">
								<span className="detail-label">Specialization</span>
								<span className="detail-value">
									{selectedParticipant.specialization || "—"}
								</span>
							</div>
							<div className="detail-row">
								<span className="detail-label">Source</span>
								<span className="detail-value">
									{selectedParticipant.source || "—"}
								</span>
							</div>
							<div className="detail-row">
								<span className="detail-label">Portfolio URL</span>
								<span className="detail-value">
									{selectedParticipant.portfolio_url ? (
										<a
											href={selectedParticipant.portfolio_url}
											target="_blank"
											rel="noopener noreferrer"
										>
											{selectedParticipant.portfolio_url}
										</a>
									) : (
										"—"
									)}
								</span>
							</div>
							<div className="detail-row">
								<span className="detail-label">Portfolio Edits</span>
								<span className="detail-value">
									{selectedParticipant.portfolio_edit_count || 0} / 2
								</span>
							</div>
							<div className="detail-row">
								<span className="detail-label">Status</span>
								<span
									className={`detail-value badge ${selectedParticipant.approval_status}`}
								>
									{selectedParticipant.approval_status}
								</span>
							</div>
							<div className="detail-row">
								<span className="detail-label">Present</span>
								<span className="detail-value">
									{selectedParticipant.is_present ? "Yes" : "No"}
								</span>
							</div>
							<div className="detail-row">
								<span className="detail-label">Registered At</span>
								<span className="detail-value">
									{new Date(selectedParticipant.created_at).toLocaleString()}
								</span>
							</div>
							{selectedParticipant.admin_notes && (
								<div className="detail-row">
									<span className="detail-label">Admin Notes</span>
									<span className="detail-value">
										{selectedParticipant.admin_notes}
									</span>
								</div>
							)}
						</div>
						<div className="popup-actions">
							{selectedParticipant.approval_status === "pending" && (
								<>
									<button
										className="action-btn btn-approve"
										onClick={() => {
											handleApprove(selectedParticipant.id);
											setSelectedParticipant(null);
										}}
									>
										Approve
									</button>
									<button
										className="action-btn btn-reject"
										onClick={() => {
											handleReject(selectedParticipant.id);
											setSelectedParticipant(null);
										}}
									>
										Reject
									</button>
								</>
							)}
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
