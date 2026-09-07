import { useState } from 'react';
import { Form, Button } from 'react-bootstrap';
import { clampRange, validateCatalogRange } from '../utils/priceRange';
import formatCurrency from '../utils/formatCurrency';

const PriceRangeFilter = ({ params, bounds, onApply }) => {
  const [min, setMin] = useState(params.get('minPrice') || '');
  const [max, setMax] = useState(params.get('maxPrice') || '');
  const [error, setError] = useState('');
  const low = bounds ? clampRange(min === '' ? bounds.min : min, bounds.min, bounds.max) : 0;
  const high = bounds ? clampRange(max === '' ? bounds.max : max, bounds.min, bounds.max) : 0;
  const change = (setter, value) => { setter(value); setError(''); };
  return <Form noValidate onSubmit={(event) => {
    event.preventDefault();
    const invalid = [...event.currentTarget.elements].some((el) => el.type === 'number' && !el.validity.valid);
    const message = invalid ? 'Enter valid prices with up to two decimal places.' : validateCatalogRange(min, max, bounds);
    if (message) { setError(message); return; }
    onApply({ minPrice: min, maxPrice: max });
  }}><fieldset><legend>Price Range</legend>
    {bounds && <><div className="small d-flex justify-content-between"><span>{formatCurrency(bounds.min)}</span><span>{formatCurrency(bounds.max)}</span></div><div className="dual-range">
      <input type="range" aria-label="Minimum price slider" min={bounds.min} max={bounds.max} step="0.01" value={Math.min(low, high)} disabled={bounds.min === bounds.max} onChange={(e) => change(setMin, String(Math.min(Number(e.target.value), high)))} />
      <input type="range" aria-label="Maximum price slider" min={bounds.min} max={bounds.max} step="0.01" value={Math.max(low, high)} disabled={bounds.min === bounds.max} onChange={(e) => change(setMax, String(Math.max(Number(e.target.value), low)))} />
    </div></>}
    <Form.Group controlId="catalog-min"><Form.Label>Minimum price</Form.Label><Form.Control type="number" min="0" step="0.01" value={min} onChange={(e) => change(setMin, e.target.value)} aria-invalid={Boolean(error)} aria-describedby={error ? 'price-error' : undefined} /></Form.Group>
    <Form.Group controlId="catalog-max"><Form.Label>Maximum price</Form.Label><Form.Control type="number" min="0" step="0.01" value={max} onChange={(e) => change(setMax, e.target.value)} aria-invalid={Boolean(error)} aria-describedby={error ? 'price-error' : undefined} /></Form.Group>
    {error && <p role="alert" id="price-error" className="text-danger small">{error}</p>}
    <Button type="submit" size="sm" className="mt-2">Apply price range</Button>
  </fieldset></Form>;
};
export default PriceRangeFilter;
