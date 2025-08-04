
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const invoices = [
  {
    invoice: "INV001",
    paymentStatus: "Paid",
    totalAmount: "$25555550.00",
    paymentMethod: "Credit Card",
    name: "kyssadfadf"
  },
  {
    invoice: "INV002",
    paymentStatus: "Pending",
    totalAmount: "$150.00",
    paymentMethod: "PayPal",
    name: "kyssadfadf"
  },
  {
    invoice: "INV003",
    paymentStatus: "Unpaid",
    totalAmount: "$350.00",
    paymentMethod: "Bank Transfer",
    name: "kyssadfadf"
  },
  {
    invoice: "INV004",
    paymentStatus: "Paid",
    totalAmount: "$450.00",
    paymentMethod: "Credit Card",
    name: "kyssadfadf"
  },
  {
    invoice: "INV005",
    paymentStatus: "Paid",
    totalAmount: "$550.00",
    paymentMethod: "PayPal",
    name: "kyssadfadf"
  },
  {
    invoice: "INV006",
    paymentStatus: "Pending",
    totalAmount: "$200.00",
    paymentMethod: "Bank Transfer",
    name: "kyssadfadf"
  },
  {
    invoice: "INV007",
    paymentStatus: "Unpaid",
    totalAmount: "$300.00",
    paymentMethod: "Credit Card",
    name: "kyssadfadf"
  },
]

export default function Page() {
  return (
    // --- CHANGE HERE ---
    // Wrap the table in a div to allow horizontal scrolling on small screens
    <div className="overflow-x-auto">
      <Table>
        <TableCaption>A list of your recent invoices.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Invoice</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Method</TableHead>
            <TableHead>Amount</TableHead>
            {/* --- CHANGE HERE --- */}
            {/* Added whitespace-nowrap to prevent the text from breaking */}
            <TableHead className="whitespace-nowrap">name of other users</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => (
            <TableRow key={invoice.invoice}>
              <TableCell className="font-medium">{invoice.invoice}</TableCell>
              <TableCell>{invoice.paymentStatus}</TableCell>
              <TableCell>{invoice.paymentMethod}</TableCell>
              <TableCell>{invoice.totalAmount}</TableCell>
              {/* --- CHANGE HERE --- */}
              {/* Added whitespace-nowrap here as well for consistency */}
              <TableCell className="whitespace-nowrap">{invoice.name}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}



/*
// demo use of markdown

import { MarkdownRenderer } from "@/components/newMarkdownRender";

const markdownContent = `
# Question Title

###### Subtitle

Here is a table:

| Amit kumar | Badal raj | Deepak kumar | Deepak kumar |
|---|---|---|---|
| 1 | 2 | 3 | 4 |

\`\`\`rust
fn main() {
// error: semicolon is missing
  println!("hello woddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddrld");
  for i in 1..4 {
    println!("{}", i);
  }
}
\`\`\`

Here is an image:

![Alt text](https://picsum.photos/600/300)

And an equation: $E=mc^2$

Block equation:

$$\\int_0^\\infty e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}$$
`;

export default function Page() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <MarkdownRenderer content={markdownContent} />
      </div>
    </div>
  );
};

*/
