"use client";
import React, { useState, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import "./registration.css";

const Register = () => {
	const [step, setStep] = useState(0);
	const [formData, setFormData] = useState({
		fullName: "",
		city: "",
		email: "",
		phone: "",
		portfolio: "",
	});

	// Refs for auto-focusing
	const containerRef = useRef(null);
	const inputRefs = useRef([]);
	const submitRef = useRef(null);

	// Data definition to drive the UI
	const formSteps = [
		{
			id: 0,
			preText: "Hi, I am ",
			placeholder: "YOUR FULL NAME",
			field: "fullName",
			type: "text",
			postText: ",",
		},
		{
			id: 1,
			preText: " currently living in ",
			placeholder: "YOUR CITY",
			field: "city",
			type: "text",
			postText: ".",
		},
		{
			id: 2,
			preText: " You can reach me at ",
			placeholder: "EMAIL ADDRESS",
			field: "email",
			type: "email",
			postText: "",
		},
		{
			id: 3,
			preText: " or call me on ",
			placeholder: "PHONE NUMBER",
			field: "phone",
			type: "tel",
			postText: ".",
		},
		{
			id: 4,
			preText: " Here is my work: ",
			placeholder: "PORTFOLIO LINK",
			field: "portfolio",
			type: "url",
			postText: ".",
		},
	];

	// Handle text change
	const handleChange = (e, field) => {
		setFormData({ ...formData, [field]: e.target.value });
	};

	// Handle Enter key to progress
	const handleKeyDown = (e, index) => {
		if (e.key === "Enter") {
			e.preventDefault();
			// Simple validation: must not be empty
			if (e.target.value.trim() !== "") {
				if (index < formSteps.length - 1) {
					setStep(index + 1);
				} else {
					// Reached end, reveal submit
					setStep(index + 1);
					// Animate submit button
					gsap.to(submitRef.current, {
						opacity: 1,
						y: 0,
						duration: 0.5,
						delay: 0.2,
					});
				}
			}
		}
	};

	// Animate in the "Next" step whenever step changes
	useGSAP(() => {
		// 1. Animate the new sentence part
		if (step < formSteps.length) {
			const currentElement = document.getElementById(`step-${step}`);
			if (currentElement) {
				gsap.fromTo(
					currentElement,
					{ y: 50, opacity: 0 },
					{ y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }
				);

				// Auto focus the input
				setTimeout(() => {
					if (inputRefs.current[step]) {
						inputRefs.current[step].focus();
					}
				}, 100); // Small delay for render
			}
		}

		// 2. Animate the Navigation Hint on first load
		if (step === 0) {
			gsap.to(".nav-hint", { opacity: 1, delay: 1, duration: 1 });
		}
	}, [step]);

	const handleSubmit = (e) => {
		e.preventDefault();
		console.log("Form Submitted", formData);
		// Add your API logic here
		alert("Registration data captured! Check console.");
	};

	return (
		<div className="register-page" ref={containerRef}>
			<form className="register-container" onSubmit={handleSubmit}>
				<div className="form-sentence">
					{formSteps.map(
						(item, index) =>
							// Logic: Only render if the step is active or passed
							step >= index && (
								<div
									key={item.id}
									id={`step-${index}`}
									className={`sentence-part ${
										step >= index ? "visible" : ""
									}`}
								>
									<span>{item.preText}</span>

									<div className="input-wrapper">
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
											required
										/>
									</div>

									<span>{item.postText}</span>
								</div>
							)
					)}
				</div>

				{/* Submit Button Area */}
				<div
					className="submit-wrapper"
					ref={submitRef}
					style={{ transform: "translateY(20px)" }} /* Initial for anim */
				>
					<button type="submit" className="submit-btn">
						Complete Registration
					</button>
				</div>
			</form>

			{/* UX Hint */}
			{step < formSteps.length && (
				<div className="nav-hint">
					<span>PRESS</span>
					<span className="enter-key-icon">ENTER ↵</span>
					<span>TO CONTINUE</span>
				</div>
			)}
		</div>
	);
};

export default Register;

