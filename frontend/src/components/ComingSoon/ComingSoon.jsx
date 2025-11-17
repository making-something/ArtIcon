"use client";

import { useEffect } from "react";
import styles from "./ComingSoon.module.css";

export default function ComingSoon() {
  useEffect(() => {
    const parallax = (event) => {
      document.querySelectorAll(".layer").forEach((layer) => {
        const speed = Number(layer.dataset.speed ?? 0);
        const x = (window.innerWidth - event.pageX * speed) / 150;
        const y = (window.innerHeight - event.pageY * speed) / 150;
        layer.style.transform = `translateX(${x}px) translateY(${y}px)`;
      });
    };

    document.addEventListener("mousemove", parallax, { passive: true });
    return () => document.removeEventListener("mousemove", parallax);
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.navbar}>
        <div className={styles.logo}>
          <img src="/coming-soon/logo.svg" alt="" className={styles.logoImg} />
        </div>
        <div className={styles.menuBtn}></div>
      </div>

      <div className={styles.header}>
        Our team has crafted impactful, full-service work that finds <br />
        your audience where they already are.
      </div>

      <div className={styles.marquee}>
        <span>
          Coming soon &nbsp; • &nbsp; Coming soon &nbsp; • &nbsp; Coming soon &nbsp; •
          &nbsp; Coming soon &nbsp; • &nbsp; Coming soon &nbsp; • &nbsp; Coming soon
          &nbsp; • &nbsp; Coming soon &nbsp; • &nbsp; Coming soon &nbsp; • &nbsp;
          Coming soon
        </span>
      </div>

      <section className={styles.section}>
        <img
          src="/coming-soon/sticker-1.svg"
          alt=""
          data-speed="-10"
          className={`layer ${styles.img1}`}
        />
        <img
          src="/coming-soon/sticker-2.svg"
          alt=""
          data-speed="8"
          className={`layer ${styles.img2}`}
        />
      </section>
    </div>
  );
}
