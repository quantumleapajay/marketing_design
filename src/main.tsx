import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { BBSRegistrationPage } from './pages/BBSRegistrationPage.tsx';
import { Toaster } from './components/ui/sonner';

const pathname = window.location.pathname;
const registrationMatch = pathname.match(/^\/register\/bbs\/([^/]+)$/i);
const eventCode = registrationMatch ? decodeURIComponent(registrationMatch[1]).toUpperCase() : null;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {eventCode ? (
      <>
        <BBSRegistrationPage eventCode={eventCode} />
        <Toaster position="top-right" richColors />
      </>
    ) : (
      <App />
    )}
  </StrictMode>,
);
