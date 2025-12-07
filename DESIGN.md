# Design Notes — Mini Group demo

Purpose
- Showcase the Mini Group landing experience: import, create, share Team Buys.
- Serve as an investor/engineering-facing prototype for flows and user experience.

Visual system
- Colors defined in `styles.css` root variables.
- Primary accent: purple (`--accent`) and teal (`--accent-2`) for CTAs and progress fills.
- Components: hero, product preview, team card grid, modal.

Accessibility
- Keyboard focus outlines for interactive elements.
- Modal moves focus to the close button on open and traps focus while open.
- Buttons have sufficient color contrast and visible focus states.

Animation
- Gentle floating and reveal animations to increase the perceived polish.
- Animated SVG (`assets/preview-animation.svg`) used as README preview.

Extending the demo
- Add OAuth + Stripe test integration for real flows.
- Replace demo JSON with a small DB (SQLite) for persistence.
- Add E2E tests and visual regression tests for UI stability.
