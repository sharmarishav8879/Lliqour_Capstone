import Link from "next/link";
import Image from "next/image";
import { HiOutlineUser, HiOutlineShoppingCart } from "react-icons/hi2";
import { HiOutlineSearch } from "react-icons/hi";

export default function Navbar() {
  return (
    <nav className="bg-white py-6 px-6">
      <div className="flex items-center justify-between">
        
        <div className="flex items-center pl-50"> 
          <Image
            src="/placeholderLogo.png"
            alt="Legacy Liquor Logo"
            width={40}
            height={40}
          />
          <span className="ml-3 text-black text-xl font-bold">Legacy Liquor</span>
        </div>

        <ul className="flex space-x-10 text-black text-lg font-semibold">
          <li>
            <Link href="/">Home</Link>
          </li>
          <li>
            <Link href="/sale">On Sale</Link>
          </li>
          <li>
            <Link href="/catalogue">Catalogue</Link>
          </li>
          <li>
            <Link href="/contact">Contact Us</Link>
          </li>
        </ul>

        <ul className="flex space-x-6 text-black text-3xl pr-50">
          <li>
            <Link href="/search">
              <HiOutlineSearch />
            </Link>
          </li>
          <li>
            <Link href="/account">
              <HiOutlineUser />
            </Link>
          </li>
          <li>
            <Link href="/cart">
              <HiOutlineShoppingCart />
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
