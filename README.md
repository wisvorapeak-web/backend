# Wisvora Scientific Backend (JS)

A high-performance backend for the World Summit and Expo on Polymers.

## 🚀 Technologies Used
*   **Express.js**: Web framework.
*   **Supabase**: For Authentication and Database management.
*   **Cloudinary**: For high-quality image and scientific document uploads (Multer-integrated).
*   **Nodemailer**: For reliable email services (independent of Supabase's built-in mailer).
*   **ES Modules**: Clean, modern JavaScript syntax.

## 🛠️ Setup
1.  Navigate to `/backend`.
2.  Install dependencies: `npm install`.
3.  Copy `.env.example` as `.env` and fill in your credentials.
4.  Run development server: `npm run dev`.

## 📡 Essential Endpoints
*   `GET /health`: Server health check.
*   `POST /api/upload`: Upload single image/file to Cloudinary.
*   `POST /api/mail`: Send custom emails using Nodemailer.
