import { createBrowserRouter } from 'react-router';
import { PublicLayout } from './layouts/PublicLayout';
import { BaristaLayout } from './layouts/BaristaLayout';

function Placeholder({ title }: { title: string }) {
  return (
    <section className="mx-auto max-w-6xl p-8">
      <h1 className="text-3xl font-bold text-coffee-900">
        {title}
      </h1>
      <p className="mt-4 text-gray-600">
        Página en construcción.
      </p>
    </section>
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    Component: PublicLayout,
    children: [
      {
        index: true,
        element: <Placeholder title="Bienvenido a Ritual Coffee" />,
      },
      {
        path: 'menu',
        element: <Placeholder title="Nuestro menú" />,
      },
      {
        path: 'barista/login',
        element: <Placeholder title="Iniciar sesión" />,
      },
    ],
  },
  {
    path: '/barista',
    Component: BaristaLayout,
    children: [
      {
        index: true,
        element: <Placeholder title="Dashboard del barista" />,
      },
      {
        path: 'menu',
        element: <Placeholder title="Administrar menú" />,
      },
      {
        path: 'orders',
        element: <Placeholder title="Gestión de órdenes" />,
      },
    ],
  },
  {
    path: '*',
    element: <Placeholder title="404 - Página no encontrada" />,
  },
]);
