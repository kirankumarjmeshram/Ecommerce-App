const PageHeader = ({ title, description, eyebrow = 'ShopSphere', children }) => (
  <div className="page-heading">
    <div><p className="eyebrow">{eyebrow}</p><h1>{title}</h1>{description && <p className="text-muted mb-0">{description}</p>}</div>
    {children}
  </div>
);
export default PageHeader;
