// // app/client.tsx
// import { hydrateRoot } from 'react-dom/client';
// import { BrowserRouter } from 'react-router-dom';
// import App from './root';
// import type { ComponentType } from 'react';

// const AppComponent = App as ComponentType<{}>;

// hydrateRoot(
//   document.getElementById('root')!,
//   <BrowserRouter>
//     <AppComponent />
//   </BrowserRouter>
// );

// app/client.tsx
// app/client.tsx
import { hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './root';

console.log('Client script loaded');

hydrateRoot(
  document.getElementById('root')!,
  <BrowserRouter>
    <App />
  </BrowserRouter>,
  {
    onRecoverableError: (error) => console.warn('Hydration error:', error), // Log mismatches
  }
);

console.log('Hydration completed');
