import Sidebar from './Sidebar'

export default function AppLayout({ children }) {
  return (
    <div className="flex h-screen overflow-hidden bg-navy">
      <Sidebar />
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
        {children}
      </main>
    </div>
  )
}
