'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import './Timeline.css';

gsap.registerPlugin(ScrollTrigger);

// Clean SVG icon components
const TimelineIcon = ({ type }) => {
  const icons = {
    door: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="1" width="18" height="22" rx="2" ry="2"/>
        <circle cx="16" cy="12" r="1"/>
      </svg>
    ),
    microphone: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
        <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
        <line x1="12" y1="19" x2="12" y2="23"/>
        <line x1="8" y1="23" x2="16" y2="23"/>
      </svg>
    ),
    zap: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
      </svg>
    ),
    pizza: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 11h.01"/>
        <path d="M11 15h.01"/>
        <path d="M16 16h.01"/>
        <path d="m2 16 20 6-6-20A20 20 0 0 0 2 16"/>
        <path d="M5.71 17.11a17.04 17.04 0 0 1 11.4-11.4"/>
      </svg>
    ),
    chart: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/>
        <line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
    ),
    music: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 18V5l12-2v13"/>
        <circle cx="6" cy="18" r="3"/>
        <circle cx="18" cy="16" r="3"/>
      </svg>
    ),
    rocket: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
        <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>
        <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/>
        <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>
      </svg>
    ),
    trophy: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
        <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
        <path d="M4 22h16"/>
        <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
        <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
        <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
      </svg>
    )
  };

  return <div className="timeline-icon-svg" style={{ color: '#c9a876' }}>{icons[type]}</div>;
};

const defaultHackathonEvents = [
  {
    id: '1',
    time: '9:00 AM',
    title: 'Doors Open',
    description:
      'Welcome to the hackathon! Check in and grab some coffee while we set up.',
    icon: 'door'
  },
  {
    id: '2',
    time: '10:00 AM',
    title: 'Opening Ceremony',
    description:
      'Meet the judges, sponsors, and fellow hackers. Learn about the themes and prizes.',
    icon: 'microphone'
  },
  {
    id: '3',
    time: '11:00 AM',
    title: 'Hacking Begins',
    description:
      'Form your teams and start building. The 24-hour countdown begins now!',
    icon: 'zap'
  },
  {
    id: '4',
    time: '2:00 PM',
    title: 'Lunch Break',
    description:
      'Take a break and fuel up with our catered lunch. Network with other teams.',
    icon: 'pizza'
  },
  {
    id: '5',
    time: '6:00 PM',
    title: 'Midpoint Check-in',
    description:
      'Showcase your progress so far. Mentors available for guidance and feedback.',
    icon: 'chart'
  },
  {
    id: '6',
    time: '9:00 PM',
    title: 'Dinner & Entertainment',
    description:
      'Relax, recharge, and enjoy live music and games with your team.',
    icon: 'music'
  },
  {
    id: '7',
    time: '10:00 AM (Day 2)',
    title: 'Final Push',
    description:
      'Last hours to polish your project and prepare your pitch. Make it count!',
    icon: 'rocket'
  },
  {
    id: '8',
    time: '1:00 PM',
    title: 'Presentations & Awards',
    description:
      'Present your projects to the judges. Celebrate winners and recognize all efforts.',
    icon: 'trophy'
  }
];

