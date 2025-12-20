import "./time-management.css";

export default function TimeManagementLayout({
                                                 children,
                                             }: {
    children: React.ReactNode;
}) {
    return (
        <section className="time-management">
            {children}
        </section>
    );
}