"use client";
import "./home.css";
import ClientReviews from "@/components/ClientReviews/ClientReviews";
import Spotlight from "@/components/Spotlight/Spotlight";
import CTACard from "@/components/CTACard/CTACard";
import Footer from "@/components/Footer/Footer";
import Preloader from "@/components/Preloader/Preloader";
import React, { useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import JunoLanding from "@/components/JunoLanding/JunoLanding";
import EventOverview from "@/components/EventOverview/EventOverview";
import Timeline from "@/components/Timeline/Timeline";
import TeamCards from "@/components/TeamCards/TeamCards";

gsap.registerPlugin(ScrollTrigger);

const Page = () => {
  useEffect(() => {
    const rafId = requestAnimationFrame(() => {
      ScrollTrigger.refresh(true);
    });

    const onLoad = () => ScrollTrigger.refresh(true);
    window.addEventListener("load", onLoad, { passive: true });

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("load", onLoad);
    };
  }, []);

  return (
    <>
      <Preloader />
      <JunoLanding />
      <EventOverview />
      <Timeline />
      <TeamCards />
      <ClientReviews />
      <Spotlight />
      <CTACard />
      <Footer />
    </>
  );
};

export default Page;
