"use client";
import React, { useEffect, useRef, useCallback } from "react";
import Winners from "@/components/Winner/Winners";
import "../dashboard/event/event.css";

const GRID_BLOCK_SIZE = 60;
const GRID_HIGHLIGHT_DURATION = 300;

export default function WinnersPage() {
	const gridRef = useRef(null);
	const gridBlocksRef = useRef([]);
	const mouseRef = useRef({
		x: undefined,
		y: undefined,
		radius: GRID_BLOCK_SIZE * 2,
	});
	const animationFrameRef = useRef(null);

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

	return (
		<div className="event-dashboard">
			<div className="interactive-grid" ref={gridRef}></div>
			<div className="event-content" style={{ padding: 0 }}>
				<Winners />
			</div>
		</div>
	);
}