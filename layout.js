import "../globals.css";
import { CartProvider } from "./context/CartProvider"; // from /app → ./context/CartProvider
// import MiniCart from "../components/MiniCart"; // optional in header

export const metadata = {
  title: "Legacy Liquor",
  description: "Shop • Save • Enjoy",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          {/* <MiniCart />  // optional to show in the header */}
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
