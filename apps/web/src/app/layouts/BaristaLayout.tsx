import { Link, Outlet } from 'react-router';

export function BaristaLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-coffee-900 p-5 text-white">
        <nav className="mx-auto flex max-w-6xl items-center justify-between">
          <Link to="/barista" className="text-xl font-bold">
            Ritual Coffee | Barista
          </Link>

          <div className="flex gap-4">
            <Link to="/barista">Dashboard</Link>
            <Link to="/barista/menu">Menú</Link>
            <Link to="/barista/orders">Órdenes</Link>
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl p-6">
        <Outlet />
      </main>
    </div>
  );
}
