import {redirect} from 'next/navigation';

export default function HomePage() {
  // Example condition to redirect
  redirect('/login');
}