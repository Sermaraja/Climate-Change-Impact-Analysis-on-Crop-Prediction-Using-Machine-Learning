"""Initial schema with PostGIS support

Revision ID: 001_initial_schema
Revises: 
Create Date: 2026-09-26

"""
from alembic import op
import sqlalchemy as sa
from geoalchemy2 import Geometry

# revision identifiers, used by Alembic.
revision = '001_initial_schema'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # 1. users
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('password_hash', sa.String(length=255), nullable=False),
        sa.Column('full_name', sa.String(length=255), nullable=False),
        sa.Column('phone', sa.String(length=50), nullable=True),
        sa.Column('role', sa.String(length=50), server_default='FARMER', nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)
    op.create_index(op.f('ix_users_id'), 'users', ['id'], unique=False)

    # 2. farms
    op.create_table(
        'farms',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('farm_name', sa.String(length=255), nullable=False),
        sa.Column('latitude', sa.Float(), nullable=False),
        sa.Column('longitude', sa.Float(), nullable=False),
        sa.Column('boundary', Geometry(geometry_type='POLYGON', srid=4326), nullable=True),
        sa.Column('area_acres', sa.Float(), nullable=False),
        sa.Column('state', sa.String(length=100), nullable=True),
        sa.Column('district', sa.String(length=100), nullable=True),
        sa.Column('village', sa.String(length=100), nullable=True),
        sa.Column('drainage_class', sa.String(length=100), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_farms_id'), 'farms', ['id'], unique=False)
    op.create_index(op.f('ix_farms_user_id'), 'farms', ['user_id'], unique=False)

    # 3. crops
    op.create_table(
        'crops',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('scientific_name', sa.String(length=150), nullable=True),
        sa.Column('category', sa.String(length=100), nullable=True),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_crops_id'), 'crops', ['id'], unique=False)
    op.create_index(op.f('ix_crops_name'), 'crops', ['name'], unique=True)

    # 4. crop_varieties
    op.create_table(
        'crop_varieties',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('crop_id', sa.Integer(), nullable=False),
        sa.Column('variety_name', sa.String(length=100), nullable=False),
        sa.Column('duration_days', sa.Integer(), nullable=True),
        sa.Column('submergence_tolerance_days', sa.Integer(), nullable=False, server_default='2'),
        sa.Column('drought_tolerance', sa.String(length=50), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['crop_id'], ['crops.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_crop_varieties_crop_id'), 'crop_varieties', ['crop_id'], unique=False)
    op.create_index(op.f('ix_crop_varieties_id'), 'crop_varieties', ['id'], unique=False)

    # 5. crop_growth_stages
    op.create_table(
        'crop_growth_stages',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('crop_id', sa.Integer(), nullable=False),
        sa.Column('stage_name', sa.String(length=100), nullable=False),
        sa.Column('stage_order', sa.Integer(), nullable=False),
        sa.Column('min_age_days', sa.Integer(), nullable=False),
        sa.Column('max_age_days', sa.Integer(), nullable=False),
        sa.Column('flood_vulnerability_level', sa.String(length=50), nullable=False, server_default='MODERATE'),
        sa.Column('submergence_limit_hours', sa.Integer(), nullable=False, server_default='24'),
        sa.Column('description', sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(['crop_id'], ['crops.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_crop_growth_stages_crop_id'), 'crop_growth_stages', ['crop_id'], unique=False)
    op.create_index(op.f('ix_crop_growth_stages_id'), 'crop_growth_stages', ['id'], unique=False)

    # 6. farm_crops
    op.create_table(
        'farm_crops',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('farm_id', sa.Integer(), nullable=False),
        sa.Column('crop_id', sa.Integer(), nullable=False),
        sa.Column('variety_id', sa.Integer(), nullable=True),
        sa.Column('planting_date', sa.Date(), nullable=False),
        sa.Column('estimated_age_days', sa.Integer(), nullable=True),
        sa.Column('current_growth_stage_id', sa.Integer(), nullable=True),
        sa.Column('user_stage_override', sa.String(length=100), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['crop_id'], ['crops.id'], ondelete='RESTRICT'),
        sa.ForeignKeyConstraint(['current_growth_stage_id'], ['crop_growth_stages.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['farm_id'], ['farms.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['variety_id'], ['crop_varieties.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_farm_crops_crop_id'), 'farm_crops', ['crop_id'], unique=False)
    op.create_index(op.f('ix_farm_crops_farm_id'), 'farm_crops', ['farm_id'], unique=False)
    op.create_index(op.f('ix_farm_crops_id'), 'farm_crops', ['id'], unique=False)

    # 7. soil_profiles
    soil_source_enum = sa.Enum('LAB_VERIFIED', 'FARMER_VERIFIED', 'ESTIMATED', name='soilsourceenum')
    op.create_table(
        'soil_profiles',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('farm_id', sa.Integer(), nullable=False),
        sa.Column('soil_type', sa.String(length=100), nullable=False),
        sa.Column('sand_percentage', sa.Float(), nullable=True),
        sa.Column('silt_percentage', sa.Float(), nullable=True),
        sa.Column('clay_percentage', sa.Float(), nullable=True),
        sa.Column('ph', sa.Float(), nullable=True),
        sa.Column('organic_carbon', sa.Float(), nullable=True),
        sa.Column('soil_source', soil_source_enum, nullable=False, server_default='ESTIMATED'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['farm_id'], ['farms.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('farm_id')
    )
    op.create_index(op.f('ix_soil_profiles_farm_id'), 'soil_profiles', ['farm_id'], unique=True)
    op.create_index(op.f('ix_soil_profiles_id'), 'soil_profiles', ['id'], unique=False)

    # 8. weather_forecasts
    op.create_table(
        'weather_forecasts',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('farm_id', sa.Integer(), nullable=False),
        sa.Column('forecast_time', sa.DateTime(timezone=True), nullable=False),
        sa.Column('temperature_min', sa.Float(), nullable=True),
        sa.Column('temperature_max', sa.Float(), nullable=True),
        sa.Column('relative_humidity', sa.Float(), nullable=True),
        sa.Column('rain_amount_24h', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('rain_amount_48h', sa.Float(), nullable=True),
        sa.Column('rain_intensity_mm_hr', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('forecast_source', sa.String(length=100), nullable=False, server_default='Open-Meteo'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['farm_id'], ['farms.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_weather_forecasts_farm_id'), 'weather_forecasts', ['farm_id'], unique=False)
    op.create_index(op.f('ix_weather_forecasts_id'), 'weather_forecasts', ['id'], unique=False)

    # 9. weather_history
    op.create_table(
        'weather_history',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('farm_id', sa.Integer(), nullable=False),
        sa.Column('record_date', sa.Date(), nullable=False),
        sa.Column('prior_24h_rain_mm', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('prior_48h_rain_mm', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('prior_72h_rain_mm', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('temp_avg', sa.Float(), nullable=True),
        sa.Column('humidity_avg', sa.Float(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['farm_id'], ['farms.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_weather_history_farm_id'), 'weather_history', ['farm_id'], unique=False)
    op.create_index(op.f('ix_weather_history_id'), 'weather_history', ['id'], unique=False)

    # 10. rain_events
    risk_level_enum = sa.Enum('LOW', 'MODERATE', 'HIGH', 'EXTREME', name='risklevelenum')
    op.create_table(
        'rain_events',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('farm_id', sa.Integer(), nullable=False),
        sa.Column('event_start', sa.DateTime(timezone=True), nullable=False),
        sa.Column('event_end', sa.DateTime(timezone=True), nullable=True),
        sa.Column('total_rainfall_mm', sa.Float(), nullable=False),
        sa.Column('peak_intensity_mm_hr', sa.Float(), nullable=False),
        sa.Column('duration_hours', sa.Float(), nullable=False),
        sa.Column('alert_level', risk_level_enum, nullable=False, server_default='LOW'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['farm_id'], ['farms.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_rain_events_farm_id'), 'rain_events', ['farm_id'], unique=False)
    op.create_index(op.f('ix_rain_events_id'), 'rain_events', ['id'], unique=False)

    # 11. waterlogging_predictions
    op.create_table(
        'waterlogging_predictions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('farm_id', sa.Integer(), nullable=False),
        sa.Column('rain_event_id', sa.Integer(), nullable=True),
        sa.Column('waterlogging_probability', sa.Float(), nullable=False),
        sa.Column('estimated_stagnation_hours', sa.Float(), nullable=False),
        sa.Column('saturation_index', sa.Float(), nullable=False),
        sa.Column('risk_level', risk_level_enum, nullable=False, server_default='LOW'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['farm_id'], ['farms.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['rain_event_id'], ['rain_events.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_waterlogging_predictions_farm_id'), 'waterlogging_predictions', ['farm_id'], unique=False)
    op.create_index(op.f('ix_waterlogging_predictions_id'), 'waterlogging_predictions', ['id'], unique=False)

    # 12. crop_damage_predictions
    op.create_table(
        'crop_damage_predictions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('farm_id', sa.Integer(), nullable=False),
        sa.Column('farm_crop_id', sa.Integer(), nullable=False),
        sa.Column('waterlogging_pred_id', sa.Integer(), nullable=True),
        sa.Column('damage_risk_level', risk_level_enum, nullable=False, server_default='LOW'),
        sa.Column('estimated_yield_loss_pct', sa.Float(), nullable=True),
        sa.Column('survival_probability', sa.Float(), nullable=False),
        sa.Column('model_version', sa.String(length=50), nullable=False, server_default='v1.0.0'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['farm_crop_id'], ['farm_crops.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['farm_id'], ['farms.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['waterlogging_pred_id'], ['waterlogging_predictions.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_crop_damage_predictions_farm_crop_id'), 'crop_damage_predictions', ['farm_crop_id'], unique=False)
    op.create_index(op.f('ix_crop_damage_predictions_farm_id'), 'crop_damage_predictions', ['farm_id'], unique=False)
    op.create_index(op.f('ix_crop_damage_predictions_id'), 'crop_damage_predictions', ['id'], unique=False)

    # 13. crop_recovery_predictions
    op.create_table(
        'crop_recovery_predictions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('farm_id', sa.Integer(), nullable=False),
        sa.Column('damage_pred_id', sa.Integer(), nullable=False),
        sa.Column('recovery_likelihood', sa.Float(), nullable=False),
        sa.Column('post_drain_recovery_days', sa.Integer(), nullable=True),
        sa.Column('key_factors', sa.Text(), nullable=True),
        sa.Column('model_version', sa.String(length=50), nullable=False, server_default='v1.0.0'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['damage_pred_id'], ['crop_damage_predictions.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['farm_id'], ['farms.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_crop_recovery_predictions_damage_pred_id'), 'crop_recovery_predictions', ['damage_pred_id'], unique=False)
    op.create_index(op.f('ix_crop_recovery_predictions_farm_id'), 'crop_recovery_predictions', ['farm_id'], unique=False)
    op.create_index(op.f('ix_crop_recovery_predictions_id'), 'crop_recovery_predictions', ['id'], unique=False)

    # 14. post_rain_assessments
    op.create_table(
        'post_rain_assessments',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('farm_id', sa.Integer(), nullable=False),
        sa.Column('farm_crop_id', sa.Integer(), nullable=False),
        sa.Column('assessment_date', sa.Date(), nullable=False),
        sa.Column('actual_waterlogging_hours', sa.Float(), nullable=True),
        sa.Column('actual_damage_observed', sa.String(length=100), nullable=True),
        sa.Column('farmer_notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['farm_crop_id'], ['farm_crops.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['farm_id'], ['farms.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_post_rain_assessments_farm_crop_id'), 'post_rain_assessments', ['farm_crop_id'], unique=False)
    op.create_index(op.f('ix_post_rain_assessments_farm_id'), 'post_rain_assessments', ['farm_id'], unique=False)
    op.create_index(op.f('ix_post_rain_assessments_id'), 'post_rain_assessments', ['id'], unique=False)

    # 15. recommendations
    recommendation_timing_enum = sa.Enum('BEFORE_RAIN', 'AFTER_RAIN', name='recommendationtimingenum')
    op.create_table(
        'recommendations',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('damage_pred_id', sa.Integer(), nullable=True),
        sa.Column('recovery_pred_id', sa.Integer(), nullable=True),
        sa.Column('timing', recommendation_timing_enum, nullable=False),
        sa.Column('action_type', sa.String(length=100), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('priority', sa.String(length=50), nullable=False, server_default='HIGH'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['damage_pred_id'], ['crop_damage_predictions.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['recovery_pred_id'], ['crop_recovery_predictions.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_recommendations_id'), 'recommendations', ['id'], unique=False)

    # 16. prediction_explanations
    op.create_table(
        'prediction_explanations',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('damage_pred_id', sa.Integer(), nullable=False),
        sa.Column('explanation_text', sa.Text(), nullable=False),
        sa.Column('feature_importance_json', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['damage_pred_id'], ['crop_damage_predictions.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('damage_pred_id')
    )
    op.create_index(op.f('ix_prediction_explanations_id'), 'prediction_explanations', ['id'], unique=False)


def downgrade() -> None:
    op.drop_table('prediction_explanations')
    op.drop_table('recommendations')
    op.drop_table('post_rain_assessments')
    op.drop_table('crop_recovery_predictions')
    op.drop_table('crop_damage_predictions')
    op.drop_table('waterlogging_predictions')
    op.drop_table('rain_events')
    op.drop_table('weather_history')
    op.drop_table('weather_forecasts')
    op.drop_table('soil_profiles')
    op.drop_table('farm_crops')
    op.drop_table('crop_growth_stages')
    op.drop_table('crop_varieties')
    op.drop_table('crops')
    op.drop_table('farms')
    op.drop_table('users')

    # Drop Enums
    sa.Enum(name='recommendationtimingenum').drop(op.get_bind(), checkfirst=True)
    sa.Enum(name='risklevelenum').drop(op.get_bind(), checkfirst=True)
    sa.Enum(name='soilsourceenum').drop(op.get_bind(), checkfirst=True)
