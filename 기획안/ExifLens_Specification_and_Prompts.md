# Camera EXIF Analysis & ND Filter Long Exposure Calculator (ExifLens)
## Functional Specification & Technical Documentation for Claude Development

---

## 1. Service Name Ideas & Unique Selling Proposition (USP)

### Service Name Ideas
- **ExifLens.com** / **ExifCalc.com** (Intuitive, memorable, high brandability)
- **ShutterShift.com** / **LightND.com** (Emphasizes long exposure and professional filter utility)

### Core Value Proposition (USP)
- **All-in-One Visual Calculation Process:** Drag-and-drop a photo to extract EXIF data (Shutter Speed, ISO, Aperture, Focal Length) in 0.1s and instantly calculate the target long exposure time for any selected ND filter strength (e.g., ND1000).
- **100% Client-Side Privacy:** All processing happens in the browser (`exifreader` / `exif-js`) without server uploads, offering instant performance and robust privacy.
- **Built-in Long Exposure Timer & Visual Preview:** Includes an interactive countdown timer with audio alert and exposure shift visual indicators for field photography convenience.

---

## 2. Recommended Tech Stack

| Category | Recommended Technology | Reason for Selection |
| :--- | :--- | :--- |
| **Framework** | **Next.js 14+ (App Router)** | SSR/SSG support for ultra-fast performance and global SEO ranking |
| **Styling** | **Tailwind CSS + shadcn/ui** | Responsive, mobile-first design system with lightweight UI components |
| **i18n** | **next-intl** | Locale-based routing (`/en`, `/ja`, `/es`) for global search engine visibility |
| **EXIF Parsing**| **exifreader** | Browser-side RAW and JPG/PNG EXIF metadata extraction |
| **State Management** | **Zustand** | Lightweight state management for calculator parameters and timer states |
| **Deployment** | **Vercel** | Serverless Edge Network deployment with zero maintenance |

---

## 3. Information Architecture & UI/UX Layout

### Page Structure
- `/` (Home): Main EXIF Parser + ND Filter Calculator Tool
- `/guides/[slug]`: Long exposure guides & ND filter photography tips (SEO Content Marketing)
- `/privacy` & `/terms`: Required static policy pages for Google AdSense compliance

### UI/UX Layout Wireframe Diagram

```text
+-----------------------------------------------------------------------+
|  [Header] Logo | Language Selector (EN/ES/JA/KO)                      |
+-----------------------------------------------------------------------+
|  [Ad-Zone 1] Top Display Banner (Leaderboard 728x90)                  |
+-----------------------------------------------------------------------+
|  [Main Container]                                                     |
|  +-----------------------------------------------------------------+  |
|  |  [Section 1] Image Dropzone (Upload JPG/RAW)                    |  |
|  |  "Drag & Drop photo here to auto-extract EXIF"                  |  |
|  +-----------------------------------------------------------------+  |
|                                                                       |
|  +--------------------------------+ +------------------------------+  |
|  | [Section 2] Extracted EXIF     | | [Section 3] ND Filter Calc   |  |
|  | - Camera: Sony A7 IV           | | - Target ND: [ ND1000 (10-Stop)|  |
|  | - Shutter: 1/125s (Auto Input) | | - New Shutter Speed: 8.2s     |  |
|  | - Aperture: f/8.0 | ISO: 100   | | [ Start Timer Button ]       |  |
|  +--------------------------------+ +------------------------------+  |
|                                                                       |
|  +-----------------------------------------------------------------+  |
|  | [Section 4] Gear Recommendation & Affiliate Cards (Amazon/B&H)  |  |
|  | - Recommended ND Filters for Sony 24-70mm f/2.8                 |  |
|  +-----------------------------------------------------------------+  |
+-----------------------------------------------------------------------+
|  [Ad-Zone 2] In-feed / Bottom Banner                                  |
+-----------------------------------------------------------------------+
|  [Footer] Copyright & Links                                           |
+-----------------------------------------------------------------------+
```

---

## 4. Feature Logic & Calculation Formulas

### EXIF Parsing Logic
1. User drops an image into the client-side uploader.
2. `exifreader` processes the binary buffer in the browser.
3. Extracted parameters: `ExposureTime` (Shutter Speed), `FNumber` (Aperture), `ISOSpeedRatings` (ISO), `FocalLength`, `LensModel`.

