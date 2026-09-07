import PageHeader from '../../components/PageHeader';
import formatCurrency from '../../utils/formatCurrency';
import { Link, useSearchParams } from "react-router-dom";
import CatalogPagination from '../../components/CatalogPagination';
import { Table, Button, Row, Col } from "react-bootstrap";
import { toast } from "react-toastify";
import { FaEdit, FaTrash } from "react-icons/fa";
import Message from "../../components/Message";
import Loader from "../../components/Loader";
import {
  useGetProductsQuery,
  useDeleteProductMutation,
} from "../../slices/productsApiSlice";

const ProductListScreen = () => {
  const [params] = useSearchParams();
  const { data, isLoading, error } = useGetProductsQuery({ page: params.get('page') || 1 });
  const products = data?.products || [];

  const [deleteProduct, { isLoading: loadingDelete }] =
    useDeleteProductMutation();

  const deleteHandler = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(id).unwrap();
        toast.success('Product deleted successfully');
      } catch (err) {
        toast.error(err?.data?.message || err?.error || 'Unable to delete product');
      }
    }
  };
  return (
    <>
      <Row className="align-items-center">
        <Col>
          <PageHeader eyebrow="Store administration" title="Products" description="Manage your collection and product details." />
        </Col>
        <Col className="text-end">
          <Button as={Link} to="/admin/product/create" className="btn-sm m-3">
            <FaEdit /> Create product
          </Button>
        </Col>
      </Row>
      {loadingDelete && <Loader />}
      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant="danger">
          {/* {error} */}
          {error?.data?.message || error?.error || "Something went wrong"}
        </Message>
      ) : (
        <>
          <Table striped hover responsive className="table-sm">
            <thead>
              <tr>
                <th>ID</th>
                <th>NAME</th>
                <th>PRICE</th>
                <th>CATEGORY</th>
                <th>BRAND</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 && <tr><td colSpan={6} className="text-center py-4">No products yet. Create a product to begin your collection.</td></tr>}
              {products.map((product) => (
                <tr key={product._id}>
                  <td>{product._id}</td>
                  <td>{product.name}</td>
                  <td>{formatCurrency(product.price)}</td>
                  <td>{product.category}</td>
                  <td>{product.brand}</td>
                  <td>
                    <Link to={`/product/${product._id}`} className="btn btn-light btn-sm">Reviews</Link>
                    <Button
                      as={Link}
                      to={`/admin/product/${product._id}/edit`}
                      variant="light"
                      className="btn-sm mx-2"
                    >
                      <FaEdit />
                    </Button>
                    <Button
                      variant="danger"
                      className="btn-sm mx-2"
                      aria-label={`Delete ${product.name}`}
                      onClick={() => deleteHandler(product._id)}
                    >
                      <FaTrash style={{ color: "white" }} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          {data && <CatalogPagination page={data.page} pages={data.pages} search={params} pathname="/admin/productlist" />}
        </>
      )}
    </>
  );
};

export default ProductListScreen;
