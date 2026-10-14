import { Link, Outlet } from 'react-router';

export function PublicLayout() {
  return (
    <div className="min-h-screen bg-coffee-50">
      <header className="border-b border-coffee-100 bg-white">
        <nav className="mx-auto flex max-w-6xl items-center justify-between p-5">
          <Link
            to="/"
            className="text-xl font-bold text-coffee-900"
          >
            Ritual Coffee
          </Link>

          <div className="flex gap-5">
            <Link to="/" className="text-coffee-900">
              Inicio
            </Link>

            <Link to="/menu" className="text-coffee-900">
              Menú
            </Link>

            <Link
              to="/barista/login"
              className="text-coffee-700"
            >
              Barista
            </Link>
          </div>
        </nav>
      </header>

      <Outlet />
    </div>
  );
}
