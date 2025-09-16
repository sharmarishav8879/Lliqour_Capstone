import Image from "next/image";
import { HiOutlineUser, HiOutlineShoppingCart } from "react-icons/hi2";
import { HiOutlineSearch } from "react-icons/hi";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-white py-6 px-6 fixed top-0 left-0 w-full shadow-md z-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center pl-50">
          <Image
            src="/Logo.jpg"
            className="border-orange-500 border-2 rounded-full"
            alt="Legacy Liquor Logo"
            width={50}
            height={50}
          />
          <span className="ml-3 text-black text-2xl font-bold font-serif">
            Legacy Liquor
          </span>
        </div>

        <ul className="flex space-x-10 text-orange-500  text-xl font-serif">
          <li>
            <Link href="/">Home</Link>
          </li>
          <li>
            <a href="/#special-offer">Special Offers</a>
          </li>
          <li>
            <a href="/#catalogue">Catalogue</a>
          </li>

          {/* JOSEPH Added this item */}
          <li>
            <Link href="/products">Products</Link>
          </li>

          <li>
            <Link href="/contactUs">Contact Us</Link>
          </li>
        </ul>

        <ul className="flex space-x-6 text-black text-3xl pr-50">
          <li>
            <Link href="/searchFilter" aria-label="Search">
              <HiOutlineSearch />
            </Link>
          </li>
          <li>
            <Link href="/account" aria-label="Account">
              <HiOutlineUser />
            </Link>
          </li>
          <li>
            <Link href="" aria-label="Cart">
              <HiOutlineShoppingCart />
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
