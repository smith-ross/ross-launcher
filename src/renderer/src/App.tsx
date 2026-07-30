import Games from './components/Games/Games'
import TopBar from './components/Topbar/Topbar'

function App(): React.JSX.Element {
  return (
    <div className="launcher">
      <TopBar />
      <Games />
    </div>
  )
}

export default App
