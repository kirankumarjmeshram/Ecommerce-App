import PageHeader from '../../components/PageHeader';
import StatusBadge from '../../components/StatusBadge';
import { Button, Table } from 'react-bootstrap';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import Loader from '../../components/Loader';
import Message from '../../components/Message';
import { useDeleteUserMutation, useGetUsersQuery, useUpdateUserMutation } from '../../slices/usersApiSlice';

const UserListScreen = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const { data: users = [], isLoading, error } = useGetUsersQuery();
  const [deleteUser, { isLoading: isDeleting }] = useDeleteUserMutation();
  const [updateUser, { isLoading: updating }] = useUpdateUserMutation();

  const deleteHandler = async (user) => {
    if (user._id === userInfo?._id) {
      toast.error('You cannot delete your own account.');
      return;
    }

    if (!window.confirm(`Delete ${user.name}? This cannot be undone.`)) return;

    try {
      await deleteUser(user._id).unwrap();
      toast.success('User deleted successfully');
    } catch (err) {
      toast.error(err?.data?.message || err?.error || 'Unable to delete user');
    }
  };

  if (isLoading) return <Loader />;
  if (error) return <Message variant="danger">{error?.data?.message || error?.error || 'Unable to load users'}</Message>;

  return (
    <>
      <PageHeader eyebrow="Store administration" title="Users" description="Manage customer accounts and administrator access." />
      {isDeleting && <Loader />}
      {users.length === 0 ? (
        <Message variant="info">No users found.</Message>
      ) : (
        <Table striped hover responsive className="table-sm">
          <thead>
            <tr>
              <th>NAME</th>
              <th>EMAIL</th>
              <th>ROLE</th>
              <th>STATUS</th><th>ORDERS</th>
              <th>CREATED</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td><StatusBadge positive={user.isAdmin}>{user.isAdmin ? 'Admin' : 'Customer'}</StatusBadge></td>
                <td><StatusBadge positive={user.status !== 'suspended'}>{user.status || 'active'}</StatusBadge></td><td>{user.orderCount ?? 0}</td>
                <td>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}</td>
                <td className="text-nowrap">
                  <Button as={Link} to={`/admin/user/${user._id}/edit`} variant="light" className="btn-sm me-2" aria-label={`Edit ${user.name}`}>
                    <FaEdit aria-hidden="true" /> View / Edit
                  </Button>
                  <Button variant="light" size="sm" className="me-2" disabled={user.isAdmin || updating} onClick={async () => {
                    try { await updateUser({ userId: user._id, status: user.status === 'suspended' ? 'active' : 'suspended' }).unwrap(); toast.success('Account status updated'); } catch (err) { toast.error(err?.data?.message || 'Unable to update account status'); }
                  }}>{user.status === 'suspended' ? 'Activate' : 'Suspend'}</Button>
                  <Button variant="outline-danger" className="btn-sm" onClick={() => deleteHandler(user)} disabled={user._id === userInfo?._id || isDeleting || user.orderCount > 0} aria-label={`Delete ${user.name}`}>
                    <FaTrash aria-hidden="true" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </>
  );
};

export default UserListScreen;
