import { Link } from "react-router-dom";


function Header () {
    return (
        <header className="topbar">
            <Link to="/">
                <div className="brand brand-header">
                    <span className="brand-mark">K</span>
                    <span>
                        KART<span className="brand-accent">/</span>CONTROL
                    </span>
                </div>
            </Link>
            <div className="top-actions">
                <Link to="/login">Login</Link>
                <Link to="/register">Register</Link>
            </div>
        </header>
    )
}

export default Header