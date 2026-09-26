from sqlalchemy import Column, Integer, String, Float, Text, ForeignKey, Enum as SQLEnum, DateTime, func
from sqlalchemy.orm import relationship
from app.database import Base
from app.models.enums import RiskLevelEnum, RecommendationTimingEnum


class WaterloggingPrediction(Base):
    __tablename__ = "waterlogging_predictions"

    id = Column(Integer, primary_key=True, index=True)
    farm_id = Column(Integer, ForeignKey("farms.id", ondelete="CASCADE"), nullable=False, index=True)
    rain_event_id = Column(Integer, ForeignKey("rain_events.id", ondelete="SET NULL"), nullable=True)
    waterlogging_probability = Column(Float, nullable=False)
    estimated_stagnation_hours = Column(Float, nullable=False)
    saturation_index = Column(Float, nullable=False)
    risk_level = Column(SQLEnum(RiskLevelEnum, name="risklevelenum"), nullable=False, default=RiskLevelEnum.LOW)
    input_snapshot_json = Column(Text, nullable=True)
    model_version = Column(String(50), default="v1.0.0", nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    farm = relationship("Farm", back_populates="waterlogging_predictions")
    rain_event = relationship("RainEvent", back_populates="waterlogging_predictions")
    crop_damage_predictions = relationship("CropDamagePrediction", back_populates="waterlogging_prediction")



class CropDamagePrediction(Base):
    __tablename__ = "crop_damage_predictions"

    id = Column(Integer, primary_key=True, index=True)
    farm_id = Column(Integer, ForeignKey("farms.id", ondelete="CASCADE"), nullable=False, index=True)
    farm_crop_id = Column(Integer, ForeignKey("farm_crops.id", ondelete="CASCADE"), nullable=False, index=True)
    waterlogging_pred_id = Column(Integer, ForeignKey("waterlogging_predictions.id", ondelete="SET NULL"), nullable=True)
    damage_risk_level = Column(SQLEnum(RiskLevelEnum, name="risklevelenum"), nullable=False, default=RiskLevelEnum.LOW)
    estimated_yield_loss_pct = Column(Float, nullable=True)
    survival_probability = Column(Float, nullable=False)
    model_version = Column(String(50), default="v1.0.0", nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    farm = relationship("Farm", back_populates="crop_damage_predictions")
    farm_crop = relationship("FarmCrop", back_populates="damage_predictions")
    waterlogging_prediction = relationship("WaterloggingPrediction", back_populates="crop_damage_predictions")
    recovery_predictions = relationship("CropRecoveryPrediction", back_populates="damage_prediction", cascade="all, delete-orphan")
    recommendations = relationship("Recommendation", back_populates="damage_prediction")
    explanation = relationship("PredictionExplanation", back_populates="damage_prediction", uselist=False, cascade="all, delete-orphan")


class CropRecoveryPrediction(Base):
    __tablename__ = "crop_recovery_predictions"

    id = Column(Integer, primary_key=True, index=True)
    farm_id = Column(Integer, ForeignKey("farms.id", ondelete="CASCADE"), nullable=False, index=True)
    damage_pred_id = Column(Integer, ForeignKey("crop_damage_predictions.id", ondelete="CASCADE"), nullable=False, index=True)
    recovery_likelihood = Column(Float, nullable=False)
    post_drain_recovery_days = Column(Integer, nullable=True)
    key_factors = Column(Text, nullable=True)
    model_version = Column(String(50), default="v1.0.0", nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    farm = relationship("Farm", back_populates="crop_recovery_predictions")
    damage_prediction = relationship("CropDamagePrediction", back_populates="recovery_predictions")
    recommendations = relationship("Recommendation", back_populates="recovery_prediction")


class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(Integer, primary_key=True, index=True)
    damage_pred_id = Column(Integer, ForeignKey("crop_damage_predictions.id", ondelete="SET NULL"), nullable=True)
    recovery_pred_id = Column(Integer, ForeignKey("crop_recovery_predictions.id", ondelete="SET NULL"), nullable=True)
    timing = Column(SQLEnum(RecommendationTimingEnum, name="recommendationtimingenum"), nullable=False)
    action_type = Column(String(100), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    priority = Column(String(50), default="HIGH", nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    damage_prediction = relationship("CropDamagePrediction", back_populates="recommendations")
    recovery_prediction = relationship("CropRecoveryPrediction", back_populates="recommendations")


class PredictionExplanation(Base):
    __tablename__ = "prediction_explanations"

    id = Column(Integer, primary_key=True, index=True)
    damage_pred_id = Column(Integer, ForeignKey("crop_damage_predictions.id", ondelete="CASCADE"), nullable=False, unique=True)
    explanation_text = Column(Text, nullable=False)
    feature_importance_json = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    damage_prediction = relationship("CropDamagePrediction", back_populates="explanation")
