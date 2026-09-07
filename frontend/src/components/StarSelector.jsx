import { useId, useState } from 'react';
import { FaStar, FaRegStar } from 'react-icons/fa';

const StarSelector = ({ value = 0, onChange, label = 'Customer Rating', minimum = false }) => {
  const id = useId();
  const [hover, setHover] = useState(0);
  return <fieldset className="star-selector"><legend>{label}</legend>
    <div className="star-options" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((number) => <span key={number}>
        <input className="visually-hidden" type="radio" id={`${id}-${number}`} name={id} value={number} checked={Number(value) === number} onChange={() => onChange(number)} aria-label={`${number} ${number === 1 ? 'star' : 'stars'}${minimum ? ' and above' : ''}`} />
        <label htmlFor={`${id}-${number}`} onMouseEnter={() => setHover(number)}>{number <= (hover || Number(value)) ? <FaStar aria-hidden="true" /> : <FaRegStar aria-hidden="true" />}</label>
      </span>)}
    </div>
    <div className="small mt-1" aria-live="polite">{value ? `${value}★${minimum ? ' & above' : ' selected'}` : 'No rating selected'} {minimum && value > 0 && <button type="button" className="btn btn-link btn-sm" onClick={() => onChange('')}>Clear rating</button>}</div>
  </fieldset>;
};
export default StarSelector;
