import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Global filter for benign ArcGIS SDK AbortErrors (caused by view recreation or React StrictMode unmounts)
if (typeof window !== 'undefined') {
  const originalConsoleError = console.error;
  console.error = (...args: any[]) => {
    const first = typeof args[0] === 'string' ? args[0] : '';
    const second = args[1];
    const isArcGISAbort =
      (first.includes('[@arcgis/core/Basemap]') || first.includes('Basemap') || first.includes('MapView') || first.includes('SceneView')) &&
      (
        second?.name === 'AbortError' ||
        second?.message === 'Aborted' ||
        first.includes('AbortError') ||
        first.includes('Aborted') ||
        JSON.stringify(args).includes('AbortError') ||
        JSON.stringify(args).includes('Aborted')
      );

    const isGenericAbort =
      args[0]?.name === 'AbortError' ||
      args[0]?.message === 'Aborted' ||
      (typeof first === 'string' && (first === 'AbortError: Aborted' || first.includes('AbortError')));

    if (isArcGISAbort || isGenericAbort) {
      // Harmless cancellation of pending HTTP tile/basemap fetches during view transitions
      return;
    }
    originalConsoleError.apply(console, args);
  };

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event?.reason;
    if (
      reason?.name === 'AbortError' ||
      reason?.message === 'Aborted' ||
      (typeof reason?.message === 'string' && reason.message.includes('Aborted'))
    ) {
      event.preventDefault();
    }
  });

  window.addEventListener('error', (event) => {
    if (
      event.error?.name === 'AbortError' ||
      event.message?.includes('AbortError') ||
      event.message?.includes('Aborted')
    ) {
      event.preventDefault();
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

