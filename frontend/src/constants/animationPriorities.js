/**
 * Animation Priority Constants
 * Lower numbers initialize first
 * Components should be ordered by their visual position on the page (top to bottom)
 */

export const ANIMATION_PRIORITIES = {
  // Hero Section - Loads first
  JUNO_LANDING: 10,
  
  // Main Content Sections - In visual order
  EVENT_OVERVIEW: 20,
  TIMELINE: 30,
  JURIES_CARDS: 40,
  CLIENT_REVIEWS: 50,
  SPOTLIGHT: 60,
  
  // Additional sections (if needed)
  TEAM_CARDS: 70,
  FEATURED_WORK: 80,
  STORY_SLIDES: 90,
  
  // Footer elements
  CTA_CARD: 100,
};

/**
 * Animation Configuration
 */
export const ANIMATION_CONFIG = {
  // Timing
  COMPONENT_REGISTRATION_DELAY: 100, // ms to wait for components to register
  RESIZE_DEBOUNCE: 250, // ms to debounce resize events
  SCROLL_TRIGGER_REFRESH_DELAY: 100, // ms to wait before refreshing ScrollTrigger
  
  // Breakpoints
  MOBILE_BREAKPOINT: 1000, // px
  TABLET_BREAKPOINT: 768, // px
  
  // ScrollTrigger defaults
  DEFAULT_SCRUB: 1,
  DEFAULT_START: "top top",
  DEFAULT_END: "bottom top",
};

/**
 * Component Names - Use these for registration
 */
export const COMPONENT_NAMES = {
  JUNO_LANDING: "JunoLanding",
  EVENT_OVERVIEW: "EventOverview",
  TIMELINE: "Timeline",
  JURIES_CARDS: "JuriesCards",
  CLIENT_REVIEWS: "ClientReviews",
  SPOTLIGHT: "Spotlight",
  TEAM_CARDS: "TeamCards",
  FEATURED_WORK: "FeaturedWork",
  STORY_SLIDES: "StorySlides",
  CTA_CARD: "CTACard",
};

