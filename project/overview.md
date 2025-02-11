MVP Project Plan: Website Comparison Tool

1. Project Setup & Framework Selection

Framework Choice:

- Astro with React Integration:
  - Pros: Lightweight, fast, and great for content-focused projects.
  - Cons: Slightly more setup required to integrate React components.
- Next.js:
  - Pros: Robust React ecosystem and built-in routing.
  - Cons: Heavier than Astro for a simple tool.

Recommendation:
Given your familiarity and the simplicity of the tool, Astro with React is a solid choice if you want to keep it lightweight.

Initial Steps:

- Scaffold your project with your chosen framework.
- Initialize a Git repository and set up your development environment.
- Integrate Tailwind CSS v4 for styling.

2. Core Components & Architecture

A. Layout & Structure

- Header/Control Bar:

  - URL Input Fields: Two inputs (one for each site) to load URLs into iframes.
  - Viewport Settings:
    - Preset buttons: Mobile, Tablet, Desktop.
    - Custom dimension inputs: Allow users to enter custom widths (and possibly heights if needed).
  - Disco Mode Controls:
    - Toggle button to activate/deactivate disco mode.
    - Input for setting the interval (in seconds) between cycles.
    - Controls for setting custom min/max pixel values for the disco mode cycle.

- Main Display Area:
  - Two side-by-side panels using iframes to display the entered URLs.

B. Core Components

- URLInput Component:

  - Handles user input for the URLs.
  - Validates the URL format.

- ViewportController Component:

  - Contains the manual controls (Mobile, Tablet, Desktop, and custom dimensions).
  - Synchronizes viewport settings across both iframes.

- DiscoMode Component:

  - Implements the automatic cycling between a range of viewport sizes.
  - Accepts settings for:
    - Predefined standard viewports (min and max values).
    - Custom pixel values for min and max.
    - Interval setting (in seconds).

- IFrameDisplay Component:
  - Renders the external sites.
  - Applies synchronized dimensions based on the current viewport settings.

+Project Structure:

- - Create a /components directory to house the following components:
- - URLInput.jsx: for handling URL input and validation.
- - ViewportController.jsx: for preset viewport buttons and custom width input.
- - DiscoMode.jsx: for managing the automatic cycling of viewport sizes.
- - IFrameDisplay.jsx: for rendering the two iframes and handling load errors with an onError handler.

3. Functionality & Implementation

A. URL Handling & Iframe Embedding

- Iframe Approach:

  - Use iframes for simplicity in MVP.
  - Note: Some sites might restrict iframe embedding (due to X-Frame-Options or CSP headers).
  - Recommendation: For MVP, simply display an error message or placeholder if an iframe fails to load.

- Validation:
  - Ensure URL inputs are valid before loading.

B. Synchronized Viewport Controls

- Manual Mode:

  - Implement buttons for preset viewports:
    - Mobile: (e.g., 375px wide)
    - Tablet: (e.g., 768px wide)
    - Desktop: (e.g., 1440px wide)
  - Provide fields for entering custom width (and optional height) values.

- Disco Mode:
  - Cycle Mechanism:
    - Create a timer that cycles through a range of viewport sizes.
    - Use settings for standard or custom min/max values.
  - User Controls:
    - Allow users to specify the interval between cycles (in seconds).
    - Allow users to define custom ranges for the disco mode.
  - Syncing:
    - Ensure that both iframes update simultaneously as the viewport size changes.

C. State Management

- Use React's state management (or Astro's state handling in components) to maintain:
  - Current URLs.
  - Current viewport width (applied to both iframes).
  - Disco mode settings (active/inactive, interval, min/max values).
- For now, React's built-in state hooks (useState) will suffice. As the project evolves, consider React Context if deeper state sharing is needed.

4. UI/UX Design & Styling

Design Philosophy:

- Minimal and clean interface.
- A simple top control bar for inputs and settings.
- Clear side-by-side display of two sites.

Styling:

- Use Tailwind CSS v4 to style the application.
- Tailwind's utility-first approach will ensure a consistent, responsive design.

5. Testing & Validation

Local Testing:

- Test with various valid and invalid URLs.
- Verify that both manual viewport changes and disco mode work correctly.
- Confirm that iframes update in sync.

Error Handling:

- Handle errors gracefully when a site cannot be embedded.
- Provide user feedback for invalid URL entries or blocked iframe content.

Cross-Browser Testing:

- Ensure functionality across modern browsers.

6. Deployment to Netlify

Deployment Steps:

- Connect your Git repository to Netlify.
- Configure build settings based on your chosen framework (Astro or Next.js).
- Deploy the application and perform final live tests.

Post-Deployment:

- Monitor for any runtime errors or issues.
- Gather initial user feedback to plan future enhancements.

7. Next Steps & Future Enhancements

After MVP Completion:

- Explore enhancements like persisting configurations via URL parameters.
- Improve error handling or add support for additional user controls.
- Consider alternative methods for site loading if iframe restrictions become a significant issue.
