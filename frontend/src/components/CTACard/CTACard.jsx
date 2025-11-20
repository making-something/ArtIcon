"use client";
import "./CTACard.css";
import Button from "../Button/Button";
import { MdArticle } from "react-icons/md";
import Copy from "../Copy/Copy";

const CTACard = () => {
	return (
		<section className="cta">
			<div className="container">
				<div className="cta-copy">
					<div className="cta-col">
						<Copy animateOnScroll={true}>
							<p className="sm">
								Kyu Banoge ArtIcon? <br /> Kyunki Ye Mauka Baar-Baar Nahi Aata!
							</p>
						</Copy>
					</div>

					<div className="cta-col">
						<Copy animateOnScroll={true}>
							<p className="lg">
								Jab Creativity aur Competition milte hai, tab banta hai Icon!
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
				</div>

				<div className="cta-card">
					<div className="cta-card-copy">
						<div className="cta-card-col">
							<Copy animateOnScroll={true}>
								<h3>What’s In It For You</h3>
							</Copy>
						</div>

						<div className="cta-card-col">
							<Copy animateOnScroll={true}>
								<p>
									Recognition and rewards that speak louder than your resume.
									Network with Gujarat's smartest creators and industry experts
									while collaborating with AI-driven tools and mentors from the
									design world.
								</p>

								<p>
									Build portfolio-worthy projects under time and theme pressure.
									Make friends (and rivals) from across Gujarat's design scene,
									get featured shoutouts across digital channels, and earn that
									priceless bragging right!
								</p>
							</Copy>

							<Button
								animateOnScroll={true}
								delay={0.25}
								variant="light"
								icon={MdArticle}
								href="/studio"
							>
								Register Now!
							</Button>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default CTACard;
