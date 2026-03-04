export default function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="max-w-6xl mx-auto px-6 py-6 text-sm text-gray-500 text-center">
        © {new Date().getFullYear()} Influencer Contracts. All rights reserved.
      </div>
    </footer>
  );
}