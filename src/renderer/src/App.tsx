import Games from './components/Games/Games'
import TopBar from './components/Topbar/Topbar'
import Snowfall from './components/Snowfall/Snowfall'
import useApplyTheme from './util/useApplyTheme'
import { useAppSelector } from './store/hooks'

function App(): React.JSX.Element {
  useApplyTheme()
  const isChristmas = useAppSelector((state) => state.theme.preference === 'christmas')

  return (
    <div className="launcher">
      <TopBar />
      <Games />
      {isChristmas && <Snowfall />}
    </div>
  )
}

export default App
