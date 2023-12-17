import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import {
  Box,
  Button,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
  Typography,
  TextField
} from "@mui/material";
import { common } from "@mui/material/colors";
import {
  CellContext,
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  HeaderContext,
  Row,
  SortingState,
  useReactTable
} from "@tanstack/react-table";
import React, { useCallback, useEffect, useState, useMemo } from "react";
import axios from "axios";

interface User {
  address: {
    city: string;
    geo: {
      lat: string;
      lng: string;
    }
  }
}

/**
 * A function whether it was judged to an error type or not.
 */
const isError = (error: unknown): error is Error => {
  return error instanceof Error;
};

export const App = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<Error | undefined>(undefined);
  const columns = useMemo<ColumnDef<User>[]>(
    () => [
      {
        header: "username",
        accessorKey: "username",
      },
      {
        header: "email",
        accessorKey: "email",
      },
      {
        header: "phone",
        accessorKey: "phone",
      }
    ],
    []
  );
  const [filterConditions, setFilterConditions] = useState<
    { id: string; value: string | number }[]
  >([]);
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "username", desc: false }
  ]);
  const [pageSetting, setPageSetting] = useState({
    pageIndex: 0,
    pageSize: 5
  });

  const getCustomHeader = (
    name: string,
    isSortable: boolean,
    props: HeaderContext<any, unknown>
  ) =>
    isSortable ? (
      <TableSortLabel
        onClick={() => {
          if (props.header.id === sorting[0].id) {
            setSorting([{ ...sorting[0], desc: !sorting[0].desc }]);
          } else {
            setSorting([{ id: props.header.id, desc: true }]);
          }
        }}
        IconComponent={() => (
          <ArrowDropDownIcon
            sx={{
              fontSize: "2rem",
              color: sorting[0].id === props.header.id ? common.white : "grey",
              transform:
                sorting[0].desc === true && sorting[0].id === props.header.id
                  ? "rotate(180deg)"
                  : "rotate(0)"
            }}
          />
        )}
      >
        <Typography color="common.white" sx={{ fontWeight: "bold" }}>
          {name}
        </Typography>
      </TableSortLabel>
    ) : (
      <Typography color="common.white" sx={{ fontWeight: "bold" }}>
        {name}
      </Typography>
    );
  const getCustomBody = (
    props: CellContext<any, unknown>,
    align: "center" | "right" | "left",
    isFlag: boolean
  ) =>(
      <TableCell align={align} key={props.cell.id}>
        <Typography>{props.cell.getValue<string>()}</Typography>
      </TableCell>
    );

  const dateAndNumberFilter = (row: Row<any>, id: string) => {
    const condition = filterConditions.find(
      (condition) => condition.id === id && condition.value
    );

    if (!condition || condition.value === null) {
      return true;
    }

    let dataVal: number;
    let conditionVal: number;

    if (typeof condition.value === "string") {
      try {
        dataVal = new Date(row.getValue(id) as string).getTime();
        conditionVal = new Date(condition.value.replace("-", "/")).getTime();
      } catch {
        return true;
      }
    } else {
      dataVal = row.getValue(id) as number;
      conditionVal = condition.value as number;
    }

    if (dataVal === conditionVal) {
      return true;
    } else {
      return false;
    }
  };

  const stringFilter = (row: Row<any>, id: string) => {
    const condition = filterConditions.find(
      (condition) => condition.id === id && condition.value
    );

    if (
      !condition ||
      condition.value === null ||
      typeof condition.value !== "string"
    ) {
      return true;
    }

    if ((row.getValue(id) as string).includes(condition.value)) {
      return true;
    } else {
      return false;
    }
  };

  const onChangeCondition = (id: string, value: string | number) => {
    setFilterConditions([
      ...filterConditions.filter((condition) => condition.id !== id),
      { id, value }
    ]);
  };

  // There is "globalFilter".
  // "globalFilter" filters whether a specific search word exists or not.
  const COLUMNS: ColumnDef<any>[] = [
    {
      header: (props) => getCustomHeader("username", false, props),
      accessorKey: "username",
      cell: (props) => getCustomBody(props, "left", false),
      filterFn: (row, id) => stringFilter(row, id)
    },
    {
      header: (props) => getCustomHeader("email", false, props),
      accessorKey: "email",
      cell: (props) => getCustomBody(props, "left", false),
      filterFn: (row, id) => stringFilter(row, id)
    },
    {
      header: (props) => getCustomHeader("phone", false, props),
      accessorKey: "phone",
      cell: (props) => getCustomBody(props, "left", false),
      filterFn: (row, id) => dateAndNumberFilter(row, id)
    }
  ];

  const table = useReactTable({
    data: users,
    columns: COLUMNS,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      sorting: sorting,
      columnFilters: filterConditions,
      pagination: {
        pageIndex: pageSetting.pageIndex,
        pageSize: pageSetting.pageSize
      }
    }
  });

  const fetchUser = useCallback(async () => {
    try {
      const response = await axios.get("https://jsonplaceholder.typicode.com/users");
      setUsers(response.data);
    } catch (e) {
      if (isError(e)) {
        setError(e);
      }
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  if (error) {
    return <div>{error.message}</div>;
  }

  return (
    <Box m={2}>
      <Box mt={2}>
        <TextField
          label="username"
          InputLabelProps={{ shrink: true }}
          variant="standard"
          value={
            filterConditions.find((condition) => condition.id === "username")
              ?.value ?? ""
          }
          onChange={(e) => {
            onChangeCondition("username", e.target.value);
          }}
        />
      </Box>

      <Box mt={2}>
        <TextField
          label="email"
          InputLabelProps={{ shrink: true }}
          variant="standard"
          value={
            filterConditions.find((condition) => condition.id === "email")
              ?.value ?? ""
          }
          onChange={(e) => {
            onChangeCondition("email", e.target.value);
          }}
        />
      </Box>
      <Box sx={{ overflowX: "auto" }}>
        <Table
          sx={{
            marginTop: "1rem"
          }}
        >
          <TableHead sx={{ backgroundColor: "blue" }}>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableCell align="left" key={header.id}>
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableHead>
          <TableBody>
            {table.getRowModel().rows.map((row) => {
              return (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <React.Fragment key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </React.Fragment>
                  ))}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Box>

      <Box
        sx={{
          textAlign: "center",
          marginTop: "2rem",
          marginBottom: "2rem"
        }}
      >
        <Button
          disabled={!table.getCanPreviousPage()}
          onClick={() =>
            setPageSetting((old) => {
              return { ...pageSetting, pageIndex: old.pageIndex - 1 };
            })
          }
        >
          PrevPage
        </Button>
        <Select
          value={pageSetting.pageIndex}
          disabled={table.getPageCount() === 0}
          onChange={(e) =>
            setPageSetting({
              ...pageSetting,
              pageIndex: e.target.value as number
            })
          }
        >
          {[...Array(table.getPageCount())].map((_, index) => (
            <MenuItem key={index} value={index}>
              {table.getPageCount() !== 0
                ? `${index + 1}/${table.getPageCount()}`
                : 0}
            </MenuItem>
          ))}
        </Select>
        <Button
          disabled={!table.getCanNextPage()}
          onClick={() =>
            setPageSetting((old) => {
              return { ...pageSetting, pageIndex: old.pageIndex + 1 };
            })
          }
        >
          NextPage
        </Button>
      </Box>
    </Box>
  );
};
export default App;
