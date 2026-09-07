import { useSearchParams } from 'react-router-dom';
import StarSelector from '../components/StarSelector';
import PriceRangeFilter from '../components/PriceRangeFilter';
import { Button, Col, Form, Row } from 'react-bootstrap';
import { useGetProductsQuery, useGetProductCategoriesQuery } from '../slices/productsApiSlice';
import Product from '../components/Product';
import ApiError from '../components/ApiError';

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
  return <>
    <PageHeader title="Products" description="Find your next everyday favourite." />
    <div className="catalog-layout">
      <details className="catalog-filters" open>
        <summary>Filters & categories</summary>
        <div className="filter-controls">
          <Form.Group controlId="catalog-category"><Form.Label>Category</Form.Label>
            <Form.Select value={params.get('category') || ''} onChange={(e) => update({ category: e.target.value })}>
              <option value="">All Categories</option>
              {params.get('category') && !categoryData?.categories.includes(params.get('category')) && <option>{params.get('category')}</option>}
              {categoryData?.categories.map((category) => <option key={category}>{category}</option>)}
            </Form.Select>
            {categoryError && <Form.Text>Category suggestions are unavailable.</Form.Text>}
          </Form.Group>
          <StarSelector value={Number(params.get('rating')) || 0} minimum onChange={(rating) => update({ rating })} />
          <PriceRangeFilter key={params.toString()} params={params} bounds={categoryData?.priceRange} onApply={update} />
          <Form.Check id="catalog-stock" label="In Stock Only" checked={params.get('inStock') === 'true'} onChange={(e) => update({ inStock: e.target.checked ? 'true' : '' })} />
          <Button variant="link" size="sm" onClick={clear}>Clear all</Button>
        </div>
      </details>
      <section aria-label="Product results" aria-busy={isFetching}>
        <div className="catalog-toolbar">
          <div aria-live="polite">{data ? `${data.totalProducts} ${data.totalProducts === 1 ? 'product' : 'products'} found` : 'Browse products'}{params.get('keyword') && <p className="small text-muted mb-0">Search: “{params.get('keyword')}”</p>}</div>
          <Form.Group controlId="catalog-sort"><Form.Label>Sort By</Form.Label><Form.Select value={params.get('sort') || 'newest'} onChange={(e) => update({ sort: e.target.value })}>
            <option value="newest">Newest</option><option value="price_asc">Price: Low to High</option><option value="price_desc">Price: High to Low</option><option value="rating_desc">Customer Rating</option>
          </Form.Select></Form.Group>
        </div>
        {isFetching && <p role="status" className="text-muted small">Updating products…</p>}
        {error ? error.status === 400 ? <Message variant="warning"><h2>Invalid catalog filters</h2><p>This link contains invalid filters. Clear filters to start again.</p><Button variant="light" onClick={clear}>Clear filters</Button></Message> : <ApiError error={error} onRetry={refetch} /> : !data && isFetching ?
          <Row className="g-4" aria-hidden="true">{Array.from({ length: 6 }, (_, index) => <Col xs={12} sm={6} xl={4} key={index}><div className="catalog-skeleton" /></Col>)}</Row> : data?.products.length ?
          <Row className="g-4">{data.products.map((product) => <Col xs={12} sm={6} xl={4} key={product._id}><Product product={product} /></Col>)}</Row> :
          <div className="empty-state"><h2>No products found</h2><p>No products match your current filters or page.</p><Button onClick={clear}>Clear filters</Button></div>}
        {!error && data && <CatalogPagination page={data.page} pages={data.pages} search={params} />}
      </section>
    </div>
  </>;
};
export default ProductsScreen;
