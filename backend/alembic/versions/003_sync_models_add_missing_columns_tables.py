"""Sync all models: add missing columns and create missing tables

Revision ID: 003_sync_models
Revises: 002_add_farm_impact_alerts
Create Date: 2026-09-27

Root cause: The User model gained is_admin, onboarding_completed, tour_status,
and preferred_language columns after migration 001 was written. Similarly,
FarmCrop gained season/status, SoilProfile gained bulk_density/notes,
WaterloggingPrediction gained input_snapshot_json/model_version,
PostRainAssessment gained several assessment detail columns, and five
crop_stress knowledge-base tables were never migrated.

This migration makes the production PostgreSQL schema match the current
SQLAlchemy models without dropping tables or deleting data.
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '003_sync_models'
down_revision = '002_add_farm_impact_alerts'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # ── 1. users: add missing columns ──────────────────────────────────
    op.add_column('users', sa.Column('is_admin', sa.Boolean(), nullable=False, server_default=sa.text('false')))
    op.add_column('users', sa.Column('onboarding_completed', sa.Boolean(), nullable=False, server_default=sa.text('false')))
    op.add_column('users', sa.Column('tour_status', sa.String(length=50), nullable=False, server_default='NOT_STARTED'))
    op.add_column('users', sa.Column('preferred_language', sa.String(length=10), nullable=False, server_default='EN'))

    # ── 2. farm_crops: add missing columns ─────────────────────────────
    op.add_column('farm_crops', sa.Column('season', sa.String(length=50), nullable=True))
    op.add_column('farm_crops', sa.Column('status', sa.String(length=50), nullable=False, server_default='ACTIVE'))

    # ── 3. soil_profiles: add missing columns ──────────────────────────
    op.add_column('soil_profiles', sa.Column('bulk_density', sa.Float(), nullable=True))
    op.add_column('soil_profiles', sa.Column('notes', sa.Text(), nullable=True))

    # ── 4. waterlogging_predictions: add missing columns ───────────────
    op.add_column('waterlogging_predictions', sa.Column('input_snapshot_json', sa.Text(), nullable=True))
    op.add_column('waterlogging_predictions', sa.Column('model_version', sa.String(length=50), nullable=False, server_default='v1.0.0'))

    # ── 5. post_rain_assessments: add missing assessment-detail columns ─
    op.add_column('post_rain_assessments', sa.Column('standing_water', sa.String(length=20), nullable=False, server_default='NO'))
    op.add_column('post_rain_assessments', sa.Column('standing_water_duration', sa.String(length=50), nullable=True))
    op.add_column('post_rain_assessments', sa.Column('leaf_condition', sa.String(length=50), nullable=True))
    op.add_column('post_rain_assessments', sa.Column('plant_condition', sa.String(length=50), nullable=True))
    op.add_column('post_rain_assessments', sa.Column('visible_damage', sa.String(length=50), nullable=True))
    op.add_column('post_rain_assessments', sa.Column('updated_recovery_potential', sa.String(length=50), nullable=True))
    op.add_column('post_rain_assessments', sa.Column('updated_crop_loss_risk', sa.String(length=50), nullable=True))

    # ── 6. evidence_sources (new table) ────────────────────────────────
    op.create_table(
        'evidence_sources',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('source_name', sa.String(length=150), nullable=False),
        sa.Column('provider_institution', sa.String(length=150), nullable=False),
        sa.Column('publication_title', sa.String(length=255), nullable=True),
        sa.Column('url_or_doi', sa.String(length=255), nullable=True),
        sa.Column('confidence_level', sa.String(length=50), nullable=False, server_default='HIGH'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_evidence_sources_id'), 'evidence_sources', ['id'], unique=False)

    # ── 7. crop_stress_profiles (new table) ────────────────────────────
    op.create_table(
        'crop_stress_profiles',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('crop_id', sa.Integer(), nullable=False),
        sa.Column('stress_type', sa.String(length=50), nullable=False),
        sa.Column('rainfall_sensitivity', sa.String(length=50), nullable=False),
        sa.Column('waterlogging_sensitivity', sa.String(length=50), nullable=False),
        sa.Column('submergence_tolerance_qualitative', sa.String(length=50), nullable=False),
        sa.Column('critical_duration_hours', sa.Integer(), nullable=True),
        sa.Column('evidence_source_id', sa.Integer(), nullable=True),
        sa.Column('evidence_reference', sa.String(length=255), nullable=True),
        sa.Column('notes', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['crop_id'], ['crops.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['evidence_source_id'], ['evidence_sources.id'], ondelete='RESTRICT'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_crop_stress_profiles_id'), 'crop_stress_profiles', ['id'], unique=False)
    op.create_index(op.f('ix_crop_stress_profiles_crop_id'), 'crop_stress_profiles', ['crop_id'], unique=False)
    op.create_index(op.f('ix_crop_stress_profiles_stress_type'), 'crop_stress_profiles', ['stress_type'], unique=False)

    # ── 8. crop_stage_stress_profiles (new table) ──────────────────────
    op.create_table(
        'crop_stage_stress_profiles',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('crop_id', sa.Integer(), nullable=False),
        sa.Column('growth_stage_id', sa.Integer(), nullable=True),
        sa.Column('stage_name', sa.String(length=100), nullable=False),
        sa.Column('stress_type', sa.String(length=50), nullable=False),
        sa.Column('stage_sensitivity', sa.String(length=50), nullable=False),
        sa.Column('yield_impact_risk', sa.String(length=50), nullable=False),
        sa.Column('critical_vulnerability_details', sa.Text(), nullable=False),
        sa.Column('evidence_source_id', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['crop_id'], ['crops.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['growth_stage_id'], ['crop_growth_stages.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['evidence_source_id'], ['evidence_sources.id'], ondelete='RESTRICT'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_crop_stage_stress_profiles_id'), 'crop_stage_stress_profiles', ['id'], unique=False)
    op.create_index(op.f('ix_crop_stage_stress_profiles_crop_id'), 'crop_stage_stress_profiles', ['crop_id'], unique=False)
    op.create_index(op.f('ix_crop_stage_stress_profiles_growth_stage_id'), 'crop_stage_stress_profiles', ['growth_stage_id'], unique=False)
    op.create_index(op.f('ix_crop_stage_stress_profiles_stress_type'), 'crop_stage_stress_profiles', ['stress_type'], unique=False)

    # ── 9. crop_recovery_profiles (new table) ──────────────────────────
    op.create_table(
        'crop_recovery_profiles',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('crop_id', sa.Integer(), nullable=False),
        sa.Column('damage_severity_level', sa.String(length=50), nullable=False),
        sa.Column('recovery_potential_class', sa.String(length=50), nullable=False),
        sa.Column('max_submergence_hours_for_recovery', sa.Integer(), nullable=True),
        sa.Column('foliar_symptoms', sa.Text(), nullable=True),
        sa.Column('post_flooding_survival_rate', sa.String(length=50), nullable=True),
        sa.Column('evidence_source_id', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['crop_id'], ['crops.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['evidence_source_id'], ['evidence_sources.id'], ondelete='RESTRICT'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_crop_recovery_profiles_id'), 'crop_recovery_profiles', ['id'], unique=False)
    op.create_index(op.f('ix_crop_recovery_profiles_crop_id'), 'crop_recovery_profiles', ['crop_id'], unique=False)

    # ── 10. agronomic_recommendations (new table) ──────────────────────
    op.create_table(
        'agronomic_recommendations',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('crop_id', sa.Integer(), nullable=False),
        sa.Column('growth_stage_id', sa.Integer(), nullable=True),
        sa.Column('trigger_stress_type', sa.String(length=50), nullable=False),
        sa.Column('trigger_severity_level', sa.String(length=50), nullable=False),
        sa.Column('recommendation_title', sa.String(length=200), nullable=False),
        sa.Column('action_steps', sa.Text(), nullable=False),
        sa.Column('timing_window_hours', sa.Integer(), nullable=True),
        sa.Column('evidence_source_id', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['crop_id'], ['crops.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['growth_stage_id'], ['crop_growth_stages.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['evidence_source_id'], ['evidence_sources.id'], ondelete='RESTRICT'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_agronomic_recommendations_id'), 'agronomic_recommendations', ['id'], unique=False)
    op.create_index(op.f('ix_agronomic_recommendations_crop_id'), 'agronomic_recommendations', ['crop_id'], unique=False)


def downgrade() -> None:
    # Drop new tables in reverse dependency order
    op.drop_index(op.f('ix_agronomic_recommendations_crop_id'), table_name='agronomic_recommendations')
    op.drop_index(op.f('ix_agronomic_recommendations_id'), table_name='agronomic_recommendations')
    op.drop_table('agronomic_recommendations')

    op.drop_index(op.f('ix_crop_recovery_profiles_crop_id'), table_name='crop_recovery_profiles')
    op.drop_index(op.f('ix_crop_recovery_profiles_id'), table_name='crop_recovery_profiles')
    op.drop_table('crop_recovery_profiles')

    op.drop_index(op.f('ix_crop_stage_stress_profiles_stress_type'), table_name='crop_stage_stress_profiles')
    op.drop_index(op.f('ix_crop_stage_stress_profiles_growth_stage_id'), table_name='crop_stage_stress_profiles')
    op.drop_index(op.f('ix_crop_stage_stress_profiles_crop_id'), table_name='crop_stage_stress_profiles')
    op.drop_index(op.f('ix_crop_stage_stress_profiles_id'), table_name='crop_stage_stress_profiles')
    op.drop_table('crop_stage_stress_profiles')

    op.drop_index(op.f('ix_crop_stress_profiles_stress_type'), table_name='crop_stress_profiles')
    op.drop_index(op.f('ix_crop_stress_profiles_crop_id'), table_name='crop_stress_profiles')
    op.drop_index(op.f('ix_crop_stress_profiles_id'), table_name='crop_stress_profiles')
    op.drop_table('crop_stress_profiles')

    op.drop_index(op.f('ix_evidence_sources_id'), table_name='evidence_sources')
    op.drop_table('evidence_sources')

    # Drop added columns
    op.drop_column('post_rain_assessments', 'updated_crop_loss_risk')
    op.drop_column('post_rain_assessments', 'updated_recovery_potential')
    op.drop_column('post_rain_assessments', 'visible_damage')
    op.drop_column('post_rain_assessments', 'plant_condition')
    op.drop_column('post_rain_assessments', 'leaf_condition')
    op.drop_column('post_rain_assessments', 'standing_water_duration')
    op.drop_column('post_rain_assessments', 'standing_water')

    op.drop_column('waterlogging_predictions', 'model_version')
    op.drop_column('waterlogging_predictions', 'input_snapshot_json')

    op.drop_column('soil_profiles', 'notes')
    op.drop_column('soil_profiles', 'bulk_density')

    op.drop_column('farm_crops', 'status')
    op.drop_column('farm_crops', 'season')

    op.drop_column('users', 'preferred_language')
    op.drop_column('users', 'tour_status')
    op.drop_column('users', 'onboarding_completed')
    op.drop_column('users', 'is_admin')
