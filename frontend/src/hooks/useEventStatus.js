import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { io } from "socket.io-client";

// Shared socket instance
let socket = null;
let socketRefCount = 0;

// Shared state across all components
let eventStatusCache = {
	winnersAnnounced: false,
	submissionsClosed: false,
};

/**
 * Hook to monitor event status using Socket.IO (similar to LiveUpdates)
 * @param {boolean} checkWinners - Whether to redirect on winner announcement
 * @returns {object} Event status { winnersAnnounced, submissionsClosed }
 */
export const useEventStatus = (checkWinners = true) => {
	const router = useRouter();
	const [status, setStatus] = useState(eventStatusCache);

	useEffect(() => {
		// Create socket connection if not exists
		if (!socket) {
			socket = io(
				process.env.NEXT_PUBLIC_API_URL || "https://api.articon.multiicon.in"
			);

			socket.on("connect", () => {
				console.log("Connected to event status socket");
			});

			// Listen for event status updates
			socket.on("event-status-update", (data) => {
				eventStatusCache = {
					winnersAnnounced: data.winnersAnnounced || false,
					submissionsClosed: data.submissionsClosed || false,
				};
			});
		}

		socketRefCount++;

		// Update local state when cache changes
		const handleStatusUpdate = (data) => {
			setStatus(data);

			// Redirect to winner page if announced
			if (checkWinners && data.winnersAnnounced) {
				router.push("/winner");
			}
		};

		// Listen for updates
		socket.on("event-status-update", handleStatusUpdate);

		// Fetch initial status
		const fetchInitialStatus = async () => {
			try {
				const response = await fetch(
					`${process.env.NEXT_PUBLIC_API_URL}/api/participants/event-status`
				);
				if (response.ok) {
					const data = await response.json();
					const newStatus = {
						winnersAnnounced: data.data.winnersAnnounced || false,
						submissionsClosed: data.data.submissionsClosed || false,
					};
					eventStatusCache = newStatus;
					setStatus(newStatus);

					// Check for winner redirect
					if (checkWinners && newStatus.winnersAnnounced) {
						router.push("/winner");
					}
				}
			} catch (error) {
				console.error("Error fetching initial event status:", error);
			}
		};

		fetchInitialStatus();

		// Cleanup
		return () => {
			socket.off("event-status-update", handleStatusUpdate);
			socketRefCount--;

			// Disconnect socket if no more subscribers
			if (socketRefCount === 0 && socket) {
				socket.disconnect();
				socket = null;
			}
		};
	}, [router, checkWinners]);

	return status;
};

export default useEventStatus;
