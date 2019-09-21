import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = (props) => {
    return(
        <div class="navbar-fixed">
            <nav className="nav-wrapper pink darken-4">
                <div className="container">
                    <Link to="/" className="brand-logo">Slate</Link>
                </div>
            </nav>
        </div>        
    )
}

export default Navbar;