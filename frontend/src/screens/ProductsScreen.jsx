import { useSearchParams } from 'react-router-dom';
import { Button, Col, Form, Row } from 'react-bootstrap';
import { useGetProductsQuery, useGetProductCategoriesQuery } from '../slices/productsApiSlice';
import Product from '../components/Product';
import Loader from '../components/Loader';
import Message from '../components/Message';
import PageHeader from '../components/PageHeader';
import CatalogPagination from '../components/CatalogPagination';
import { catalogParams, updateCatalogParams } from '../utils/catalogParams';

const ProductsScreen = () => {
  const [params, setParams] = useSearchParams();
  const { currentData: data, isFetching, error, refetch } = useGetProductsQuery(catalogParams(params));
  const { data: categoryData, error: categoryError } = useGetProductCategoriesQuery();
  const update = (changes) => setParams(updateCatalogParams(params, changes));
  const clear = () => setParams({});
  const submitFilters = (event) => {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    const min = fields.get('minPrice'); const max = fields.get('maxPrice');
    const maximum = event.currentTarget.elements.maxPrice;
    maximum.setCustomValidity(min !== '' && max !== '' && Number(min) > Number(max) ? 'Maximum price must be at least the minimum price.' : '');
    if (!event.currentTarget.reportValidity()) return;
    update({ category: fields.get('category'), minPrice: min, maxPrice: max, inStock: fields.has('inStock') ? 'true' : '' });
  };
  return <>
    <PageHeader title="Products" description="Find your next everyday favourite." />
    <div className="catalog-layout">
      <details className="catalog-filters" open>
        <summary>Filters & categories</summary>
        <Form key={params.toString()} onSubmit={submitFilters}>
          <Form.Group controlId="catalog-category"><Form.Label>Category</Form.Label>
            <Form.Select name="category" defaultValue={params.get('category') || ''}>
              <option value="">All Categories</option>
              {params.get('category') && !categoryData?.categories.includes(params.get('category')) && <option>{params.get('category')}</option>}
              {categoryData?.categories.map((category) => <option key={category}>{category}</option>)}
            </Form.Select>
            {categoryError && <Form.Text>Category suggestions are unavailable. Other filters still work.</Form.Text>}
          </Form.Group>
          <fieldset><legend>Price (₹)</legend>
            <Form.Group controlId="catalog-min"><Form.Label>Minimum price</Form.Label><Form.Control type="number" name="minPrice" min="0" step="0.01" defaultValue={params.get('minPrice') || ''} /></Form.Group>
            <Form.Group controlId="catalog-max"><Form.Label>Maximum price</Form.Label><Form.Control type="number" name="maxPrice" min="0" step="0.01" defaultValue={params.get('maxPrice') || ''} onInput={(e) => e.target.setCustomValidity('')} /></Form.Group>
          </fieldset>
          <Form.Check id="catalog-stock" name="inStock" label="In Stock Only" defaultChecked={params.get('inStock') === 'true'} />
          <Button type="submit" className="w-100">Apply filters</Button>
          <Button variant="light" className="w-100" onClick={clear}>Clear filters</Button>
        </Form>
      </details>
      <section aria-label="Product results" aria-busy={isFetching}>
        <div className="catalog-toolbar">
          <div aria-live="polite">{data ? `${data.totalProducts} ${data.totalProducts === 1 ? 'product' : 'products'} found` : 'Browse products'}{params.get('keyword') && <p className="small text-muted mb-0">Search: “{params.get('keyword')}”</p>}</div>
          <Form.Group controlId="catalog-sort"><Form.Label>Sort By</Form.Label><Form.Select value={params.get('sort') || 'newest'} onChange={(e) => update({ sort: e.target.value })}>
            <option value="newest">Newest</option><option value="price_asc">Price: Low to High</option><option value="price_desc">Price: High to Low</option><option value="rating_desc">Customer Rating</option>
          </Form.Select></Form.Group>
        </div>
        {isFetching ? <Loader /> : error ? <Message variant="danger">{error.status === 400 ? 'This catalog link contains invalid filters. Clear filters to start again.' : 'We could not load products. Please try again.'}<div className="mt-2"><Button variant="light" onClick={error.status === 400 ? clear : refetch}>{error.status === 400 ? 'Clear filters' : 'Try again'}</Button></div></Message> : data?.products.length ?
          <Row className="g-4">{data.products.map((product) => <Col xs={12} sm={6} xl={4} key={product._id}><Product product={product} /></Col>)}</Row> :
          <div className="empty-state"><h2>No products found</h2><p>No products match your current filters or page.</p><Button onClick={clear}>Clear filters</Button></div>}
        {data && <CatalogPagination page={data.page} pages={data.pages} search={params} />}
      </section>
    </div>
  </>;
};
export default ProductsScreen;
