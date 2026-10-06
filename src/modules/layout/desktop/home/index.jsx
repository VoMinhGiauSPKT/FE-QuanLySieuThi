import { Link } from 'react-router-dom'

export default function HomeDesktop() {
  return (
    <div>
      <div>home</div>
      <Link to="/login">Chuyển sang Login</Link>
    </div>
  )
}
