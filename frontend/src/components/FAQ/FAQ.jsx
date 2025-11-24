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
				"This is a fully offline event held at Multiicon's 4th Floor. You'll experience live energy, real-time collaboration vibes, and face-to-face creative competition!",
		},
		{
			question: "Do I need to complete all three categories?",
			answer:
				"Yes! To compete for the Main ArtIcon Trophy, you must complete all three tasks (UI/UX, Graphic Design, and Video Editing) under one unified theme. This tests your versatility as a complete creative professional.",
		},
		{
			question: "Are AI tools allowed?",
			answer:
				"Absolutely! AI tools are encouraged to enhance your creativity and productivity. Use them smartly to amplify your ideas, but remember — the creativity and storytelling should be yours!",
		},
		{
			question: "What equipment do I need to bring?",
			answer:
				"Bring your laptop with all necessary software pre-installed (design tools, video editors, etc.), chargers, and any other creative tools you prefer. We'll provide power outlets and WiFi. Make sure your software is licensed and ready to use!",
		},
		{
			question: "Will food and refreshments be provided?",
			answer:
				"Yes! We'll provide meals and refreshments throughout the day. Creatives can't design on empty stomachs, so we've got you covered!",
		},
		{
			question: "How will the judging work?",
			answer:
				"Three expert jury members will evaluate your work based on: (1) Creativity and originality, (2) Consistency across all three tasks, and (3) How well you tell a cohesive story through different mediums. It's not just about individual excellence — it's about unified creative vision!",
		},
		{
			question: "What if I'm not experienced in all three categories?",
			answer:
				"That's the challenge! ArtIcon is designed to push you out of your comfort zone and help you grow as a versatile creative. Use AI tools, learn on the go, and give it your best shot. You might surprise yourself!",
		},
		{
			question: "Can I work in a team?",
			answer:
				"No, this is a solo challenge. You'll work independently to showcase your individual versatility and creative skills across all three disciplines.",
		},
		{
			question: "What happens if I don't finish all three tasks?",
			answer:
				"You must complete all three tasks to be eligible for the Main ArtIcon Trophy. However, partial submissions may still be considered for category-specific runner-up prizes.",
		},
		{
			question: "How do I register and what's the deadline?",
			answer:
				"Click the 'Register Now' button on this website and fill out the form. Registration is limited to 100 participants, so register early! The deadline will be announced on our social media channels.",
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
