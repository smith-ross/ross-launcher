import { useEffect, useRef } from 'react'
import { useAppDispatch, useAppSelector } from '@renderer/store/hooks'
import { setThemePreference } from '@renderer/store/slices/theme-slice'

const useApplyTheme = () => {
  const dispatch = useAppDispatch()
  const preference = useAppSelector((state) => state.theme.preference)
  const hasLoaded = useRef(false)

  useEffect(() => {
    window.settingsAPI.getTheme().then((saved) => {
      dispatch(setThemePreference(saved))
      hasLoaded.current = true
    })
  }, [dispatch])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', preference)
  }, [preference])

  useEffect(() => {
    if (!hasLoaded.current) return
    window.settingsAPI.setTheme(preference)
  }, [preference])
}

export default useApplyTheme
