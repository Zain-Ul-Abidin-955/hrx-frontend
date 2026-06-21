"use client";

import React from "react";
import { Button } from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";

export interface CustomPaginationProps {
  currentPage: number;
  pageSize: number;
  totalItems?: number | null;
  onPageChange: (page: number) => void;
  hasNextPage?: boolean;
  totalPages?: number | null;
}

const CustomPagination: React.FC<CustomPaginationProps> = ({
  currentPage,
  pageSize,
  totalItems,
  onPageChange,
  hasNextPage = false,
  totalPages: apiTotalPages,
}) => {
  const hasKnownTotal = totalItems != null;

  const totalPages =
    apiTotalPages != null
      ? apiTotalPages
      : hasKnownTotal
        ? Math.ceil(totalItems / pageSize)
        : undefined;

  if (hasKnownTotal && totalPages != null && totalPages <= 1 && currentPage === 1) {
    return null;
  }

  if (!hasKnownTotal && currentPage === 1 && !hasNextPage) {
    return null;
  }

  const isNextDisabled =
    hasKnownTotal && totalPages != null
      ? currentPage >= totalPages
      : !hasNextPage;

  return (
    <div className="mt-6 flex justify-end">
      <div className="flex items-center gap-3">
        <Button
          icon={<LeftOutlined />}
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="!h-9 w-[100px] !rounded-[15px] !bg-primaryColor !text-whiteColor text-h6 disabled:!opacity-50"
        >
          Previous
        </Button>

        <span className="text-sm text-gray-600">
          Page {currentPage}
          {totalPages ? ` of ${totalPages}` : ""}
        </span>

        <Button
          disabled={isNextDisabled}
          onClick={() => onPageChange(currentPage + 1)}
          className="!h-9 w-[100px] !rounded-[15px] !bg-primaryColor !text-whiteColor text-h6 disabled:!opacity-50 flex items-center justify-center gap-2"
        >
          Next <RightOutlined />
        </Button>
      </div>
    </div>
  );
};

export default CustomPagination;
