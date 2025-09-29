export default function Footer() {
  return (
    <footer className="w-full bg-white text-black text-xs py-4 mt-20 font-serif shadow-top">


      <div className="max-w-6xl mx-auto text-center flex flex-col md:flex-row justify-between gap-6 px-4">
        <div>
          <p>+1 (123) 456-7890</p>
          <p>support@legacyliquor.com</p>
          <p>123 Liquor St, Beverage City, USA</p>
        </div>

        <div>
          <p>Legacy Liquor, your trusted online liquor store.</p>
          <p>
            &copy; {new Date().getFullYear()} Legacy Liquor. All rights
            reserved.
          </p>
        </div>

        <div>
          <p>Follow us on social media for the latest updates!</p>
          <div className="flex space-x-2 justify-center mt-2">
            <a href="#" className="hover:text-orange-500">
              Facebook
            </a>
            <a href="#" className="hover:text-orange-500">
              Twitter
            </a>
            <a href="#" className="hover:text-orange-500">
              Instagram
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
