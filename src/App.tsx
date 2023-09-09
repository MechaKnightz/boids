import { useRef } from 'react'
import './App.css'
import { CustomCanvas } from './CustomCanvas'
import { AppContext } from './context/AppContext'
import { createAppStore } from './store'

const App: React.FC = () => {

  const store = useRef(createAppStore()).current

  return (
    <AppContext.Provider value={store}>
      <CustomCanvas />
    </AppContext.Provider>
  )
}

export default App
