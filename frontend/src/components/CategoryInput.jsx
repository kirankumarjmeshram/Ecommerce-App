import { Form } from 'react-bootstrap';
import { useGetProductCategoriesQuery } from '../slices/productsApiSlice';

const CategoryInput = ({ value, onChange }) => {
  const { data } = useGetProductCategoriesQuery();
  return <Form.Group controlId="category" className="my-2">
    <Form.Label>Category</Form.Label>
    <Form.Control required maxLength={100} list="product-categories" value={value} onChange={onChange} aria-describedby="category-help" />
    <datalist id="product-categories">{data?.categories.map((category) => <option key={category} value={category} />)}</datalist>
    <Form.Text id="category-help">Choose an existing category or enter a new one.</Form.Text>
  </Form.Group>;
};
export default CategoryInput;
