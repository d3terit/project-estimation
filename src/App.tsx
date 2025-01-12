import { HashRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import './App.css'
import GridTimeline from './pages/public/GridTimeline/GridTimelinePage';

function App() {

  return (
    <>
      <Router>
        <Routes>
          <Route path='/' element={<GridTimeline />} />
          <Route path="*" element={<Navigate to="/home" />} />
        </Routes>
      </Router>
    </>
  )
}

export default App