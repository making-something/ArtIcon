"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { gsap } from "gsap";
import { SplitText } from "gsap/dist/SplitText";
import { getCurrentParticipant, isAuthenticated, logout } from "@/services/api";
import "./event.css";

if (typeof window !== "undefined") {
	gsap.registerPlugin(SplitText);
}

// Category display names
const CATEGORY_LABELS = {
	ui_ux: "UI/UX Design",
	graphics: "Graphics Design",
	video: "Video Editing",
	all: "All Categories",
};

// Dummy tasks for each category
const DUMMY_TASKS = {
	ui_ux: {
		title: "UI/UX Design Task",
		description:
			"Create a modern and intuitive mobile app interface for a food delivery application. Focus on user experience, visual hierarchy, and accessibility. Include at least 5 screens: Home, Menu, Cart, Checkout, and Order Tracking.",
		duration: "3 hours",
	},
	graphics: {
		title: "Graphics Design Task",
		description:
			"Design a complete brand identity for an eco-friendly startup. Include logo variations (primary, secondary, icon), color palette, typography guide, and 3 social media post templates. The design should convey sustainability and innovation.",
		duration: "3 hours",
	},
	video: {
		title: "Video Editing Task",
		description:
			"Create a 60-second promotional video for a tech product launch. Include motion graphics, smooth transitions, background music, and text overlays. The video should be engaging and suitable for social media platforms.",
		duration: "3 hours",
	},
};

const GRID_BLOCK_SIZE = 60;
const GRID_HIGHLIGHT_DURATION = 300;

