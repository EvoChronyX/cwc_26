"""0001_initial_cwc_schema

Revision ID: 0001_initial_cwc_schema
Revises: 
Create Date: 2026-09-17 06:50:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '0001_initial_cwc_schema'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Table: teams
    op.create_table(
        'teams',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('team_name', sa.String(length=100), nullable=False),
        sa.Column('p1_handle', sa.String(length=100), nullable=False),
        sa.Column('p2_handle', sa.String(length=100), nullable=False),
        sa.Column('avatar_id', sa.String(length=50), nullable=False, server_default='avatar-1'),
        sa.Column('password', sa.String(length=255), nullable=False),
        sa.Column('lane', sa.String(length=50), nullable=False, server_default='Lane #01'),
        sa.Column('status', sa.String(length=30), nullable=False, server_default='CONNECTED'),
        sa.Column('score', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('r1_score', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('r2_score', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('r3_live_score', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('win_rate', sa.String(length=20), nullable=False, server_default='0%'),
        sa.Column('streak', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.CheckConstraint("status IN ('CONNECTED', 'DISCONNECTED', 'STANDBY')", name='chk_teams_status'),
        sa.PrimaryKeyConstraint('id', name='pk_teams'),
        sa.UniqueConstraint('team_name', name='uq_teams_team_name')
    )
    op.create_index('ix_teams_team_name', 'teams', ['team_name'], unique=True)
    op.create_index('ix_teams_score_desc', 'teams', [sa.text('score DESC')])

    # 2. Table: admin_users
    op.create_table(
        'admin_users',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('gm_id', sa.String(length=50), nullable=False),
        sa.Column('username', sa.String(length=100), nullable=False),
        sa.Column('password', sa.String(length=255), nullable=False),
        sa.Column('role', sa.String(length=50), nullable=False, server_default='GAME_MASTER'),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.PrimaryKeyConstraint('id', name='pk_admin_users'),
        sa.UniqueConstraint('gm_id', name='uq_admin_users_gm_id')
    )
    op.create_index('ix_admin_users_gm_id', 'admin_users', ['gm_id'], unique=True)

    # 3. Table: game_sessions
    op.create_table(
        'game_sessions',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('session_code', sa.String(length=50), nullable=False),
        sa.Column('tournament_name', sa.String(length=150), nullable=False, server_default='Code with Comali 2026'),
        sa.Column('current_round', sa.Integer(), nullable=False, server_default='1'),
        sa.Column('round_name', sa.String(length=100), nullable=False, server_default='Round 01 - Technical Architecture'),
        sa.Column('buzzers_armed', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.PrimaryKeyConstraint('id', name='pk_game_sessions'),
        sa.UniqueConstraint('session_code', name='uq_game_sessions_session_code')
    )
    op.create_index('ix_game_sessions_session_code', 'game_sessions', ['session_code'], unique=True)

    # 4. Table: buzzer_events
    op.create_table(
        'buzzer_events',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('session_id', sa.Integer(), nullable=False),
        sa.Column('round_number', sa.Integer(), nullable=False),
        sa.Column('team_id', sa.Integer(), nullable=False),
        sa.Column('server_timestamp', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('latency_seconds', sa.Float(), nullable=False),
        sa.Column('queue_rank', sa.Integer(), nullable=False),
        sa.Column('status', sa.String(length=30), nullable=False, server_default='ACCEPTED'),
        sa.Column('is_resolved', sa.Boolean(), nullable=False, server_default='false'),
        sa.ForeignKeyConstraint(['session_id'], ['game_sessions.id'], name='fk_buzzer_events_session', ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['team_id'], ['teams.id'], name='fk_buzzer_events_team', ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id', name='pk_buzzer_events'),
        sa.UniqueConstraint('session_id', 'round_number', 'team_id', name='uq_buzzer_session_round_team')
    )
    op.create_index('ix_buzzer_events_session_round_rank', 'buzzer_events', ['session_id', 'round_number', 'queue_rank'])
    op.create_index('ix_buzzer_events_timestamp_asc', 'buzzer_events', ['server_timestamp'])

    # 5. Table: sabotages
    op.create_table(
        'sabotages',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('slug', sa.String(length=50), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('default_duration', sa.Integer(), nullable=False),
        sa.Column('category', sa.String(length=50), nullable=False, server_default='DISRUPTION'),
        sa.Column('badge_label', sa.String(length=50), nullable=False, server_default='Available'),
        sa.PrimaryKeyConstraint('id', name='pk_sabotages'),
        sa.UniqueConstraint('name', name='uq_sabotages_name'),
        sa.UniqueConstraint('slug', name='uq_sabotages_slug')
    )
    op.create_index('ix_sabotages_slug', 'sabotages', ['slug'], unique=True)

    # 6. Table: sabotage_instances
    op.create_table(
        'sabotage_instances',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('session_id', sa.Integer(), nullable=False),
        sa.Column('sabotage_id', sa.Integer(), nullable=False),
        sa.Column('attacker_team_id', sa.Integer(), nullable=False),
        sa.Column('target_team_id', sa.Integer(), nullable=False),
        sa.Column('duration_seconds', sa.Integer(), nullable=False),
        sa.Column('started_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('status', sa.String(length=30), nullable=False, server_default='ACTIVE'),
        sa.Column('neutralized_by_admin_id', sa.Integer(), nullable=True),
        sa.Column('neutralized_at', sa.DateTime(timezone=True), nullable=True),
        sa.CheckConstraint("status IN ('ACTIVE', 'EXPIRED', 'NEUTRALIZED')", name='chk_sabotage_inst_status'),
        sa.ForeignKeyConstraint(['session_id'], ['game_sessions.id'], name='fk_sabotage_inst_session', ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['sabotage_id'], ['sabotages.id'], name='fk_sabotage_inst_sabotage', ondelete='RESTRICT'),
        sa.ForeignKeyConstraint(['attacker_team_id'], ['teams.id'], name='fk_sabotage_inst_attacker', ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['target_team_id'], ['teams.id'], name='fk_sabotage_inst_target', ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['neutralized_by_admin_id'], ['admin_users.id'], name='fk_sabotage_inst_admin', ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id', name='pk_sabotage_instances')
    )
    op.create_index('ix_sabotage_instances_target_status', 'sabotage_instances', ['target_team_id', 'status'])
    op.create_index('ix_sabotage_instances_expires_at', 'sabotage_instances', ['expires_at'])

    # 7. Table: score_transactions
    op.create_table(
        'score_transactions',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('session_id', sa.Integer(), nullable=False),
        sa.Column('team_id', sa.Integer(), nullable=False),
        sa.Column('delta', sa.Integer(), nullable=False),
        sa.Column('resulting_score', sa.Integer(), nullable=False),
        sa.Column('reason', sa.String(length=255), nullable=False),
        sa.Column('admin_user_id', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.ForeignKeyConstraint(['session_id'], ['game_sessions.id'], name='fk_score_tx_session', ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['team_id'], ['teams.id'], name='fk_score_tx_team', ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['admin_user_id'], ['admin_users.id'], name='fk_score_tx_admin', ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id', name='pk_score_transactions')
    )
    op.create_index('ix_score_transactions_team_created', 'score_transactions', ['team_id', sa.text('created_at DESC')])

    # 8. Table: audit_logs (Kanaku Valaku)
    op.create_table(
        'audit_logs',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('CURRENT_TIMESTAMP'), nullable=False),
        sa.Column('category', sa.String(length=50), nullable=False),
        sa.Column('actor_type', sa.String(length=30), nullable=False),
        sa.Column('actor_id', sa.Integer(), nullable=True),
        sa.Column('target_team_id', sa.Integer(), nullable=True),
        sa.Column('action_type', sa.String(length=100), nullable=False),
        sa.Column('message', sa.Text(), nullable=False),
        sa.Column('metadata', postgresql.JSONB(astext_type=sa.Text()), server_default='{}', nullable=False),
        sa.Column('color_class', sa.String(length=100), nullable=False, server_default='text-primary'),
        sa.ForeignKeyConstraint(['target_team_id'], ['teams.id'], name='fk_audit_logs_target_team', ondelete='SET NULL'),
        sa.PrimaryKeyConstraint('id', name='pk_audit_logs')
    )
    op.create_index('ix_audit_logs_created_desc', 'audit_logs', [sa.text('created_at DESC')])
    op.create_index('ix_audit_logs_category', 'audit_logs', ['category'])


def downgrade() -> None:
    op.drop_table('audit_logs')
    op.drop_table('score_transactions')
    op.drop_table('sabotage_instances')
    op.drop_table('sabotages')
    op.drop_table('buzzer_events')
    op.drop_table('game_sessions')
    op.drop_table('admin_users')
    op.drop_table('teams')