export default function HackathonTimeline({ 
  events,
  title = "Hackathon Timeline"
}) {
  const safeEvents = useMemo(() => {
    if (Array.isArray(events) && events.length > 0) {
      return events;
    }
    return defaultHackathonEvents;
  }, [events]);
  const containerRef = useRef(null);
  const timelineRef = useRef(null);
  const eventsRef = useRef([]);

  useEffect(() => {
    if (!containerRef.current || !timelineRef.current) return;
    eventsRef.current = eventsRef.current.slice(0, safeEvents.length);

    const ctx = gsap.context(() => {
      // Progressive timeline line drawing based on scroll
      gsap.to('.timeline-line-fill', {
        scaleY: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: '.timeline-content-wrapper',
          start: 'top 80%',
          end: 'bottom 20%',
          scrub: 1
        }
      });

      // Animate each event
      eventsRef.current.forEach((event, index) => {
        if (!event) return;

        const isEven = index % 2 === 0;
        const card = event.querySelector('.timeline-card');
        const dot = event.querySelector('.timeline-dot');
        const icon = event.querySelector('.timeline-icon');

        // Cards slide in from their respective sides with rotation
        gsap.fromTo(
          card,
          {
            opacity: 0,
            x: isEven ? -80 : 80,
            rotateY: isEven ? -15 : 15,
            scale: 0.9
          },
          {
            opacity: 1,
            x: 0,
            rotateY: 0,
            scale: 1,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: event,
              start: 'top 75%',
              once: true
            }
          }
        );

        // Dots scale in with ripple effect
        if (dot) {
          gsap.fromTo(
            dot,
            { scale: 0, opacity: 0 },
            {
              scale: 1,
              opacity: 1,
              duration: 0.6,
              ease: 'back.out(2)',
              scrollTrigger: {
                trigger: event,
                start: 'top 75%',
                once: true
              },
              onComplete: () => {
                // Ripple pulse effect
                gsap.to(dot, {
                  boxShadow: '0 0 0 20px rgba(197, 170, 140, 0)',
                  duration: 1.5,
                  ease: 'power2.out'
                });
              }
            }
          );
        }

        // Icons bounce in after card appears
        const iconSvg = event.querySelector('.timeline-icon-svg');
        if (iconSvg) {
          gsap.fromTo(
            iconSvg,
            { scale: 0, rotation: -180 },
            {
              scale: 1,
              rotation: 0,
              duration: 0.8,
              ease: 'elastic.out(1, 0.5)',
              scrollTrigger: {
                trigger: event,
                start: 'top 75%',
                once: true
              },
              delay: 0.3
            }
          );
        }

        // Magnetic hover effect on cards with dynamic shadows
        if (card) {
          const handleMouseMove = (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            // Calculate shadow offset based on mouse position (reduced intensity)
            const shadowX = -x * 0.03;
            const shadowY = -y * 0.03;
            const shadowBlur = 24 + Math.abs(x * 0.015) + Math.abs(y * 0.015);

            gsap.to(card, {
              x: x * 0.05, // Reduced from 0.1
              y: y * 0.05, // Reduced from 0.1
              rotateX: -y * 0.02, // Reduced from 0.05
              rotateY: x * 0.02, // Reduced from 0.05
              boxShadow: `${shadowX}px ${shadowY}px ${shadowBlur}px rgba(197, 170, 140, 0.25)`,
              duration: 0.4,
              ease: 'power2.out'
            });

            // Subtle icon scale on hover
            const cardIcon = card.parentElement.querySelector('.timeline-icon-svg');
            if (cardIcon) {
              gsap.to(cardIcon, {
                scale: 1.15,
                duration: 0.3,
                ease: 'back.out(2)'
              });
            }
          };

          const handleMouseLeave = () => {
            gsap.to(card, {
              x: 0,
              y: 0,
              rotateX: 0,
              rotateY: 0,
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
              duration: 0.6,
              ease: 'elastic.out(1, 0.6)'
            });

            // Reset icon scale
            const cardIcon = card.parentElement.querySelector('.timeline-icon-svg');
            if (cardIcon) {
              gsap.to(cardIcon, {
                scale: 1,
                duration: 0.4,
                ease: 'back.out(2)'
              });
            }
          };

          card.addEventListener('mousemove', handleMouseMove);
          card.addEventListener('mouseleave', handleMouseLeave);
        }
      });
    }, containerRef);

    return () => {
      ctx.revert();
    };
  }, [safeEvents]);

  return (
    <div ref={containerRef} className="hackathon-timeline-container">
      <div className="timeline-wrapper">
        <h1 className="timeline-title">{title}</h1>
        
        <div className="timeline-content-wrapper">
          <div ref={timelineRef} className="timeline-line">
            <div className="timeline-line-fill"></div>
          </div>

          <div className="timeline-events">
            {safeEvents.map((event, index) => (
              <div
                key={event.id}
                ref={(el) => {
                  eventsRef.current[index] = el;
                }}
                className="timeline-event"
              >
                <div className="timeline-dot">
                  <TimelineIcon type={event.icon} />
                </div>
                <div className="timeline-card">
                  <div className="timeline-time">{event.time}</div>
                  <div className="timeline-content">
                    <h3 className="timeline-event-title">{event.title}</h3>
                    <p className="timeline-description">{event.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
