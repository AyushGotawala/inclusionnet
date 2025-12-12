# Logo Setup Instructions

## How to Add Your Application Logo

To replace the default icon with your InclusionNet logo, follow these steps:

### Step 1: Prepare Your Logo Files

Create two versions of your logo:
- **PNG format** (recommended): `logo.png`
- **SVG format** (optional, for better scaling): `logo.svg`

**Recommended specifications:**
- **Size**: 512x512 pixels (or square aspect ratio)
- **Format**: PNG with transparent background (or SVG)
- **File size**: Keep under 100KB for optimal performance

### Step 2: Place Logo Files

Place your logo files in the `frontend/public/` directory:

```
frontend/
  └── public/
      ├── logo.png  ← Your logo here
      └── logo.svg  ← Optional SVG version
```

### Step 3: Verify

After adding your logo files:
1. Restart your development server if it's running
2. The logo will automatically appear in:
   - Browser tab (favicon)
   - Header navigation (Layout component)
   - Landing page
   - Login page
   - Signup page

### Fallback Behavior

If logo files are not found, the application will:
1. First try to load `logo.png`
2. If that fails, try `logo.svg`
3. If both fail, display a default TrendingUp icon

### Logo Component Usage

The logo is now centralized in `src/components/Logo.jsx`. You can use it anywhere:

```jsx
import Logo from './Logo';

// Small logo with text
<Logo size="sm" showText={true} />

// Medium logo with text (default)
<Logo size="md" showText={true} />

// Large logo without text
<Logo size="lg" showText={false} />
```

### Notes

- The logo is displayed in a rounded container with a gradient background
- The logo automatically scales and maintains aspect ratio
- All logo instances are clickable and link to the home page

