import { Link } from 'react-router-dom';
import { updateCatalogParams } from '../utils/catalogParams';

const CatalogPagination = ({ page, pages, search, pathname = '/products' }) => {
  if (pages < 2 && page <= 1) return null;
  const numbers = [...new Set([1, page - 1, page, page + 1, pages])].filter((n) => n >= 1 && n <= pages).sort((a, b) => a - b);
  const link = (number, label) => <Link className={`btn btn-light ${number === page ? 'active' : ''}`} aria-current={number === page ? 'page' : undefined} to={`${pathname}?${updateCatalogParams(search, { page: number }, false)}`}>{label}</Link>;
  return <nav className="catalog-pagination" aria-label="Product pages">
    {page > 1 && link(page - 1, 'Previous')}
    {numbers.map((number, index) => <span key={number}>{index > 0 && number - numbers[index - 1] > 1 && <span className="px-1">…</span>}{link(number, number)}</span>)}
    {page < pages && link(page + 1, 'Next')}
  </nav>;
};
export default CatalogPagination;
