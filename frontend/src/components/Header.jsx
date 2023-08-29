import { Container, Navbar, Nav } from 'react-bootstrap';
import {FaShoppingCart, FaUser} from 'react-icons/fa';
const Header = () => {
  return (
    <header>
        <Navbar bg = "dark" variant='dark' expand="md">
            <Container>
                <Navbar.Brand href='/'> EComApp</Navbar.Brand>
                <Navbar.Toggle aria-controls='basic-navbar-nav'/>
                <Navbar.Collapse id='basic-navbar-nav'>
                    <Nav className='ms-auto'>
                        <Nav.Link href="/cart"><FaShoppingCart/>Cart</Nav.Link>
                        <Nav.Link href="/login"><FaUser/>SignIn</Nav.Link>
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
    </header>
  )
}

export default Header