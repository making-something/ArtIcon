"use client";
import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import "./registration.css";
import { registerParticipant, loginParticipant } from "@/services/api";

const Register = () => {
	const router = useRouter();
	const [phase, setPhase] = useState("register");
	const [step, setStep] = useState(0);
	const [isRestoring, setIsRestoring] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState("");

	const [formData, setFormData] = useState({
		fullName: "",
		city: "",
		role: "",
		experience: "", // Changed default to empty string so placeholder shows initially
		organization: "",
		specialization: "",
		source: "",
		portfolio: "",
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
			field: "experience",
			type: "number",
			pre: " with ",
			post: " years of experience.",
			placeholder: "0",
		},
		{
			id: 4,
			field: "organization",
			type: "text",
			pre: " I represent ",
			post: " ",
			placeholder: "ORG / COLLEGE NAME",
		},
		{
			id: 5,
			field: "specialization",
			type: "select",
			options: ["UI/UX Design", "Video Editing", "Graphic Design"],
			pre: " and specialize in and want to participate in ",
			post: " .",
			placeholder: "CHOOSE FIELD",
		},
		{
			id: 6,
			field: "source",
			type: "select",
			options: [
				"Social Media (IG/LinkedIn)",
				"Friend / Referral",
				"Google Search",
				"College Announcement",
				"Other",
			],
			pre: " I came to know about this competition through ",
			post: " .",
			placeholder: "SELECT SOURCE",
		},
		{
			id: 7,
			field: "portfolio",
			type: "text",
			pre: " I am submitting my portfolio/project work attached/uploaded here: ",
			post: " .",
			placeholder: "DRIVE / BEHANCE LINK",
		},
		{
			id: 8,
			field: "phone",
			type: "tel",
			pre: " You may contact me at ",
			post: " ",
			placeholder: "PHONE NUMBER",
		},
		{
			id: 9,
			field: "email",
			type: "email",
			pre: " or ",
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

	// --- HANDLERS ---

	const handleChange = (e, field) => {
		let value = e.target.value;
		if (field === "experience" && value < 0) value = 0;

		setFormData({ ...formData, [field]: value });

		// Trigger resize immediately on change
		updateInputWidth(e.target);
	};

	const handleKeyDown = (e, index) => {
		if (e.key === "Enter") {
			e.preventDefault();
			if (e.target.value.trim() !== "") {
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
			handlePhaseTransition("password");
		} else if (phase === "password") {
			if (formData.password !== formData.confirmPassword) {
				setError("Passwords do not match!");
				alert("Passwords do not match!");
				return;
			}

			// Submit registration to backend
			setIsSubmitting(true);
			try {
				const response = await registerParticipant(formData);

				if (response.success) {
					console.log("Registration successful:", response.data);
					alert("Registration Successful! You can now login.");
					handlePhaseTransition("login");
				}
			} catch (error) {
				console.error("Registration error:", error);
				setError(error.message || "Registration failed. Please try again.");
				alert(error.message || "Registration failed. Please try again.");
			} finally {
				setIsSubmitting(false);
			}
		} else if (phase === "login") {
			// Handle login
			setIsSubmitting(true);
			try {
				const response = await loginParticipant(
					formData.loginEmail,
					formData.loginPassword
				);

				if (response.success) {
					console.log("Login successful:", response.participant);
					alert("Login Successful! Redirecting to dashboard...");
					// Redirect to dashboard or home page
					router.push("/");
				}
			} catch (error) {
				console.error("Login error:", error);
				setError(
					error.message || "Login failed. Please check your credentials."
				);
				alert(error.message || "Login failed. Please check your credentials.");
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
		}
	}, [step, phase, isRestoring]);

	return (
		<>
			<div className="register-top-bar">
				<div className="page-title">
					Register <span className="cursive-accent">Yourself</span>
				</div>
				<div>
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

			<div className="register-page" ref={containerRef}>
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
														onChange={(e) => handleChange(e, item.field)}
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
												) : (
													<input
														ref={(el) => (inputRefs.current[index] = el)}
														type={item.type}
														name={item.field}
														className="register-input"
														placeholder={item.placeholder}
														value={formData[item.field]}
														onChange={(e) => handleChange(e, item.field)}
														onKeyDown={(e) => handleKeyDown(e, index)}
														autoComplete="off"
														min={item.field === "experience" ? "0" : undefined}
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
