import React from 'react';
import '../../styles/components.css';

const PointsHistory = ({ history, totalPoints }) => {
  // 确保 history 数组已定义，如果未定义则初始化为空数组
  const safeHistory = history || [];

  return (
    <div className="points-history">
      <div className="points-summary">
        <h2>积分记录</h2>
        <div className="total-points">
          <span>总积分</span>
          <span className="points-number">{totalPoints}</span>
        </div>
      </div>

      <div className="history-list">
        {safeHistory.length === 0 ? (
          <div className="empty-state">暂无积分记录</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>时间</th>
                <th>活动</th>
                <th>积分变动</th>
                <th>类型</th>
              </tr>
            </thead>
            <tbody>
              {safeHistory.map((record, index) => (
                <tr key={index}>
                  <td>{new Date(record.createdAt).toLocaleString()}</td>
                  <td>{record.activity?.title || record.description}</td>
                  <td className={record.points >= 0 ? 'points-plus' : 'points-minus'}>
                    {record.points >= 0 ? `+${record.points}` : record.points}
                  </td>
                  <td>{record.type === 'activity' ? '活动参与' : '积分兑换'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default PointsHistory;