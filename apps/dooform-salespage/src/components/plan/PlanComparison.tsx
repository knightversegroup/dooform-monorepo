import { Fragment } from 'react';
import { Check, Minus } from 'lucide-react';
import type { ComparisonDict } from './PlanCards';

export default function PlanComparison({ dict }: { dict: ComparisonDict }) {
  return (
    <section className="px-[10px] py-20">
      <div className="mx-auto max-w-[1280px] px-6">
        {/* Scrollable wrapper for mobile */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] border-collapse">
            {/* Header */}
            <thead>
              <tr className="border-b border-[#e5e5e5]">
                <th className="pb-4 pr-4 text-left text-sm font-medium text-[#666]">
                  {dict.heading}
                </th>
                {dict.columns.map((col) => (
                  <th
                    key={col}
                    className="pb-4 text-center text-sm font-semibold text-[#262626]"
                    style={{ width: '18%' }}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {dict.sections.map((section) => (
                <Fragment key={section.name}>
                  {/* Section header */}
                  <tr>
                    <td
                      colSpan={dict.columns.length + 1}
                      className="pb-3 pt-10 text-base font-bold text-[#262626]"
                    >
                      {section.name}
                    </td>
                  </tr>

                  {/* Rows */}
                  {section.rows.map((row) => (
                    <tr
                      key={row.feature}
                      className="border-b border-[#f0f0f0]"
                    >
                      <td className="py-3.5 pr-4 text-sm text-[#4d4d4d]">
                        {row.feature}
                      </td>
                      {row.values.map((value, i) => (
                        <td key={i} className="py-3.5 text-center">
                          {value === true ? (
                            <Check className="mx-auto h-4 w-4 text-[#262626]" />
                          ) : value === false ? (
                            <Minus className="mx-auto h-4 w-4 text-[#ccc]" />
                          ) : (
                            <span className="text-sm text-[#262626]">
                              {value}
                            </span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
