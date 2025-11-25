"use client";
import { ArrowLeftIcon } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import "./registration.css";
import { registerParticipant, login } from "@/services/api";

const Register = () => {
	const router = useRouter();
	const [phase, setPhase] = useState("register");
	const [step, setStep] = useState(0);
	const [isRestoring, setIsRestoring] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState("");
	const [fieldError, setFieldError] = useState("");
	const [showErrorPopup, setShowErrorPopup] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [showLoginPassword, setShowLoginPassword] = useState(false);

	const [formData, setFormData] = useState({
		fullName: "",
		city: "",
		role: "",
		specialization: "",
		portfolio: "", // Stores the Link text OR the Filename
		portfolioFile: null,
		phone: "",
		email: "",
		password: "",
		confirmPassword: "",
		loginEmail: "",
		loginPassword: "",
	});

	const sizerRef = useRef(null);

	const containerRef = useRef(null);
	const scrollContainerRef = useRef(null); // Ref for the new container
	const inputRefs = useRef([]);
	const submitRef = useRef(null);

	const fileInputRef = useRef(null);

	// --- CONFIG ARRAYS (Same as before) ---
	const registerSteps = [
		{
			id: 0,
			field: "fullName",
			type: "text",
			pre: "I, ",
			post: " ,",
			placeholder: "YOUR FULL NAME",
		},
		{
			id: 1,
			field: "city",
			type: "text",
			pre: " currently residing in ",
			post: " ,",
			placeholder: "YOUR CITY",
		},
		{
			id: 2,
			field: "role",
			type: "select",
			options: ["Student", "Professional", "Freelancer"],
			pre: " would like to register for ArtIcon 2025. I am professionally working/studying as a ",
			post: " ",
			placeholder: "SELECT ROLE",
		},
		{
			id: 3,
			field: "specialization",
			type: "select",
			options: ["UI/UX Design", "Video Editing", "Graphic Design"],
			pre: " and specialize in and want to participate in ",
			post: " .",
			placeholder: "CHOOSE FIELD",
		},
		{
			id: 4,
			field: "portfolio",
			type: "text",
			pre: " I am submitting my portfolio/project work attached/uploaded here: ",
			post: " .",
			placeholder: "LINK OR ATTACH FILE",
		},
		{
			id: 5,
			field: "phone",
			type: "tel",
			pre: " You may contact me at ",
			post: " ",
			placeholder: "PHONE NUMBER",
		},
		{
			id: 6,
			field: "email",
			type: "email",
			pre: " AND ",
			post: " for further communication.",
			placeholder: "EMAIL ADDRESS",
		},
	];

	const passwordSteps = [
		{
			id: 0,
			field: "password",
			type: "password",
			pre: "Great! Let's secure your spot. Set your password: ",
			post: " .",
			placeholder: "PASSWORD",
		},
		{
			id: 1,
			field: "confirmPassword",
			type: "password",
			pre: " Please confirm it again: ",
			post: " to create your account.",
			placeholder: "CONFIRM PASSWORD",
		},
	];

	const loginSteps = [
		{
			id: 0,
			field: "loginEmail",
			type: "email",
			pre: "Welcome back! Please enter your email: ",
			post: " ",
			placeholder: "REGISTERED EMAIL",
		},
		{
			id: 1,
			field: "loginPassword",
			type: "password",
			pre: " and your password: ",
			post: " to access the portal.",
			placeholder: "YOUR PASSWORD",
		},
	];

	const getCurrentSteps = () => {
		if (phase === "register") return registerSteps;
		if (phase === "password") return passwordSteps;
		if (phase === "login") return loginSteps;
		return [];
	};

	const currentSteps = getCurrentSteps();

	// --- NEW: AUTO RESIZE LOGIC ---

	const updateInputWidth = (target) => {
		if (!sizerRef.current || !target) return;

		// 1. Get text to measure (Value OR Placeholder)
		let text = target.value || target.placeholder || "";

		// 2. Copy to ghost element
		sizerRef.current.innerText = text;

		let buffer = 25; // Default buffer for inputs

		if (target.tagName === "SELECT") {
			// For Select: Get the text of the selected option (which includes placeholder if value is empty)
			// selectedIndex can be -1 if nothing selected, though with value="" controlled it usually defaults to 0
			const index = target.selectedIndex >= 0 ? target.selectedIndex : 0;
			text = target.options[index] ? target.options[index].text : "";
			buffer = 50; // Larger buffer for the Arrow Icon
		} else {
			// For Input: Use value or placeholder
			text = target.value || target.placeholder || "";
		}

		sizerRef.current.innerText = text;

		// Measure and apply
		const newWidth = sizerRef.current.offsetWidth + buffer;
		target.style.width = `${newWidth}px`;
	};

	// UseEffect to resize all visible inputs on mount/phase change/step change
	useEffect(() => {
		inputRefs.current.forEach((input) => {
			if (input) updateInputWidth(input);
		});
	}, [step, phase, isRestoring]);

	// --- VALIDATION FUNCTIONS ---
	const showError = (message) => {
		setFieldError(message);
		setShowErrorPopup(true);
		setTimeout(() => {
			setShowErrorPopup(false);
		}, 3000);
	};

	const validateField = (field, value) => {
		// Full Name - Only letters and spaces, at least 2 words
		if (field === "fullName") {
			if (!/^[a-zA-Z\s]+$/.test(value)) {
				showError("Name can only contain letters and spaces");
				return false;
			}
			if (value.trim().split(/\s+/).length < 2) {
				showError("Please enter your full name (first and last name)");
				return false;
			}
		}

		// City - Only letters and spaces
		if (field === "city") {
			if (!/^[a-zA-Z\s]+$/.test(value)) {
				showError("City name can only contain letters and spaces");
				return false;
			}
		}

		// Phone - Only numbers, exactly 10 digits
		if (field === "phone") {
			if (!/^\d{10}$/.test(value)) {
				showError("Phone number must be exactly 10 digits");
				return false;
			}
		}

		// Email - Valid email format
		if (field === "email" || field === "loginEmail") {
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!emailRegex.test(value)) {
				showError("Please enter a valid email address");
				return false;
			}
		}

		// Portfolio - Must be a valid URL or file
		if (field === "portfolio") {
			if (!formData.portfolioFile) {
				// If no file, check if it's a valid URL
				const urlRegex =
					/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
				if (!urlRegex.test(value)) {
					showError("Please enter a valid URL or attach a file");
					return false;
				}
			}
		}

		// Password - Minimum 6 characters
		if (field === "password" || field === "loginPassword") {
			if (value.length < 6) {
				showError("Password must be at least 6 characters long");
				return false;
			}
		}

		return true;
	};

	// --- HANDLERS ---

	const handleChange = (e, field, type, index) => {
		let value = e.target.value;

		// Phone number - Only allow digits, max 10
		if (field === "phone") {
			value = value.replace(/\D/g, "").slice(0, 10);
		}

		// Full Name and City - Only allow letters and spaces
		if (field === "fullName" || field === "city") {
			value = value.replace(/[^a-zA-Z\s]/g, "");
		}

		// If typing in portfolio, clear the file object (user switched to link mode)
		if (field === "portfolio") {
			setFormData((prev) => ({
				...prev,
				portfolio: value,
				portfolioFile: null,
			}));
		} else {
			setFormData((prev) => ({ ...prev, [field]: value }));
		}

		updateInputWidth(e.target);

		// Auto-progress for select dropdowns
		if (type === "select" && value !== "") {
			e.target.blur();
			setTimeout(() => {
				// Scroll logic: Ensure next field is in view
				if (scrollContainerRef.current) {
					setTimeout(() => {
						const nextEl = inputRefs.current[index + 1];
						if (nextEl)
							nextEl.scrollIntoView({ behavior: "smooth", block: "center" });
					}, 100);
				}

				// Progress to next step
				if (index < currentSteps.length - 1) {
					setStep(index + 1);
				} else {
					setStep(index + 1);
					gsap.to(submitRef.current, {
						opacity: 1,
						y: 0,
						duration: 0.5,
						pointerEvents: "auto",
					});
				}
			}, 300);
		}
	};

	const handleFileChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			// Validate Type
			const validTypes = [
				"application/pdf",
				"image/jpeg",
				"image/png",
				"image/webp",
			];
			if (!validTypes.includes(file.type)) {
				alert("Invalid file type. Please upload a PDF or Image (JPG/PNG).");
				return;
			}

			// Update State: Set text to filename, store file object
			setFormData((prev) => ({
				...prev,
				portfolio: file.name,
				portfolioFile: file,
			}));

			// Auto-Focus back to the text input so they can press Enter
			const portfolioIndex = registerSteps.findIndex(
				(s) => s.field === "portfolio"
			);
			setTimeout(() => {
				if (inputRefs.current[portfolioIndex]) {
					inputRefs.current[portfolioIndex].focus();
					updateInputWidth(inputRefs.current[portfolioIndex]);
				}
			}, 100);
		}
	};

	const handleKeyDown = (e, index) => {
		if (e.key === "Enter") {
			e.preventDefault();
			const currentStep = currentSteps[index];
			const value = e.target.value.trim();

			// Check if field is empty
			if (value === "") {
				showError("This field is required");
				return;
			}

			// Validate the field before progressing
			if (!validateField(currentStep.field, value)) {
				return;
			}

			// Scroll logic: Ensure next field is in view
			if (scrollContainerRef.current) {
				// Small timeout to allow render, then scroll slightly if needed
				setTimeout(() => {
					const nextEl = inputRefs.current[index + 1];
					if (nextEl)
						nextEl.scrollIntoView({ behavior: "smooth", block: "center" });
				}, 100);
			}

			if (index < currentSteps.length - 1) {
				setStep(index + 1);
			} else {
				setStep(index + 1);
				gsap.to(submitRef.current, {
					opacity: 1,
					y: 0,
					duration: 0.5,
					pointerEvents: "auto",
				});
			}
		}
	};

	// Updated Phase Transition to handle "Go Back"
	const handlePhaseTransition = (newPhase, restoreState = false) => {
		// 1. Fade Out Current Content
		gsap.to(".form-sentence, .submit-wrapper", {
			opacity: 0,
			y: -20,
			duration: 0.4,
			onComplete: () => {
				// 2. Switch Phase
				setPhase(newPhase);

				// 3. Determine Step
				if (restoreState && newPhase === "register") {
					setIsRestoring(true); // Flag to skip animation
					setStep(registerSteps.length); // Set step to max to show all
				} else {
					setIsRestoring(false);
					setStep(0);
				}

				inputRefs.current = [];

				// 4. Fade In New Content
				gsap.set(".form-sentence", { y: 0, opacity: 1 });

				// If restoring, show submit button immediately
				if (restoreState && newPhase === "register") {
					gsap.set(".submit-wrapper", {
						y: 0,
						opacity: 1,
						pointerEvents: "auto",
					});
				} else {
					gsap.set(".submit-wrapper", {
						y: 20,
						opacity: 0,
						pointerEvents: "none",
					});
				}
			},
		});
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");

		if (phase === "register") {
			// Validate all registration fields before moving to password
			const fieldsToValidate = [
				{ field: "fullName", value: formData.fullName },
				{ field: "city", value: formData.city },
				{ field: "phone", value: formData.phone },
				{ field: "email", value: formData.email },
				{ field: "portfolio", value: formData.portfolio },
			];

			for (const { field, value } of fieldsToValidate) {
				if (!value.trim()) {
					showError("Please fill in all required fields");
					return;
				}
				if (!validateField(field, value)) {
					return;
				}
			}

			handlePhaseTransition("password");
		} else if (phase === "password") {
			// Validate password fields
			if (!validateField("password", formData.password)) {
				return;
			}

			if (formData.password !== formData.confirmPassword) {
				showError("Passwords do not match!");
				return;
			}

			// Submit registration to backend
			setIsSubmitting(true);
			try {
				// Show different message if uploading file
				if (formData.portfolioFile) {
					console.log("Uploading portfolio file...");
				}

				const response = await registerParticipant(formData);

				if (response.success) {
					console.log("Registration successful:", response.data);
					handlePhaseTransition("login");
				}
			} catch (error) {
				console.error("Registration error:", error);
				showError(error.message || "Registration failed. Please try again.");
			} finally {
				setIsSubmitting(false);
			}
		} else if (phase === "login") {
			// Validate login fields
			if (!validateField("loginEmail", formData.loginEmail)) {
				return;
			}
			if (!validateField("loginPassword", formData.loginPassword)) {
				return;
			}

			// Handle universal login (admin or participant)
			setIsSubmitting(true);
			try {
				const response = await login(
					formData.loginEmail,
					formData.loginPassword
				);

				if (response.success) {
					if (response.role === "admin") {
						console.log("Admin login successful");
						router.push("/admin/portfolios");
					} else {
						console.log(
							"Participant login successful:",
							response.data.participant
						);
						router.push("/dashboard");
					}
				}
			} catch (error) {
				console.error("Login error:", error);
				showError(
					error.message || "Login failed. Please check your credentials."
				);
			} finally {
				setIsSubmitting(false);
			}
		}
	};

	useGSAP(() => {
		// Only run the "Appear" animation if we are NOT restoring state
		// If restoring, everything renders visible by default due to React logic
		if (!isRestoring && step < currentSteps.length) {
			const elementId = `#step-${phase}-${step}`;
			const el = document.querySelector(elementId);

			if (el) {
				gsap.fromTo(
					el,
					{ opacity: 0, y: 30 },
					{ opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
				);
				setTimeout(() => {
					if (inputRefs.current[step]) inputRefs.current[step].focus();
				}, 100);
			}

			// Animate the nav-hint to be visible
			gsap.to(".nav-hint", {
				opacity: 1,
				duration: 0.5,
				delay: 0.3,
				ease: "power2.out",
			});
		} else {
			// Hide nav-hint when form is complete or restoring
			gsap.to(".nav-hint", {
				opacity: 0,
				duration: 0.3,
			});
		}
	}, [step, phase, isRestoring]);

	return (
		<>
			<div className="register-wrapper">
				<div className="register-top-bar">
					<div className="page-title">
						Register <span className="cursive-accent">Yourself</span>
					</div>
					<div className="top-nav-buttons">
						<button className="back-nav-btn" onClick={() => router.push("/")}>
							<ArrowLeftIcon className="hidden-in-mobile" />
							Back
						</button>
						{phase !== "login" && (
							<button
								className="login-nav-btn"
								onClick={() => handlePhaseTransition("login")}
							>
								Login
							</button>
						)}
						{phase === "login" && (
							<button
								className="login-nav-btn"
								onClick={() => handlePhaseTransition("register")}
							>
								Register
							</button>
						)}
					</div>
				</div>
			</div>

			{/* Error Popup */}
			{showErrorPopup && (
				<div className="error-popup">
					<div className="error-popup-content">
						<svg
							className="error-icon"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
						>
							<circle cx="12" cy="12" r="10" />
							<line x1="12" y1="8" x2="12" y2="12" />
							<line x1="12" y1="16" x2="12.01" y2="16" />
						</svg>
						<p>{fieldError}</p>
					</div>
				</div>
			)}

			<div
				className="register-page"
				ref={containerRef}
				style={{
					// Force CSS variables inline to prevent any override issues
					"--base-100": "#e3e3db",
					"--base-200": "#ccccc4",
					"--base-300": "#8c7e77",
					"--base-400": "#1a1614",
					"--base-500": "#ff6e14",
					"--accent-1": "#3d2fa9",
					"--accent-2": "#a92f78",
					"--accent-3": "#ff3d33", // RED - not yellow!
					"--accent-4": "#785f47",
					"--accent-5": "#2f72a9",
				}}
			>
				<form className="register-container" onSubmit={handleSubmit}>
					{/* SAFE AREA CONTAINER (Solves the navbar overlap issue) */}

					<span ref={sizerRef} className="input-sizer-ghost"></span>
					<div className="form-scroll-container" ref={scrollContainerRef}>
						<div className="form-sentence">
							{currentSteps.map(
								(item, index) =>
									(step >= index || isRestoring) && (
										<div
											key={`${phase}-${item.id}`}
											id={`step-${phase}-${index}`}
											className={`sentence-part ${
												step >= index ? "visible" : ""
											}`}
										>
											<span>{item.pre}</span>

											<div className="input-wrapper">
												{item.type === "select" ? (
													<select
														ref={(el) => (inputRefs.current[index] = el)}
														name={item.field}
														className="register-select"
														value={formData[item.field]}
														onChange={(e) =>
															handleChange(e, item.field, item.type, index)
														}
														onKeyDown={(e) => handleKeyDown(e, index)}
														required
													>
														<option value="" disabled>
															{item.placeholder}
														</option>
														{item.options.map((opt) => (
															<option key={opt} value={opt}>
																{opt}
															</option>
														))}
													</select>
												) : item.field === "portfolio" ? (
													<div className="portfolio-wrapper">
														<input
															ref={(el) => (inputRefs.current[index] = el)}
															type="text"
															name={item.field}
															className={`register-input ${
																formData.portfolioFile ? "has-file" : ""
															}`}
															placeholder={item.placeholder}
															value={formData[item.field]}
															onChange={(e) =>
																handleChange(e, item.field, item.type, index)
															}
															onKeyDown={(e) => handleKeyDown(e, index)}
															autoComplete="off"
															required
														/>

														{/* Attachment Trigger */}
														<label
															htmlFor="portfolio-upload"
															className="file-upload-btn"
															title="Upload PDF or Image"
														>
															{/* SVG Paperclip Icon */}
															<svg viewBox="0 0 24 24">
																<path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5a2.5 2.5 0 0 1 5 0v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5a2.5 2.5 0 0 0 5 0V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z" />
															</svg>
														</label>

														{/* Hidden File Input */}
														<input
															id="portfolio-upload"
															type="file"
															className="hidden-file-input"
															accept="application/pdf, image/png, image/jpeg, image/webp"
															onChange={handleFileChange}
															ref={fileInputRef}
														/>
													</div>
												) : item.type === "password" ? (
													<div className="password-input-wrapper">
														<input
															ref={(el) => (inputRefs.current[index] = el)}
															type={
																item.field === "password"
																	? showPassword
																		? "text"
																		: "password"
																	: item.field === "confirmPassword"
																	? showConfirmPassword
																		? "text"
																		: "password"
																	: item.field === "loginPassword"
																	? showLoginPassword
																		? "text"
																		: "password"
																	: "password"
															}
															name={item.field}
															className="register-input password-input"
															placeholder={item.placeholder}
															value={formData[item.field]}
															onChange={(e) =>
																handleChange(e, item.field, item.type, index)
															}
															onKeyDown={(e) => handleKeyDown(e, index)}
															autoComplete="off"
															required
														/>
														<button
															type="button"
															className="toggle-password-btn"
															onClick={() => {
																if (item.field === "password") {
																	setShowPassword(!showPassword);
																} else if (item.field === "confirmPassword") {
																	setShowConfirmPassword(!showConfirmPassword);
																} else if (item.field === "loginPassword") {
																	setShowLoginPassword(!showLoginPassword);
																}
															}}
															tabIndex={-1}
														>
															{(item.field === "password" && showPassword) ||
															(item.field === "confirmPassword" &&
																showConfirmPassword) ||
															(item.field === "loginPassword" &&
																showLoginPassword) ? (
																<svg
																	viewBox="0 0 24 24"
																	fill="none"
																	stroke="currentColor"
																	strokeWidth="2"
																>
																	<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
																	<circle cx="12" cy="12" r="3" />
																</svg>
															) : (
																<svg
																	viewBox="0 0 24 24"
																	fill="none"
																	stroke="currentColor"
																	strokeWidth="2"
																>
																	<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
																	<line x1="1" y1="1" x2="23" y2="23" />
																</svg>
															)}
														</button>
													</div>
												) : (
													<input
														ref={(el) => (inputRefs.current[index] = el)}
														type={item.type}
														name={item.field}
														className="register-input"
														placeholder={item.placeholder}
														value={formData[item.field]}
														onChange={(e) =>
															handleChange(e, item.field, item.type, index)
														}
														onKeyDown={(e) => handleKeyDown(e, index)}
														autoComplete="off"
														required
													/>
												)}
											</div>

											<span>{item.post}</span>
										</div>
									)
							)}
						</div>
					</div>

					{/* SUBMIT AREA */}
					<div className="submit-wrapper" ref={submitRef}>
						{phase === "password" && (
							<button
								type="button"
								className="back-btn"
								onClick={() => handlePhaseTransition("register", true)}
								disabled={isSubmitting}
							>
								← Back
							</button>
						)}
						<button
							type="submit"
							className="submit-btn"
							disabled={isSubmitting}
						>
							{isSubmitting ? (
								<>
									{phase === "password" && "Registering..."}
									{phase === "login" && "Logging in..."}
								</>
							) : (
								<>
									{phase === "register" && "Set Password →"}
									{phase === "password" && "Complete Registration"}
									{phase === "login" && "Enter Visual Vault"}
								</>
							)}
						</button>
					</div>
				</form>

				{/* Hint only if not finished and not restoring */}
				{!isRestoring && step < currentSteps.length && (
					<div className="nav-hint">
						<span>PRESS</span>
						<span className="enter-key-icon">ENTER ↵</span>
						<span>TO CONTINUE</span>
					</div>
				)}
			</div>
		</>
	);
};

export default Register;
