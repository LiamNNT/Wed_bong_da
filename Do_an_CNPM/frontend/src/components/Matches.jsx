import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Navigation, Pagination } from 'swiper/modules';

const Matches = ({ matches: propMatches, setMatches: setPropMatches, setEditingMatch = () => { }, setShowForm = () => { }, type = 'all', onPastMatchesFetched = () => { }, token, seasonId, limit }) => {
  const [localMatches, setLocalMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [dateError, setDateError] = useState(''); // State for date validation error

  // Use propMatches if provided, otherwise use localMatches
  const matches = propMatches !== undefined ? propMatches : localMatches;
  const setMatches = setPropMatches || setLocalMatches;

  const defaultLogoUrl = 'https://th.bing.com/th/id/OIP.iiLfIvv8F-PfjMrjObypGgHaHa?rs=1&pid=ImgDetMain';

  const handleImageError = (e) => {
    e.target.src = defaultLogoUrl;
  };

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        let url = 'http://localhost:5000/api/matches/';
        if (seasonId) {
          url = `http://localhost:5000/api/matches/seasons/${seasonId}`;
        }
        const response = await axios.get(url);
        const matchesData = response.data.data || response.data || [];
        setMatches(matchesData);

        const today = new Date();
        const pastMatches = matchesData
          .filter((match) => new Date(match.date) <= today && match.score)
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 5);

        onPastMatchesFetched(pastMatches);

        setLoading(false);
      } catch (err) {
        console.error('Fetch Matches Error:', err.response?.data || err.message);
        setError('Không thể tải danh sách trận đấu');
        setLoading(false);
      }
    };

    fetchMatches();
  }, [seasonId, onPastMatchesFetched, setMatches]);

  const handleEdit = (match) => {
    setEditingMatch(match);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!token) {
      setError('Vui lòng đăng nhập để xóa trận đấu');
      return;
    }
    try {
      await axios.delete(`http://localhost:5000/api/matches/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMatches(matches.filter((match) => match._id !== id));
    } catch (err) {
      setError('Không thể xóa trận đấu');
    }
  };

  // Validate date range when startDate or endDate changes
  const validateDateRange = (start, end) => {
    if (start && end && new Date(end) < new Date(start)) {
      setDateError('Ngày kết thúc không thể trước ngày bắt đầu.');
      return false;
    }
    setDateError('');
    return true;
  };

  // Handle startDate change
  const handleStartDateChange = (value) => {
    setStartDate(value);
    if (value && endDate) {
      validateDateRange(value, endDate);
    }
  };

  // Handle endDate change
  const handleEndDateChange = (value) => {
    setEndDate(value);
    if (startDate && value) {
      validateDateRange(startDate, value);
    }
  };

  // Handle reset filter
  const handleResetFilter = () => {
    setStartDate('');
    setEndDate('');
    setDateError('');
  };

  // Filter matches based on the date range, only for type="all"
  const filterMatchesByDate = (matchesList) => {
    if (type !== 'all' || (!startDate && !endDate)) return matchesList;
    if (dateError) return []; // Return empty list if date range is invalid
    return matchesList.filter((match) => {
      const matchDate = new Date(match.date);
      const start = startDate ? new Date(startDate) : new Date(-8640000000000000); // Min date
      const end = endDate ? new Date(endDate) : new Date(8640000000000000); // Max date
      return matchDate >= start && matchDate <= end;
    });
  };

  if (loading) return <p>Đang tải...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  const today = new Date();
  const filteredMatches = filterMatchesByDate(matches); // Lọc theo dải ngày nếu type="all"
  const pastMatches = filteredMatches
    .filter((match) => new Date(match.date) <= today && match.score)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const upcomingMatches = filteredMatches
    .filter((match) => new Date(match.date) > today)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, limit || undefined); // Áp dụng limit nếu có

  const renderMatches = (list, title, color) => (
    <div>
      <h3 className={`text-2xl font-semibold ${color} mb-4 text-center`}>{title}</h3>
      {list.length > 0 ? (
        list.map((match) => (
          <div
            key={match._id}
            className="border rounded-2xl shadow-md p-6 bg-white hover:shadow-lg transition duration-300 flex flex-col justify-between mb-4"
          >
            <div className="flex flex-col items-center mb-4">
              <div className="flex items-center gap-4 text-xl font-bold text-gray-800">
                <img
                  src={match.team1?.logo || defaultLogoUrl}
                  alt={`${match.team1?.team_name} logo`}
                  className="w-10 h-10 object-contain"
                  onError={handleImageError}
                />
                <span className="text-blue-600">{match.team1?.team_name || 'Unknown Team'}</span>
                <span className="text-gray-500">VS</span>
                <span className="text-red-600">{match.team2?.team_name || 'Unknown Team'}</span>
                <img
                  src={match.team2?.logo || defaultLogoUrl}
                  alt={`${match.team2?.team_name} logo`}
                  className="w-10 h-10 object-contain"
                  onError={handleImageError}
                />
              </div>
              <p className="text-sm text-gray-500 mt-2">
                📅 {new Date(match.date).toLocaleDateString()} | 🏟 {match.stadium}
              </p>
              {new Date(match.date) <= today && match.score ? (
                <p className="text-lg font-semibold text-purple-700 mt-2">
                  Tỉ số: {match.score}
                </p>
              ) : (
                <p className="text-lg font-semibold text-purple-700 mt-2">
                  Bắt đầu lúc: {new Date(match.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              )}
            </div>
            {token && (
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => handleEdit(match)}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-xl"
                >
                  Sửa
                </button>
                <button
                  onClick={() => handleDelete(match._id)}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl"
                >
                  Xóa
                </button>
              </div>
            )}
          </div>
        ))
      ) : (
        <p className="text-center text-gray-500">
          {type === 'all' && dateError ? 'Vui lòng chọn khoảng ngày hợp lệ.' : type === 'all' ? 'Không có trận nào trong khoảng thời gian này.' : 'Không có trận đấu sắp diễn ra.'}
        </p>
      )}
    </div>
  );

  return (
    <div className="container mx-auto p-4">
      {/* Date Range Search Input and Reset Button, chỉ hiển thị khi type="all" */}
      {type === 'all' && (
        <div className="mb-4 flex items-center gap-4">
          <label htmlFor="start-date" className="mr-2">Từ ngày: </label>
          <input
            type="date"
            id="start-date"
            value={startDate}
            onChange={(e) => handleStartDateChange(e.target.value)}
            className="border rounded p-2"
          />
          <label htmlFor="end-date" className="mr-2">Đến ngày: </label>
          <input
            type="date"
            id="end-date"
            value={endDate}
            onChange={(e) => handleEndDateChange(e.target.value)}
            className="border rounded p-2"
          />
          {dateError && <p className="text-red-500 text-sm ml-2">{dateError}</p>}
          <button
            onClick={handleResetFilter}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition"
          >
            Xóa lọc
          </button>
        </div>
      )}

      {error && <p className="text-red-500 text-center mb-4">{error}</p>}

      {type === 'past' && renderMatches(pastMatches, '🕑 Đã diễn ra', 'text-green-600')}
      {type === 'upcoming' && (
        <div>
          <h3 className="bg-gradient-to-r from-slate-600 to-slate-800 text-4xl font-extrabold text-white py-3 px-6 rounded-lg drop-shadow-md mb-4 text-center font-heading hover:brightness-110 transition-all duration-200">
            🚀 Sắp diễn ra
          </h3>
          {upcomingMatches.length > 0 ? (
            <Swiper
              modules={[Navigation, Pagination]}
              slidesPerView={1}
              spaceBetween={16}
              navigation
              pagination={{ clickable: true }}
              breakpoints={{
                640: { slidesPerView: 2, spaceBetween: 16 },
                768: { slidesPerView: 3, spaceBetween: 16 },
                1024: { slidesPerView: 4, spaceBetween: 16 },
              }}
              className="pb-8"
            >
              {upcomingMatches.map((match) => (
                <SwiperSlide key={match._id}>
                  <div className="w-80 border rounded-2xl shadow-md p-6 bg-white hover:shadow-lg transition duration-300 flex flex-col justify-between h-full">
                    <div className="flex flex-col items-center">
                      <div className="flex items-center gap-4 text-xl font-bold text-gray-800">
                        <img
                          src={match.team1?.logo || defaultLogoUrl}
                          alt={`${match.team1?.team_name} logo`}
                          className="w-10 h-10 object-contain"
                          onError={handleImageError}
                        />
                        <span className="text-blue-600">{match.team1?.team_name || 'Unknown Team'}</span>
                        <span className="text-gray-500">VS</span>
                        <span className="text-red-600">{match.team2?.team_name || 'Unknown Team'}</span>
                        <img
                          src={match.team2?.logo || defaultLogoUrl}
                          alt={`${match.team2?.team_name} logo`}
                          className="w-10 h-10 object-contain"
                          onError={handleImageError}
                        />
                      </div>
                      <p className="text-sm text-gray-500 mt-2">
                        📅 {new Date(match.date).toLocaleDateString()} | 🏟 {match.stadium}
                      </p>
                      <p className="text-lg font-semibold text-purple-700 mt-2">
                        {new Date(match.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    {token && (
                      <div className="flex justify-center gap-3 mt-4">
                        <button
                          onClick={() => handleEdit(match)}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-xl"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDelete(match._id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl"
                        >
                          Xóa
                        </button>
                      </div>
                    )}
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            <p className="text-center text-gray-500">Không có trận đấu sắp diễn ra.</p>
          )}
        </div>
      )}
      {type === 'all' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {renderMatches(pastMatches, '🕑 Đã diễn ra', 'text-green-600')}
          {renderMatches(upcomingMatches, '🚀 Sắp diễn ra', 'text-orange-600')}
        </div>
      )}
    </div>
  );
};

export default Matches;