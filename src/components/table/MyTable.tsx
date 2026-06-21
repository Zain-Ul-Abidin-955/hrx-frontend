"use client";

import { useMemo, useState } from "react";
import { Card, Input, Table } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import type { TableProps } from "antd";
import CustomPagination from "@/components/pagination/Pagination";

export interface MyTablePaginationConfig {
  currentPage?: number;
  pageSize?: number;
  totalItems?: number | null;
  totalPages?: number | null;
  hasNextPage?: boolean;
  onPageChange?: (page: number) => void;
}

export interface MyTableProps<T extends object> extends Omit<
  TableProps<T>,
  "title" | "pagination"
> {
  title: string;
  searchPlaceholder?: string;
  showSearch?: boolean;
  searchKeys?: (keyof T)[];
  showPagination?: boolean;
  paginationConfig?: MyTablePaginationConfig;
}

function MyTable<T extends object>({
  title,
  searchPlaceholder = "Search...",
  showSearch = true,
  searchKeys,
  showPagination = true,
  paginationConfig,
  columns,
  dataSource = [],
  scroll,
  ...tableProps
}: MyTableProps<T>) {
  const [searchText, setSearchText] = useState("");
  const [internalPage, setInternalPage] = useState(1);

  const pageSize = paginationConfig?.pageSize ?? 10;
  const isControlledPagination = paginationConfig?.onPageChange != null;
  const currentPage = paginationConfig?.currentPage ?? internalPage;

  const filteredData = useMemo(() => {
    if (!searchText.trim()) return dataSource;

    const query = searchText.toLowerCase();

    return dataSource.filter((record) => {
      const keys = searchKeys ?? (Object.keys(record) as (keyof T)[]);

      return keys.some((key) =>
        String(record[key] ?? "")
          .toLowerCase()
          .includes(query),
      );
    });
  }, [dataSource, searchKeys, searchText]);

  const handleSearchChange = (value: string) => {
    setSearchText(value);
    if (!isControlledPagination) {
      setInternalPage(1);
    }
  };

  const totalItems =
    paginationConfig?.totalItems ?? filteredData.length;

  const paginatedData = useMemo(() => {
    if (!showPagination || isControlledPagination) return filteredData;

    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [
    currentPage,
    filteredData,
    isControlledPagination,
    pageSize,
    showPagination,
  ]);

  const handlePageChange = (page: number) => {
    if (paginationConfig?.onPageChange) {
      paginationConfig.onPageChange(page);
      return;
    }
    setInternalPage(page);
  };

  const hasNextPage =
    paginationConfig?.hasNextPage ??
    (isControlledPagination
      ? false
      : currentPage * pageSize < filteredData.length);

  return (
    <Card
      title={
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <span className="text-lg font-semibold">{title}</span>
          {showSearch && (
            <Input
              placeholder={searchPlaceholder}
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="!w-full sm:!w-[340px]"
              allowClear
            />
          )}
        </div>
      }
    >
      <Table<T>
        columns={columns}
        dataSource={paginatedData}
        pagination={false}
        scroll={scroll ?? { x: 1200 }}
        {...tableProps}
      />

      {showPagination && (
        <CustomPagination
          currentPage={currentPage}
          pageSize={pageSize}
          totalItems={totalItems}
          totalPages={paginationConfig?.totalPages}
          hasNextPage={hasNextPage}
          onPageChange={handlePageChange}
        />
      )}
    </Card>
  );
}

export default MyTable;
