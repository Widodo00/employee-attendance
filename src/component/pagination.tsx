import { ArrowLeft, ArrowRight } from "lucide-react";
import type { paginationInterface } from "../types/general";

export default function Pagination<T>({ data, columns, page, total, totalPage, onChange }: paginationInterface<T>) {
  const visiblePages: number[] = [];
  if (totalPage < 4) {
    for (let i = 0; i < totalPage; i++) {
      visiblePages.push(i + 1);
    }
  } else {
    if (page < 3) {
      for (let i = 0; i < 3; i++) {
        visiblePages.push(i + 1);
      }
    } else if (page > totalPage - 2) {
      for (let i = totalPage - 3; i < totalPage; i++) {
        visiblePages.push(i + 1);
      }
    } else {
      for (let i = page - 2; i < page + 1; i++) {
        visiblePages.push(i + 1);
      }
    }
  }

  return (
    <div className="flex flex-col">
      <table>
        <thead>
          <tr>
            {columns!.map((item, index) => (
              <th key={index} className="border-y border-border py-3 px-5 bg-bg-primary font-semibold text-xs text-text-caption text-start">
                {item.cell.toUpperCase()}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
              {columns!.map((itemCol, indexCol) => (
                <td key={indexCol} className="border-b border-border py-3.5 px-5 font-medium text-sm text-body">
                  {itemCol.row(item)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <p>
        Showing {(page - 1) * 10 + 1}-{(page - 1) * 10 + 10} of {total} results
      </p>
      <div className="flex">
        <button className="btn-secondary" disabled={page === 1} onClick={() => onChange!(page - 1)}>
          <ArrowLeft className="size-4" />
          <p>Prev</p>
        </button>
        {visiblePages.map((item) => (
          <button key={item}>{item}</button>
        ))}
        <button className="btn-secondary" disabled={page === totalPage} onClick={() => onChange!(page + 1)}>
          <p>Next</p>
          <ArrowRight className="size-4" />
        </button>
      </div>
    </div>
  );
}
