import { Suspense } from 'react';
import { RouterProvider } from 'react-router';
import { router } from './routes';

export default function App() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#000509] text-[#00f0ff]">
          Loading SOC Dashboard...
        </div>
      }
    >
      <RouterProvider router={router} />
    </Suspense>
  );
}
