import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const Matches = ({ setEditingMatch = () => {}, setShowForm = () => {}, type = 'all', onPastMatchesFetched = () => {}, token }) => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        console.log('Token:', token); // Debug token
        const response = await axios.get('http://localhost:5000/api/matches/', {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('API Response:', response.data); // Debug API response
        const matchesData = response.data.data || response.data || [];
        setMatches(matchesData);
        console.log('Matches:', matchesData); // Debug matches
        setLoading(false);
      } catch (err) {
        console.error('Fetch Error:', err.response || err.message); // Debug error
        setError('Không thể tải danh sách trận đấu');
        setLoading(false);
      }
    };

    fetchMatches();
  }, [token]);

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

  const groupedMatches = matches.reduce((acc, match) => {
    const league = match.season_id?.name || 'Unknown League'; // Adjust if season_id has a different field
    if (!acc[league]) acc[league] = [];
    acc[league].push(match);
    return acc;
  }, {});
  
  console.log('Grouped Matches:', groupedMatches); // Debug grouped matches

  const sortedLeagues = Object.keys(groupedMatches).sort();

  return (
    <div className="space-y-4">
      {sortedLeagues.map((league) => (
        <div key={league} className="bg-gray-800 rounded-lg shadow-md p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-gray-300">{league}</span>
            <span className="text-xs text-gray-500">
              {groupedMatches[league][0]?.date
                ? new Date(groupedMatches[league][0].date).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  })
                : 'N/A'}
            </span>
          </div>
          {groupedMatches[league].map((match) => {
            const [team1Score, team2Score] = match.score ? match.score.split('-') : ['0', '0'];
            const team1 = match.team1 || { team_name: 'Team A', logo: 'https://via.placeholder.com/24' };
            const team2 = match.team2 || { team_name: 'Team B', logo: 'https://via.placeholder.com/24' };

            return (
              <div
                key={match._id}
                className="flex items-center py-2 border-b border-gray-700 last:border-b-0"
              >
                <div className="flex items-center space-x-2 w-1/4">
                  <span className="text-gray-300">{team1.team_name}</span>
                  <img
                    src={team1.logo || 'https://via.placeholder.com/24'}
                    alt={`${team1.team_name} logo`}
                    className="w-6 h-6 object-contain"
                    onError={(e) => (e.target.src = 'https://via.placeholder.com/24')}
                  />
                </div>
                <div className="flex justify-center w-2/4">
                  <span className="text-lg font-bold text-white">{team1Score}</span>
                  <span className="text-lg font-bold text-white mx-2">-</span>
                  <span className="text-lg font-bold text-white">{team2Score}</span>
                </div>
                <div className="flex items-center justify-end space-x-2 w-1/4">
                  <img
                    src={team2.logo || 'https://via.placeholder.com/24'}
                    alt={`${team2.team_name} logo`}
                    className="w-6 h-6 object-contain"
                    onError={(e) => (e.target.src = 'https://via.placeholder.com/24')}
                  />
                  <span className="text-gray-300">{team2.team_name}</span>
                  <Link
                    to={`/match/${match._id}`}
                    className="bg-green-500 text-white text-xs px-2 py-1 rounded hover:bg-green-600"
                  >
                    Chi tiết
                  </Link>
                  {token && (
                    <>
                      <button
                        onClick={() => handleEdit(match)}
                        className="bg-yellow-500 text-white text-xs px-2 py-1 rounded hover:bg-yellow-600"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleDelete(match._id)}
                        className="bg-red-500 text-white text-xs px-2 py-1 rounded hover:bg-red-600"
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
      {sortedLeagues.length === 0 && (
        <p className="text-gray-300 text-center">Không có trận đấu nào.</p>
      )}
    </div>
  );
};

export default Matches;