### ND Filter Exposure Calculation Formula
The target shutter speed ($T_{	ext{new}}$) when using an ND filter is derived from the base shutter speed ($T_{	ext{base}}$) and filter density in stops ($N$):

$$T_{	ext{new}} = T_{	ext{base}} 	imes 2^N$$

#### Example:
If $T_{	ext{base}} = 1/125	ext{s}$ and filter is **ND1000** ($N = 10	ext{ stops}$):

$$T_{	ext{new}} = rac{1}{125} 	imes 2^{10} = rac{1024}{125} pprox 8.192	ext{ seconds}$$

---

## 5. SEO Optimization & Ad Placement Strategy

### SEO Strategy
1. **Dynamic Metadata & Open Graph:** Generate localized canonical links and `hreflang` tags using `next-intl`.
2. **Schema.org Structured Data:** Implement `WebApplication` and `HowTo` rich snippets.
3. **Target Keywords:** `ND filter calculator`, `EXIF viewer online`, `Long exposure shutter speed calculator`.

### Monetization Layout
- **Ad-Zone 1 (Header Top):** 728x90 Responsive Banner
- **Ad-Zone 2 (Content Bottom):** 300x250 Native Rectangle Ad below calculation output
- **Affiliate Integration:** Automatically detect lens filter thread size (e.g., 82mm) and surface dynamic Amazon / B&H affiliate buy buttons for matching ND filters.

---

## 6. Step-by-Step Claude Prompts

---

### Phase 1: Project Setup & Core Layout
```text
I am building a web service called "ExifLens" using Next.js 14 (App Router), Tailwind CSS, and shadcn/ui.
This app is a global tool that parses photo EXIF data and calculates long exposure times for ND filters.

Please set up the initial layout and routing structure with the following requirements:
1. Support i18n structure using `next-intl` (Default language: English).
2. Create a clean, responsive layout with a Header, Main Container, Ad Banner Placeholders (Top, Middle, Bottom), and Footer.
3. Use dark mode by default, tailored for photographers.
4. Provide the code for `app/[locale]/page.tsx` and the main layout.
```

---

### Phase 2: EXIF Parser Component
```text
Now let's build the EXIF Parsing feature.

Requirements:
1. Create a client-side Drag and Drop file upload component (`ExifUploader.tsx`).
2. Use the `exifreader` library to parse EXIF metadata directly in the browser without uploading files to a server.
3. Extract and display the following data cleanly:
   - Camera Model & Lens Model
   - Shutter Speed (ExposureTime)
   - Aperture (FNumber)
   - ISO
   - Focal Length
4. If Shutter Speed is successfully extracted, pass this value directly to the ND Filter Calculator state.
5. Provide the code for the component and necessary utility functions.
```

---

### Phase 3: ND Filter Calculator & Timer
```text
Let's implement the ND Filter Long Exposure Calculator logic and Timer UI.

Requirements:
1. Create `NdCalculator.tsx`.
2. Input: Base Shutter Speed (Auto-filled from EXIF or manually selectable via dropdown like 1/1000s to 30s).
3. Selection: ND Filter Stop selection (ND4/2-Stop, ND8/3-Stop, ND64/6-Stop, ND1000/10-Stop, ND32000/15-Stop, or custom stop input).
4. Calculation Logic: Calculate new shutter speed using the formula: New Speed = Base Speed * (2 ^ Stops).
5. Output & Feature:
   - Display the target shutter speed clearly (e.g., "8.2 seconds" or "2 mins 15 secs").
   - If calculated time is >= 1 second, display a "Start Countdown Timer" button with audio/visual notification when finished.
6. Provide complete Next.js React code using Tailwind CSS.
```

---

### Phase 4: SEO, i18n & Affiliate Monetization
```text
Finally, let's optimize the application for SEO and Affiliate Monetization.

Requirements:
1. Add dynamic metadata generation in `page.tsx` including Open Graph tags, canonical URLs, and structured data (Schema.org WebApplication).
2. Add dynamic Amazon Affiliate recommendation links based on extracted lens info or selected filter thread size (e.g., "Recommended 82mm ND Filters").
3. Add placeholder components for Google AdSense banners (Leaderboard 728x90, Rectangle 300x250) positioned for maximum CTR without violating AdSense policies.
4. Output the complete integrated page file and SEO utility files.
```
