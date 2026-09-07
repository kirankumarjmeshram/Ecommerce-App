import { Badge, Container, Navbar, Nav, NavDropdown, Form, Button } from "react-bootstrap";
import { useGetProductCategoriesQuery } from '../slices/productsApiSlice';
import { FaShoppingCart, FaUser } from "react-icons/fa";
import { LinkContainer } from "react-router-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import {useNavigate} from 'react-router-dom';
import {useLogoutMutation} from '../slices/usersApiSlice';
import {logout} from '../slices/authSlice';
import { setCartOwner } from '../slices/cartSlice';
import { catalogLocation } from '../utils/catalogParams';
import { useLocation } from 'react-router-dom';

const Header = () => {
  const { cartItems } = useSelector((state) => state.cart);
  // console.log(cartItems)
  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { data: categoryData, error: categoryError } = useGetProductCategoriesQuery();

  const [logoutApiCall] = useLogoutMutation();// we can call logoutApiCall whatever we want

  const logoutHandler = async () => {
    // console.log("Logout");
    try {
      await logoutApiCall().unwrap();
      dispatch(setCartOwner(null));
      dispatch(logout());
      navigate('/login')
    }catch(err){
      // Keep the existing authenticated UI intact when a network request fails.
    }

  };
  return (
    <header className="store-header">
      <div className="store-announcement">Everyday essentials. Secure checkout with Razorpay.</div>
      <Navbar variant="light" expand="xl" collapseOnSelect>
        <Container>
          <LinkContainer to="/">
            <Navbar.Brand>
              <span className="brand-mark" aria-hidden="true">S</span> ShopSphere<span className="brand-dot">.</span>
            </Navbar.Brand>
          </LinkContainer>

          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Form className="header-search" role="search" onSubmit={(event) => { event.preventDefault(); const keyword = new FormData(event.currentTarget).get('keyword').trim(); navigate(catalogLocation(keyword ? { keyword } : {})); }}>
              <Form.Control key={location.search} defaultValue={new URLSearchParams(location.search).get('keyword') || ''} name="keyword" type="search" maxLength={100} aria-label="Search products" placeholder="Search products…" />
              <Button type="submit" variant="light">Search</Button>
            </Form>
            <Nav className="ms-auto">
              <LinkContainer to="/"><Nav.Link>Home</Nav.Link></LinkContainer>
              <LinkContainer to="/products"><Nav.Link>Products</Nav.Link></LinkContainer>
              <NavDropdown title="Categories" id="categories-menu">
                <LinkContainer to="/products"><NavDropdown.Item>All Categories</NavDropdown.Item></LinkContainer>
                {!categoryError && categoryData?.categories.map((category) => <LinkContainer key={category} to={catalogLocation({ category })} isActive={location.pathname === '/products' && new URLSearchParams(location.search).get('category') === category}><NavDropdown.Item>{category}</NavDropdown.Item></LinkContainer>)}
              </NavDropdown>
              <LinkContainer to="/cart">
                <Nav.Link>
                  <FaShoppingCart />
                  Cart
                  {cartItems.length > 0 && (
                    <Badge pill bg="success" style={{ marginLeft: "5px" }}>
                      {cartItems.reduce((a, c) => a + c.qty, 0)}
                    </Badge>
                  )}
                </Nav.Link>
              </LinkContainer>
              {userInfo ? (
                <NavDropdown title={userInfo.name.split(' ')[0]} id="username">
                  <LinkContainer to="/profile">
                    <NavDropdown.Item>Profile</NavDropdown.Item>
                  </LinkContainer>
                  <NavDropdown.Item onClick={logoutHandler}>
                    Logout
                  </NavDropdown.Item>
                </NavDropdown>
              ) : (
                <LinkContainer to="/login">
                  <Nav.Link>
                    <FaUser />
                    SignIn
                  </Nav.Link>
                </LinkContainer>
              )}
              {userInfo && userInfo.isAdmin && (
                <NavDropdown title="Admin" id="adminmenu">
                  <LinkContainer to='/admin/productlist'>
                    <NavDropdown.Item>Products</NavDropdown.Item>
                  </LinkContainer>
                  <LinkContainer to='/admin/userlist'>
                    <NavDropdown.Item>Users</NavDropdown.Item>
                  </LinkContainer>
                  <LinkContainer to='/admin/orderlist'>
                    <NavDropdown.Item>Orders</NavDropdown.Item>
                  </LinkContainer>
                  <LinkContainer to='/admin/observability'>
                    <NavDropdown.Item>Observability</NavDropdown.Item>
                  </LinkContainer>
                </NavDropdown>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
};

export default Header;
