import type { ComponentType, JSX } from 'react';
import { lazy } from 'react';

// Entry point page - bundled immediately (always visited)
import { ListPage } from '@/pages/ListPage';

// Secondary pages - lazy loaded (visited less frequently)
const CreatePage = lazy(() => import('@/pages/CreatePage'));
const EditPage = lazy(() => import('@/pages/EditPage'));

interface Route {
  path: string;
  Component: ComponentType;
  title?: string;
  icon?: JSX.Element;
}

export const routes: Route[] = [
  { path: '/', Component: ListPage },
  { path: '/create', Component: CreatePage },
  { path: '/edit/:id', Component: EditPage },
];
