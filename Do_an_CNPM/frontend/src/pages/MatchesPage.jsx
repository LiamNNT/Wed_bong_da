import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BellIcon, UserCircleIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/solid';
import axios from 'axios';
import Matches from '../components/Matches';
import MatchForm from '../components/MatchForm';

const MatchesPage = ({ token }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingMatch, setEditingMatch] = useState(null);
  const [news, setNews] = useState([]);
  const [pastMatches, setPastMatches] = useState([]);
  const [seasons, setSeasons] = useState([]); // State để lưu danh sách seasons
  const [openLeagues, setOpenLeagues] = useState({}); // State để quản lý trạng thái dropdown

  // Fetch news từ API (tạm thời bỏ qua nếu lỗi 404)
  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/news', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setNews(response.data || []);
      } catch (error) {
        console.error('Error fetching news:', error);
        setNews([]); // Đặt news là mảng rỗng nếu lỗi
      }
    };
    if (token) fetchNews(); // Chỉ fetch nếu có token
  }, [token]);

  // Fetch seasons từ API
  useEffect(() => {
    const fetchSeasons = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/seasons', {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Seasons API Response:', response.data); // Debug response thô
        // Xử lý phản hồi linh hoạt
        let seasonsData = [];
        if (Array.isArray(response.data)) {
          seasonsData = response.data;
        } else if (response.data && Array.isArray(response.data.data)) {
          seasonsData = response.data.data;
        } else if (response.data && response.data.seasons) {
          seasonsData = response.data.seasons;
        } else {
          console.warn('Unexpected API response format:', response.data);
        }
        console.log('Processed Seasons Data:', seasonsData); // Debug dữ liệu sau xử lý
        setSeasons(seasonsData);
      } catch (error) {
        console.error('Error fetching seasons:', error);
        setSeasons([]); // Đặt seasons là mảng rỗng nếu lỗi
      }
    };
    fetchSeasons(); // Fetch ngay cả khi token null để test
  }, []);

  // Nhóm seasons theo tên giải đấu và năm
  const groupedSeasons = Array.isArray(seasons) ? seasons.reduce((acc, season) => {
    console.log('Processing season:', season); // Debug từng season
    const name = season.season_name; // Truy cập season_name theo model
    if (!name) {
      console.warn('Season without season_name:', season);
      return acc;
    }
    const match = name.match(/^(.+?)(?:\s(\d{4}))?$/); // Tách tên và năm bằng regex
    if (!match) {
      console.warn('Failed to match season name:', name);
      return acc;
    }

    const leagueName = match[1].trim(); // Phần tên (ví dụ: "V-League", "Premier League")
    const year = match[2] || ''; // Phần năm (ví dụ: "2017", hoặc rỗng nếu không có)

    if (!acc[leagueName]) {
      acc[leagueName] = [];
    }
    if (year) {
      acc[leagueName].push(year);
    }
    return acc;
  }, {}) : {};

  console.log('Grouped Seasons:', groupedSeasons); // Debug kết quả grouping

  // Sắp xếp tên giải đấu
  const sortedLeagues = Object.keys(groupedSeasons).sort();

  // Toggle trạng thái mở/đóng của dropdown
  const toggleLeague = (league) => {
    setOpenLeagues((prev) => ({
      ...prev,
      [league]: !prev[league],
    }));
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans pt-1 px">
      <div className="flex max-w-7xl mx-auto mt-6 space-x-6">
        {/* Sidebar: Football Leagues */}
        <aside className="w-1/5 bg-white rounded-lg shadow-md p-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Football Leagues</h2>
          <ul className="space-y-3">
            {sortedLeagues.length > 0 ? (
              sortedLeagues.map((league) => (
                <li key={league}>
                  <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => toggleLeague(league)}
                  >
                    <div className="flex items-center space-x-3">
                      <img src="https://via.placeholder.com/24" alt={league} className="h-6 w-6" />
                      <span className="text-gray-700 hover:text-blue-600">{league}</span>
                    </div>
                    {groupedSeasons[league].length > 0 && (
                      openLeagues[league] ? (
                        <ChevronUpIcon className="h-5 w-5 text-gray-700" />
                      ) : (
                        <ChevronDownIcon className="h-5 w-5 text-gray-700" />
                      )
                    )}
                  </div>
                  {openLeagues[league] && groupedSeasons[league].length > 0 && (
                    <ul className="pl-9 space-y-2 mt-2">
                      {groupedSeasons[league].map((year) => (
                        <li key={year} className="flex items-center space-x-3">
                          <span className="text-gray-700 hover:text-blue-600 cursor-pointer">{year}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))
            ) : (
              <li className="text-gray-500">No leagues available.</li>
            )}
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