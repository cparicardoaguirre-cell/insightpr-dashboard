import { useState } from 'react'
import { LanguageProvider } from './context/LanguageContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import Header from './components/Header'
import Footer from './components/Footer'
import LoginPage from './components/LoginPage'
import Overview from './components/Overview'
import NotebookChat from './components/NotebookChat'
import FinancialAnalysis from './components/FinancialAnalysis'
import FinancialStatements from './components/FinancialStatements'
import ComplianceTracker from './components/ComplianceTracker'
import IndustryAnalysis from './components/IndustryAnalysis'
import Act60Tab from './components/Act60Tab'
import './index.css'

function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div className="min-h-screen">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="container animate-fade-in">
        {activeTab === 'overview' && <Overview />}
        {activeTab === 'financials' && <FinancialAnalysis />}
        {activeTab === 'statements' && <FinancialStatements />}
        {activeTab === 'compliance' && <ComplianceTracker />}
        {activeTab === 'industry' && <IndustryAnalysis />}
        {activeTab === 'act60' && <Act60Tab />}
        {activeTab === 'chat' && <NotebookChat />}
        {activeTab === 'files' && (
          <div className="card">
            <h2>File Manager</h2>
            <p>Connect your local NLT-PR files to NotebookLM here.</p>
            {/* Implementation Pending */}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}

function AppContent() {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <LoginPage />
  }

  return <Dashboard />
}

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </LanguageProvider>
  )
}

export default App
