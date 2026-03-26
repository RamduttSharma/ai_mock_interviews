"use client";

import Link from "next/link";

export default function Footer() {
    return (
        <footer style={{background:"transparent"}} className="w-full border-t mt-16 bg-white">
            <div className="max-w-7xl mx-auto px-6 py-10 grid gap-8 md:grid-cols-3">

                {/* Logo / About */}
                <div>
                    <h2 className="text-xl font-semibold">PrepWise AI</h2>
                    <p className="text-sm text-gray-600 mt-2">
                        AI-powered interview preparation platform with resume-based mock
                        interviews, real-time feedback, and smart analytics.
                    </p>
                </div>

                {/* Links */}
                <div className="flex flex-col gap-2">
                    <h3 className="font-medium">Quick Links</h3>

                    <Link style={{width:"50px"}} href="/" className="text-sm text-gray-600 hover:text-white">
                        Home
                    </Link>

                    <Link style={{width:"75px"}} href="/interview" className="text-sm text-gray-600 hover:text-white">
                        Interviews
                    </Link>

                    <Link style={{width:"45px"}} href="/sign-in" className="text-sm text-gray-600 hover:text-white">
                        Login
                    </Link>
                </div>

                {/* Contact / Social */}
                <div className="flex flex-col gap-2">
                    <h3 className="font-medium">Contact</h3>
                    <p className="text-sm text-gray-600">
                        Dial: <a className=" hover:text-white" href="tel:+917819884117">+917819884117</a>
                    </p>

                    <p className="text-sm text-gray-600">
                        Email: <a className=" hover:text-white" href="mailto:support@prepwise.ai">support@prepwise.ai</a>
                    </p>

                    <div className="flex gap-4 mt-2 text-sm">
                        <a href="#" className="a text-gray-600 hover:text-white">LinkedIn</a>
                        <a href="#" className="a text-gray-600 hover:text-white">GitHub</a>
                        <a href="#" className="a text-gray-600 hover:text-white">Twitter</a>
                    </div>
                </div>
            </div>

            {/* Bottom */}
            <div className="border-t text-center text-sm text-gray-500 py-4">
                © {new Date().getFullYear()} PrepWise AI. All rights reserved.
            </div>
        </footer>
    );
}