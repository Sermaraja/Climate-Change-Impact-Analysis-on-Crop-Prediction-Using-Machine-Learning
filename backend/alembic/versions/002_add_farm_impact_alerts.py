"""Add farm impact alerts table for farm-specific warning impact tracking

Revision ID: 002_add_farm_impact_alerts
Revises: 001_initial_schema
Create Date: 2026-09-26

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '002_add_farm_impact_alerts'
down_revision = '001_initial_schema'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # 1. Create farm_impact_alerts table
    op.create_table(
        'farm_impact_alerts',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('farm_id', sa.Integer(), nullable=False),
        sa.Column('farm_crop_id', sa.Integer(), nullable=True),
        sa.Column('weather_forecast_id', sa.Integer(), nullable=True),
        sa.Column('official_warning_id', sa.Integer(), nullable=True),
        sa.Column('prediction_id', sa.Integer(), nullable=True),
        sa.Column('application_impact_level', sa.String(length=50), server_default='GREEN', nullable=False),
        sa.Column('rain_risk', sa.String(length=50), nullable=True),
        sa.Column('waterlogging_risk', sa.String(length=50), nullable=True),
        sa.Column('damage_risk', sa.String(length=50), nullable=True),
        sa.Column('survival_class', sa.String(length=50), nullable=True),
        sa.Column('recovery_class', sa.String(length=50), nullable=True),
        sa.Column('loss_risk', sa.String(length=50), nullable=True),
        sa.Column('forecast_start', sa.DateTime(), nullable=True),
        sa.Column('forecast_end', sa.DateTime(), nullable=True),
        sa.Column('rain_24h', sa.Float(), nullable=True),
        sa.Column('rain_48h', sa.Float(), nullable=True),
        sa.Column('previous_rain_72h', sa.Float(), nullable=True),
        sa.Column('main_factors', sa.JSON(), nullable=True),
        sa.Column('engine_type', sa.String(length=50), server_default='HYBRID', nullable=False),
        sa.Column('status', sa.String(length=50), server_default='ACTIVE', nullable=False),
        sa.Column('acknowledged_at', sa.DateTime(), nullable=True),
        sa.Column('resolved_at', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(['farm_crop_id'], ['farm_crops.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['farm_id'], ['farms.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['prediction_id'], ['crop_damage_predictions.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['weather_forecast_id'], ['weather_forecasts.id'], ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_farm_impact_alerts_id'), 'farm_impact_alerts', ['id'], unique=False)
    op.create_index(op.f('ix_farm_impact_alerts_user_id'), 'farm_impact_alerts', ['user_id'], unique=False)
    op.create_index(op.f('ix_farm_impact_alerts_farm_id'), 'farm_impact_alerts', ['farm_id'], unique=False)
    op.create_index(op.f('ix_farm_impact_alerts_status'), 'farm_impact_alerts', ['status'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_farm_impact_alerts_status'), table_name='farm_impact_alerts')
    op.drop_index(op.f('ix_farm_impact_alerts_farm_id'), table_name='farm_impact_alerts')
    op.drop_index(op.f('ix_farm_impact_alerts_user_id'), table_name='farm_impact_alerts')
    op.drop_index(op.f('ix_farm_impact_alerts_id'), table_name='farm_impact_alerts')
    op.drop_table('farm_impact_alerts')
