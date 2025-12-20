interface Props {
    status: string;
}

export default function StatusBadge({ status }: Props) {
    const color =
        status === "APPROVED"
            ? "green"
            : status === "REJECTED"
                ? "red"
                : "orange";

    return (
        <span
            style={{
                padding: "4px 8px",
                borderRadius: "6px",
                backgroundColor: color,
                color: "white",
                fontSize: "12px",
            }}
        >
      {status}
    </span>
    );
}
