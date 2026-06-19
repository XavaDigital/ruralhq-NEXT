export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-gray-200 bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-gray-500">
        <p>Connecting Rural New Zealand.</p>
        <p className="mt-2">
          © {new Date().getFullYear()} RuralHQ. Rebuilt on Next.js.
        </p>
      </div>
    </footer>
  );
}
