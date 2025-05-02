import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MatchForm = ({ editingMatch, setEditingMatch, setShowForm, setMatches, token }) => {
  const [formData, setFormData] = useState({
    season_id: '',
    team1: { _id: '', team_name: '', logo: '' },
    team2: { _id: '', team_name: '', logo: '' },
    date: '',
    stadium: '',
    score: '',
    status: 'FT',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingMatch) {
      setFormData({
        season_id: editingMatch.season_id?._id || '',
        team1: {
          _id: editingMatch.team1 || '',
          team_name: editingMatch.team1_name || '',
          logo: editingMatch.team1_logo || '',
        },
        team2: {
          _id: editingMatch.team2 || '',
          team_name: editingMatch.team2_name || '',
          logo: editingMatch.team2_logo || '',
        },
        date: editingMatch.date ? new Date(editingMatch.date).toISOString().split('T')[0] : '',
        stadium: editingMatch.stadium || '',
        score: editingMatch.score || '0-0',
        status: editingMatch.status || 'FT',
      });
    }
  }, [editingMatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        season_id: formData.season_id,
        team1: formData.team1._id,
        team2: formData.team2._id,
        date: new Date(formData.date).toISOString(),
        stadium: formData.stadium,
        score: formData.score,
      };
      if (editingMatch) {
        const response = await axios.put(`http://localhost:5000/api/matches/${editingMatch._id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMatches((prev) =>
          prev.map((match) => (match._id === editingMatch._id ? response.data.data : match))
        );
      } else {
        const response = await axios.post('http://localhost:5000/api/matches/', payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMatches((prev) => [...prev, response.data.data]);
      }
      setShowForm(false);
      setEditingMatch(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể lưu trận đấu');
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-md p-6 max-w-md mx-auto">
      <h2 className="text-xl font-bold text-white mb-4">
        {editingMatch ? 'Sửa trận đấu' : 'Thêm trận đấu'}
      </h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300">Season ID</label>
          <input
            type="text"
            value={formData.season_id}
            onChange={(e) => setFormData({ ...formData, season_id: e.target.value })}
            placeholder="Nhập Season ID"
            className="w-full p-2 bg-gray-700 text-white border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300">Đội 1 - ID</label>
          <input
            type="text"
            value={formData.team1._id}
            onChange={(e) =>
              setFormData({ ...formData, team1: { ...formData.team1, _id: e.target.value } })
            }
            placeholder="Nhập Team 1 ID"
            className="w-full p-2 bg-gray-700 text-white border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300">Đội 1 - Tên</label>
          <input
            type="text"
            value={formData.team1.team_name}
            onChange={(e) =>
              setFormData({ ...formData, team1: { ...formData.team1, team_name: e.target.value } })
            }
            placeholder="Tên đội 1 (ví dụ: Arsenal)"
            className="w-full p-2 bg-gray-700 text-white border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300">Đội 1 - Logo URL</label>
          <input
            type="text"
            value={formData.team1.logo}
            onChange={(e) =>
              setFormData({ ...formData, team1: { ...formData.team1, logo: e.target.value } })
            }
            placeholder="URL logo đội 1"
            className="w-full p-2 bg-gray-700 text-white border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300">Đội 2 - ID</label>
          <input
            type="text"
            value={formData.team2._id}
            onChange={(e) =>
              setFormData({ ...formData, team2: { ...formData.team2, _id: e.target.value } })
            }
            placeholder="Nhập Team 2 ID"
            className="w-full p-2 bg-gray-700 text-white border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300">Đội 2 - Tên</label>
          <input
            type="text"
            value={formData.team2.team_name}
            onChange={(e) =>
              setFormData({ ...formData, team2: { ...formData.team2, team_name: e.target.value } })
            }
            placeholder="Tên đội 2 (ví dụ: Tottenham)"
            className="w-full p-2 bg-gray-700 text-white border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300">Đội 2 - Logo URL</label>
          <input
            type="text"
            value={formData.team2.logo}
            onChange={(e) =>
              setFormData({ ...formData, team2: { ...formData.team2, logo: e.target.value } })
            }
            placeholder="URL logo đội 2"
            className="w-full p-2 bg-gray-700 text-white border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300">Ngày thi đấu</label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="w-full p-2 bg-gray-700 text-white border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300">Sân vận động</label>
          <input
            type="text"
            value={formData.stadium}
            onChange={(e) => setFormData({ ...formData, stadium: e.target.value })}
            placeholder="Nhập tên sân vận động"
            className="w-full p-2 bg-gray-700 text-white border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300">Tỉ số</label>
          <input
            type="text"
            value={formData.score}
            onChange={(e) => setFormData({ ...formData, score: e.target.value })}
            placeholder="Tỉ số (ví dụ: 0-0)"
            className="w-full p-2 bg-gray-700 text-white border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300">Trạng thái</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className="w-full p-2 bg-gray-700 text-white border border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="FT">FT (Kết thúc)</option>
          </select>
        </div>
        <div className="flex space-x-3">
          <button
            type="submit"
            className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition"
          >
            Lưu
          </button>
          <button
            type="button"
            onClick={() => setShowForm(false)}
            className="bg-gray-500 text-white p-2 rounded hover:bg-gray-600 transition"
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
};

export default MatchForm;