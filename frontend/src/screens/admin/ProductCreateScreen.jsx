import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Form } from 'react-bootstrap';
import { toast } from 'react-toastify';
import FormContainer from '../../components/FormContainer';
import Loader from '../../components/Loader';
import { useCreateProductMutation } from '../../slices/productsApiSlice';

const ProductCreateScreen = () => {
  const navigate = useNavigate();
  const [createProduct, { isLoading }] = useCreateProductMutation();
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('');
  const [countInStock, setCountInStock] = useState('');
  const [description, setDescription] = useState('');

  const submitHandler = async (event) => {
    event.preventDefault();

    try {
      await createProduct({
        name,
        price: Number(price),
        image,
        brand,
        category,
        countInStock: Number(countInStock),
        description,
      }).unwrap();
      toast.success('Product created successfully');
      navigate('/admin/productlist');
    } catch (err) {
      toast.error(err?.data?.message || err?.error || 'Unable to create product');
    }
  };

  return (
    <>
      <Link to="/admin/productlist" className="btn btn-light my-3">
        Go Back
      </Link>
      <FormContainer>
        <h1>Create Product</h1>
        {isLoading && <Loader />}
        <Form onSubmit={submitHandler}>
          <Form.Group controlId="name" className="my-2">
            <Form.Label>Name</Form.Label>
            <Form.Control type="text" value={name} onChange={(event) => setName(event.target.value)} required />
          </Form.Group>
          <Form.Group controlId="price" className="my-2">
            <Form.Label>Price</Form.Label>
            <Form.Control type="number" min="0" step="0.01" value={price} onChange={(event) => setPrice(event.target.value)} required />
          </Form.Group>
          <Form.Group controlId="image" className="my-2">
            <Form.Label>Image path</Form.Label>
            <Form.Control type="text" placeholder="/images/product.jpg" value={image} onChange={(event) => setImage(event.target.value)} required />
          </Form.Group>
          <Form.Group controlId="brand" className="my-2">
            <Form.Label>Brand</Form.Label>
            <Form.Control type="text" value={brand} onChange={(event) => setBrand(event.target.value)} required />
          </Form.Group>
          <Form.Group controlId="category" className="my-2">
            <Form.Label>Category</Form.Label>
            <Form.Control type="text" value={category} onChange={(event) => setCategory(event.target.value)} required />
          </Form.Group>
          <Form.Group controlId="countInStock" className="my-2">
            <Form.Label>Count In Stock</Form.Label>
            <Form.Control type="number" min="0" step="1" value={countInStock} onChange={(event) => setCountInStock(event.target.value)} required />
          </Form.Group>
          <Form.Group controlId="description" className="my-2">
            <Form.Label>Description</Form.Label>
            <Form.Control as="textarea" rows={3} value={description} onChange={(event) => setDescription(event.target.value)} required />
          </Form.Group>
          <Button type="submit" variant="primary" className="my-2" disabled={isLoading}>
            Create Product
          </Button>
        </Form>
      </FormContainer>
    </>
  );
};

export default ProductCreateScreen;
