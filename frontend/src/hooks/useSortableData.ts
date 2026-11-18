import { useState } from "react";

type SortDirection = "asc" | "desc";

type Comparator<T> = (a: T, b: T) => number;

type Comparators<T, K extends string> = Record<K, Comparator<T>>;

export const useSortableData = <T, K extends string>(
  data: T[],
  comparators: Comparators<T, K>,
  initialColumn: K,
) => {
  const [sortColumn, setSortColumn] = useState<K>(initialColumn);
  const [sortDirection, setSortDirection] =
    useState<SortDirection>("asc");

  const handleSort = (column: K) => {
    if (column === sortColumn) {
      setSortDirection((current) =>
        current === "asc" ? "desc" : "asc",
      );
      return;
    }

    setSortColumn(column);
    setSortDirection("asc");
  };

  const sortedData = [...data].sort((a, b) => {
    const comparator = comparators[sortColumn];

    if (!comparator) {
      return 0;
    }

    const comparison = comparator(a, b);

    return sortDirection === "asc" ? comparison : -comparison;
  });

  const sortIndicator = (column: K) => {
    if (column !== sortColumn) {
      return "";
    }

    return sortDirection === "asc" ? " ▲" : " ▼";
  };

  return {
    sortedData,
    sortColumn,
    sortDirection,
    handleSort,
    sortIndicator,
  };
};