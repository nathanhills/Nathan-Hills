import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Overview from './pages/Overview'
import PlanDetail from './pages/PlanDetail'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Overview />} />
        <Route path="/plans/:planId" element={<PlanDetail />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
