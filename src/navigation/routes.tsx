import type { ComponentType, JSX } from 'react';

import { ListPage } from '@/pages/ListPage';
import { CreatePage } from '@/pages/CreatePage';
import { EditPage } from '@/pages/EditPage';

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
