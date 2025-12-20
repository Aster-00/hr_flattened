import Link from "next/link";
import { ShiftType } from "../../types/shiftType";

export const ShiftTypeTable = ({ data }: { data: ShiftType[] }) => {
  return (
    <table className="table">
      <thead>
        <tr>
          <th>Name</th>
          <th>Status</th>
          <th className="text-right">Actions</th>
        </tr>
      </thead>

      <tbody>
        {data.map((type) => (
          <tr key={type._id as unknown as string}>
            <td className="font-medium">{type.name}</td>

            <td>
              <span
                className={`badge ${
                  type.active ? "badge-success" : "badge-error"
                }`}
              >
                {type.active ? "Active" : "Inactive"}
              </span>
            </td>

            <td className="text-right">
              <Link
                href={`/time-management/shift-types/edit/${type._id}`}
                className="text-link font-medium hover:underline"
              >
                Edit
              </Link>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
