import { useMemo } from 'react';
import { Modal } from '../common/Modal.tsx';
import { generateAccessPlan } from '../../utils/accessPlanner.ts';
import { formatDateDisplay } from '../../utils/dateUtils.ts';
import { BOOKING_SITES } from '../../data/access-stations.ts';
import type { Mountain } from '../../types/index.ts';

interface AccessPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  mountain: Mountain | null;
  date: string | null;
}

export function AccessPlanModal({ isOpen, onClose, mountain, date }: AccessPlanModalProps) {
  const plan = useMemo(() => {
    if (!mountain || !date) return null;
    return generateAccessPlan(mountain, date);
  }, [mountain, date]);

  if (!mountain || !date || !plan) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${mountain.name} アクセス計画`}
      wide
    >
      <div className="access-plan">
        <div className="access-plan-date">
          {formatDateDisplay(date)} の登山計画
        </div>
        <div className="access-plan-mountain">
          {mountain.name}（{mountain.elevation}m・{mountain.category}）
        </div>

        {/* 新幹線セクション */}
        <section className="access-section">
          <h3 className="access-section-title">🚅 新幹線</h3>
          {plan.nearestStations.map((option, i) => (
            <div key={i} className="access-option-card">
              <div className="access-option-header">
                <span className="access-option-name">{option.label}</span>
                <span className="access-option-distance">
                  山まで約{option.distanceKm}km（車で約{option.estimatedDrivingMinutes}分）
                </span>
              </div>
              <div className="access-option-detail">{option.details}</div>
              <div className="access-option-hint">🔍 {option.bookingHint}</div>
              <a
                href={option.bookingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm btn-primary access-booking-link"
              >
                {option.bookingUrl.includes('smart-ex') ? 'SmartEX' : 'えきねっと'} で予約検索 ↗
              </a>
            </div>
          ))}
        </section>

        {/* 飛行機セクション（遠方のみ） */}
        {plan.nearestAirports.length > 0 && (
          <section className="access-section">
            <h3 className="access-section-title">✈️ 飛行機</h3>
            {plan.nearestAirports.map((option, i) => (
              <div key={i} className="access-option-card">
                <div className="access-option-header">
                  <span className="access-option-name">{option.label}</span>
                  <span className="access-option-distance">
                    山まで約{option.distanceKm}km（車で約{option.estimatedDrivingMinutes}分）
                  </span>
                </div>
                <div className="access-option-hint">🔍 {option.bookingHint}</div>
                <a
                  href={option.bookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-sm btn-primary access-booking-link"
                >
                  skyticket で検索 ↗
                </a>
              </div>
            ))}
          </section>
        )}

        {/* 夜行バスセクション */}
        <section className="access-section">
          <h3 className="access-section-title">🚌 夜行バス</h3>
          <div className="access-option-card">
            <div className="access-option-hint">🔍 {plan.nightBus.bookingHint}</div>
            <a
              href={plan.nightBus.bookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-sm btn-primary access-booking-link"
            >
              バス比較なび で検索 ↗
            </a>
          </div>
        </section>

        {/* タイムズカーシェアセクション */}
        <section className="access-section">
          <h3 className="access-section-title">🚗 タイムズカーシェア</h3>
          {plan.carShareStations.length > 0 ? (
            <>
              <div className="access-carshare-note">
                最寄り駅・空港周辺のステーション:
              </div>
              {plan.carShareStations.map((station, i) => (
                <div key={i} className="access-carshare-item">
                  <span className="access-carshare-name">📍 {station.name}</span>
                  <span className="access-carshare-hub">（{station.nearHub}付近）</span>
                </div>
              ))}
            </>
          ) : (
            <div className="access-carshare-note">
              最寄り駅周辺のステーション情報はサイトで検索してください。
            </div>
          )}
          <a
            href={BOOKING_SITES.timescar.url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-sm btn-primary access-booking-link"
          >
            タイムズカーシェア で予約検索 ↗
          </a>
        </section>
      </div>
    </Modal>
  );
}
