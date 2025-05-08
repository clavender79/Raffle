import { NavLink } from "react-router-dom"
import { Home, Info, Settings } from "lucide-react"

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <ul className="sidebar-menu">
        <li>
          <NavLink to="/" className={({ isActive }) => (isActive ? "active" : "")}>
            <Home size={18} />
            <span>Home</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/about" className={({ isActive }) => (isActive ? "active" : "")}>
            <Info size={18} />
            <span>About</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/admin" className={({ isActive }) => (isActive ? "active" : "")}>
            <Settings size={18} />
            <span>Admin Panel</span>
          </NavLink>
        </li>
      </ul>
    </aside>
  )
}

export default Sidebar
