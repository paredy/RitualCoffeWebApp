import { createBrowserRouter, Navigate } from 'react-router';
import { PublicLayout } from './layouts/PublicLayout';
import { BaristaLayout } from './layouts/BaristaLayout';

// Public pages
import { HomePage } from '../features/public-site/pages/HomePage';
import { OurCoffeePage } from '../features/public-site/pages/OurCoffeePage';
import { LabPage } from '../features/public-site/pages/LabPage';
import { WorkshopsPage } from '../features/public-site/pages/WorkshopsPage';
import { VisitUsPage } from '../features/public-site/pages/VisitUsPage';
import { MenuPage } from '../features/menu/pages/MenuPage';

// Barista pages
import { BaristaOrdersPage } from '../features/barista/pages/BaristaOrdersPage';
import { BaristaPOSPage } from '../features/barista/pages/BaristaPOSPage';
import { BaristaMenuPage } from '../features/barista/pages/BaristaMenuPage';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: PublicLayout,
    children: [
      {
        index: true,
        Component: HomePage,
      },
      {
        path: 'nuestro-cafe',
        Component: OurCoffeePage,
      },
      {
        path: 'laboratorio',
        Component: LabPage,
      },
      {
        path: 'talleres',
        Component: WorkshopsPage,
      },
      {
        path: 'menu',
        Component: MenuPage,
      },
      {
        path: 'visitanos',
        Component: VisitUsPage,
      },
    ],
  },
  {
    path: '/barista',
    Component: BaristaLayout,
    children: [
      {
        index: true,
        element: <Navigate to="/barista/orders" replace />,
      },
      {
        path: 'orders',
        Component: BaristaOrdersPage,
      },
      {
        path: 'pos',
        Component: BaristaPOSPage,
      },
      {
        path: 'menu',
        Component: BaristaMenuPage,
      },
    ],
  },
  {
    path: '*',
    Component: HomePage,
  },
]);
