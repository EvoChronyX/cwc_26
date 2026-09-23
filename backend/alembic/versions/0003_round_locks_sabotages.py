"""0003_round_locks_sabotages

Revision ID: 0003_round_locks_sabotages
Revises: 0002_add_buzzer_client_timing
Create Date: 2026-09-23 16:10:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '0003_round_locks_sabotages'
down_revision: Union[str, None] = '0002_add_buzzer_client_timing'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Add round lock flags to game_sessions if not existing
    op.add_column('game_sessions', sa.Column('round1_unlocked', sa.Boolean(), server_default='false', nullable=False))
    op.add_column('game_sessions', sa.Column('round2_unlocked', sa.Boolean(), server_default='false', nullable=False))

    # 2. Add item metadata fields to sabotages
    op.add_column('sabotages', sa.Column('item_type', sa.String(length=30), server_default='SABOTAGE', nullable=False))
    op.add_column('sabotages', sa.Column('round_number', sa.Integer(), server_default='1', nullable=False))
    op.add_column('sabotages', sa.Column('cost', sa.Integer(), server_default='15', nullable=False))
    op.add_column('sabotages', sa.Column('level', sa.String(length=20), server_default='Medium', nullable=False))
    op.add_column('sabotages', sa.Column('duration_effect', sa.String(length=100), nullable=True))


def downgrade() -> None:
    op.drop_column('sabotages', 'duration_effect')
    op.drop_column('sabotages', 'level')
    op.drop_column('sabotages', 'cost')
    op.drop_column('sabotages', 'round_number')
    op.drop_column('sabotages', 'item_type')

    op.drop_column('game_sessions', 'round2_unlocked')
    op.drop_column('game_sessions', 'round1_unlocked')
