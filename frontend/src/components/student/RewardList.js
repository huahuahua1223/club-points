import React from 'react';
import '../../styles/components.css';

const RewardList = ({ rewards, userPoints, onExchange }) => {
  return (
    <div className="rewards-section">
      <div className="rewards-header">
        <h2>积分兑换</h2>
        <div className="available-points">
          可用积分: <span>{userPoints}</span>
        </div>
      </div>

      <div className="rewards-grid">
        {rewards.length === 0 ? (
          <div className="empty-state">暂无可兑换奖品</div>
        ) : (
          rewards.map(reward => (
            <div key={reward._id} className="reward-card">
              <div className="reward-info">
                <h3>{reward.name}</h3>
                <p>{reward.description}</p>
                <div className="reward-points">
                  所需积分: <span>{reward.points}</span>
                </div>
                <div className="reward-stock">
                  剩余数量: <span>{reward.stock}</span>
                </div>
              </div>
              <button
                className={`exchange-btn ${userPoints < reward.points || reward.stock <= 0 ? 'disabled' : ''}`}
                onClick={() => onExchange(reward._id)}
                disabled={userPoints < reward.points || reward.stock <= 0}
              >
                {reward.stock <= 0 ? '已兑完' : 
                 userPoints < reward.points ? '积分不足' : '立即兑换'}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RewardList;