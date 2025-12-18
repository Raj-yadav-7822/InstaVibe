import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const navigate = useNavigate();

  //  Base API URL from .env
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (!query) {
      setResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      try {
        const res = await axios.get(`${API_URL}/user/search?query=${query}`, {
          withCredentials: true,
        });
        setResults(res.data.users || []);
      } catch (error) {
        console.log("Search error:", error);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query, API_URL]);

  const handleProfileClick = (userId) => {
    navigate(`/profile/${userId}`);
    setQuery(""); // clear search input
    setResults([]);
  };

  return (
    <div className="w-full max-w-md mx-auto mt-10">
      {/* Search Input */}
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search users..."
        className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {/* Search Results */}
      {results.length > 0 && (
        <div className="mt-2 border rounded-lg bg-white shadow-md">
          {results.map((user) => (
            <div
              key={user._id}
              onClick={() => handleProfileClick(user._id)}
              className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 cursor-pointer"
            >
              <Avatar className="w-10 h-10">
                <AvatarImage src={user.profilePicture} alt={user.username} />
                <AvatarFallback>
                  {user.username?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{user.username}</p>
                <p className="text-sm text-gray-500">{user.name}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Search;
