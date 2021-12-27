import './header.css';
import { Link, } from 'react-router-dom';

function Header() {
    return (
        <div className='header'>
    <h1>FFXIV Script</h1>
    <div className='nav'>
        <Link to='/'>Home</Link>
        <Link to='/about'>About</Link>
    </div>
</div>
    )
}

export default Header;