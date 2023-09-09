// Mimic the hook returned by `create`
import { useContext } from 'react'
import { useStore } from 'zustand'
import { AppContext } from '../context/AppContext'
import { AppState } from '../store'

export function useAppContext<T>(selector: (state: AppState) => T): T {
  const store = useContext(AppContext)
  if (!store) throw new Error('Missing BearContext.Provider in the tree')
  return useStore(store, selector)
}