import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { getGalleryAlbums } from "@/actions/cms-actions";
import { GalleryAlbums } from "@/components/GalleryAlbums";

export default async function GalleryPage() {
  const albums = await getGalleryAlbums();

  return (
    <div className="flex flex-col flex-1">
      <Navbar />
      <GalleryAlbums albums={albums} />

      <footer className="bg-white border-t border-zinc-200 py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <div
                className="text-2xl font-bold mb-6"
                style={{ color: "var(--brand)" }}
              >
                PT AMP
              </div>
              <p className="text-zinc-600 max-w-md mb-6">
                Partner terpercaya untuk kebutuhan kulit manis berkualitas
                tinggi. Melayani pasar lokal dan internasional dengan standar
                mutu terbaik.
              </p>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center hover:bg-zinc-200 transition-colors cursor-pointer">
                  <span className="sr-only">Facebook</span>
                  <svg
                    className="w-5 h-5 text-zinc-600"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center hover:bg-zinc-200 transition-colors cursor-pointer">
                  <span className="sr-only">Instagram</span>
                  <svg
                    className="w-5 h-5 text-zinc-600"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 014.15 2.06c.636-.247 1.363-.416 2.427-.465C7.673 2.013 8.027 2 10.315 2h2zm-5.69 4.34a6.57 6.57 0 00-1.126.27 3.28 3.28 0 00-1.2 1.196 6.57 6.57 0 00-.27 1.126c-.035.795-.04 1.033-.04 3.088 0 2.054.005 2.292.04 3.088.016.368.053.722.112 1.068a3.28 3.28 0 001.31 2.07c.307.195.632.348.97.455.727.228 1.503.238 2.233.03.335-.096.658-.25 1.126-.27 3.28-3.28 0 001.2-1.196c.196-.307.349-.632.455-.97.228-.727.238-1.503.03-2.233a6.57 6.57 0 00-.27-1.126 3.28 3.28 0 00-1.2-1.196 6.57 6.57 0 00-1.126-.27c-.795-.035-1.033-.04-3.088-.04-2.054 0-2.292.005-3.088.04z"
                      clipRule="evenodd"
                    />
                    <path
                      fillRule="evenodd"
                      d="M12 6.865a5.135 5.135 0 100 10.27 5.135 5.135 0 000-10.27zM8.838 12a3.162 3.162 0 116.324 0 3.162 3.162 0 01-6.324 0z"
                      clipRule="evenodd"
                    />
                    <circle cx="18.406" cy="5.594" r="1.44" />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4 text-zinc-900">Links</h3>
              <ul className="space-y-3 text-zinc-600">
                <li>
                  <a
                    href="#about"
                    className="hover:text-brand transition-colors"
                  >
                    About Us
                  </a>
                </li>
                <li>
                  <Link
                    href="/products"
                    className="hover:text-brand transition-colors"
                  >
                    Products
                  </Link>
                </li>
                <li>
                  <Link
                    href="/blog"
                    className="hover:text-brand transition-colors"
                  >
                    Blog
                  </Link>
                </li>
                <li>
                  <Link
                    href="/login"
                    className="hover:text-brand transition-colors"
                  >
                    Login
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4 text-zinc-900">Contact</h3>
              <ul className="space-y-3 text-zinc-600">
                <li className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-zinc-400 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <span>
                    Jl. Raya Padang - Solok, KM 20, Indarung, Padang, Sumatera
                    Barat
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <svg
                    className="w-5 h-5 text-zinc-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  <span>+62 812 3456 7890</span>
                </li>
                <li className="flex items-center gap-3">
                  <svg
                    className="w-5 h-5 text-zinc-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <span>contact@ptamp.com</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-zinc-100 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-zinc-500 text-sm">
              &copy; {new Date().getFullYear()} PT AMP. All rights reserved.
            </div>
            <div className="flex gap-6 text-sm text-zinc-500">
              <a href="#" className="hover:text-zinc-900">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-zinc-900">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
