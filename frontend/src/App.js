import {Container} from 'react-bootstrap';
import Header from './components/Header';
import Footer from './components/Footer';
import { Outlet } from 'react-router-dom';
import {ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
//import HomeScreen from './screens/HomeScreen';
const App = () => {
  return (
    <>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <Header/>
      <main id="main-content" className='store-main'>
        <Container>
          <Outlet/>
        </Container>
      </main>
      <Footer/>
      <ToastContainer position="bottom-right" autoClose={4000} theme="light"/>
    </>
  );
}

export default App;
