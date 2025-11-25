"use client";
import React, { useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import "./FAQ.css";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const FAQ = () => {
	const faqSectionRef = useRef(null);
	const [openIndex, setOpenIndex] = useState(null);

	const faqs = [
		{
			question: "Is this an online or offline event?",
			answer:
				"Offline! Pure vibes, live energy, and actual face-to-face creative chaos at Golden Acre.",
		},
		{
			question: "Can I participate in more than one category?",
			answer:
				"You can choose one and slay it. But for the Main ArtIcon Title, you'll need to ace all three!",
		},
		{
			question: "Are AI tools allowed?",
			answer:
				"Yes! It's encouraged, bas use it smartly. AI se assist lo, replace nahi!",
		},
		{
			question: "Do I need to bring my own equipment?",
			answer:
				"Yes!! Laptop, software, and imagination sab apna laana hai. Power points hum denge.",
		},
		{
			question: "Will food be provided?",
			answer: "Of course! Creatives can't design on empty stomachs.",
		},
	];

	useGSAP(
		() => {
			// Animate title on scroll
			const title = faqSectionRef.current?.querySelector(".faq-title");
			const subtitle = faqSectionRef.current?.querySelector(".faq-subtitle");

			if (title) {
				gsap.from(title, {
					opacity: 0,
					y: 50,
					duration: 1,
					ease: "power2.out",
					scrollTrigger: {
						trigger: title,
						start: "top 80%",
						toggleActions: "play none none none",
					},
				});
			}

			if (subtitle) {
				gsap.from(subtitle, {
					opacity: 0,
					y: 30,
					duration: 1,
					delay: 0.2,
					ease: "power2.out",
					scrollTrigger: {
						trigger: subtitle,
						start: "top 80%",
						toggleActions: "play none none none",
					},
				});
			}

			// Animate FAQ items
			const faqItems = gsap.utils.toArray(".faq-item");
			faqItems.forEach((item, index) => {
				gsap.from(item, {
					opacity: 0,
					y: 30,
					duration: 0.8,
					delay: index * 0.1,
					ease: "power2.out",
					scrollTrigger: {
						trigger: item,
						start: "top 85%",
						toggleActions: "play none none none",
					},
				});
			});
		},
		{ scope: faqSectionRef }
	);

	const toggleFAQ = (index) => {
		setOpenIndex(openIndex === index ? null : index);
	};

	return (
		<section className="faq-section" ref={faqSectionRef}>
			<div className="faq-container">
				<h1 className="faq-title">Still Confused? Chill, Picasso!</h1>
				<p className="faq-subtitle">
					Tere saare sawaalon ke creative jawab yahi milenge
				</p>

				<div className="faq-list">
					{faqs.map((faq, index) => (
						<div
							key={index}
							className={`faq-item ${openIndex === index ? "open" : ""}`}
						>
							<div className="faq-question" onClick={() => toggleFAQ(index)}>
								<span>{faq.question}</span>
								<span className="faq-icon">
									{openIndex === index ? "−" : "+"}
								</span>
							</div>
							<div className="faq-answer">
								<div className="faq-answer-content">
									<span className="faq-arrow">&gt;</span>
									<p>{faq.answer}</p>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</section>
	);
};

export default FAQ;
