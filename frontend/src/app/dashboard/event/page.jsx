"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getCurrentParticipant, isAuthenticated, logout } from "@/services/api";
import LiveUpdates from "@/components/LiveUpdates/LiveUpdates";
import useEventStatus from "@/hooks/useEventStatus";
import "./event.css";

// Category display names
const CATEGORY_LABELS = {
	ui_ux: "UI/UX Design",
	graphics: "Graphics Design",
	video: "Video Editing",
	all: "All Categories",
};

// PDF paths for each category with viewer settings
// Parameters:
// - view=FitH - Fit to width
// - zoom=50 - Set zoom to 50%
// - pagemode=none - Hide sidebar/thumbnails
// - toolbar=0 - Hide toolbar (not supported in all browsers)
const TASK_PDFS = {
	ui_ux: "/UI-UX Designing Task ARTICON.pdf#view=FitH&zoom=50&pagemode=none",
	graphics:
		"/Graphic Designer Task ARTICON.pdf#view=FitH&zoom=50&pagemode=none",
	video: "/Video Editing Task ARTICON.pdf#view=FitH&zoom=50&pagemode=none",
};

// Dummy tasks for each category
const DUMMY_TASKS = {
	ui_ux: {
		title: "UI/UX Design Task",
		description: "",
		duration: "5 hours",
		pdfUrl: TASK_PDFS.ui_ux,
	},
	graphics: {
		title: "Graphics Design Task",
		description: "",
		duration: "5 hours",
		pdfUrl: TASK_PDFS.graphics,
	},
	video: {
		title: "Video Editing Task",
		description: "",
		duration: "5 hours",
		pdfUrl: TASK_PDFS.video,
	},
};

const GRID_BLOCK_SIZE = 60;
const GRID_HIGHLIGHT_DURATION = 300;
const TASK_UNLOCK_TIME = { hour: 10, minute: 0 };

