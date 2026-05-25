import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { RouterProvider } from 'react-router'
import { router } from './routes/Router.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* <App></App> */}
    <RouterProvider router={router} />

  </StrictMode>,
)
