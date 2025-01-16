import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { Game } from "./components/Game"
import { Room } from "./components/Room"


const App = () => {
  return (
    <Router>
      <Routes>
        <Route path='/'  element={<Room/>}/>
        <Route path="/game/:roomId" element={<Game />} />
      </Routes>
    </Router>
  )
}

export default App
