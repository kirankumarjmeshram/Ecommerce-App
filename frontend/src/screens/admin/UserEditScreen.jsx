import { useEffect, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import FormContainer from '../../components/FormContainer';
import Loader from '../../components/Loader';
import Message from '../../components/Message';
import { useGetUserDetailsQuery, useUpdateUserMutation } from '../../slices/usersApiSlice';

const UserEditScreen = () => {
  const { id: userId } = useParams();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const { data: user, isLoading, error } = useGetUserDetailsQuery(userId);
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setIsAdmin(Boolean(user.isAdmin));
    }
  }, [user]);

  const submitHandler = async (event) => {
    event.preventDefault();
    try {
      await updateUser({ userId, name, email, isAdmin }).unwrap();
      toast.success('User updated successfully');
      navigate('/admin/userlist');
    } catch (err) {
      toast.error(err?.data?.message || err?.error || 'Unable to update user');
    }
  };

  return (
    <>
      <Link to="/admin/userlist" className="btn btn-light my-3">Go Back</Link>
      <FormContainer>
        <h1>Edit User</h1>
        {isUpdating && <Loader />}
        {isLoading ? <Loader /> : error ? (
          <Message variant="danger">{error?.data?.message || error?.error || 'Unable to load user'}</Message>
        ) : (
          <Form onSubmit={submitHandler}>
            <Form.Group controlId="name" className="my-3">
              <Form.Label>Name</Form.Label>
              <Form.Control type="text" value={name} onChange={(event) => setName(event.target.value)} required />
            </Form.Group>
            <Form.Group controlId="email" className="my-3">
              <Form.Label>Email</Form.Label>
              <Form.Control type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
            </Form.Group>
            <Form.Check type="switch" id="isAdmin" label="Administrator access" checked={isAdmin} onChange={(event) => setIsAdmin(event.target.checked)} className="my-3" />
            <Button type="submit" variant="primary" disabled={isUpdating}>Update User</Button>
          </Form>
        )}
      </FormContainer>
    </>
  );
};

export default UserEditScreen;
