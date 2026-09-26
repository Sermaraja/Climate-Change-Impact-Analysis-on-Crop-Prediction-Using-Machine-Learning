from sqlalchemy import Column, Integer, String, Text, ForeignKey, Float, DateTime, func
from sqlalchemy.orm import relationship
from app.database import Base


class EvidenceSource(Base):
    __tablename__ = "evidence_sources"

    id = Column(Integer, primary_key=True, index=True)
    source_name = Column(String(150), nullable=False)  # e.g., "TNAU Agritech Portal", "ICAR Submergence Bulletin"
    provider_institution = Column(String(150), nullable=False)  # e.g., "TNAU", "ICAR", "IRRI"
    publication_title = Column(String(255), nullable=True)
    url_or_doi = Column(String(255), nullable=True)
    confidence_level = Column(String(50), nullable=False, default="HIGH")  # HIGH, MODERATE, EXPERT_OPINION
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    stress_profiles = relationship("CropStressProfile", back_populates="evidence_source")
    stage_stress_profiles = relationship("CropStageStressProfile", back_populates="evidence_source")
    recovery_profiles = relationship("CropRecoveryProfile", back_populates="evidence_source")
    recommendations = relationship("AgronomicRecommendation", back_populates="evidence_source")


class CropStressProfile(Base):
    __tablename__ = "crop_stress_profiles"

    id = Column(Integer, primary_key=True, index=True)
    crop_id = Column(Integer, ForeignKey("crops.id", ondelete="CASCADE"), nullable=False, index=True)
    stress_type = Column(String(50), nullable=False, index=True)  # HEAVY_RAIN, WATERLOGGING, SUBMERGENCE, EXCESS_SOIL_MOISTURE
    rainfall_sensitivity = Column(String(50), nullable=False)  # LOW, MODERATE, HIGH, CRITICAL
    waterlogging_sensitivity = Column(String(50), nullable=False)  # LOW, MODERATE, HIGH, CRITICAL
    submergence_tolerance_qualitative = Column(String(50), nullable=False)  # LOW, MODERATE, HIGH
    critical_duration_hours = Column(Integer, nullable=True)  # Optional empirical threshold if verified
    evidence_source_id = Column(Integer, ForeignKey("evidence_sources.id", ondelete="RESTRICT"), nullable=True)
    evidence_reference = Column(String(255), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    crop = relationship("Crop")
    evidence_source = relationship("EvidenceSource", back_populates="stress_profiles")


class CropStageStressProfile(Base):
    __tablename__ = "crop_stage_stress_profiles"

    id = Column(Integer, primary_key=True, index=True)
    crop_id = Column(Integer, ForeignKey("crops.id", ondelete="CASCADE"), nullable=False, index=True)
    growth_stage_id = Column(Integer, ForeignKey("crop_growth_stages.id", ondelete="CASCADE"), nullable=True, index=True)
    stage_name = Column(String(100), nullable=False)  # e.g., "Germination", "Tillering", "Flowering"
    stress_type = Column(String(50), nullable=False, index=True)  # HEAVY_RAIN, WATERLOGGING, SUBMERGENCE
    stage_sensitivity = Column(String(50), nullable=False)  # LOW, MODERATE, HIGH, CRITICAL
    yield_impact_risk = Column(String(50), nullable=False)  # MILD, SEVERE, CATASTROPHIC
    critical_vulnerability_details = Column(Text, nullable=False)
    evidence_source_id = Column(Integer, ForeignKey("evidence_sources.id", ondelete="RESTRICT"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    crop = relationship("Crop")
    growth_stage = relationship("CropGrowthStage")
    evidence_source = relationship("EvidenceSource", back_populates="stage_stress_profiles")


class CropRecoveryProfile(Base):
    __tablename__ = "crop_recovery_profiles"

    id = Column(Integer, primary_key=True, index=True)
    crop_id = Column(Integer, ForeignKey("crops.id", ondelete="CASCADE"), nullable=False, index=True)
    damage_severity_level = Column(String(50), nullable=False)  # MILD, MODERATE, SEVERE
    recovery_potential_class = Column(String(50), nullable=False)  # HIGH, MODERATE, LOW, UNRECOVERABLE
    max_submergence_hours_for_recovery = Column(Integer, nullable=True)
    foliar_symptoms = Column(Text, nullable=True)
    post_flooding_survival_rate = Column(String(50), nullable=True)  # e.g. ">80%", "40-60%", "<20%"
    evidence_source_id = Column(Integer, ForeignKey("evidence_sources.id", ondelete="RESTRICT"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    crop = relationship("Crop")
    evidence_source = relationship("EvidenceSource", back_populates="recovery_profiles")


class AgronomicRecommendation(Base):
    __tablename__ = "agronomic_recommendations"

    id = Column(Integer, primary_key=True, index=True)
    crop_id = Column(Integer, ForeignKey("crops.id", ondelete="CASCADE"), nullable=False, index=True)
    growth_stage_id = Column(Integer, ForeignKey("crop_growth_stages.id", ondelete="SET NULL"), nullable=True)
    trigger_stress_type = Column(String(50), nullable=False)  # WATERLOGGING, SUBMERGENCE, HEAVY_RAIN
    trigger_severity_level = Column(String(50), nullable=False)  # MODERATE, HIGH, CRITICAL
    recommendation_title = Column(String(200), nullable=False)
    action_steps = Column(Text, nullable=False)  # Detailed agronomic guidance (drainage, foliar spray, N application)
    timing_window_hours = Column(Integer, nullable=True, default=48)  # Immediate action window (e.g. within 24-48h)
    evidence_source_id = Column(Integer, ForeignKey("evidence_sources.id", ondelete="RESTRICT"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    crop = relationship("Crop")
    growth_stage = relationship("CropGrowthStage")
    evidence_source = relationship("EvidenceSource", back_populates="recommendations")