const EventDashboard = () => {
	const router = useRouter();
	const [participant, setParticipant] = useState(null);
	const [areTasksVisible, setAreTasksVisible] = useState(false);

	// Use event status hook (handles winner redirect and submission status via Socket.IO)
	const { submissionsClosed } = useEventStatus(true);
	const gridRef = useRef(null);
	const gridBlocksRef = useRef([]);
	const mouseRef = useRef({
		x: undefined,
		y: undefined,
		radius: GRID_BLOCK_SIZE * 2,
	});
	const animationFrameRef = useRef(null);

	// Get tasks for participant based on their category
	const getParticipantTasks = () => {
		if (!participant) return [];

		if (participant.category === "all") {
			// Return all tasks grouped by category
			return Object.entries(DUMMY_TASKS).map(([cat, task]) => ({
				...task,
				category: cat,
			}));
		}

		// Return single category task
		const task = DUMMY_TASKS[participant.category];
		return task ? [{ ...task, category: participant.category }] : [];
	};

	// Handle submission - redirect to external URL
	const handleSubmit = () => {
		window.open("http://192.168.1.65:3001", "_blank");
	};

	useEffect(() => {
		if (!isAuthenticated()) {
			router.push("/registration");
			return;
		}
		const userData = getCurrentParticipant();
		if (!userData?.is_present) {
			router.push("/dashboard");
			return;
		}
		setParticipant(userData);
	}, [router]);

	useEffect(() => {
		const updateVisibility = () => {
			const now = new Date();
			const isAfterUnlock =
				now.getHours() > TASK_UNLOCK_TIME.hour ||
				(now.getHours() === TASK_UNLOCK_TIME.hour &&
					now.getMinutes() >= TASK_UNLOCK_TIME.minute);
			setAreTasksVisible(isAfterUnlock);
		};

		updateVisibility();
		const intervalId = setInterval(updateVisibility, 30000);
		return () => clearInterval(intervalId);
	}, []);

	const resetInteractiveGrid = useCallback(() => {
		if (!gridRef.current) return;
		gridRef.current.innerHTML = "";
		gridBlocksRef.current = [];
		const gridWidth = window.innerWidth;
		const gridHeight = window.innerHeight;
		const gridColumnCount = Math.ceil(gridWidth / GRID_BLOCK_SIZE);
		const gridRowCount = Math.ceil(gridHeight / GRID_BLOCK_SIZE);
		const gridOffsetX = (gridWidth - gridColumnCount * GRID_BLOCK_SIZE) / 2;
		const gridOffsetY = (gridHeight - gridRowCount * GRID_BLOCK_SIZE) / 2;

		for (let rowIndex = 0; rowIndex < gridRowCount; rowIndex++) {
			for (let colIndex = 0; colIndex < gridColumnCount; colIndex++) {
				const blockPosX = colIndex * GRID_BLOCK_SIZE + gridOffsetX;
				const blockPosY = rowIndex * GRID_BLOCK_SIZE + gridOffsetY;
				const gridBlock = document.createElement("div");
				gridBlock.classList.add("block");
				gridBlock.style.width = `${GRID_BLOCK_SIZE}px`;
				gridBlock.style.height = `${GRID_BLOCK_SIZE}px`;
				gridBlock.style.left = `${blockPosX}px`;
				gridBlock.style.top = `${blockPosY}px`;
				gridRef.current.appendChild(gridBlock);
				gridBlocksRef.current.push({
					element: gridBlock,
					x: blockPosX + GRID_BLOCK_SIZE / 2,
					y: blockPosY + GRID_BLOCK_SIZE / 2,
					gridX: colIndex,
					gridY: rowIndex,
					highlightEndTime: 0,
				});
			}
		}
	}, []);

	const addGridHighlights = useCallback(() => {
		const mouse = mouseRef.current;
		if (!mouse.x || !mouse.y) return;
		let closestBlock = null;
		let closestDistance = Infinity;
		for (const block of gridBlocksRef.current) {
			const distX = mouse.x - block.x;
			const distY = mouse.y - block.y;
			const dist = Math.sqrt(distX * distX + distY * distY);
			if (dist < closestDistance) {
				closestDistance = dist;
				closestBlock = block;
			}
		}
		if (!closestBlock || closestDistance > mouse.radius) return;
		const currentTime = Date.now();
		closestBlock.element.classList.add("highlight");
		closestBlock.highlightEndTime = currentTime + GRID_HIGHLIGHT_DURATION;
		const clusterSize = Math.floor(Math.random() * 1) + 1;
		let currentBlock = closestBlock;
		const highlightedBlocks = [closestBlock];
		for (let i = 0; i < clusterSize; i++) {
			const neighbors = gridBlocksRef.current.filter((nb) => {
				if (highlightedBlocks.includes(nb)) return false;
				const dx = Math.abs(nb.gridX - currentBlock.gridX);
				const dy = Math.abs(nb.gridY - currentBlock.gridY);
				return dx <= 1 && dy <= 1;
			});
			if (neighbors.length === 0) break;
			const randomNeighbor =
				neighbors[Math.floor(Math.random() * neighbors.length)];
			randomNeighbor.element.classList.add("highlight");
			randomNeighbor.highlightEndTime =
				currentTime + GRID_HIGHLIGHT_DURATION + i * 10;
			highlightedBlocks.push(randomNeighbor);
			currentBlock = randomNeighbor;
		}
	}, []);

	const updateGridHighlights = useCallback(() => {
		const currentTime = Date.now();
		gridBlocksRef.current.forEach((block) => {
			if (block.highlightEndTime > 0 && currentTime > block.highlightEndTime) {
				block.element.classList.remove("highlight");
				block.highlightEndTime = 0;
			}
		});
		animationFrameRef.current = requestAnimationFrame(updateGridHighlights);
	}, []);

	useEffect(() => {
		resetInteractiveGrid();
		const handleResize = () => resetInteractiveGrid();
		const handleMouseMove = (e) => {
			mouseRef.current.x = e.clientX;
			mouseRef.current.y = e.clientY;
			addGridHighlights();
		};
		const handleMouseOut = () => {
			mouseRef.current.x = undefined;
			mouseRef.current.y = undefined;
		};
		window.addEventListener("resize", handleResize);
		window.addEventListener("mousemove", handleMouseMove);
		window.addEventListener("mouseout", handleMouseOut);
		animationFrameRef.current = requestAnimationFrame(updateGridHighlights);
		return () => {
			window.removeEventListener("resize", handleResize);
			window.removeEventListener("mousemove", handleMouseMove);
			window.removeEventListener("mouseout", handleMouseOut);
			if (animationFrameRef.current) {
				cancelAnimationFrame(animationFrameRef.current);
			}
		};
	}, [resetInteractiveGrid, addGridHighlights, updateGridHighlights]);

	const handleLogout = () => {
		logout();
		router.push("/registration");
	};

	if (!participant) {
		return (
			<div className="event-dashboard">
				<div className="interactive-grid" ref={gridRef}></div>
				<div className="event-content">
					<div className="loading-spinner"></div>
				</div>
			</div>
		);
	}

	return (
		<div className="event-dashboard">
			<div className="interactive-grid" ref={gridRef}></div>
			<header className="event-header">
				<img src="/art.png" alt="ArtIcon" className="event-logo" />
				<div className="event-user-info">
					<span className="event-user-name">{participant.name}</span>
					<button className="event-logout-btn" onClick={handleLogout}>
						Logout
					</button>
				</div>
			</header>

			{/* Main Content */}
			<main className="event-main">
				{/* Title Section */}
				<section className="event-welcome">
					<h1 className="event-title">
						Hey <span className="accent">Artist!</span>
					</h1>
					<p className="event-subtitle">
						You're officially inside Gujarat's AI-powered creative competition.
					</p>
				</section>

				{/* Tasks & Live Updates Grid */}
				<section className="tasks-updates-grid">
					{/* Tasks Panel */}
					<div className="tasks-panel">
						<div className="panel-header">
							<h2 className="panel-title">Your Tasks</h2>
							<span className="task-count">
								{getParticipantTasks().length} Task
								{getParticipantTasks().length !== 1 ? "s" : ""}
							</span>
						</div>
						<div className="tasks-list">
							{!areTasksVisible ? (
								<div className="empty-state">
									<p>Your assigned task will unlock at 10:00 AM.</p>
									<p>Till then, keep your imagination loaded!</p>
								</div>
							) : participant?.category === "all" ? (
								<>
									{["ui_ux", "graphics", "video"].map((cat) => {
										const task = DUMMY_TASKS[cat];
										return (
											<div key={cat} className="category-group">
												<h3 className="category-title">
													{CATEGORY_LABELS[cat]}
												</h3>
												<div className="task-card active">
													<div className="task-header">
														<span className="task-status-badge active">
															Live
														</span>
														<span className="task-duration">
															{task.duration}
														</span>
													</div>
													<h3 className="task-title">{task.title}</h3>
													{task.pdfUrl && (
														<div className="task-pdf-viewer">
															<iframe
																src={task.pdfUrl}
																title={`${task.title} PDF`}
																className="pdf-frame"
															/>
														</div>
													)}
												</div>
											</div>
										);
									})}
								</>
							) : (
								(() => {
									const task = DUMMY_TASKS[participant?.category];
									if (!task)
										return (
											<div className="empty-state">
												No task available for your category.
											</div>
										);
									return (
										<div className="task-card active">
											<div className="task-header">
												<span className="task-status-badge active">Live</span>
												<span className="task-duration">{task.duration}</span>
											</div>
											{task.pdfUrl && (
												<div className="task-pdf-viewer">
													<iframe
														src={task.pdfUrl}
														title={`${
															CATEGORY_LABELS[participant?.category]
														} Task PDF`}
														className="pdf-frame"
													/>
												</div>
											)}
										</div>
									);
								})()
							)}
						</div>
					</div>

					{/* Live Updates Panel */}
					<LiveUpdates />
				</section>

				{/* Submission Section */}
				<section className="submission-section">
					<div className="submission-container">
						<div className="panel-header">
							<h2 className="panel-title">Submit Your Work</h2>
						</div>
						{submissionsClosed ? (
							<div className="submissions-closed">
								<span className="closed-icon">🔒</span>
								<h3>Submissions Closed</h3>
								<p>The submission window has been closed by the organizers.</p>
							</div>
						) : (
							<div className="submission-form">
								<button className="submit-btn" onClick={handleSubmit}>
									Submit
								</button>
							</div>
						)}
					</div>
				</section>
			</main>
		</div>
	);
};

export default EventDashboard;
