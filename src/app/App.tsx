import { Suspense } from 'react';
import { RouterProvider } from 'react-router';
import { router } from './routes';
import { SocRealtimeProvider } from './lib/realtime';
import { ToastProvider } from './lib/toast';

export default function App() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#000509] text-[#00f0ff]">
          Loading SOC Dashboard...
        </div>
      }
    >
      <SocRealtimeProvider>
        <ToastProvider>
          <RouterProvider router={router} />
        </ToastProvider>
      </SocRealtimeProvider>
    </Suspense>
  );
}
