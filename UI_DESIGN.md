# UI Design Documentation - Economic Strategy Game

## Design Philosophy

The Economic Strategy Game employs a modern, minimalist design language that emphasizes:
- Clear visual hierarchy
- High readability
- Smooth transitions
- Consistent spacing
- Responsive layouts
- Dark theme with subtle gradients

## Color Scheme

### Base Colors
- Primary Background: `from-indigo-900 via-purple-900 to-pink-900` gradient
- Card Background: `bg-white/10` with `backdrop-blur-lg`
- Text: White and gray variations
- Accents:
  - Blue: Actions and selections
  - Green: Positive actions
  - Red: Negative actions/warnings
  - Purple: Special features (lottery)
  - Yellow: Important information

### Opacity and Blur
- Cards use translucent white backgrounds (`bg-white/10`) with backdrop blur
- Interactive elements use varying opacity levels for different states
- Hover states increase opacity for better feedback

## Typography

### Hierarchy
1. Game Title: `text-3xl font-bold`
2. Section Headers: `text-xl font-semibold`
3. Card Titles: `text-lg font-semibold`
4. Body Text: Base size with `text-gray-300`
5. Numerical Values: `font-mono` for better readability

### Font Choices
- System font stack for general text
- Monospace for numerical values
- Consistent font weights:
  - Bold (700) for headers
  - Semibold (600) for sub-headers
  - Regular (400) for body text

## Layout System

### Grid Structure
- Responsive grid using Tailwind's grid system
- Mobile: Single column
- Tablet/Desktop: Multi-column layout
  - Main content area: 2/3 width
  - Sidebar: 1/3 width

### Spacing
- Consistent spacing using Tailwind's spacing scale
- Common values:
  - Container padding: `p-4` (mobile) to `p-6` (desktop)
  - Gap between elements: `gap-4` to `gap-6`
  - Margin between sections: `space-y-6`

## Components

### Cards
- Consistent card style across the application
- Properties:
  ```css
  bg-white/10 backdrop-blur-lg rounded-xl p-6 shadow-xl
  ```
- Used for:
  - Game header
  - Player list
  - Action panels
  - Game log

### Buttons
Three main button styles:
1. Primary Action:
   ```css
   bg-green-500/30 hover:bg-green-500/50 transition-colors
   ```
2. Secondary Action:
   ```css
   bg-white/20 hover:bg-white/30 transition-colors
   ```
3. Danger Action:
   ```css
   bg-red-500/50 hover:bg-red-500/70 transition-colors
   ```

### Icons
- Using Lucide React icons
- Consistent sizing:
  - Navigation/headers: `w-5 h-5`
  - In-content: `w-4 h-4`
- Always paired with text for better accessibility
- Used to enhance visual recognition of actions

## Responsive Design

### Breakpoints
- Mobile: Default
- Tablet: `sm:` (640px)
- Desktop: `lg:` (1024px)

### Mobile Considerations
- Single column layout
- Larger touch targets
- Simplified header with stacked buttons
- Adjusted font sizes
- Full-width buttons
- Reduced padding and margins

### Desktop Enhancements
- Multi-column layout
- Hover effects
- Larger content areas
- Side-by-side layouts
- Enhanced spacing

## Animation and Transitions

### Transition Properties
- All interactive elements use `transition-colors`
- Duration: 200ms (default)
- Used for:
  - Button hovers
  - Selection states
  - Modal appearances

### Visual Feedback
- Hover states increase opacity
- Active states use borders or background changes
- Current player/turn highlighted with blue accents

## Accessibility

### Color Contrast
- Light text on dark backgrounds
- Sufficient contrast ratios for all text sizes
- Additional visual indicators beyond color

### Interactive Elements
- Clear hover and focus states
- Adequate sizing for touch targets
- Consistent behavior patterns

### Screen Readers
- Semantic HTML structure
- Meaningful icon labels
- Clear button purposes

## Game State Visualization

### Player Status
- Active vs Inactive states
- Current turn highlighting
- Clear multiplier and balance display
- Level progression indication

### Turn Phases
- Distinct visual separation
- Clear phase indicators
- Action availability feedback

### Modals and Overlays
- Clear purpose and context
- Backdrop blur for depth
- Centered content
- Easy dismissal

## Future Enhancements

1. Theme Customization
   - Light/Dark mode toggle
   - Custom color schemes
   - Adjustable contrast

2. Animation Improvements
   - Score changes
   - Turn transitions
   - Victory celebrations

3. Accessibility Enhancements
   - Keyboard navigation
   - Screen reader optimizations
   - Reduced motion options