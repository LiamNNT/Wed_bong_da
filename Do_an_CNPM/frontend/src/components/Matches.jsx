import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { Navigation, Pagination } from 'swiper/modules';

const Matches = ({ setEditingMatch = () => { }, setShowForm = () => { }, type = 'all', onPastMatchesFetched = () => { }, token }) => {
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchMatches = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/matches/');
                const matchesData = response.data.data;
                setMatches(matchesData);

                // Tính pastMatches
                const today = new Date();
                const pastMatches = matchesData
                    .filter((match) => new Date(match.date) <= today && match.score)
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .slice(0, 5);

                // Truyền pastMatches lên component cha
                onPastMatchesFetched(pastMatches);

                setLoading(false);
            } catch (err) {
                setError('Không thể tải danh sách trận đấu');
                setLoading(false);
            }
        };

        fetchMatches();
    }, [onPastMatchesFetched]);

    const handleEdit = (match) => {
        setEditingMatch(match);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/api/matches/${id}`);
            setMatches(matches.filter((match) => match._id !== id));
        } catch (err) {
            setError('Không thể xóa trận đấu');
        }
    };

    if (loading) return <p>Đang tải...</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    // Phân loại
    const today = new Date();
    const pastMatches = matches
        .filter((match) => new Date(match.date) <= today && match.score)
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);

    const upcomingMatches = matches
        .filter((match) => new Date(match.date) > today)
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 5);

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
                                    src={match.team1.logo || 'https://th.bing.com/th/id/OIP.iiLfIvv8F-PfjMrjObypGgHaHa?rs=1&pid=ImgDetMain'}
                                    alt={`${match.team1.team_name} logo`}
                                    className="w-10 h-10 object-contain"
                                    onError={(e) => (e.target.src = 'https://th.bing.com/th/id/OIP.iiLfIvv8F-PfjMrjObypGgHaHa?rs=1&pid=ImgDetMain')}
                                />
                                <span className="text-blue-600">{match.team1.team_name}</span>
                                <span className="text-gray-500">VS</span>
                                <span className="text-red-600">{match.team2.team_name}</span>
                                <img
                                    src={match.team2.logo || 'https://th.bing.com/th/id/OIP.iiLfIvv8F-PfjMrjObypGgHaHa?rs=1&pid=ImgDetMain'}
                                    alt={`${match.team2.team_name} logo`}
                                    className="w-10 h-10 object-contain"
                                    onError={(e) => (e.target.src = 'https://th.bing.com/th/id/OIP.iiLfIvv8F-PfjMrjObypGgHaHa?rs=1&pid=ImgDetMain')}
                                />
                            </div>
                            <p className="text-sm text-gray-500 mt-2">
                                📅 {new Date(match.date).toLocaleDateString()} | 🏟 {match.stadium}
                            </p>
                            {match.score ? (
                                <p className="text-lg font-semibold text-purple-700 mt-2">
                                    Tỉ số: {match.score}
                                </p>
                            ) : (
                                <p className="text-lg font-semibold text-purple-700 mt-2">
                                    Bắt đầu lúc: {new Date(match.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            )}
                        </div>
                        {token && setEditingMatch && setShowForm && (
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
                <p className="text-center text-gray-500">Không có trận nào.</p>
            )}
        </div>
    );

    return (
        <div className="container mx-auto p-4">
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
                                                    src={
                                                        match.team1.logo ||
                                                        'https://th.bing.com/th/id/OIP.iiLfIvv8F-PfjMrjObypGgHaHa?rs=1&pid=ImgDetMain'
                                                    }
                                                    alt={`${match.team1.team_name} logo`}
                                                    className="w-10 h-10 object-contain"
                                                    onError={(e) =>
                                                    (e.target.src =
                                                        'https://th.bing.com/th/id/OIP.iiLfIvv8F-PfjMrjObypGgHaHa?rs=1&pid=ImgDetMain')
                                                    }
                                                />
                                                <span className="text-blue-600">{match.team1.team_name}</span>
                                                <span className="text-gray-500">VS</span>
                                                <span className="text-red-600">{match.team2.team_name}</span>
                                                <img
                                                    src={
                                                        match.team2.logo ||
                                                        'https://th.bing.com/th/id/OIP.iiLfIvv8F-PfjMrjObypGgHaHa?rs=1&pid=ImgDetMain'
                                                    }
                                                    alt={`${match.team2.team_name} logo`}
                                                    className="w-10 h-10 object-contain"
                                                    onError={(e) =>
                                                    (e.target.src =
                                                        'https://th.bing.com/th/id/OIP.iiLfIvv8F-PfjMrjObypGgHaHa?rs=1&pid=ImgDetMain')
                                                    }
                                                />
                                            </div>
                                            <p className="text-sm text-gray-500 mt-2">
                                                📅 {new Date(match.date).toLocaleDateString()} | 🏟 {match.stadium}
                                            </p>
                                            <p className="text-lg font-semibold text-purple-700 mt-2">
                                                {new Date(match.date).toLocaleTimeString([], {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </p>
                                        </div>
                                        {token && setEditingMatch && setShowForm && (
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
                        <p className="text-center text-gray-500">Không có trận nào.</p>
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