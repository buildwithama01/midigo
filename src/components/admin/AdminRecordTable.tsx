import type { ReactNode } from "react";
import AdminTable from "./AdminTable";

export type AdminRecordColumn<T> = {
  header: string;
  render: (record: T, index: number) => ReactNode;
  search?: (record: T) => string;
};

export default function AdminRecordTable<T extends { id: string }>({
  caption,
  columns,
  records,
}: {
  caption: string;
  columns: AdminRecordColumn<T>[];
  records: T[];
}) {
  const rows = records.map((record, index) =>
    columns.map((column) => column.render(record, index)),
  );
  return (
    <AdminTable
      caption={caption}
      columns={columns.map((column) => column.header)}
      rows={rows}
    />
  );
}
