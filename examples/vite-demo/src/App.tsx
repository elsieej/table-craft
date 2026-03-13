import { NavLink, Route, Routes } from 'react-router'
import UsersWithParamsSearchPage from './pages/users-with-params-search.page'
import UsersWithoutParamsSearchPage from './pages/users-without-params-search.page'
import UsersAdvancedPage from './pages/user-advanced.page'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `text-sm font-medium ${isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`

const App = () => {
  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <nav className="mb-8 flex gap-6 border-b border-slate-200 pb-4">
        <NavLink to="/" end className={navLinkClass}>
          Search (URL params)
        </NavLink>
        <NavLink to="/without-params-search" className={navLinkClass}>
          Search (local state)
        </NavLink>
        <NavLink to="/advanced" className={navLinkClass}>
          Advanced (Advanced Toolbar)
        </NavLink>
      </nav>
      <Routes>
        <Route index element={<UsersWithParamsSearchPage />} />
        <Route
          path="without-params-search"
          element={<UsersWithoutParamsSearchPage />}
        />
        <Route path="advanced" element={<UsersAdvancedPage />} />
      </Routes>
    </div>
  )
}

export default App
