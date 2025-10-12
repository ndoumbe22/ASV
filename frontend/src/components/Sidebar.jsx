import React from "react";
import { Link } from "react-router-dom";
import { FaUserMd, FaBars } from "react-icons/fa";

function Sidebar({ isOpen, toggleSidebar, menuItems, logoText = "HealthMeet" }) {
  return (
    <>
      {/* Mobile toggle button */}
      <button
        className="md:hidden fixed top-4 left-4 z-30 p-2 rounded-md bg-green-600 text-white"
        onClick={toggleSidebar}
      >
        <FaBars />
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed md:relative z-20 h-full bg-green-700 text-white transition-all duration-300 ease-in-out ${
          isOpen ? "left-0 w-64" : "left-0 md:left-0 w-64"
        } md:translate-x-0`}
        style={{ minWidth: "250px" }}
      >
        <div className="flex items-center justify-between p-4 border-b border-green-600">
          <div className="flex items-center">
            <FaUserMd className="mr-2 text-xl" />
            <h1 className="text-xl font-bold">{logoText}</h1>
          </div>
          <button
            className="md:hidden text-white"
            onClick={toggleSidebar}
          >
            <FaBars />
          </button>
        </div>

        <nav className="p-4">
          <ul className="space-y-2">
            {menuItems.map((item, index) => (
              <li key={index}>
                <Link
                  to={item.path}
                  className="flex items-center p-3 rounded-lg hover:bg-green-600 transition-colors duration-200"
                  onClick={toggleSidebar}
                >
                  <span className="mr-3">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden"
          onClick={toggleSidebar}
        ></div>
      )}
    </>
  );
}

export default Sidebar;