import Sidebar from './Sidebar'
import Header from './Header'

function MainLayout({ children }) {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <Header />
        
        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">
          <div className="mx-auto max-w-7xl animate-fadeIn">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default MainLayout
