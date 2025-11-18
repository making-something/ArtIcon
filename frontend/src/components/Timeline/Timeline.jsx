'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import './Timeline.css';

gsap.registerPlugin(ScrollTrigger);

const defaultHackathonEvents = [
  {
    id: '1',
    time: '9:00 AM',
    title: 'Doors Open',
    description:
      'Welcome to the hackathon! Check in and grab some coffee while we set up.',
    icon: '🚪'
  },
  {
    id: '2',
    time: '10:00 AM',
    title: 'Opening Ceremony',
    description:
      'Meet the judges, sponsors, and fellow hackers. Learn about the themes and prizes.',
    icon: '🎤'
  },
  {
    id: '3',
    time: '11:00 AM',
    title: 'Hacking Begins',
    description:
      'Form your teams and start building. The 24-hour countdown begins now!',
    icon: '⚡'
  },
  {
    id: '4',
    time: '2:00 PM',
    title: 'Lunch Break',
    description:
      'Take a break and fuel up with our catered lunch. Network with other teams.',
    icon: '🍕'
  },
  {
    id: '5',
    time: '6:00 PM',
    title: 'Midpoint Check-in',
    description:
      'Showcase your progress so far. Mentors available for guidance and feedback.',
    icon: '📊'
  },
  {
    id: '6',
    time: '9:00 PM',
    title: 'Dinner & Entertainment',
    description:
      'Relax, recharge, and enjoy live music and games with your team.',
    icon: '🎵'
  },
  {
    id: '7',
    time: '10:00 AM (Day 2)',
    title: 'Final Push',
    description:
      'Last hours to polish your project and prepare your pitch. Make it count!',
    icon: '🚀'
  },
  {
    id: '8',
    time: '1:00 PM',
    title: 'Presentations & Awards',
    description:
      'Present your projects to the judges. Celebrate winners and recognize all efforts.',
    icon: '🏆'
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
        if (icon) {
          gsap.fromTo(
            icon,
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

        // Magnetic hover effect on cards
        if (card) {
          const handleMouseMove = (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            gsap.to(card, {
              x: x * 0.1,
              y: y * 0.1,
              rotateX: -y * 0.05,
              rotateY: x * 0.05,
              duration: 0.5,
              ease: 'power2.out'
            });
          };

          const handleMouseLeave = () => {
            gsap.to(card, {
              x: 0,
              y: 0,
              rotateX: 0,
              rotateY: 0,
              duration: 0.5,
              ease: 'power2.out'
            });
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
                  <div className="timeline-icon">{event.icon}</div>
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
