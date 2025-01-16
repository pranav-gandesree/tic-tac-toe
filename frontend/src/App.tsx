import Room from "./components/Room"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import Game from './components/Game'

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path='/'  element={<Room/>}/>
        <Route path='/game'  element={<Game/>}/>
      </Routes>
    </Router>
  )
}

export default App
