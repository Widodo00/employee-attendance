import { useState } from "react";
import NavBar from "../../component/navbar";
import Pagination from "../../component/pagination";
import type { paginationInterface } from "../../types/general";

interface dataInterface {
  cell1: string;
  cell2: string;
}

export default function Dashboard() {
  const [data, setData] = useState<paginationInterface<dataInterface>>({
    data: [
      { cell1: "oke", cell2: "oke2" },
      { cell1: "oke1", cell2: "oke21" },
      { cell1: "oke2", cell2: "oke22" },
    ],
    page: 1,
    total: 3,
    totalPage: 10,
  });

  const column = [
    { cell: "cell 1", row: (row: dataInterface) => row.cell1 },
    { cell: "cell 2", row: (row: dataInterface) => <div>{row.cell2}</div> },
  ];

  const handleOnChange = (value: number) => {
    console.log("coba", value);
    setData((prev) => ({ ...prev, page: value }));
  };

  return (
    <div className="w-full h-dvh">
      <NavBar />
      <Pagination columns={column} data={data.data} page={data.page} total={data.total} totalPage={data.totalPage} onChange={handleOnChange} />
    </div>
  );
}
