from abc import ABC, abstractmethod
from typing import Optional, Dict
from app.models.soil import SoilProfile
from app.models.enums import SoilSourceEnum
from app.schemas.soil import SoilProfileResponse

# Standard Soil Texture Presets for Farmer Selection
SOIL_TYPE_PRESETS: Dict[str, Dict[str, float]] = {
    "Clay Loam": {"sand_percentage": 30.0, "silt_percentage": 35.0, "clay_percentage": 35.0, "ph": 6.8, "organic_carbon": 0.6, "bulk_density": 1.35},
    "Alluvial Soil": {"sand_percentage": 40.0, "silt_percentage": 40.0, "clay_percentage": 20.0, "ph": 7.2, "organic_carbon": 0.75, "bulk_density": 1.40},
    "Red Soil / Laterite": {"sand_percentage": 55.0, "silt_percentage": 20.0, "clay_percentage": 25.0, "ph": 6.2, "organic_carbon": 0.45, "bulk_density": 1.45},
    "Black Cotton Soil (Vertisol)": {"sand_percentage": 20.0, "silt_percentage": 25.0, "clay_percentage": 55.0, "ph": 8.0, "organic_carbon": 0.50, "bulk_density": 1.30},
    "Sandy Loam": {"sand_percentage": 65.0, "silt_percentage": 20.0, "clay_percentage": 15.0, "ph": 6.5, "organic_carbon": 0.40, "bulk_density": 1.50},
}


class BaseSoilProvider(ABC):
    @abstractmethod
    def resolve_soil_profile(
        self,
        farm_id: int,
        existing_profile: Optional[SoilProfile],
        latitude: float,
        longitude: float,
        state: Optional[str] = None
    ) -> SoilProfileResponse:
        """Resolve soil profile applying priority: LAB_VERIFIED > FARMER_VERIFIED > ESTIMATED."""
        pass


class DefaultEstimatedSoilProvider(BaseSoilProvider):
    """
    Default provider that respects user-supplied LAB_VERIFIED and FARMER_VERIFIED entries,
    and falls back to estimated regional soil profiles when no user data is stored.
    An external API provider (e.g. SoilGrids / ISRIC) can subclass BaseSoilProvider.
    """
    def resolve_soil_profile(
        self,
        farm_id: int,
        existing_profile: Optional[SoilProfile],
        latitude: float,
        longitude: float,
        state: Optional[str] = None
    ) -> SoilProfileResponse:
        # Priority 1 & 2: User verified database records
        if existing_profile:
            return SoilProfileResponse(
                id=existing_profile.id,
                farm_id=existing_profile.farm_id,
                soil_type=existing_profile.soil_type,
                sand_percentage=existing_profile.sand_percentage,
                silt_percentage=existing_profile.silt_percentage,
                clay_percentage=existing_profile.clay_percentage,
                ph=existing_profile.ph,
                organic_carbon=existing_profile.organic_carbon,
                bulk_density=existing_profile.bulk_density,
                soil_source=existing_profile.soil_source,
                notes=existing_profile.notes,
                is_estimated_fallback=False,
                created_at=existing_profile.created_at,
                updated_at=existing_profile.updated_at,
            )

        # Priority 3: Regional Estimation Fallback (e.g., Delta Alluvial / Clay Loam for South India)
        estimated_preset = SOIL_TYPE_PRESETS["Clay Loam"]
        if state and "Tamil Nadu" in state:
            estimated_preset = SOIL_TYPE_PRESETS["Alluvial Soil"]

        return SoilProfileResponse(
            id=None,
            farm_id=farm_id,
            soil_type="Clay Loam (Regional Estimation)",
            sand_percentage=estimated_preset["sand_percentage"],
            silt_percentage=estimated_preset["silt_percentage"],
            clay_percentage=estimated_preset["clay_percentage"],
            ph=estimated_preset["ph"],
            organic_carbon=estimated_preset["organic_carbon"],
            bulk_density=estimated_preset["bulk_density"],
            soil_source=SoilSourceEnum.ESTIMATED,
            notes="Estimated soil properties based on regional agricultural GIS survey. Update with soil test or farmer knowledge.",
            is_estimated_fallback=True,
            created_at=None,
            updated_at=None,
        )


# Global soil provider instance (can be swapped for external API provider)
soil_provider: BaseSoilProvider = DefaultEstimatedSoilProvider()
