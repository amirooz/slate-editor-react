import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = (props) => {
    return(
        <div className="navbar-fixed">
            <nav className="nav-wrapper blue darken-3">
                <div className="container">
                    <Link to="/" className="brand-logo">Slate</Link>
                </div>
            </nav>
        </div>        
    )
}

export default Navbar;