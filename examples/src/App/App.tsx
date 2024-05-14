import yFilesLicense from '../yfiles-license.json'
import './App.css'
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import Header from './Header.tsx'
import routes from './routes.ts'
import SimpleProcessMining from '../examples/SimpleProcessMining'
import { registerLicense } from '@yworks/react-yfiles-process-mining'

import '@yworks/react-yfiles-process-mining/dist/index.css'

function App() {
  registerLicense(yFilesLicense)

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/examples" />} />
        <Route path="examples" element={<Header />}>
          <Route index element={<SimpleProcessMining />} />
          {routes.map(route => (
            <Route path={route.path} key={route.path} element={<route.component />} />
          ))}
        </Route>
      </Routes>
    </HashRouter>
  )
}

export default App
