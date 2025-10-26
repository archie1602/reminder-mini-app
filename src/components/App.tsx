import { Suspense } from 'react';
import { Navigate, Route, Routes, HashRouter } from 'react-router-dom';

import { routes } from '@/navigation/routes.tsx';

// Loading fallback shown while lazy-loaded page chunks download
function PageLoader() {
  return (
    <div className="min-h-screen bg-[var(--tg-theme-bg-color)] flex items-center justify-center">
      <div className="text-[var(--tg-theme-hint-color)] text-sm">
        Loading...
      </div>
    </div>
  );
}

export function App() {
  return (
    <div>
      <HashRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {routes.map((route) => <Route key={route.path} {...route} />)}
            <Route path="*" element={<Navigate to="/"/>}/>
          </Routes>
        </Suspense>
      </HashRouter>
    </div>
  );
}
