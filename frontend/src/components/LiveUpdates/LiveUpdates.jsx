"use client";
import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import "./LiveUpdates.css";

const LiveUpdates = () => {
	const [updates, setUpdates] = useState([]);

	useEffect(() => {
		const socket = io(process.env.NEXT_PUBLIC_API_URL || "https://api.articon.multiicon.in");

		socket.on("connect", () => {
			console.log("Connected to socket server");
		});

		socket.on("live-update", (data) => {
			setUpdates((prev) => [data, ...prev]);
		});

		return () => {
			socket.disconnect();
		};
	}, []);

	return (
		<div className="updates-panel">
			<div className="panel-header">
				<h2 className="panel-title">Live Updates</h2>
			</div>
			<div className="updates-list">
				{updates.length === 0 ? (
					<div className="empty-state">No updates yet.</div>
				) : (
					updates.map((update, index) => (
						<div key={index} className="update-item">
							<span className="update-arrow">&gt;</span>
							<div className="update-content">
								<p className="update-text">{update.message}</p>
								<span className="update-time">
									{new Date(update.timestamp).toLocaleTimeString([], {
										hour: "2-digit",
										minute: "2-digit",
									})}
								</span>
							</div>
						</div>
					))
				)}
			</div>
		</div>
	);
};

export default LiveUpdates;
