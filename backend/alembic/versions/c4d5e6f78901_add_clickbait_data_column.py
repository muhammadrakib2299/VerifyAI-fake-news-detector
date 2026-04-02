"""Add clickbait_data column to analyses

Revision ID: c4d5e6f78901
Revises: b3c4d5e6f789
Create Date: 2026-04-02 14:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c4d5e6f78901'
down_revision: Union[str, Sequence[str], None] = 'b3c4d5e6f789'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add clickbait_data JSON column."""
    op.add_column('analyses', sa.Column('clickbait_data', sa.JSON(), nullable=True))


def downgrade() -> None:
    """Remove clickbait_data column."""
    op.drop_column('analyses', 'clickbait_data')