const EventDashboard = () => {
	const router = useRouter();
	const [participant, setParticipant] = useState(null);
	const [winnersReady, setWinnersReady] = useState(false);
	const gridRef = useRef(null);
	const gridBlocksRef = useRef([]);
	const mouseRef = useRef({
		x: undefined,
		y: undefined,
		radius: GRID_BLOCK_SIZE * 2,
	});
	const animationFrameRef = useRef(null);

	// Winners section refs
	const winnersContainerRef = useRef(null);
	const profileImagesContainerRef = useRef(null);
	const profileImagesRef = useRef([]);
	const nameElementsRef = useRef([]);
	const nameHeadingsRef = useRef([]);

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

		const refreshData = async () => {
			const freshData = await refreshParticipantData();
			if (freshData) {
				if (!freshData.is_present) {
					router.push("/dashboard");
					return;
				}
				setParticipant(freshData);
			}
		};
		refreshData();

		// Refresh data periodically
		const refreshInterval = setInterval(() => {
			refreshData();
		}, 30000);

		return () => clearInterval(refreshInterval);
	}, [router]);

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

	// Set winnersReady after component mounts
	useEffect(() => {
		if (participant) {
			const timer = setTimeout(() => {
				setWinnersReady(true);
			}, 100);
			return () => clearTimeout(timer);
		}
	}, [participant]);

	// Winners section animation
	useEffect(() => {
		if (!winnersReady) return;

		const profileImagesContainer = profileImagesContainerRef.current;
		const profileImages = profileImagesRef.current.filter(Boolean);
		const nameElements = nameElementsRef.current.filter(Boolean);
		const nameHeadings = nameHeadingsRef.current.filter(Boolean);

		if (nameHeadings.length === 0) return;

		// Split text into characters
		const splits = nameHeadings.map((heading) => {
			const split = new SplitText(heading, { type: "chars" });
			split.chars.forEach((char) => {
				char.classList.add("letter");
			});
			return split;
		});

		if (nameElements[0]) {
			const defaultLetters = nameElements[0].querySelectorAll(".letter");
			gsap.set(defaultLetters, { y: "100%" });

			if (window.innerWidth >= 900) {
				const handlers = [];

				profileImages.forEach((img, index) => {
					if (!img) return;

					const correspondingName = nameElements[index + 1];
					if (!correspondingName) return;

					const letters = correspondingName.querySelectorAll(".letter");

					const isLarge = img.classList.contains("img-large");
					const defaultSize = isLarge ? 120 : 70;
					const hoverSize = isLarge ? 180 : 140;

					const handleMouseEnter = () => {
						gsap.to(img, {
							width: hoverSize,
							height: hoverSize,
							duration: 0.5,
							ease: "power4.out",
						});

						gsap.to(letters, {
							y: "-100%",
							ease: "power4.out",
							duration: 0.75,
							stagger: {
								each: 0.025,
								from: "center",
							},
						});
					};

					const handleMouseLeave = () => {
						gsap.to(img, {
							width: defaultSize,
							height: defaultSize,
							duration: 0.5,
							ease: "power4.out",
						});

						gsap.to(letters, {
							y: "0%",
							ease: "power4.out",
							duration: 0.75,
							stagger: {
								each: 0.025,
								from: "center",
							},
						});
					};

					img.addEventListener("mouseenter", handleMouseEnter);
					img.addEventListener("mouseleave", handleMouseLeave);
					handlers.push({
						el: img,
						enter: handleMouseEnter,
						leave: handleMouseLeave,
					});
				});

				if (profileImagesContainer) {
					const containerEnter = () => {
						const defaultLetters = nameElements[0].querySelectorAll(".letter");
						gsap.to(defaultLetters, {
							y: "0%",
							ease: "power4.out",
							duration: 0.75,
							stagger: {
								each: 0.025,
								from: "center",
							},
						});
					};

					const containerLeave = () => {
						const defaultLetters = nameElements[0].querySelectorAll(".letter");
						gsap.to(defaultLetters, {
							y: "100%",
							ease: "power4.out",
							duration: 0.75,
							stagger: {
								each: 0.025,
								from: "center",
							},
						});
					};

					profileImagesContainer.addEventListener("mouseenter", containerEnter);
					profileImagesContainer.addEventListener("mouseleave", containerLeave);

					return () => {
						handlers.forEach(({ el, enter, leave }) => {
							el.removeEventListener("mouseenter", enter);
							el.removeEventListener("mouseleave", leave);
						});
						profileImagesContainer.removeEventListener(
							"mouseenter",
							containerEnter
						);
						profileImagesContainer.removeEventListener(
							"mouseleave",
							containerLeave
						);
						splits.forEach((split) => split.revert());
					};
				}
			}
		}
	}, [winnersReady]);

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
						Welcome to <span className="accent">ArtIcon</span>
					</h1>
					<p className="event-subtitle">Innovation Meets Creativity</p>
				</section>

				{/* Tasks Section */}
				<section className="tasks-section">
					<div className="tasks-panel">
						<div className="panel-header">
							<h2 className="panel-title">
								<span className="title-icon">📋</span>
								Your Tasks
							</h2>
							<span className="task-count">
								{getParticipantTasks().length} Task
								{getParticipantTasks().length !== 1 ? "s" : ""}
							</span>
						</div>
						<div className="tasks-list">
							{participant?.category === "all" ? (
								// Show all tasks grouped by category for "all" participants
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
															🔴 Live
														</span>
														<span className="task-duration">
															⏱ {task.duration}
														</span>
													</div>
													<h3 className="task-title">{task.title}</h3>
													<p className="task-description">{task.description}</p>
												</div>
											</div>
										);
									})}
								</>
							) : (
								// Single category task
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
												<span className="task-status-badge active">
													🔴 Live
												</span>
												<span className="task-duration">⏱ {task.duration}</span>
											</div>
											<h3 className="task-title">{task.title}</h3>
											<p className="task-description">{task.description}</p>
										</div>
									);
								})()
							)}
						</div>
					</div>
				</section>

				{/* Winners Section - Sticky Box */}
				<section className="winners-section">
					<div className="winners-box" ref={winnersContainerRef}>
						<div className="winners-content">
							<div className="profile-images" ref={profileImagesContainerRef}>
								{/* First Row - 1 larger element */}
								<div className="image-row row-first">
									<div
										key="img1"
										className="img img-large"
										ref={(el) => (profileImagesRef.current[0] = el)}
									>
										<Image
											src="/winners/img1.jpeg"
											alt="Winner 1"
											width={180}
											height={180}
											priority={true}
										/>
									</div>
								</div>

								{/* Second Row - 3 smaller elements */}
								<div className="image-row row-second">
									{[2, 3, 4].map((num, index) => (
										<div
											key={`img${num}`}
											className="img img-small"
											ref={(el) => (profileImagesRef.current[index + 1] = el)}
										>
											<Image
												src={`/winners/img${num}.jpeg`}
												alt={`Winner ${num}`}
												width={140}
												height={140}
												priority={false}
											/>
										</div>
									))}
								</div>
							</div>

							<div className="profile-names">
								<div
									className="name default"
									ref={(el) => (nameElementsRef.current[0] = el)}
								>
									<h1 ref={(el) => (nameHeadingsRef.current[0] = el)}>
										Artists
									</h1>
								</div>
								{[
									"NILAY and DHAIRYA",
									"MULTIICON",
									"BONTON",
									"MARKET MAYA",
								].map((name, index) => (
									<div
										key={name}
										className="name"
										ref={(el) => (nameElementsRef.current[index + 1] = el)}
									>
										<h1 ref={(el) => (nameHeadingsRef.current[index + 1] = el)}>
											{name}
										</h1>
									</div>
								))}
							</div>
						</div>
					</div>
				</section>
			</main>
		</div>
	);
};

export default EventDashboard;
