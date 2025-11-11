"use client";
import "./sample-project.css";
import Footer from "@/components/Footer/Footer";
import Copy from "@/components/Copy/Copy";

const Page = () => {
  return (
    <div className="sample-project-page">
      <section className="project-header">
        <Copy delay={0.75}>
          <p className="lg">Engineered Perfection</p>
          <h1>Gunmetal Dream</h1>
        </Copy>
      </section>

      <section className="project-banner-img">
        <div className="project-banner-img-wrapper">
          <img src="/project/sample-project-1.jpg" alt="" />
        </div>
      </section>

      <section className="project-details">
        <Copy animateOnScroll={true}>
          <div className="details">
            <p>Concept</p>
            <h3>
              A visual narrative set in a metallic dreamscape, Gunmetal Dream
              explores the tension between machine and memory where emotion
              flickers inside engineered perfection.
            </h3>
          </div>

          <div className="details">
            <p>Cycle</p>
            <h3>2025</h3>
          </div>

          <div className="details">
            <p>Form</p>
            <h3>Digital Art Series</h3>
          </div>

          <div className="details">
            <p>Medium</p>
            <h3>3D Design and Motion</h3>
          </div>

          <div className="details">
            <p>Studio</p>
            <h3>Polite Chaos</h3>
          </div>
        </Copy>
      </section>

      <section className="project-images">
        <div className="project-images-container">
          <div className="project-img">
            <div className="project-img-wrapper">
              <img src="/project/sample-project-2.jpg" alt="" />
            </div>
          </div>

          <div className="project-img">
            <div className="project-img-wrapper">
              <img src="/project/sample-project-3.jpg" alt="" />
            </div>
          </div>

          <div className="project-img">
            <div className="project-img-wrapper">
              <img src="/project/sample-project-4.jpg" alt="" />
            </div>
          </div>

          <div className="project-img">
            <div className="project-img-wrapper">
              <img src="/project/sample-project-5.jpg" alt="" />
            </div>
          </div>

          <div className="project-img">
            <div className="project-img-wrapper">
              <img src="/project/sample-project-6.jpg" alt="" />
            </div>
          </div>
        </div>
      </section>

      <section className="project-details">
        <Copy animateOnScroll={true}>
          <div className="details">
            <p>Assembly</p>
            <h3>Rhea Korrin</h3>
          </div>

          <div className="details">
            <p>Sound</p>
            <h3>Ezra Lowell</h3>
          </div>

          <div className="details">
            <p>Direction of Form</p>
            <h3>Jun Park</h3>
          </div>

          <div className="details">
            <p>Production</p>
            <h3>Isla Trent</h3>
          </div>

          <div className="details">
            <p>Vision Lead</p>
            <h3>Kael Morrow</h3>
          </div>
        </Copy>
      </section>

      <section className="next-project">
        <Copy animateOnScroll={true}>
          <p style={{ marginBottom: "1rem" }}>02 - 05</p>
          <h2>Next</h2>
        </Copy>

        <div className="next-project-img">
          <div className="next-project-img-wrapper">
            <img src="/project/next-project.jpg" alt="" />
          </div>
        </div>

        <Copy animateOnScroll={true}>
          <h3>Stoneface</h3>
        </Copy>
      </section>

      <Footer />
    </div>
  );
};

export default Page;
