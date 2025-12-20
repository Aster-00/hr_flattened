export const ExpiryBadge = ({ status }: { status: string }) => {
  if (status === "Expired") {
    return <span className="badge badge-error">Expired</span>;
  }

  if (status === "Near Expiry") {
    return <span className="badge badge-warning">Near Expiry</span>;
  }

  return <span className="badge badge-success">Active</span>;
};
