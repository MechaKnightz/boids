import { useRef } from 'react'
import './App.css'
import { WebGPUInitializer } from './components/WebGPUInitializer'
import { AppContext } from './context/AppContext'
import { createAppStore } from './store'

const App: React.FC = () => {

  const store = useRef(createAppStore()).current;

  return (
    <AppContext.Provider value={store}>
      <WebGPUInitializer />
    </AppContext.Provider>
  )
}

export default App
