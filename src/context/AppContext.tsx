import { createContext } from 'react'
import { AppStore } from '../store'

export const AppContext = createContext<AppStore | null>(null)