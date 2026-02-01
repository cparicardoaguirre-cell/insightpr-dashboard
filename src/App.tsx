import { useState } from 'react'
import { LanguageProvider } from './context/LanguageContext'
import Header from './components/Header'
import Footer from './components/Footer'
import Overview from './components/Overview'
import NotebookChat from './components/NotebookChat'
import FinancialAnalysis from './components/FinancialAnalysis'
import ComplianceTracker from './components/ComplianceTracker'
import IndustryAnalysis from './components/IndustryAnalysis'
import Act60Tab from './components/Act60Tab'
import './index.css'

function App() {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <LanguageProvider>
      <div className="min-h-screen">
        <Header activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="container animate-fade-in">
          {activeTab === 'overview' && <Overview />}
          {activeTab === 'financials' && <FinancialAnalysis />}
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
    </LanguageProvider>
  )
}

export default App

