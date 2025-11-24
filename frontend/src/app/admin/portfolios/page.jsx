"use client";
import { useState, useEffect } from "react";
import { approveParticipant, rejectParticipant, exportParticipantsCSV } from "@/services/api";
import "./portfolios.css";

export default function AdminPortfolios() {
	const [participants, setParticipants] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [filters, setFilters] = useState({
		category: "all",
		approval_status: "all",
		search: "",
		page: 1,
		limit: 20,
	});
	const [pagination, setPagination] = useState(null);

	const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

	useEffect(() => {
		fetchParticipants();
	}, [filters]);

	const fetchParticipants = async () => {
		try {
			setLoading(true);
			const token = localStorage.getItem("adminToken");

			if (!token) {
				setError("Not authenticated. Please login.");
				setLoading(false);
				return;
			}

			const queryParams = new URLSearchParams({
				category: filters.category,
				approval_status: filters.approval_status,
				page: filters.page.toString(),
				limit: filters.limit.toString(),
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

			if (!response.ok) {
				throw new Error("Failed to fetch participants");
			}

			const data = await response.json();
			setParticipants(data.data);
			setPagination(data.pagination);
			setError(null);
		} catch (err) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	const handleCategoryChange = (category) => {
		setFilters({ ...filters, category, page: 1 });
	};

	const handleSearchChange = (e) => {
		const search = e.target.value;
		setFilters({ ...filters, search, page: 1 });
	};

	const handlePageChange = (newPage) => {
		setFilters({ ...filters, page: newPage });
	};

	const handleApprovalStatusChange = (approval_status) => {
		setFilters({ ...filters, approval_status, page: 1 });
	};

	const handleApprove = async (participantId, adminNotes = '') => {
		try {
			setLoading(true);
			const result = await approveParticipant(participantId, adminNotes);

			if (result.success) {
				// Refresh participants list
				await fetchParticipants();
				alert('Participant approved successfully!');
			} else {
				alert('Failed to approve participant');
			}
		} catch (error) {
			console.error('Error approving participant:', error);
			alert('Error approving participant');
		} finally {
			setLoading(false);
		}
	};

	const handleReject = async (participantId, adminNotes = '') => {
		try {
			const notes = adminNotes || prompt('Please enter rejection reason (optional):');
			if (notes === null) return; // User cancelled

			setLoading(true);
			const result = await rejectParticipant(participantId, notes);

			if (result.success) {
				// Refresh participants list
				await fetchParticipants();
				alert('Participant rejected successfully!');
			} else {
				alert('Failed to reject participant');
			}
		} catch (error) {
			console.error('Error rejecting participant:', error);
			alert('Error rejecting participant');
		} finally {
			setLoading(false);
		}
	};

	const handleExportCSV = async () => {
		try {
			await exportParticipantsCSV(filters.category, filters.approval_status);
		} catch (error) {
			console.error('Error exporting CSV:', error);
			alert('Error exporting CSV');
		}
	};

	const getCategoryLabel = (category) => {
		const labels = {
			video: "Video Editing",
			ui_ux: "UI/UX Design",
			graphics: "Graphic Design",
		};
		return labels[category] || category;
	};

	const getApprovalStatusLabel = (status) => {
		const labels = {
			pending: "Pending",
			approved: "Approved",
			rejected: "Rejected",
		};
		return labels[status] || status;
	};

	const getApprovalStatusColor = (status) => {
		const colors = {
			pending: "#ffc107",
			approved: "#28a745",
			rejected: "#dc3545",
		};
		return colors[status] || "#6c757d";
	};

	const getPortfolioLink = (participant) => {
		if (participant.portfolio_file_path) {
			return `${API_URL}${participant.portfolio_file_path}`;
		}
		return participant.portfolio_url;
	};

	const isFilePortfolio = (participant) => {
		return !!participant.portfolio_file_path;
	};

	if (loading && participants.length === 0) {
		return (
			<div className="portfolios-container">
				<div className="loading">Loading participants...</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="portfolios-container">
				<div className="error">
					<h2>Error</h2>
					<p>{error}</p>
					<button onClick={fetchParticipants}>Retry</button>
				</div>
			</div>
		);
	}

	return (
		<div className="portfolios-container">
			<div className="portfolios-header">
				<h1>Participant Portfolios</h1>
				<p>View and manage participant portfolios</p>
			</div>

			<div className="portfolios-controls">
				<div className="filters-row">
					<div className="category-filters">
						<button
							className={filters.category === "all" ? "active" : ""}
							onClick={() => handleCategoryChange("all")}
						>
							All
						</button>
						<button
							className={filters.category === "video" ? "active" : ""}
							onClick={() => handleCategoryChange("video")}
						>
							Video Editing
						</button>
						<button
							className={filters.category === "ui_ux" ? "active" : ""}
							onClick={() => handleCategoryChange("ui_ux")}
						>
							UI/UX Design
						</button>
						<button
							className={filters.category === "graphics" ? "active" : ""}
							onClick={() => handleCategoryChange("graphics")}
						>
							Graphic Design
						</button>
					</div>

					<div className="approval-filters">
						<button
							className={filters.approval_status === "all" ? "active" : ""}
							onClick={() => handleApprovalStatusChange("all")}
						>
							All Status
						</button>
						<button
							className={filters.approval_status === "pending" ? "active" : ""}
							onClick={() => handleApprovalStatusChange("pending")}
						>
							Pending
						</button>
						<button
							className={filters.approval_status === "approved" ? "active" : ""}
							onClick={() => handleApprovalStatusChange("approved")}
						>
							Approved
						</button>
						<button
							className={filters.approval_status === "rejected" ? "active" : ""}
							onClick={() => handleApprovalStatusChange("rejected")}
						>
							Rejected
						</button>
					</div>
				</div>

				<div className="controls-bottom">
					<div className="search-box">
						<input
							type="text"
							placeholder="Search by name, email, or city..."
							value={filters.search}
							onChange={handleSearchChange}
						/>
					</div>

					<button className="export-csv-btn" onClick={handleExportCSV}>
						📊 Export CSV
					</button>
				</div>
			</div>

			{pagination && (
				<div className="results-info">
					Showing {participants.length} of {pagination.total} participants
				</div>
			)}

			<div className="portfolios-grid">
				{participants.map((participant) => (
					<div key={participant.id} className="portfolio-card">
						<div className="portfolio-card-header">
							<h3>{participant.name}</h3>
							<span className={`category-badge ${participant.category}`}>
								{getCategoryLabel(participant.category)}
							</span>
						</div>

						<div className="portfolio-card-body">
							<div className="info-row">
								<span className="label">Email:</span>
								<span className="value">{participant.email}</span>
							</div>

							<div className="info-row">
								<span className="label">Phone:</span>
								<span className="value">{participant.whatsapp_no}</span>
							</div>

							<div className="info-row">
								<span className="label">City:</span>
								<span className="value">{participant.city}</span>
							</div>

							{participant.role && (
								<div className="info-row">
									<span className="label">Role:</span>
									<span className="value">{participant.role}</span>
								</div>
							)}

							{participant.experience !== null && (
								<div className="info-row">
									<span className="label">Experience:</span>
									<span className="value">{participant.experience} years</span>
								</div>
							)}

							{participant.organization && (
								<div className="info-row">
									<span className="label">Organization:</span>
									<span className="value">{participant.organization}</span>
								</div>
							)}

							<div className="portfolio-link">
								<span className="label">Portfolio:</span>
								{isFilePortfolio(participant) ? (
									<a
										href={getPortfolioLink(participant)}
										target="_blank"
										rel="noopener noreferrer"
										className="portfolio-button file"
									>
										📄 View File
									</a>
								) : (
									<a
										href={getPortfolioLink(participant)}
										target="_blank"
										rel="noopener noreferrer"
										className="portfolio-button link"
									>
										🔗 View Link
									</a>
								)}
							</div>

							<div className="info-row">
								<span className="label">Present:</span>
								<span className={`status ${participant.is_present ? "present" : "absent"}`}>
									{participant.is_present ? "✓ Yes" : "✗ No"}
								</span>
							</div>

							<div className="info-row">
								<span className="label">Registered:</span>
								<span className="value">
									{new Date(participant.created_at).toLocaleDateString()}
								</span>
							</div>

							<div className="info-row">
								<span className="label">Approval:</span>
								<span
									className="approval-status-badge"
									style={{
										backgroundColor: getApprovalStatusColor(participant.approval_status),
										color: 'white',
										padding: '2px 8px',
										borderRadius: '12px',
										fontSize: '12px',
										fontWeight: 'bold'
									}}
								>
									{getApprovalStatusLabel(participant.approval_status)}
								</span>
							</div>

							{participant.admin_notes && (
								<div className="info-row">
									<span className="label">Notes:</span>
									<span className="value" style={{ fontStyle: 'italic', fontSize: '12px' }}>
										{participant.admin_notes}
									</span>
								</div>
							)}

							{participant.approval_status === 'pending' && (
								<div className="approval-actions">
									<button
										className="approve-btn"
										onClick={() => handleApprove(participant.id)}
										disabled={loading}
									>
										✅ Approve
									</button>
									<button
										className="reject-btn"
										onClick={() => handleReject(participant.id)}
										disabled={loading}
									>
										❌ Reject
									</button>
								</div>
							)}
						</div>
					</div>
				))}
			</div>

			{pagination && pagination.totalPages > 1 && (
				<div className="pagination">
					<button
						disabled={filters.page === 1}
						onClick={() => handlePageChange(filters.page - 1)}
					>
						Previous
					</button>

					<span className="page-info">
						Page {pagination.page} of {pagination.totalPages}
					</span>

					<button
						disabled={filters.page >= pagination.totalPages}
						onClick={() => handlePageChange(filters.page + 1)}
					>
						Next
					</button>
				</div>
			)}
		</div>
	);
}
