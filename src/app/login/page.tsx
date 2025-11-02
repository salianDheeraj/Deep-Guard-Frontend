// src/app/login/page.tsx
// This is a client component because AuthForm uses "use client"
// However, Next.js can automatically determine this if AuthForm is a client component.
// Explicitly marking this page as client-side is often not necessary if all it does is render client components.
// If you add any server-side logic here, remove the "use client" directive.

import AuthForm from '@/components/Login'; // Adjust the path based on your page's location

export default function LoginPage() {
  return (
    // The AuthForm component handles its own styling and layout.
    // You might add a wrapper div here if you want to add more to the page.
    <AuthForm />
  );
}