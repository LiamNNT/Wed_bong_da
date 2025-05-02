import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BellIcon, UserCircleIcon } from '@heroicons/react/24/solid';
import axios from 'axios';
import Matches from '../components/Matches';
import MatchForm from '../components/MatchForm';

const MatchesPage = ({ token }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingMatch, setEditingMatch] = useState(null);
  const [news, setNews] = useState([]);
  const [pastMatches, setPastMatches] = useState([]);

  // Fetch news from API (adjust endpoint as needed)
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/news', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNews(response.data);
      } catch (error) {
        console.error('Error fetching news:', error);
      }
    };
    fetchNews();
  }, [token]);

  return (
    <div className="min-h-screen bg-gray-20 font-sans">
      <div className="flex max-w-7xl mx-auto mt-6 space-x-6">
        {/* Sidebar: Football Leagues */}
        <aside className="w-1/5 bg-white rounded-lg shadow-md p-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Football Leagues</h2>
          <ul className="space-y-3">
            {['Premier League', 'La Liga', 'Serie A', 'Bundesliga', 'Eredivisie', 'Primeira Liga', 'Champions League', 'Europa League', 'Conference League'].map((league) => (
              <li key={league} className="flex items-center space-x-3">
                <img src="https://via.placeholder.com/24" alt={league} className="h-6 w-6" />
                <span className="text-gray-700 hover:text-blue-600 cursor-pointer">{league}</span>
              </li>
            ))}
          </ul>
        </aside>

        {/* Main Content: Matches */}
        <main className="w-3/5">
          {token && (
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white p-2 rounded mb-4 hover:bg-blue-700"
            >
              Thêm trận đấu
            </button>
          )}
          {!token && (
            <p className="text-gray-500 mb-4">Vui lòng đăng nhập để thêm, sửa hoặc xóa trận đấu.</p>
          )}
          {showForm ? (
            <MatchForm
              editingMatch={editingMatch}
              setEditingMatch={setEditingMatch}
              setShowForm={setShowForm}
              setMatches={setPastMatches}
              token={token}
            />
          ) : (
            <Matches
              setEditingMatch={setEditingMatch}
              setShowForm={setShowForm}
              type="all"
              onPastMatchesFetched={(pastMatches) => setPastMatches(pastMatches)}
              token={token}
            />
          )}
        </main>

        {/* News Section */}
        <aside className="w-1/5 bg-white rounded-lg shadow-md p-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent News</h2>
          {news.length > 0 ? (
            news.map((item, index) => (
              <div key={index} className="flex space-x-3 mb-4">
                <img src={item.image || 'https://via.placeholder.com/80'} alt="News" className="h-20 w-20 rounded" />
                <div>
                  <h3 className="text-sm font-semibold text-gray-800">{item.title}</h3>
                  <p className="text-xs text-gray-500">{item.time || 'About 23 hours ago'}</p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No news available.</p>
          )}
        </aside>
      </div>
    </div>
  );
};

export default MatchesPage;