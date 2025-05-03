import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SeasonForm from './SeasonForm';

const Seasons = ({ setEditingSeason, setShowForm, token }) => {
    const [seasons, setSeasons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchSeasons = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/seasons');
                setSeasons(response.data.data);
                setLoading(false);
            } catch (err) {
                setError('Không thể tải danh sách mùa giải');
                setLoading(false);
            }
        };
        fetchSeasons();
    }, []);

    const handleEdit = (season) => {
        setEditingSeason(season);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://localhost:5000/api/seasons/${id}`);
            setSeasons(seasons.filter((season) => season._id !== id));
        } catch (err) {
            setError('Không thể xóa mùa giải');
        }
    };

    if (loading) return <p className="text-center text-[#6B7280]">Đang tải...</p>;
    if (error) return <p className="text-red-500 text-center">{error}</p>;

    return (
        <div className="container mx-auto p-6 bg-[#F9FAFB] min-h-screen">
            <h2 className="text-3xl font-bold mb-6 text-center text-white bg-[#1E3A8A] py-3 px-6 rounded-lg shadow-md">Danh sách mùa giải</h2>
            <div className="overflow-x-auto bg-white rounded-lg shadow-md">
                <table className="min-w-full border border-[#E5E7EB]">
                    <thead className="bg-[#F9FAFB]">
                        <tr>
                            <th className="py-3 px-6 border-b border-[#E5E7EB] text-left text-[#111827] font-semibold">Tên mùa giải</th>
                            <th className="py-3 px-6 border-b border-[#E5E7EB] text-left text-[#111827] font-semibold">Ngày bắt đầu</th>
                            <th className="py-3 px-6 border-b border-[#E5E7EB] text-left text-[#111827] font-semibold">Ngày kết thúc</th>
                            <th className="py-3 px-6 border-b border-[#E5E7EB] text-center text-[#111827] font-semibold">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {seasons.map((season) => (
                            <tr key={season._id} className="hover:bg-[#F3F4F6] transition-colors duration-200">
                                <td className="py-3 px-6 border-b border-[#E5E7EB] text-[#111827]">{season.season_name}</td>
                                <td className="py-3 px-6 border-b border-[#E5E7EB] text-[#111827]">{new Date(season.start_date).toLocaleDateString('vi-VN')}</td>
                                <td className="py-3 px-6 border-b border-[#E5E7EB] text-[#111827]">{new Date(season.end_date).toLocaleDateString('vi-VN')}</td>
                                <td className="py-3 px-6 border-b border-[#E5E7EB] text-center">
                                    {token && setEditingSeason && setShowForm && (
                                        <div className="flex justify-center space-x-2">
                                            <button
                                                onClick={() => handleEdit(season)}
                                                className="bg-[#1E3A8A] text-white px-4 py-1 rounded hover:bg-opacity-90 transition-colors duration-200"
                                            >
                                                Sửa
                                            </button>
                                            <button
                                                onClick={() => handleDelete(season._id)}
                                                className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600 transition-colors duration-200"
                                            >
                                                Xóa
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Seasons;