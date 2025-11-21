"use client";
import "./Footer.css";
import { useEffect, useRef } from "react";

const imageParticleCount = 10;
const imagePaths = Array.from(
	{ length: imageParticleCount },
	(_, i) => `/images/work-items/work-item-${i + 1}.avif`
);

const addressLine =
	"Office No 301/302/303, Rumi Plaza, Third Floor, Maruti Nagar 3 Corner, Airport Road, Rajkot, Gujarat 360005, India";

const socialLinks = [
	{
		label: "FB",
		name: "Facebook",
		href: "https://www.facebook.com/multiiconofficial/",
	},
	{
		label: "IN",
		name: "Instagram",
		href: "https://www.instagram.com/account",
	},
	{
		label: "LI",
		name: "LinkedIn",
		href: "https://www.linkedin.com/company/mulitiicon/",
	},
];

const Footer = () => {
	const footerRef = useRef(null);
	const explosionRef = useRef(null);

	useEffect(() => {
		const footerElement = footerRef.current;
		const explosionElement = explosionRef.current;
		if (!footerElement || !explosionElement) return;

		let hasExploded = false;
		let animationId;
		let checkTimeout;
		let initialTimeout;

		const config = {
			gravity: 0.25,
			friction: 0.99,
			imageSize: 150,
			horizontalForce: 20,
			verticalForce: 15,
			rotationSpeed: 10,
		};

		imagePaths.forEach((path) => {
			const img = new Image();
			img.src = path;
			return img;
		});

		class Particle {
			constructor(element) {
				this.element = element;
				this.x = 0;
				this.y = 0;
				this.vx = (Math.random() - 0.5) * config.horizontalForce;
				this.vy = -config.verticalForce - Math.random() * 10;
				this.rotation = 0;
				this.rotationSpeed = (Math.random() - 0.5) * config.rotationSpeed;
			}

			update() {
				this.vy += config.gravity;
				this.vx *= config.friction;
				this.vy *= config.friction;
				this.rotationSpeed *= config.friction;
				this.x += this.vx;
				this.y += this.vy;
				this.rotation += this.rotationSpeed;

				this.element.style.transform = `translate(${this.x}px, ${this.y}px) rotate(${this.rotation}deg)`;
			}
		}

		const createParticles = () => {
			if (!explosionElement) return;
			explosionElement.innerHTML = "";

			imagePaths.forEach((path) => {
				const particle = document.createElement("img");
				particle.src = path;
				particle.classList.add("explosion-particle-img");
				explosionElement.appendChild(particle);
			});
		};

		const explode = () => {
			if (hasExploded || !explosionElement) return;
			hasExploded = true;

			createParticles();

			const particleElements = explosionElement.querySelectorAll(
				".explosion-particle-img"
			);
			const particles = Array.from(particleElements).map(
				(element) => new Particle(element)
			);

			const animate = () => {
				particles.forEach((particle) => particle.update());
				animationId = requestAnimationFrame(animate);

				if (
					explosionElement &&
					particles.every(
						(particle) => particle.y > explosionElement.offsetHeight / 2
					)
				) {
					cancelAnimationFrame(animationId);
				}
			};

			animate();
		};

		const checkFooterPosition = () => {
			if (!footerElement) return;

			const footerRect = footerElement.getBoundingClientRect();
			const viewportHeight = window.innerHeight;

			if (footerRect.top > viewportHeight + 100) {
				hasExploded = false;
			}

			if (!hasExploded && footerRect.top <= viewportHeight + 250) {
				explode();
			}
		};

		const handleScroll = () => {
			clearTimeout(checkTimeout);
			checkTimeout = window.setTimeout(checkFooterPosition, 5);
		};

		const handleResize = () => {
			hasExploded = false;
		};

		createParticles();
		initialTimeout = window.setTimeout(checkFooterPosition, 500);

		window.addEventListener("scroll", handleScroll);
		window.addEventListener("resize", handleResize);

		return () => {
			window.removeEventListener("scroll", handleScroll);
			window.removeEventListener("resize", handleResize);
			clearTimeout(checkTimeout);
			clearTimeout(initialTimeout);
			cancelAnimationFrame(animationId);
			if (explosionElement) {
				explosionElement.innerHTML = "";
			}
		};
	}, []);

	return (
		<footer ref={footerRef} className="otis-footer">
			<div className="footer-container">
				<div className="footer-symbols footer-symbols-1">
					<img src="/images/global/s6.avif" alt="" />
					<img src="/images/global/s6.avif" alt="" />
				</div>
				<div className="footer-symbols footer-symbols-2">
					<img src="/images/global/s6.avif" alt="" />
					<img src="/images/global/s6.avif" alt="" />
				</div>
				<div className="footer-header">
					<h1>ArtIcon</h1>
				</div>
				<div className="footer-row">
					<div className="footer-col footer-col-address">
						<div
							className="footer-col-heading"
							role="img"
							aria-label="MultiIcon HQ"
						>
							<img src="/multiicon.avif" alt="MultiIcon" />
						</div>
						<p className="footer-address-line">
							Office No 301,
							<br /> Rumi Plaza,
							<br /> Third Floor,
							<br /> Maruti Nagar 3 Corner,
							<br /> Airport Road, Rajkot, Gujarat 360005, India
						</p>
					</div>
					<div className="footer-col footer-col-contact">
						<p>Contact Us</p>
						<div className="footer-contact-card">
							<div>
								<p className="footer-contact-label"></p>
								<p className="footer-contact-link">
									<a href="tel:++919377769938">+91 9377769938</a>
								</p>
							</div>
							<div>
								<p className="footer-contact-label"></p>
								<p className="footer-contact-link">
									<a href="mailto:media@multiicon.com">media@multiicon.com</a>
								</p>
							</div>
						</div>
					</div>
					<div className="footer-col footer-col-social">
						<p>Social Pulse</p>
						{socialLinks.map((link) => (
							<p className="footer-social-item" key={link.href}>
								<span className="footer-social-tag">{link.label}</span>
								<a
									href={link.href}
									target="_blank"
									rel="noreferrer noopener"
									className="footer-social-link"
								>
									{link.name}
								</a>
							</p>
						))}
					</div>
				</div>
				<div className="copyright-info">
					<p className="mn">//////////////</p>
				</div>
				<div className="explosion-container" ref={explosionRef}></div>
			</div>
		</footer>
	);
};

export default Footer;
