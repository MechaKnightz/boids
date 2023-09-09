import { useRef } from 'react'
import './App.css'
import { WGPUInitializer } from './components/WGPUInitializer'
import { AppContext } from './context/AppContext'
import { createAppStore } from './store'

const App: React.FC = () => {

  const store = useRef(createAppStore()).current;

  return (
    <AppContext.Provider value={store}>
      <WGPUInitializer />
    </AppContext.Provider>
  )
}

export default App
