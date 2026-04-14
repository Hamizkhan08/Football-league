import Navbar from './Navbar'
import Footer from './Footer'
import { Toaster } from 'react-hot-toast'

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#111111',
            color: '#fff',
            borderRadius: '0px',
            fontFamily: 'Inter, sans-serif',
            fontSize: '14px',
            fontWeight: '600',
            padding: '16px 24px',
          },
          success: { iconTheme: { primary: '#007D48', secondary: '#fff' } },
          error:   { iconTheme: { primary: '#D30005', secondary: '#fff' } },
        }}
      />
    </div>
  )
}
