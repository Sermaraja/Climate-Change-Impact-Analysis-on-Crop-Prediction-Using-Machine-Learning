import enum


class SoilSourceEnum(str, enum.Enum):
    LAB_VERIFIED = "LAB_VERIFIED"
    FARMER_VERIFIED = "FARMER_VERIFIED"
    ESTIMATED = "ESTIMATED"


class RiskLevelEnum(str, enum.Enum):
    LOW = "LOW"
    MODERATE = "MODERATE"
    HIGH = "HIGH"
    EXTREME = "EXTREME"


class RecommendationTimingEnum(str, enum.Enum):
    BEFORE_RAIN = "BEFORE_RAIN"
    AFTER_RAIN = "AFTER_RAIN"
