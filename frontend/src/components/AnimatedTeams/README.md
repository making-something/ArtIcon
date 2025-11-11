# AnimatedTeams Component

A stunning scroll-triggered animated team section component for Next.js with GSAP animations.

## Features

✅ **Scroll-triggered animations** - Team members slide in as you scroll
✅ **Card reveal effect** - Cards slide in from the right with rotation
✅ **Initial letter animation** - Large initial letters scale in
✅ **Fully responsive** - Optimized for mobile and desktop
✅ **Customizable** - Pass your own team members data
✅ **Performance optimized** - Proper cleanup and debounced resize handling

## Installation

The component is already set up in your project. Required dependencies:
- `gsap` (already installed)
- `@gsap/react` (needs to be installed)
- `lenis` (already installed)

Install missing dependency:

```bash
npm install @gsap/react
```

## Basic Usage

### With Default Team Members

```jsx
import AnimatedTeams from "@/components/AnimatedTeams/AnimatedTeams";

export default function Page() {
	return <AnimatedTeams />;
}
```

### With Custom Team Members

```jsx
import AnimatedTeams from "@/components/AnimatedTeams/AnimatedTeams";

const myTeam = [
	{
		initial: "J",
		role: "CEO & Founder",
		firstName: "John",
		lastName: "Doe",
		image: "/team/john.jpg",
	},
	{
		initial: "S",
		role: "CTO",
		firstName: "Sarah",
		lastName: "Smith",
		image: "/team/sarah.jpg",
	},
	{
		initial: "M",
		role: "Lead Designer",
		firstName: "Mike",
		lastName: "Johnson",
		image: "/team/mike.jpg",
	},
];

export default function Page() {
	return <AnimatedTeams teamMembers={myTeam} />;
}
```

### Without Hero/Outro Sections

```jsx
<AnimatedTeams showHero={false} showOutro={false} />
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `teamMembers` | Array | Default 3 members | Array of team member objects |
| `showHero` | Boolean | `true` | Show hero section with title |
| `showOutro` | Boolean | `true` | Show outro section with title |

### Team Member Object Structure

```javascript
{
	initial: "C",           // Single letter for background
	role: "Creative Director",  // Job title
	firstName: "Callu",     // First name
	lastName: "Kalia",      // Last name
	image: "/team-member-1.jpg"  // Image path
}
```

## With Lenis Smooth Scrolling

For the best experience, wrap your page with Lenis:

```jsx
"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ReactLenis } from "lenis/react";
import AnimatedTeams from "@/components/AnimatedTeams/AnimatedTeams";

export default function Page() {
	const lenisRef = useRef();

	useEffect(() => {
		function update(time) {
			lenisRef.current?.lenis?.raf(time * 1000);
		}

		gsap.ticker.add(update);

		return () => gsap.ticker.remove(update);
	}, []);

	return (
		<>
			<ReactLenis root options={{ autoRaf: false }} ref={lenisRef} />
			<AnimatedTeams />
		</>
	);
}
```

## Customization

### Colors

Edit `AnimatedTeams.css` to customize colors:

```css
.animated-teams-hero h1,
.animated-teams-outro h1 {
	color: var(--accent-teams, #fc694c);  /* Hero/Outro title color */
}

.team-member-name-initial h1 {
	color: var(--accent-teams, #fc694c);  /* Initial letter color */
}

.team-member-card {
	background-color: var(--base-teams-card, #f2f5ea);  /* Card background */
}

.team-member-info h1 {
	color: var(--accent-teams, #fc694c);  /* Name color */
}

.team-member-info h1 span {
	color: var(--base-teams-dark, #171717);  /* Last name color */
}
```

### Animation Timing

Adjust animation timing in `AnimatedTeams.jsx`:

```javascript
// Entrance delay between team members
const entranceDelay = 0.15;  // Increase for slower stagger

// Card slide-in stagger
const slideInStagger = 0.075;  // Increase for slower card reveals

// Pin duration (scroll distance)
end: `+=${window.innerHeight * 3}`  // Increase multiplier for longer scroll
```

## Assets

### Required Images

Place team member images in the `public` folder:

```
public/
├── team-member-1.jpg  ✅ (Already copied)
├── team-member-2.jpg  ✅ (Already copied)
└── team-member-3.jpg  ✅ (Already copied)
```

### Image Specifications

- **Aspect Ratio**: 1:1 (square)
- **Recommended Size**: 800×800px minimum
- **Format**: JPG, PNG, or WebP
- **Optimization**: Compress for web

## Demo

View the demo page at: `http://localhost:3000/teams-demo`

## Animation Breakdown

### 1. Team Member Entrance (Scroll: 0% → 100%)
- Members slide up from `translateY(125%)` to `translateY(0%)`
- Staggered entrance with 0.15s delay between members
- Initial letters scale from 0 to 1

### 2. Card Slide-In (Scroll: 100% → 400%)
- Section pins for 3 viewport heights
- Cards slide from right (`300%`, `200%`, `100%`) to center (`-50%`)
- Cards rotate from 20deg to 0deg
- Cards scale from 0.75 to 1
- Staggered animation for smooth reveal

### 3. Mobile Behavior
- All animations disabled on screens < 1000px
- Cards displayed in vertical stack
- No scroll pinning
- Static layout for better mobile UX

## Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers

## Performance

- ✅ Debounced resize handling (250ms)
- ✅ Proper ScrollTrigger cleanup
- ✅ `will-change` CSS properties for GPU acceleration
- ✅ Mobile animations disabled for better performance

## Troubleshooting

### Animations not working
1. Ensure `@gsap/react` is installed
2. Check that component is wrapped with Lenis
3. Verify images are in the correct path

### Scroll not smooth
Make sure you're using the Lenis wrapper as shown in the examples

### Images not loading
Check that image paths in team member objects match files in `public` folder

## Credits

Original design: CodeGrid WorkingStiff Animated Teams Section
Converted to reusable Next.js component for CGMWTOCT2025 project

