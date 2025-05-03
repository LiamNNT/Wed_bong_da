import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Matches = ({ setEditingMatch = () => {}, setShowForm = () => {}, type = 'all', onPastMatchesFetched = () => {}, token }) => {
  const [matches, setMatches] = useState([]);
  const [seasons, setSeasons] = useState({}); // Lưu thông tin seasons theo season_id
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMatchesAndSeasons = async () => {
      try {
        // Bước 1: Lấy danh sách trận đấu
        console.log('Token:', token); // Debug token
        const response = await axios.get('http://localhost:5000/api/matches/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Matches API Response:', response.data); // Debug API response
        const matchesData = response.data.data || response.data || [];
        setMatches(matchesData);
        onPastMatchesFetched(matchesData); // Callback để truyền matches ra ngoài

        // Bước 2: Lấy danh sách season_id duy nhất
        const seasonIds = [...new Set(matchesData.map(match => match.season_id).filter(id => id))];
        console.log('Season IDs:', seasonIds); // Debug season_ids

        // Bước 3: Gọi API để lấy thông tin seasons
        const seasonPromises = seasonIds.map(async (seasonId) => {
          try {
            const seasonResponse = await axios.get(`http://localhost:5000/api/seasons/${seasonId}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            return { id: seasonId, data: seasonResponse.data };
          } catch (err) {
            console.error(`Error fetching season ${seasonId}:`, err);
            return { id: seasonId, data: null };
          }
        });

        const seasonResults = await Promise.all(seasonPromises);
        const seasonsData = seasonResults.reduce((acc, result) => {
          if (result.data) {
            acc[result.id] = result.data;
          }
          return acc;
        }, {});
        console.log('Seasons Data:', seasonsData); // Debug seasons
        setSeasons(seasonsData);

        setLoading(false);
      } catch (err) {
        console.error('Fetch Matches Error:', err.response || err.message); // Debug error
        setError('Không thể tải danh sách trận đấu');
        setLoading(false);
      }
    };

    fetchMatchesAndSeasons();
  }, [token, onPastMatchesFetched]);

  const handleEdit = (match) => {
    setEditingMatch(match);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/matches/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMatches(matches.filter((match) => match._id !== id));
    } catch (err) {
      setError('Không thể xóa trận đấu');
    }
  };

  if (loading) return <p className="text-gray-300">Đang tải...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  // Nhóm matches theo league (season_name) và ngày bắt đầu
  const groupedMatches = matches.reduce((acc, match) => {
    const season = seasons[match.season_id];
    const leagueName = season?.season_name ? season.season_name.match(/^(.+?)(?:\s(\d{4}))?/)[1].trim() : 'Unknown League';
    const dateStr = match.date ? new Date(match.date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }) : 'No Date';

    if (!acc[leagueName]) {
      acc[leagueName] = {};
    }
    if (!acc[leagueName][dateStr]) {
      acc[leagueName][dateStr] = [];
    }
    acc[leagueName][dateStr].push(match);
    return acc;
  }, {});

  const sortedLeagues = Object.keys(groupedMatches).sort();

  return (
    <div className="space-y-6">
      {sortedLeagues.map((league) => (
        <div
          key={league}
          className="bg-white shadow-md p-4 rounded-lg"
        >
          <div className="flex justify-between items-center mb-4 border-b-2 border-gray-200 pb-2">
            <h3 className="text-xl font-bold text-gray-800">{league}</h3>
            {Object.keys(groupedMatches[league]).length > 0 && (
              <h4 className="text-lg font-semibold text-gray-600">
                {Object.keys(groupedMatches[league])[0]} {/* Lấy ngày đầu tiên làm đại diện */}
              </h4>
            )}
          </div>
          {Object.keys(groupedMatches[league]).sort().map((date) => (
            <div key={date}>
              <h4 className="text-lg font-semibold text-gray-700 mt-4 mb-2">{date}</h4>
              {groupedMatches[league][date].map((match, index) => {
                const [team1Score, team2Score] = match.score ? match.score.split('-') : ['0', '0'];
                const team1 = match.team1 || { team_name: 'Team A', logo: 'https://via.placeholder.com/24' };
                const team2 = match.team2 || { team_name: 'Team B', logo: 'https://via.placeholder.com/24' };

                return (
                  <div
                    key={match._id}
                    className="flex items-center py-3 px-4"
                    style={{ borderBottom: index === groupedMatches[league][date].length - 1 ? 'none' : '1px solid #e5e7eb' }}
                  >
                    <div className="w-1/3 flex items-center space-x-3">
                      <img
                        src={team1.logo || 'https://via.placeholder.com/24'}
                        alt={`${team1.team_name} logo`}
                        className="w-6 h-6 object-contain"
                        onError={(e) => (e.target.src = 'https://via.placeholder.com/24')}
                      />
                      <span className="text-gray-800 font-medium">{team1.team_name}</span>
                    </div>
                    <div className="w-1/3 flex justify-center space-x-4">
                      <span className="text-xl font-bold text-gray-600">{team1Score}</span>
                      <span className="text-xl font-bold text-gray-600">-</span>
                      <span className="text-xl font-bold text-gray-600">{team2Score}</span>
                    </div>
                    <div className="w-1/3 flex items-center justify-end space-x-3">
                      <span className="text-gray-800 font-medium">{team2.team_name}</span>
                      <img
                        src={team2.logo || 'https://via.placeholder.com/24'}
                        alt={`${team2.team_name} logo`}
                        className="w-6 h-6 object-contain"
                        onError={(e) => (e.target.src = 'https://via.placeholder.com/24')}
                      />
                    </div>
                    <div className="w-1/4 flex items-center justify-end space-x-2 ml-4">
                      <Link
                        to={`/match/${match._id}`}
                        className="bg-green-500 text-white text-sm px-3 py-1 rounded hover:bg-green-600 transition-colors"
                      >
                        Chi tiết
                      </Link>
                      {token && (
                        <>
                          <button
                            onClick={() => handleEdit(match)}
                            className="bg-yellow-500 text-white text-sm px-3 py-1 rounded hover:bg-yellow-600 transition-colors"
                          >
                            Sửa
                          </button>
                          <button
                            onClick={() => handleDelete(match._id)}
                            className="bg-red-500 text-white text-sm px-3 py-1 rounded hover:bg-red-600 transition-colors"
                          >
                            Xóa
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
          {Object.keys(groupedMatches[league]).length === 0 && (
            <p className="text-gray-500 text-center">Không có trận đấu nào trong {league}.</p>
          )}
        </div>
      ))}
      {sortedLeagues.length === 0 && (
        <p className="text-gray-300 text-center">Không có trận đấu nào.</p>
      )}
    </div>
  );
};

export default Matches;