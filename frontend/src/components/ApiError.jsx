import { Button } from 'react-bootstrap';
import Message from './Message';
import getErrorMessage from '../utils/getErrorMessage';

const ApiError = ({ error, title = 'Unable to load products', onRetry }) => <Message variant="danger">
  <h2>{title}</h2>
  <p>{getErrorMessage(error, 'Please try again.')}</p>
  {onRetry && <Button variant="light" onClick={onRetry}>Retry</Button>}
</Message>;
export default ApiError;
