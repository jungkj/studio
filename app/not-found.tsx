import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-mac-light-gray flex items-center justify-center">
      <div className="text-center px-8">
        <h1 className="text-6xl font-bold text-mac-black mb-4">404</h1>
        <p className="text-lg text-mac-dark-gray mb-6">Page not found</p>
        <Link 
          href="/"
          className="inline-block px-6 py-3 bg-mac-white mac-border-outset hover:mac-border-inset text-mac-black transition-all"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}