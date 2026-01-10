
# How to Host QR-Drop

This project is ready to be hosted on **Vercel** or **Netlify**. Both are free and excellent for React apps.

## Option 1: Vercel (Recommended)

1.  **Push to GitHub**:
    *   Initialize git if you haven't: `git init`
    *   Add files: `git add .`
    *   Commit: `git commit -m "Ready for deployment"`
    *   Create a repository on GitHub and push your code there.

2.  **Deploy on Vercel**:
    *   Go to [Vercel.com](https://vercel.com) and Sign Up/Login.
    *   Click **"Add New..."** -> **"Project"**.
    *   Import your GitHub repository.
    *   **IMPORTANT**: In the "Environment Variables" section, add the following keys from your `.env.local` file:
        *   `VITE_SUPABASE_URL`
        *   `VITE_SUPABASE_ANON_KEY`
        *   `VITE_GEMINI_API_KEY`
    *   Click **"Deploy"**.

## Option 2: Netlify (Recommended)

1.  **Push to GitHub**:
    *   (Same steps as above: git init, add, commit, push).

2.  **Deploy on Netlify**:
    *   Go to [Netlify.com](https://www.netlify.com/) and Sign Up/Login.
    *   Click **"Add new site"** -> **"Import from existing project"**.
    *   Connect to GitHub and select your repository.
    *   Netlify will detect the `netlify.toml` file and automatically configure settings.
    *   **IMPORTANT**: Click on **"Show advanced"** or go to **"Site settings" > "Environment variables"** after deployment initiates, and add:
        *   `VITE_SUPABASE_URL`
        *   `VITE_SUPABASE_ANON_KEY`
        *   `VITE_GEMINI_API_KEY` (if used)
    *   Click **"Deploy"**.

## Option 3: Netlify Drop (Manual)

1.  Run the build command locally:
    ```bash
    npm run build
    ```
2.  This generates a `dist` folder.
3.  Go to [app.netlify.com/drop](https://app.netlify.com/drop).
4.  Drag and drop the `dist` folder.
5.  **Important**: Go to **Site Settings >Environment variables** and add the keys mentioned above.

## Troubleshooting

*   **Refresh 404 Error**: I have already added a `public/_redirects` file and `netlify.toml` to handle routing correctly.
