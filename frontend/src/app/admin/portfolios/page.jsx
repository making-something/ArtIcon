"use client";
import { useState, useEffect } from "react";
import "./portfolios.css";

export default function AdminPortfolios() {
	const [participants, setParticipants] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [filters, setFilters] = useState({
		category: "all",
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

	const getCategoryLabel = (category) => {
		const labels = {
			video: "Video Editing",
			ui_ux: "UI/UX Design",
			graphics: "Graphic Design",
		};
		return labels[category] || category;
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

				<div className="search-box">
					<input
						type="text"
						placeholder="Search by name, email, or city..."
						value={filters.search}
						onChange={handleSearchChange}
					/>
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
