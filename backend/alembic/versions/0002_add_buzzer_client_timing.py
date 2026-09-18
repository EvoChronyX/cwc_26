"""0002_add_buzzer_client_timing

Revision ID: 0002_add_buzzer_client_timing
Revises: 0001_initial_cwc_schema
Create Date: 2026-09-18 09:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '0002_add_buzzer_client_timing'
down_revision: Union[str, None] = '0001_initial_cwc_schema'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add buzzers_armed_at to game_sessions
    op.add_column('game_sessions', sa.Column('buzzers_armed_at', sa.DateTime(timezone=True), nullable=True))

    # Add client_timestamp and client_time_str to buzzer_events
    op.add_column('buzzer_events', sa.Column('client_timestamp', sa.Float(), nullable=True))
    op.add_column('buzzer_events', sa.Column('client_time_str', sa.String(length=50), nullable=True))


def downgrade() -> None:
    op.drop_column('buzzer_events', 'client_time_str')
    op.drop_column('buzzer_events', 'client_timestamp')
    op.drop_column('game_sessions', 'buzzers_armed_at')
