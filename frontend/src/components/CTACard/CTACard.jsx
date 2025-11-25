"use client";
import "./CTACard.css";
import Button from "../Button/Button";
import Copy from "../Copy/Copy";

const CTACard = () => {
	return (
		<section className="cta">
			<div className="container">
				<div className="cta-copy" style={{ backgroundColor: "#e0dede", borderRadius: "15px", padding: "2em" }}>
					<Copy animateOnScroll={true}>
						<p className="lg">
							Every Great Creation Starts With Understanding The Guidelines!
						</p>
					</Copy>

					<Button
						animateOnScroll={true}
						delay={0.25}
						variant="dark"
						href="/rules.pdf"
						download
					>
						Rules & Guidelines
					</Button>
				</div>

				<div className="contact-pill-btn">
					<a href="/register"></a>
					<div className="contact-text-large">
						<h1>Register Now</h1>
					</div>
				</div>
			</div>
		</section>
	);
};

export default CTACard;
